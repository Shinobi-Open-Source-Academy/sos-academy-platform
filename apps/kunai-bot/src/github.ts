import axios from 'axios';
import { config } from './config';
import { COMMUNITY_PROJECTS } from './data/projects';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const SEARCH_TIMEOUT_MS = 15000;
const MAX_ISSUES_TO_FETCH = 30;

export interface OpenIssue {
  title: string;
  url: string;
  repo: string;
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

/** Fetches open, unassigned "good first issue"/"help wanted" issues across our curated repos. */
export async function fetchOpenGoodFirstIssues(): Promise<OpenIssue[]> {
  const repoQualifiers = COMMUNITY_PROJECTS.map((project) => `repo:${project.repo}`).join(' ');
  const query = `is:issue is:open no:assignee label:"good first issue","help wanted" ${repoQualifiers}`;

  try {
    const response = await axios.get<GitHubSearchResponse>(`${GITHUB_API_BASE_URL}/search/issues`, {
      headers: getHeaders(),
      timeout: SEARCH_TIMEOUT_MS,
      params: { q: query, per_page: MAX_ISSUES_TO_FETCH, sort: 'updated', order: 'desc' },
    });

    return (response.data.items ?? []).map((item) => ({
      title: item.title,
      url: item.html_url,
      repo: repoFromUrl(item.repository_url),
    }));
  } catch (error) {
    console.error(
      '[kunai-bot] Failed to fetch open issues from GitHub:',
      error instanceof Error ? error.message : error
    );
    return [];
  }
}
