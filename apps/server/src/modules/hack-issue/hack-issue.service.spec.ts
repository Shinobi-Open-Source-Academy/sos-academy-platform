import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { GitHubIssue, GitHubService, GitHubUnavailableError } from '../github/github.service';
import { HackIssueService } from './hack-issue.service';
import { HACK_ISSUE_STATUS_CHANGED, HackIssueEvent } from './hack-issue-status-machine';
import { HackIssue } from './schemas/hack-issue.schema';

const URL = 'https://github.com/Owner/Repo/issues/42';

const githubIssue = (overrides: Partial<GitHubIssue> = {}): GitHubIssue => ({
  githubId: 1001,
  owner: 'Owner',
  repo: 'Repo',
  number: 42,
  title: 'Fix the thing',
  body: 'Details',
  labels: ['good first issue'],
  language: 'TypeScript',
  state: 'open',
  htmlUrl: URL,
  isPullRequest: false,
  ...overrides,
});

describe('HackIssueService', () => {
  let service: HackIssueService;
  let githubService: { fetchIssue: jest.Mock };
  let hackIssueModel: {
    exists: jest.Mock;
    create: jest.Mock;
    find: jest.Mock;
    countDocuments: jest.Mock;
    findById: jest.Mock;
    findOneAndUpdate: jest.Mock;
  };
  const eventEmitter = { emit: jest.fn() };
  let findQuery: Record<string, jest.Mock>;

  beforeEach(async () => {
    findQuery = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    hackIssueModel = {
      exists: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      create: jest.fn().mockImplementation(async (doc) => doc),
      find: jest.fn().mockReturnValue(findQuery),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    eventEmitter.emit.mockReset();
    githubService = { fetchIssue: jest.fn().mockResolvedValue(githubIssue()) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackIssueService,
        { provide: getModelToken(HackIssue.name), useValue: hackIssueModel },
        { provide: GitHubService, useValue: githubService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get(HackIssueService);
  });

  describe('register', () => {
    it('creates a registered issue from a valid GitHub issue URL', async () => {
      const issue = await service.register({ url: URL }, 'admin-id');

      expect(githubService.fetchIssue).toHaveBeenCalledWith('Owner', 'Repo', 42);
      expect(hackIssueModel.create).toHaveBeenCalledWith({
        githubId: 1001,
        repository: 'Owner/Repo',
        owner: 'Owner',
        repo: 'Repo',
        number: 42,
        title: 'Fix the thing',
        body: 'Details',
        labels: ['good first issue'],
        language: 'TypeScript',
        url: URL,
        registeredBy: 'admin-id',
      });
      expect(issue).toMatchObject({ repository: 'Owner/Repo', number: 42 });
    });

    it('rejects an invalid URL without calling GitHub', async () => {
      await expect(
        service.register({ url: 'https://github.com/owner/repo' })
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(githubService.fetchIssue).not.toHaveBeenCalled();
    });

    it('rejects an already registered issue without calling GitHub', async () => {
      hackIssueModel.exists.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'x' }) });

      await expect(service.register({ url: URL })).rejects.toBeInstanceOf(ConflictException);
      expect(hackIssueModel.exists).toHaveBeenCalledWith({ repository: 'owner/repo', number: 42 });
      expect(githubService.fetchIssue).not.toHaveBeenCalled();
    });

    it('checks duplicates again against the canonical repository name', async () => {
      githubService.fetchIssue.mockResolvedValue(
        githubIssue({ owner: 'new-owner', repo: 'renamed' })
      );
      hackIssueModel.exists
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ _id: 'x' }) });

      await expect(service.register({ url: URL })).rejects.toBeInstanceOf(ConflictException);
      expect(hackIssueModel.exists).toHaveBeenLastCalledWith({
        repository: 'new-owner/renamed',
        number: 42,
      });
      expect(hackIssueModel.create).not.toHaveBeenCalled();
    });

    it('maps a concurrent duplicate insert to a conflict', async () => {
      hackIssueModel.create.mockRejectedValue({ code: 11000 });

      await expect(service.register({ url: URL })).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects a nonexistent or private issue', async () => {
      githubService.fetchIssue.mockResolvedValue(null);

      await expect(service.register({ url: URL })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects pull requests', async () => {
      githubService.fetchIssue.mockResolvedValue(githubIssue({ isPullRequest: true }));

      await expect(service.register({ url: URL })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects closed issues', async () => {
      githubService.fetchIssue.mockResolvedValue(githubIssue({ state: 'closed' }));

      await expect(service.register({ url: URL })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('reports GitHub outages as service unavailable', async () => {
      githubService.fetchIssue.mockRejectedValue(new GitHubUnavailableError('down'));

      await expect(service.register({ url: URL })).rejects.toBeInstanceOf(
        ServiceUnavailableException
      );
    });
  });

  describe('findAll', () => {
    it('paginates and filters by status and escaped search', async () => {
      hackIssueModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(45) });

      const result = await service.findAll({
        status: 'OPEN' as never,
        search: 'owner/repo (x',
        page: 2,
        limit: 20,
      });

      const filter = hackIssueModel.find.mock.calls[0][0];
      expect(filter.status).toBe('OPEN');
      expect(filter.$or[0].title.source).toBe('owner\\/repo \\(x');
      expect(findQuery.skip).toHaveBeenCalledWith(20);
      expect(result.pagination).toEqual({ total: 45, page: 2, limit: 20, pages: 3 });
    });
  });

  describe('transition', () => {
    const currentStatus = (status: string | null) =>
      hackIssueModel.findById.mockReturnValue({
        select: () => ({ lean: () => ({ exec: async () => (status ? { status } : null) }) }),
      });

    it('moves the issue, records the history and emits a domain event', async () => {
      currentStatus('PR_OPEN');
      const updated = { _id: 'i1', status: 'CHANGES_REQUESTED' };
      hackIssueModel.findOneAndUpdate.mockReturnValue({ exec: async () => updated });

      const result = await service.transition('i1', HackIssueEvent.REQUEST_CHANGES, {
        actorId: 'mentor-1',
        reason: 'Missing tests',
      });

      expect(result).toBe(updated);
      const [filter, update] = hackIssueModel.findOneAndUpdate.mock.calls[0];
      // Guarded on the status that was read, so a concurrent change can't be overwritten
      expect(filter).toEqual({ _id: 'i1', status: 'PR_OPEN' });
      expect(update.$set).toEqual({ status: 'CHANGES_REQUESTED' });
      expect(update.$push.statusHistory).toMatchObject({
        from: 'PR_OPEN',
        to: 'CHANGES_REQUESTED',
        event: HackIssueEvent.REQUEST_CHANGES,
        actor: 'mentor-1',
        reason: 'Missing tests',
        at: expect.any(Date),
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        HACK_ISSUE_STATUS_CHANGED,
        expect.objectContaining({
          issueId: 'i1',
          from: 'PR_OPEN',
          to: 'CHANGES_REQUESTED',
          event: HackIssueEvent.REQUEST_CHANGES,
          actorId: 'mentor-1',
        })
      );
    });

    it('rejects an illegal transition without writing anything', async () => {
      currentStatus('OPEN');

      await expect(service.transition('i1', HackIssueEvent.MERGE)).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(hackIssueModel.findOneAndUpdate).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('reports a concurrent status change as a conflict', async () => {
      currentStatus('ASSIGNED');
      hackIssueModel.findOneAndUpdate.mockReturnValue({ exec: async () => null });

      await expect(service.transition('i1', HackIssueEvent.START)).rejects.toBeInstanceOf(
        ConflictException
      );
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('throws when the issue does not exist', async () => {
      currentStatus(null);

      await expect(service.transition('missing', HackIssueEvent.ASSIGN)).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });
});
