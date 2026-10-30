import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HackIssueStatus, ICurrentUser, UserRole, UserStatus } from '@sos-academy/shared';
import { FilterQuery, Model } from 'mongoose';
import { envConfig } from '../../common/config/env.config';
import { Squad, SquadDocument } from '../squad/schemas/squad.schema';
import { UserService } from '../user/user.service';
import { GetAvailableHackIssuesQueryDto } from './dto/get-available-hack-issues.dto';
import { HackIssueService } from './hack-issue.service';
import { ACTIVE_STATUSES, HackIssueEvent } from './hack-issue-status-machine';
import { HackIssue, HackIssueDocument } from './schemas/hack-issue.schema';

/** Statuses an issue can be claimed from */
const CLAIMABLE = [HackIssueStatus.OPEN, HackIssueStatus.UNASSIGNED];

/** What hackers see of an issue: no registration details, body or status history */
const PUBLIC_FIELDS =
  'repository owner repo number title labels language url status assignee assignedAt pullRequest createdAt';

/**
 * Claiming, releasing and assigning issues on the hack platform. Every change goes through the
 * status machine (`HackIssueService.transition`), so it is validated, atomic and recorded.
 */
@Injectable()
export class HackIssueClaimService {
  constructor(
    @InjectModel(HackIssue.name) private hackIssueModel: Model<HackIssueDocument>,
    @InjectModel(Squad.name) private squadModel: Model<SquadDocument>,
    private readonly hackIssueService: HackIssueService,
    private readonly userService: UserService
  ) {}

  get maxActiveClaims(): number {
    return envConfig.hack.maxActiveClaims;
  }

  /** Open issues anyone can claim */
  async findAvailable(query: GetAvailableHackIssuesQueryDto) {
    const { search, language, page = 1, limit = 20 } = query;

    const filter: FilterQuery<HackIssueDocument> = { status: { $in: CLAIMABLE } };
    if (language) {
      filter.language = language;
    }
    if (search) {
      const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: pattern }, { repository: pattern }];
    }

    const [issues, total] = await Promise.all([
      this.hackIssueModel
        .find(filter)
        .select(PUBLIC_FIELDS)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.hackIssueModel.countDocuments(filter).exec(),
    ]);

    return {
      issues,
      pagination: { total, page, limit, pages: total === 0 ? 0 : Math.ceil(total / limit) },
    };
  }

  /** The issues a hacker is working on, with how many more they can claim */
  async findMine(userId: string) {
    const issues = await this.hackIssueModel
      .find({ assignee: userId, status: { $in: ACTIVE_STATUSES } })
      .select(PUBLIC_FIELDS)
      .sort({ assignedAt: -1 })
      .lean()
      .exec();

    return { issues, activeCount: issues.length, maxActiveClaims: this.maxActiveClaims };
  }

  /** A hacker takes an open issue */
  async claim(issueId: string, user: ICurrentUser): Promise<HackIssue> {
    await this.ensureUnderLimit(user._id, 'You');
    return this.assign(issueId, user._id, { actorId: user._id });
  }

  /**
   * A sensei hands an issue to one of their mentees. A mentor can only assign to members of
   * their own active squads; a kage can assign to any active member.
   */
  async assignTo(issueId: string, menteeId: string, actor: ICurrentUser): Promise<HackIssue> {
    const mentee = await this.userService.findOne(menteeId);
    if (mentee.status !== UserStatus.ACTIVE || mentee.isActive === false) {
      throw new BadRequestException(`User with ID ${menteeId} is not an active member`);
    }

    if (actor.role !== UserRole.KAGE) {
      const inSquad = await this.squadModel
        .exists({ mentor: actor._id, members: menteeId, isActive: true })
        .exec();
      if (!inSquad) {
        throw new ForbiddenException('You can only assign issues to mentees of your squad');
      }
    }

    await this.ensureUnderLimit(menteeId, mentee.name);
    return this.assign(issueId, menteeId, {
      actorId: actor._id,
      reason: `Assigned by ${actor.name}`,
    });
  }

  /**
   * The assignee gives the issue back (a kage can release anyone's). It goes through
   * `UNASSIGNED`, so the history shows who dropped it, then back to `OPEN` for the next hacker.
   */
  async release(issueId: string, user: ICurrentUser): Promise<HackIssue> {
    const issue = await this.findIssue(issueId);
    if (!issue.assignee) {
      throw new BadRequestException('This issue is not assigned to anyone');
    }
    if (String(issue.assignee) !== user._id && user.role !== UserRole.KAGE) {
      throw new ForbiddenException('Only the assignee can release this issue');
    }
    if (issue.status === HackIssueStatus.PR_OPEN) {
      throw new BadRequestException(
        'A pull request is open for this issue: close it before releasing the issue'
      );
    }

    await this.hackIssueService.transition(issueId, HackIssueEvent.UNASSIGN, {
      actorId: user._id,
      unset: ['assignee', 'assignedAt'],
    });
    return this.hackIssueService.transition(issueId, HackIssueEvent.RELEASE, {
      actorId: user._id,
    });
  }

  private async assign(
    issueId: string,
    assigneeId: string,
    { actorId, reason }: { actorId: string; reason?: string }
  ): Promise<HackIssue> {
    const issue = await this.findIssue(issueId);
    if (!CLAIMABLE.includes(issue.status)) {
      throw issue.assignee
        ? new ConflictException(
            String(issue.assignee) === assigneeId
              ? 'This issue is already assigned to this hacker'
              : 'This issue is already assigned to someone else'
          )
        : new BadRequestException(`This issue can't be claimed (status: ${issue.status})`);
    }

    try {
      // Atomic: only one of two simultaneous claims can move the issue out of OPEN
      return await this.hackIssueService.transition(issueId, HackIssueEvent.ASSIGN, {
        actorId,
        reason,
        set: { assignee: assigneeId, assignedAt: new Date() },
      });
    } catch (error) {
      // Someone claimed it between our read and the update: the transition then either loses
      // the atomic update (409) or sees the issue already ASSIGNED (400). Both mean "taken".
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        const current = await this.findIssue(issueId);
        if (!CLAIMABLE.includes(current.status)) {
          throw new ConflictException('This issue was just claimed by someone else');
        }
      }
      throw error;
    }
  }

  private async ensureUnderLimit(userId: string, who: string): Promise<void> {
    const active = await this.hackIssueModel
      .countDocuments({ assignee: userId, status: { $in: ACTIVE_STATUSES } })
      .exec();
    if (active >= this.maxActiveClaims) {
      throw new ConflictException(
        `${who} already ${who === 'You' ? 'have' : 'has'} ${active} issues in progress (limit: ${this.maxActiveClaims}). Finish or release one first.`
      );
    }
  }

  private async findIssue(issueId: string) {
    const issue = await this.hackIssueModel
      .findById(issueId)
      .select('status assignee')
      .lean()
      .exec();
    if (!issue) {
      throw new NotFoundException(`Hack issue ${issueId} not found`);
    }
    return issue;
  }
}
