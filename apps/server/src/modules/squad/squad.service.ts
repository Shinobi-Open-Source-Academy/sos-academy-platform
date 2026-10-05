import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole, UserStatus } from '@sos-academy/shared';
import { Model } from 'mongoose';
import { CommunityService } from '../community/community.service';
import { UserService } from '../user/user.service';
import { CreateSquadDto } from './dto/create-squad.dto';
import { GetSquadsQueryDto } from './dto/get-squads.dto';
import { DEFAULT_SQUAD_CAPACITY, Squad, SquadDocument } from './schemas/squad.schema';

interface RosterMemberDoc {
  _id: unknown;
  name: string;
  githubProfile?: { login?: string; avatarUrl?: string };
}

export interface SquadRoster {
  id: string;
  community: { name?: string; slug?: string };
  capacity: number;
  members: {
    id: string;
    name: string;
    githubLogin: string | null;
    avatarUrl: string | null;
    joinedAt?: Date;
  }[];
}

const isDuplicateKeyError = (error: unknown) =>
  !!error && typeof error === 'object' && 'code' in error && error.code === 11000;

/**
 * A mentee belongs to **at most one active squad**: they get one sensei, and their progress
 * isn't split across mentors. Adding someone already in another active squad is rejected —
 * remove them from it first. The partial unique index on `members` enforces it in the database too.
 */
@Injectable()
export class SquadService {
  constructor(
    @InjectModel(Squad.name) private squadModel: Model<SquadDocument>,
    private readonly userService: UserService,
    private readonly communityService: CommunityService
  ) {}

  async create(createSquadDto: CreateSquadDto): Promise<Squad> {
    const { mentor, community, capacity = DEFAULT_SQUAD_CAPACITY } = createSquadDto;
    const members = [...new Set(createSquadDto.members ?? [])];

    if (members.length > capacity) {
      throw new BadRequestException(
        `Squad has ${members.length} members but a capacity of ${capacity}`
      );
    }
    if (members.includes(mentor)) {
      throw new BadRequestException('A mentor cannot be a member of their own squad');
    }

    const mentorUser = await this.userService.findOne(mentor);
    if (mentorUser.role !== UserRole.MENTOR && mentorUser.role !== UserRole.KAGE) {
      throw new BadRequestException(`User with ID ${mentor} is not a mentor`);
    }
    if (mentorUser.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(`Mentor with ID ${mentor} is not approved yet`);
    }

    const existingCommunity = await this.communityService.findById(community);
    if (!existingCommunity) {
      throw new NotFoundException(`Community with ID ${community} not found`);
    }

    for (const memberId of members) {
      await this.assertEligibleMentee(memberId);
    }

    try {
      const joinedAt = new Date();
      const squad = new this.squadModel({
        mentor,
        community,
        members,
        capacity,
        memberJoinedAt: Object.fromEntries(members.map((memberId) => [memberId, joinedAt])),
      });
      return await squad.save();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('A member is already in another active squad');
      }
      throw error;
    }
  }

  async findAll(query: GetSquadsQueryDto = {}): Promise<Squad[]> {
    const filter: Record<string, unknown> = {};
    if (query.community) {
      filter.community = query.community;
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    return this.squadModel
      .find(filter)
      .select('-__v')
      .populate('mentor', 'name email githubProfile')
      .populate('community', 'name slug')
      .populate('members', 'name email githubProfile')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Squad> {
    const squad = await this.squadModel
      .findById(id)
      .select('-__v')
      .populate('mentor', 'name email')
      .populate('community', 'name slug')
      .populate('members', 'name email githubProfile')
      .exec();
    if (!squad) {
      throw new NotFoundException(`Squad with ID ${id} not found`);
    }
    return squad;
  }

  /**
   * Returns the active squads a user belongs to, either as a member or as the mentor.
   */
  async findByUser(userId: string): Promise<Squad[]> {
    return this.squadModel
      .find({ isActive: true, $or: [{ members: userId }, { mentor: userId }] })
      .select('-__v')
      .populate('mentor', 'name email')
      .populate('community', 'name slug')
      .populate('members', 'name email githubProfile')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * The roster of the squads a mentor leads: only their own squads, and only what a mentor
   * needs to see about their mentees (no email).
   */
  async findMine(mentorId: string): Promise<SquadRoster[]> {
    const squads = await this.squadModel
      .find({ mentor: mentorId, isActive: true })
      .populate<{ community: { _id: unknown; name: string; slug: string } }>(
        'community',
        'name slug'
      )
      .populate<{ members: RosterMemberDoc[] }>('members', 'name githubProfile')
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return squads.map((squad) => {
      const joinedAt = (squad.memberJoinedAt ?? {}) as unknown as Record<string, Date>;
      return {
        id: String(squad._id),
        community: { name: squad.community?.name, slug: squad.community?.slug },
        capacity: squad.capacity,
        members: squad.members
          .map((member) => ({
            id: String(member._id),
            name: member.name,
            githubLogin: member.githubProfile?.login ?? null,
            avatarUrl: member.githubProfile?.avatarUrl ?? null,
            joinedAt: joinedAt[String(member._id)] ?? (squad as { createdAt?: Date }).createdAt,
          }))
          .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()),
      };
    });
  }

  /**
   * Adds an approved mentee to an active squad, without going over its capacity.
   */
  async addMember(squadId: string, userId: string): Promise<Squad> {
    const squad = await this.squadModel.findById(squadId).exec();
    if (!squad) {
      throw new NotFoundException(`Squad with ID ${squadId} not found`);
    }
    if (!squad.isActive) {
      throw new BadRequestException('Cannot add members to an inactive squad');
    }
    if (String(squad.mentor) === userId) {
      throw new BadRequestException('A mentor cannot be a member of their own squad');
    }
    if (squad.members.some((member) => String(member) === userId)) {
      throw new ConflictException('This user is already a member of the squad');
    }

    await this.assertEligibleMentee(userId, squadId);

    // Capacity is checked in the same update, so two concurrent adds can't overfill the squad
    let updated: SquadDocument | null;
    try {
      updated = await this.squadModel
        .findOneAndUpdate(
          {
            _id: squadId,
            isActive: true,
            members: { $ne: userId },
            $expr: { $lt: [{ $size: '$members' }, '$capacity'] },
          },
          { $addToSet: { members: userId }, $set: { [`memberJoinedAt.${userId}`]: new Date() } },
          { new: true }
        )
        .exec();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('This user is already in another active squad');
      }
      throw error;
    }

    if (!updated) {
      throw new ConflictException(
        `Squad is at capacity (${squad.capacity}/${squad.capacity}) — raise its capacity or remove a member first`
      );
    }

    return this.findById(squadId);
  }

  async removeMember(squadId: string, userId: string): Promise<Squad> {
    const updated = await this.squadModel
      .findOneAndUpdate(
        { _id: squadId, members: userId },
        { $pull: { members: userId }, $unset: { [`memberJoinedAt.${userId}`]: '' } }
      )
      .exec();

    if (!updated) {
      const exists = await this.squadModel.exists({ _id: squadId });
      throw new NotFoundException(
        exists
          ? `User with ID ${userId} is not a member of this squad`
          : `Squad with ID ${squadId} not found`
      );
    }

    return this.findById(squadId);
  }

  /**
   * Only approved members can be mentees, and only in one active squad at a time.
   */
  private async assertEligibleMentee(userId: string, squadId?: string): Promise<void> {
    const user = await this.userService.findOne(userId);
    if (user.role !== UserRole.MEMBER) {
      throw new BadRequestException(`User with ID ${userId} is not a member (role: ${user.role})`);
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(`User with ID ${userId} is not an approved member yet`);
    }

    const otherSquad = await this.squadModel
      .exists({ isActive: true, members: userId, ...(squadId ? { _id: { $ne: squadId } } : {}) })
      .exec();
    if (otherSquad) {
      throw new ConflictException(
        `User with ID ${userId} is already in another active squad — remove them from it first`
      );
    }
  }
}
