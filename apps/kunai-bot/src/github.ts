import axios from 'axios';
import { config } from './config';
import { COMMUNITY_LANGUAGES } from './data/languages';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const SEARCH_TIMEOUT_MS = 15000;
const MAX_ISSUES_PER_LANGUAGE = 15;
// Quality bar so we surface issues from repos people actually use, not toy/abandoned ones.
const MIN_REPO_STARS = 200;

export interface OpenIssue {
  title: string;
  url: string;
  repo: string;
  language: string;
}

interface GitHubSearchIssueItem {
  title: string;
  html_url: string;
  repository_url: string;
}

interface GitHubSearchResponse {
  items: GitHubSearchIssueItem[];
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
  };

  if (config.githubApiToken) {
    headers.Authorization = `Bearer ${config.githubApiToken}`;
  }

  return headers;
}

function repoFromUrl(repositoryUrl: string): string {
  return repositoryUrl.replace(`${GITHUB_API_BASE_URL}/repos/`, '');
}

function buildQuery(language: string): string {
  return [
    'is:issue',
    'is:open',
    'no:assignee',
    'archived:false',
    `language:${language}`,
    `stars:>${MIN_REPO_STARS}`,
    'label:"good first issue","help wanted"',
  ].join(' ');
}

/** Open, unassigned, beginner-friendly issues in a single language, from active/starred repos. */
async function fetchIssuesForLanguage(language: string): Promise<OpenIssue[]> {
  try {
    const response = await axios.get<GitHubSearchResponse>(`${GITHUB_API_BASE_URL}/search/issues`, {
      headers: getHeaders(),
      timeout: SEARCH_TIMEOUT_MS,
      params: {
        q: buildQuery(language),
        per_page: MAX_ISSUES_PER_LANGUAGE,
        sort: 'updated',
        order: 'desc',
      },
    });

    return (response.data.items ?? []).map((item) => ({
      title: item.title,
      url: item.html_url,
      repo: repoFromUrl(item.repository_url),
      language,
    }));
  } catch (error) {
    console.error(
      `[kunai-bot] Failed to fetch ${language} issues from GitHub:`,
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

/**
 * Fetches open, unassigned "good first issue"/"help wanted" issues from actively-starred repos,
 * across every language the Academy's communities teach. One request per language (sequential,
 * to stay well clear of GitHub's search rate limit), merged into a single pool to pick from.
 */
export async function fetchOpenGoodFirstIssues(): Promise<OpenIssue[]> {
  const results: OpenIssue[] = [];

  for (const language of COMMUNITY_LANGUAGES) {
    const issues = await fetchIssuesForLanguage(language);
    results.push(...issues);
  }

  return results;
}
