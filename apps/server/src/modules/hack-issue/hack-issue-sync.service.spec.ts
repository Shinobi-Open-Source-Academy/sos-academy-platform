import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HackIssueStatus as S } from '@sos-academy/shared';
import { GitHubPullRequest, GitHubService } from '../github/github.service';
import { HackIssueService } from './hack-issue.service';
import { HackIssueEvent as E } from './hack-issue-status-machine';
import {
  HackIssueSyncService,
  pickPullRequest,
  statusFromPullRequest,
} from './hack-issue-sync.service';
import { HackIssue } from './schemas/hack-issue.schema';

const pr = (overrides: Partial<GitHubPullRequest> = {}): GitHubPullRequest => ({
  number: 7,
  authorLogin: 'naruto-dev',
  state: 'open',
  merged: false,
  mergedAt: null,
  updatedAt: new Date('2026-10-01'),
  htmlUrl: 'https://github.com/owner/repo/pull/7',
  reviewDecision: null,
  ...overrides,
});

const issue = (status: S, login: string | null = 'naruto-dev') => ({
  _id: 'issue-1',
  owner: 'owner',
  repo: 'repo',
  number: 42,
  status,
  assignee: { githubProfile: login ? { login } : {} },
});

describe('statusFromPullRequest', () => {
  it.each([
    [pr(), S.PR_OPEN],
    [pr({ reviewDecision: 'APPROVED' }), S.PR_OPEN],
    [pr({ reviewDecision: 'CHANGES_REQUESTED' }), S.CHANGES_REQUESTED],
    [pr({ state: 'closed', merged: true }), S.MERGED],
    [pr({ state: 'closed' }), S.CLOSED_UNMERGED],
  ])('maps %j to %s', (pullRequest, status) => {
    expect(statusFromPullRequest(pullRequest)).toBe(status);
  });
});

describe('pickPullRequest', () => {
  it('prefers a merged pull request, then the latest open one, then the latest closed one', () => {
    const closed = pr({ number: 1, state: 'closed', updatedAt: new Date('2026-10-03') });
    const open = pr({ number: 2, updatedAt: new Date('2026-10-02') });
    const merged = pr({ number: 3, state: 'closed', merged: true });

    expect(pickPullRequest([closed, open, merged])?.number).toBe(3);
    expect(pickPullRequest([closed, open])?.number).toBe(2);
    expect(pickPullRequest([closed, pr({ number: 4, state: 'closed' })])?.number).toBe(1);
    expect(pickPullRequest([])).toBeNull();
  });
});

describe('HackIssueSyncService', () => {
  let service: HackIssueSyncService;
  let githubService: {
    fetchPullRequestsForIssue: jest.Mock;
    rateLimit: { remaining: number | null; limit: number | null; resetAt: null };
  };
  let hackIssueService: { transition: jest.Mock };
  let hackIssueModel: { find: jest.Mock; updateOne: jest.Mock };
  let findExec: jest.Mock;

  beforeEach(async () => {
    githubService = {
      fetchPullRequestsForIssue: jest.fn().mockResolvedValue([]),
      rateLimit: { remaining: null, limit: null, resetAt: null },
    };
    hackIssueService = { transition: jest.fn().mockResolvedValue({}) };
    findExec = jest.fn().mockResolvedValue([]);
    hackIssueModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: findExec,
      }),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackIssueSyncService,
        { provide: getModelToken(HackIssue.name), useValue: hackIssueModel },
        { provide: HackIssueService, useValue: hackIssueService },
        { provide: GitHubService, useValue: githubService },
      ],
    }).compile();

    service = module.get(HackIssueSyncService);
  });

  const events = () => hackIssueService.transition.mock.calls.map(([, event]) => event);

  describe('syncIssue', () => {
    it("looks up the assignee's pull requests by GitHub login", async () => {
      await service.syncIssue(issue(S.ASSIGNED));

      expect(githubService.fetchPullRequestsForIssue).toHaveBeenCalledWith(
        'owner',
        'repo',
        42,
        'naruto-dev'
      );
    });

    it('moves an assigned issue to PR_OPEN when its pull request is opened', async () => {
      githubService.fetchPullRequestsForIssue.mockResolvedValue([pr()]);

      await expect(service.syncIssue(issue(S.ASSIGNED))).resolves.toBe('updated');

      expect(hackIssueService.transition).toHaveBeenCalledWith('issue-1', E.OPEN_PR, {
        reason: 'GitHub sync: pull request #7 open',
        set: {
          pullRequest: {
            number: 7,
            url: 'https://github.com/owner/repo/pull/7',
            state: 'open',
            merged: false,
          },
          lastSyncedAt: expect.any(Date),
        },
      });
    });

    it('records changes requested as its own status', async () => {
      githubService.fetchPullRequestsForIssue.mockResolvedValue([
        pr({ reviewDecision: 'CHANGES_REQUESTED' }),
      ]);

      await service.syncIssue(issue(S.PR_OPEN));

      expect(events()).toEqual([E.REQUEST_CHANGES]);
    });

    it('sets MERGED when the pull request is merged upstream, even if no PR was seen before', async () => {
      githubService.fetchPullRequestsForIssue.mockResolvedValue([
        pr({ state: 'closed', merged: true }),
      ]);

      await service.syncIssue(issue(S.IN_PROGRESS));

      expect(events()).toEqual([E.OPEN_PR, E.MERGE]);
      expect(hackIssueService.transition.mock.calls[1][2].reason).toBe(
        'GitHub sync: pull request #7 merged'
      );
    });

    it('sets CLOSED_UNMERGED when the pull request is closed without merging', async () => {
      githubService.fetchPullRequestsForIssue.mockResolvedValue([pr({ state: 'closed' })]);

      await service.syncIssue(issue(S.CHANGES_REQUESTED));

      expect(events()).toEqual([E.CLOSE_UNMERGED]);
    });

    it('is a no-op when the pull request has not changed: no transition, no history row', async () => {
      githubService.fetchPullRequestsForIssue.mockResolvedValue([pr()]);

      await expect(service.syncIssue(issue(S.PR_OPEN))).resolves.toBe('skipped');
      await expect(service.syncIssue(issue(S.PR_OPEN))).resolves.toBe('skipped');

      expect(hackIssueService.transition).not.toHaveBeenCalled();
      expect(hackIssueModel.updateOne).toHaveBeenCalledWith(
        { _id: 'issue-1' },
        {
          $set: {
            pullRequest: expect.objectContaining({ number: 7 }),
            lastSyncedAt: expect.any(Date),
          },
        }
      );
    });

    it('leaves the issue alone while there is no pull request', async () => {
      await expect(service.syncIssue(issue(S.ASSIGNED))).resolves.toBe('skipped');

      expect(hackIssueService.transition).not.toHaveBeenCalled();
    });

    it('skips an assignee without a GitHub account', async () => {
      await expect(service.syncIssue(issue(S.ASSIGNED, null))).resolves.toBe('skipped');

      expect(githubService.fetchPullRequestsForIssue).not.toHaveBeenCalled();
    });

    it('lets the next run catch up when the issue changed meanwhile', async () => {
      githubService.fetchPullRequestsForIssue.mockResolvedValue([pr()]);
      hackIssueService.transition.mockRejectedValue(new ConflictException());

      await expect(service.syncIssue(issue(S.ASSIGNED))).resolves.toBe('skipped');
    });
  });

  describe('syncAll', () => {
    it('checks every issue being worked on', async () => {
      findExec.mockResolvedValue([issue(S.ASSIGNED), issue(S.PR_OPEN)]);
      githubService.fetchPullRequestsForIssue.mockResolvedValue([pr()]);

      await expect(service.syncAll()).resolves.toEqual({
        checked: 2,
        updated: 1,
        skipped: 1,
        errors: 0,
        stoppedForRateLimit: false,
      });
      expect(hackIssueModel.find).toHaveBeenCalledWith({
        status: { $in: [S.ASSIGNED, S.IN_PROGRESS, S.PR_OPEN, S.CHANGES_REQUESTED] },
        assignee: { $exists: true },
      });
    });

    it('stops early when the GitHub rate limit runs low', async () => {
      findExec.mockResolvedValue([issue(S.ASSIGNED), issue(S.ASSIGNED)]);
      githubService.rateLimit.remaining = 10;

      const summary = await service.syncAll();

      expect(summary).toMatchObject({ checked: 0, stoppedForRateLimit: true });
      expect(githubService.fetchPullRequestsForIssue).not.toHaveBeenCalled();
    });

    it('keeps a smaller reserve when the quota is small (no GitHub token)', async () => {
      findExec.mockResolvedValue([issue(S.ASSIGNED)]);
      githubService.rateLimit = { remaining: 20, limit: 60, resetAt: null };

      // reserve = min(50, 60 / 5) = 12, so 20 calls left is enough
      await expect(service.syncAll()).resolves.toMatchObject({
        checked: 1,
        stoppedForRateLimit: false,
      });

      githubService.rateLimit = { remaining: 11, limit: 60, resetAt: null };
      await expect(service.syncAll()).resolves.toMatchObject({ stoppedForRateLimit: true });
    });

    it('keeps going when one issue fails', async () => {
      findExec.mockResolvedValue([issue(S.ASSIGNED), issue(S.ASSIGNED)]);
      githubService.fetchPullRequestsForIssue
        .mockRejectedValueOnce(new Error('GitHub down'))
        .mockResolvedValueOnce([pr()]);

      await expect(service.syncAll()).resolves.toMatchObject({ checked: 2, updated: 1, errors: 1 });
    });

    it('does not run twice at the same time', async () => {
      let release: () => void = () => undefined;
      findExec.mockReturnValue(
        new Promise((resolve) => {
          release = () => resolve([]);
        })
      );

      const first = service.syncAll();
      await expect(service.syncAll()).resolves.toMatchObject({ checked: 0 });
      release();
      await first;
      expect(hackIssueModel.find).toHaveBeenCalledTimes(1);
    });
  });
});
