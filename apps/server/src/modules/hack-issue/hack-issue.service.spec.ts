import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { GitHubIssue, GitHubService, GitHubUnavailableError } from '../github/github.service';
import { HackIssueService } from './hack-issue.service';
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
  };
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
    };
    githubService = { fetchIssue: jest.fn().mockResolvedValue(githubIssue()) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackIssueService,
        { provide: getModelToken(HackIssue.name), useValue: hackIssueModel },
        { provide: GitHubService, useValue: githubService },
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
});
