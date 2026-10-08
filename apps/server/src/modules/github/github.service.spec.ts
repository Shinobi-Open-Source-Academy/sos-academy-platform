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
