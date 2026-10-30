import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HackIssueStatus, ICurrentUser, UserRole, UserStatus } from '@sos-academy/shared';
import { Types } from 'mongoose';
import { envConfig } from '../../common/config/env.config';
import { Squad } from '../squad/schemas/squad.schema';
import { UserService } from '../user/user.service';
import { HackIssueService } from './hack-issue.service';
import { HackIssueClaimService } from './hack-issue-claim.service';
import { ACTIVE_STATUSES, HackIssueEvent } from './hack-issue-status-machine';
import { HackIssue } from './schemas/hack-issue.schema';

const id = () => new Types.ObjectId().toString();

const userOf = (role: UserRole, overrides: Partial<ICurrentUser> = {}): ICurrentUser => ({
  _id: id(),
  email: 'user@test.local',
  name: `A ${role.toLowerCase()}`,
  role,
  status: UserStatus.ACTIVE,
  isActive: true,
  ...overrides,
});

describe('HackIssueClaimService', () => {
  let service: HackIssueClaimService;
  let hackIssueModel: { findById: jest.Mock; countDocuments: jest.Mock; find: jest.Mock };
  let squadModel: { exists: jest.Mock };
  let hackIssueService: { transition: jest.Mock };
  let userService: { findOne: jest.Mock };
  let issueQuery: Record<string, jest.Mock>;
  let activeCount: jest.Mock;
  let inSquad: jest.Mock;

  const issueId = id();
  const hacker = userOf(UserRole.MEMBER);

  const issueIs = (doc: Record<string, unknown> | null) => issueQuery.exec.mockResolvedValue(doc);

  beforeEach(async () => {
    issueQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    activeCount = jest.fn().mockResolvedValue(0);
    inSquad = jest.fn().mockResolvedValue({ _id: id() });
    hackIssueModel = {
      findById: jest.fn().mockReturnValue(issueQuery),
      countDocuments: jest.fn().mockReturnValue({ exec: activeCount }),
      find: jest.fn(),
    };
    squadModel = { exists: jest.fn().mockReturnValue({ exec: inSquad }) };
    hackIssueService = {
      transition: jest.fn().mockImplementation(async (_id, event) => ({ _id, event })),
    };
    userService = {
      findOne: jest.fn().mockImplementation(async (userId: string) => ({
        _id: userId,
        name: 'Naruto',
        role: UserRole.MEMBER,
        status: UserStatus.ACTIVE,
        isActive: true,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackIssueClaimService,
        { provide: getModelToken(HackIssue.name), useValue: hackIssueModel },
        { provide: getModelToken(Squad.name), useValue: squadModel },
        { provide: HackIssueService, useValue: hackIssueService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    service = module.get(HackIssueClaimService);
    issueIs({ _id: issueId, status: HackIssueStatus.OPEN });
  });

  describe('claim', () => {
    it('assigns an open issue to the hacker through the state machine', async () => {
      await service.claim(issueId, hacker);

      expect(hackIssueService.transition).toHaveBeenCalledWith(issueId, HackIssueEvent.ASSIGN, {
        actorId: hacker._id,
        reason: undefined,
        set: { assignee: hacker._id, assignedAt: expect.any(Date) },
      });
    });

    it('can claim an issue that was unassigned', async () => {
      issueIs({ _id: issueId, status: HackIssueStatus.UNASSIGNED });

      await service.claim(issueId, hacker);

      expect(hackIssueService.transition).toHaveBeenCalled();
    });

    it("rejects an issue that is already someone else's", async () => {
      issueIs({ _id: issueId, status: HackIssueStatus.ASSIGNED, assignee: id() });

      await expect(service.claim(issueId, hacker)).rejects.toThrow(
        'already assigned to someone else'
      );
      expect(hackIssueService.transition).not.toHaveBeenCalled();
    });

    it('says when the hacker already holds the issue', async () => {
      issueIs({ _id: issueId, status: HackIssueStatus.IN_PROGRESS, assignee: hacker._id });

      await expect(service.claim(issueId, hacker)).rejects.toThrow(
        'already assigned to this hacker'
      );
    });

    it('rejects a merged issue', async () => {
      issueIs({ _id: issueId, status: HackIssueStatus.MERGED });

      await expect(service.claim(issueId, hacker)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('enforces the concurrent claim limit', async () => {
      activeCount.mockResolvedValue(envConfig.hack.maxActiveClaims);

      await expect(service.claim(issueId, hacker)).rejects.toThrow(
        `You already have 3 issues in progress (limit: 3)`
      );
      expect(hackIssueModel.countDocuments).toHaveBeenCalledWith({
        assignee: hacker._id,
        status: { $in: ACTIVE_STATUSES },
      });
      expect(hackIssueService.transition).not.toHaveBeenCalled();
    });

    it('defaults the limit to 3', () => {
      expect(service.maxActiveClaims).toBe(3);
    });

    it.each([
      ['loses the atomic update', new ConflictException('changed status')],
      ['sees the issue already assigned', new BadRequestException('Cannot ASSIGN')],
    ])('turns a lost race into a clear conflict when the transition %s', async (_, error) => {
      issueQuery.exec
        .mockResolvedValueOnce({ _id: issueId, status: HackIssueStatus.OPEN })
        .mockResolvedValueOnce({ _id: issueId, status: HackIssueStatus.ASSIGNED, assignee: id() });
      hackIssueService.transition.mockRejectedValue(error);

      await expect(service.claim(issueId, hacker)).rejects.toThrow(
        'This issue was just claimed by someone else'
      );
    });

    it('throws when the issue does not exist', async () => {
      issueIs(null);

      await expect(service.claim(issueId, hacker)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('release', () => {
    it('unassigns the issue then puts it back in the pool', async () => {
      issueIs({ _id: issueId, status: HackIssueStatus.IN_PROGRESS, assignee: hacker._id });

      await service.release(issueId, hacker);

      expect(hackIssueService.transition.mock.calls).toEqual([
        [
          issueId,
          HackIssueEvent.UNASSIGN,
          { actorId: hacker._id, unset: ['assignee', 'assignedAt'] },
        ],
        [issueId, HackIssueEvent.RELEASE, { actorId: hacker._id }],
      ]);
    });

    it("rejects someone who isn't the assignee", async () => {
      issueIs({ _id: issueId, status: HackIssueStatus.ASSIGNED, assignee: id() });

      await expect(service.release(issueId, hacker)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("lets a kage release anyone's issue", async () => {
      issueIs({ _id: issueId, status: HackIssueStatus.ASSIGNED, assignee: id() });

      await expect(service.release(issueId, userOf(UserRole.KAGE))).resolves.toBeDefined();
    });

    it('rejects an issue with an open pull request', async () => {
      issueIs({ _id: issueId, status: HackIssueStatus.PR_OPEN, assignee: hacker._id });

      await expect(service.release(issueId, hacker)).rejects.toThrow('A pull request is open');
    });

    it('rejects an issue nobody holds', async () => {
      await expect(service.release(issueId, hacker)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('assignTo', () => {
    const menteeId = id();
    const mentor = userOf(UserRole.MENTOR, { name: 'Kakashi' });

    it('lets a mentor assign an issue to a mentee of their squad', async () => {
      await service.assignTo(issueId, menteeId, mentor);

      expect(squadModel.exists).toHaveBeenCalledWith({
        mentor: mentor._id,
        members: menteeId,
        isActive: true,
      });
      expect(hackIssueService.transition).toHaveBeenCalledWith(issueId, HackIssueEvent.ASSIGN, {
        actorId: mentor._id,
        reason: 'Assigned by Kakashi',
        set: { assignee: menteeId, assignedAt: expect.any(Date) },
      });
    });

    it("rejects a mentee outside the mentor's squads", async () => {
      inSquad.mockResolvedValue(null);

      await expect(service.assignTo(issueId, menteeId, mentor)).rejects.toBeInstanceOf(
        ForbiddenException
      );
      expect(hackIssueService.transition).not.toHaveBeenCalled();
    });

    it('lets a kage assign to any active member', async () => {
      inSquad.mockResolvedValue(null);

      await service.assignTo(issueId, menteeId, userOf(UserRole.KAGE));

      expect(squadModel.exists).not.toHaveBeenCalled();
      expect(hackIssueService.transition).toHaveBeenCalled();
    });

    it('applies the limit to the mentee', async () => {
      activeCount.mockResolvedValue(3);

      await expect(service.assignTo(issueId, menteeId, mentor)).rejects.toThrow(
        'Naruto already has 3 issues in progress'
      );
    });

    it('rejects an inactive user', async () => {
      userService.findOne.mockResolvedValue({ _id: menteeId, status: UserStatus.PENDING });

      await expect(service.assignTo(issueId, menteeId, mentor)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });
  });

  describe('findMine', () => {
    it("returns the hacker's active issues and the limit", async () => {
      const issues = [{ _id: issueId }];
      hackIssueModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(issues),
      });

      await expect(service.findMine(hacker._id)).resolves.toEqual({
        issues,
        activeCount: 1,
        maxActiveClaims: 3,
      });
      expect(hackIssueModel.find).toHaveBeenCalledWith({
        assignee: hacker._id,
        status: { $in: ACTIVE_STATUSES },
      });
    });
  });
});
