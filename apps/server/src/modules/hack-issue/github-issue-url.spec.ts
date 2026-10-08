import { parseGitHubIssueUrl } from './github-issue-url';

describe('parseGitHubIssueUrl', () => {
  it.each([
    ['https://github.com/owner/repo/issues/42', { owner: 'owner', repo: 'repo', number: 42 }],
    [
      'http://www.github.com/Owner/my.repo/issues/7/',
      { owner: 'Owner', repo: 'my.repo', number: 7 },
    ],
    [
      'https://github.com/owner/repo-name/issues/3#issuecomment-1',
      { owner: 'owner', repo: 'repo-name', number: 3 },
    ],
    [
      '  https://github.com/owner/repo/issues/9?foo=bar  ',
      { owner: 'owner', repo: 'repo', number: 9 },
    ],
  ])('parses %s', (url, expected) => {
    expect(parseGitHubIssueUrl(url)).toEqual(expected);
  });

  it.each([
    'not a url',
    'https://gitlab.com/owner/repo/issues/1',
    'https://github.com/owner/repo',
    'https://github.com/owner/repo/pull/1',
    'https://github.com/owner/repo/issues/',
    'https://github.com/owner/repo/issues/0',
    'https://github.com/owner/repo/issues/abc',
    'https://github.com.evil.com/owner/repo/issues/1',
    'https://github.com/owner/repo/issues/1/extra',
  ])('rejects %s', (url) => {
    expect(parseGitHubIssueUrl(url)).toBeNull();
  });
});
