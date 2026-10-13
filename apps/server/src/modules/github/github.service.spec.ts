import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GitHubService, GitHubUnavailableError } from './github.service';

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return { __esModule: true, default: { ...actual.default, get: jest.fn() } };
});

const mockedGet = axios.get as jest.Mock;

const axiosError = (status: number) =>
  Object.assign(new Error(`Request failed with status ${status}`), {
    isAxiosError: true,
    response: { status, data: {}, headers: {} },
  });

describe('GitHubService.fetchIssue', () => {
  let service: GitHubService;

  beforeEach(() => {
    mockedGet.mockReset();
    service = new GitHubService({ get: () => undefined } as unknown as ConfigService);
  });

  it('returns the issue with its repository language', async () => {
    mockedGet.mockImplementation(async (url: string) =>
      url.endsWith('/issues/42')
        ? {
            data: {
              id: 1001,
              number: 42,
              title: 'Fix the thing',
              body: null,
              labels: [{ name: 'bug' }, 'help wanted', {}],
              state: 'open',
              html_url: 'https://github.com/owner/repo/issues/42',
            },
          }
        : { data: { full_name: 'Owner/Repo', language: 'Go' } }
    );

    await expect(service.fetchIssue('owner', 'repo', 42)).resolves.toEqual({
      githubId: 1001,
      owner: 'Owner',
      repo: 'Repo',
      number: 42,
      title: 'Fix the thing',
      body: null,
      labels: ['bug', 'help wanted'],
      language: 'Go',
      state: 'open',
      htmlUrl: 'https://github.com/owner/repo/issues/42',
      isPullRequest: false,
    });
    expect(mockedGet).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/issues/42',
      expect.anything()
    );
  });

  it('flags pull requests', async () => {
    mockedGet.mockImplementation(async (url: string) =>
      url.endsWith('/issues/1')
        ? { data: { id: 1, number: 1, title: 'PR', state: 'open', pull_request: {} } }
        : { data: { full_name: 'owner/repo', language: null } }
    );

    await expect(service.fetchIssue('owner', 'repo', 1)).resolves.toMatchObject({
      isPullRequest: true,
      language: null,
    });
  });

  it.each([404, 410])('returns null when GitHub answers %i', async (status) => {
    mockedGet.mockRejectedValue(axiosError(status));

    await expect(service.fetchIssue('owner', 'repo', 1)).resolves.toBeNull();
  });

  it.each([403, 500])('throws GitHubUnavailableError when GitHub answers %i', async (status) => {
    mockedGet.mockRejectedValue(axiosError(status));

    await expect(service.fetchIssue('owner', 'repo', 1)).rejects.toBeInstanceOf(
      GitHubUnavailableError
    );
  });
});

describe('GitHubService.fetchPullRequestsForIssue', () => {
  let service: GitHubService;

  const crossReference = (number: number, login: string, repository = 'Owner/Repo') => ({
    event: 'cross-referenced',
    source: {
      issue: { number, pull_request: {}, user: { login }, repository: { full_name: repository } },
    },
  });

  beforeEach(() => {
    mockedGet.mockReset();
    service = new GitHubService({ get: () => undefined } as unknown as ConfigService);
  });

  it("returns the assignee's pull requests referencing the issue, with their review decision", async () => {
    mockedGet.mockImplementation(async (url: string) => {
      if (url.includes('/timeline')) {
        return {
          headers: { 'x-ratelimit-remaining': '4321', 'x-ratelimit-reset': '4102444800' },
          data: [
            { event: 'labeled' },
            crossReference(7, 'Naruto-Dev'),
            crossReference(7, 'Naruto-Dev'),
            crossReference(8, 'someone-else'),
            crossReference(9, 'naruto-dev', 'other/fork'),
            {
              event: 'cross-referenced',
              source: { issue: { number: 10, user: { login: 'naruto-dev' } } },
            },
          ],
        };
      }
      if (url.endsWith('/pulls/7')) {
        return {
          headers: { 'x-ratelimit-remaining': '4320' },
          data: {
            number: 7,
            state: 'open',
            merged: false,
            merged_at: null,
            updated_at: '2026-10-01T10:00:00Z',
            html_url: 'https://github.com/Owner/Repo/pull/7',
            user: { login: 'Naruto-Dev' },
          },
        };
      }
      if (url.includes('/pulls/7/reviews')) {
        return {
          headers: { 'x-ratelimit-remaining': '4319' },
          data: [
            { state: 'CHANGES_REQUESTED', user: { login: 'maintainer' } },
            { state: 'COMMENTED', user: { login: 'maintainer' } },
            { state: 'APPROVED', user: { login: 'other-reviewer' } },
          ],
        };
      }
      throw new Error(`unexpected ${url}`);
    });

    await expect(
      service.fetchPullRequestsForIssue('Owner', 'Repo', 42, 'naruto-dev')
    ).resolves.toEqual([
      {
        number: 7,
        authorLogin: 'Naruto-Dev',
        state: 'open',
        merged: false,
        mergedAt: null,
        updatedAt: new Date('2026-10-01T10:00:00Z'),
        htmlUrl: 'https://github.com/Owner/Repo/pull/7',
        reviewDecision: 'CHANGES_REQUESTED',
      },
    ]);
    // timeline + pull request + reviews: the other references are filtered out without a call
    expect(mockedGet).toHaveBeenCalledTimes(3);
    expect(service.rateLimit).toEqual({
      remaining: 4319,
      limit: null,
      resetAt: new Date(4102444800 * 1000),
    });
  });

  it("uses a reviewer's latest decision", async () => {
    mockedGet.mockImplementation(async (url: string) => {
      if (url.includes('/timeline'))
        return { headers: {}, data: [crossReference(7, 'naruto-dev')] };
      if (url.endsWith('/pulls/7'))
        return {
          headers: {},
          data: {
            number: 7,
            state: 'open',
            merged: false,
            merged_at: null,
            updated_at: '2026-10-01',
            html_url: 'u',
            user: { login: 'naruto-dev' },
          },
        };
      return {
        headers: {},
        data: [
          { state: 'CHANGES_REQUESTED', user: { login: 'maintainer' } },
          { state: 'APPROVED', user: { login: 'maintainer' } },
        ],
      };
    });

    const [pr] = await service.fetchPullRequestsForIssue('owner', 'repo', 42, 'naruto-dev');

    expect(pr.reviewDecision).toBe('APPROVED');
  });

  it('does not fetch reviews of a merged pull request', async () => {
    mockedGet.mockImplementation(async (url: string) =>
      url.includes('/timeline')
        ? { headers: {}, data: [crossReference(7, 'naruto-dev')] }
        : {
            headers: {},
            data: {
              number: 7,
              state: 'closed',
              merged: true,
              merged_at: '2026-10-02',
              updated_at: '2026-10-02',
              html_url: 'u',
              user: { login: 'naruto-dev' },
            },
          }
    );

    const [pr] = await service.fetchPullRequestsForIssue('owner', 'repo', 42, 'naruto-dev');

    expect(pr).toMatchObject({
      merged: true,
      mergedAt: new Date('2026-10-02'),
      reviewDecision: null,
    });
    expect(mockedGet).toHaveBeenCalledTimes(2);
  });

  it('returns nothing for an issue that no longer exists', async () => {
    mockedGet.mockRejectedValue(axiosError(404));

    await expect(service.fetchPullRequestsForIssue('owner', 'repo', 42, 'x')).resolves.toEqual([]);
  });

  it('reports GitHub being unavailable and still tracks the rate limit', async () => {
    mockedGet.mockRejectedValue(
      Object.assign(axiosError(403), {
        response: { status: 403, data: {}, headers: { 'x-ratelimit-remaining': '0' } },
      })
    );

    await expect(
      service.fetchPullRequestsForIssue('owner', 'repo', 42, 'x')
    ).rejects.toBeInstanceOf(GitHubUnavailableError);
    expect(service.rateLimit.remaining).toBe(0);
  });

  it('forgets the remaining quota once the window has reset', async () => {
    mockedGet.mockResolvedValue({
      headers: {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-limit': '60',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) - 1),
      },
      data: [],
    });

    await service.fetchPullRequestsForIssue('owner', 'repo', 42, 'x');

    expect(service.rateLimit).toMatchObject({ remaining: null, limit: 60 });
  });
});
