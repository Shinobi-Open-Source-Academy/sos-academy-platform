import type { OpenIssue } from '../github';
import { truncate } from '../utils/text';

const MAX_REPO_LENGTH = 50;
const MAX_TITLE_LENGTH = 90;

/** Compact, wrap-friendly rendering of an issue: bold "repo · language" line, then the linked title. */
export function formatIssueLink(issue: OpenIssue): string {
  const repo = truncate(issue.repo, MAX_REPO_LENGTH);
  const title = truncate(issue.title, MAX_TITLE_LENGTH);
  return `**${repo}** · ${issue.language}\n[${title}](${issue.url})`;
}
