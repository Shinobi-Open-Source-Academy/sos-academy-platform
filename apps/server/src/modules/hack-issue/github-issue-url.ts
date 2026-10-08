export interface GitHubIssueRef {
  owner: string;
  repo: string;
  number: number;
}

// https://github.com/<owner>/<repo>/issues/<number>, optionally followed by a slash, query or hash
const GITHUB_ISSUE_URL_REGEX =
  /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100})\/issues\/(\d+)\/?(?:[?#].*)?$/;

/**
 * Parse a GitHub issue URL into its owner, repo and issue number
 * @returns The issue reference, or null if the URL isn't a GitHub issue URL
 */
export function parseGitHubIssueUrl(url: string): GitHubIssueRef | null {
  const match = url.trim().match(GITHUB_ISSUE_URL_REGEX);
  if (!match) {
    return null;
  }

  const [, owner, repo, rawNumber] = match;
  const number = Number.parseInt(rawNumber, 10);
  if (!Number.isSafeInteger(number) || number < 1) {
    return null;
  }

  return { owner, repo: repo.replace(/\.git$/, ''), number };
}
