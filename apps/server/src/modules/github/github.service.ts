import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGitHubProfile } from '@sos-academy/shared';
import axios from 'axios';

const GITHUB_API_TIMEOUT = 30000;
const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';

export interface GitHubIssue {
  githubId: number;
  owner: string;
  repo: string;
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  language: string | null;
  state: 'open' | 'closed';
  htmlUrl: string;
  isPullRequest: boolean;
}

/** A pull request that references a registered issue */
export interface GitHubPullRequest {
  number: number;
  authorLogin: string;
  state: 'open' | 'closed';
  merged: boolean;
  mergedAt: Date | null;
  updatedAt: Date;
  htmlUrl: string;
  /** Latest decisive review: changes requested by at least one reviewer, or approved */
  reviewDecision: 'CHANGES_REQUESTED' | 'APPROVED' | null;
}

/**
 * Thrown when GitHub can't be reached or refuses the request for a reason other than
 * the resource not existing (rate limit, network error, 5xx...).
 */
export class GitHubUnavailableError extends Error {}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly orgName: string | undefined;
  private readonly orgAdminToken: string | undefined;
  private readonly apiToken: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.orgName = this.configService.get<string>('GITHUB_ORG_NAME');
    this.orgAdminToken = this.configService.get<string>('GITHUB_ORG_ADMIN_TOKEN');
    // Use GITHUB_API_TOKEN if available, otherwise fall back to GITHUB_ORG_ADMIN_TOKEN
    this.apiToken = this.configService.get<string>('GITHUB_API_TOKEN') || this.orgAdminToken;

    if (this.orgName && this.orgAdminToken) {
      this.logger.log(`GitHub org integration enabled for: ${this.orgName}`);
    } else {
      this.logger.warn(
        'GitHub org integration disabled: GITHUB_ORG_NAME or GITHUB_ORG_ADMIN_TOKEN not configured'
      );
    }

    if (this.apiToken) {
      this.logger.log('GitHub API token configured for authenticated requests');
    } else {
      this.logger.warn(
        'GitHub API token not configured. API requests will be rate-limited (60/hour). Set GITHUB_API_TOKEN or GITHUB_ORG_ADMIN_TOKEN for higher limits (5000/hour).'
      );
    }
  }

  /** Remaining GitHub API calls in the current window, as last reported by GitHub */
  private rateLimitRemaining: number | null = null;
  private rateLimitTotal: number | null = null;
  private rateLimitResetAt: Date | null = null;

  /**
   * GitHub API quota as last reported by GitHub. `remaining` is `null` when unknown, or once the
   * window has reset (the next call will report the new value).
   */
  get rateLimit(): { remaining: number | null; limit: number | null; resetAt: Date | null } {
    const expired = this.rateLimitResetAt !== null && this.rateLimitResetAt.getTime() <= Date.now();
    return {
      remaining: expired ? null : this.rateLimitRemaining,
      limit: this.rateLimitTotal,
      resetAt: this.rateLimitResetAt,
    };
  }

  private trackRateLimit(headers: Record<string, unknown> | undefined): void {
    const remaining = Number(headers?.['x-ratelimit-remaining']);
    const limit = Number(headers?.['x-ratelimit-limit']);
    const reset = Number(headers?.['x-ratelimit-reset']);
    if (Number.isFinite(remaining)) {
      this.rateLimitRemaining = remaining;
    }
    if (Number.isFinite(limit) && limit > 0) {
      this.rateLimitTotal = limit;
    }
    if (Number.isFinite(reset) && reset > 0) {
      this.rateLimitResetAt = new Date(reset * 1000);
    }
  }

  private async apiGet<T>(path: string): Promise<T> {
    try {
      const response = await axios.get(`${GITHUB_API_BASE_URL}${path}`, {
        headers: this.getApiHeaders(),
        timeout: GITHUB_API_TIMEOUT,
      });
      this.trackRateLimit(response.headers as Record<string, unknown>);
      return response.data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.trackRateLimit(error.response?.headers as Record<string, unknown> | undefined);
      }
      throw error;
    }
  }

  /**
   * Get headers for GitHub API requests with authentication if available
   */
  private getApiHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    };

    if (this.apiToken) {
      headers.Authorization = `Bearer ${this.apiToken}`;
    }

    return headers;
  }

  /**
   * Fetch GitHub user profile by handle
   * @param handle GitHub username
   * @returns GitHub profile data or null if not found/error
   */
  async fetchUserProfile(handle: string): Promise<IGitHubProfile | null> {
    try {
      this.logger.log(`Fetching GitHub profile for: ${handle}`);

      const response = await axios.get(`${GITHUB_API_BASE_URL}/users/${handle}`, {
        headers: this.getApiHeaders(),
        timeout: GITHUB_API_TIMEOUT,
      });

      const profile: IGitHubProfile = {
        login: response.data.login,
        githubId: response.data.id,
        avatarUrl: response.data.avatar_url,
        htmlUrl: response.data.html_url,
        publicRepos: response.data.public_repos,
        followers: response.data.followers,
        following: response.data.following,
        createdAt: response.data.created_at ? new Date(response.data.created_at) : undefined,
        lastUpdated: new Date(),
        email: response.data.email,
        bio: response.data.bio,
        location: response.data.location,
        company: response.data.company,
        blog: response.data.blog,
        twitterUsername: response.data.twitter_username,
      };

      this.logger.log(`GitHub profile fetched for: ${handle} (ID: ${profile.githubId})`);
      return profile;
    } catch (error) {
      this.logger.error(
        `Failed to fetch GitHub profile for ${handle}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Send organization invitation to a GitHub user
   * @param githubUserId GitHub user ID (preferred) - from profile.githubId
   * @param email Fallback email if user ID not available
   * @returns true if invitation sent successfully, false otherwise
   */
  async sendOrgInvitation(githubUserId?: number, email?: string): Promise<boolean> {
    if (!this.orgName || !this.orgAdminToken) {
      this.logger.warn('Cannot send org invitation: GitHub org not configured');
      return false;
    }

    if (!githubUserId && !email) {
      this.logger.error('Cannot send org invitation: neither githubUserId nor email provided');
      return false;
    }

    try {
      const payload: { invitee_id?: number; email?: string; role: string } = {
        role: 'direct_member',
      };

      if (githubUserId) {
        payload.invitee_id = githubUserId;
        this.logger.log(`Sending org invitation to GitHub user ID: ${githubUserId}`);
      } else if (email) {
        payload.email = email;
        this.logger.log(`Sending org invitation to email: ${email}`);
      }

      await axios.post(`${GITHUB_API_BASE_URL}/orgs/${this.orgName}/invitations`, payload, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${this.orgAdminToken}`,
          'X-GitHub-Api-Version': GITHUB_API_VERSION,
        },
        timeout: GITHUB_API_TIMEOUT,
      });

      this.logger.log(
        `Org invitation sent successfully to: ${githubUserId ? `user ID ${githubUserId}` : email}`
      );
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        // 422 = already a member or already invited - not an error
        if (status === 422) {
          this.logger.log(
            `User already a member or has pending invitation: ${githubUserId || email}`
          );
          return true;
        }

        this.logger.error(`Failed to send org invitation: ${status} - ${message}`);
      } else {
        this.logger.error(
          `Failed to send org invitation: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      return false;
    }
  }

  /**
   * Fetch profile and send org invitation in one call
   * This is the main method to use when a user joins with a GitHub handle
   * @param handle GitHub username
   * @param userEmail User's email as fallback for invitation
   * @returns GitHub profile or null
   */
  async fetchProfileAndInviteToOrg(
    handle: string,
    userEmail?: string
  ): Promise<IGitHubProfile | null> {
    const profile = await this.fetchUserProfile(handle);

    // Send org invitation (non-blocking, fire and forget)
    if (profile?.githubId) {
      this.sendOrgInvitation(profile.githubId).catch((err) => {
        this.logger.error(`Background org invitation failed: ${err.message}`);
      });
    } else if (userEmail) {
      // Fallback to email if profile fetch failed
      this.sendOrgInvitation(undefined, userEmail).catch((err) => {
        this.logger.error(`Background org invitation (email) failed: ${err.message}`);
      });
    }

    return profile;
  }

  /**
   * Fetch GitHub repository statistics
   * @param repoUrl Full GitHub repository URL (e.g., https://github.com/owner/repo)
   * @returns Repository stats or null if not found/error
   */
  async fetchRepositoryStats(repoUrl: string): Promise<{
    stars: number;
    contributors: number;
    lastUpdated: Date;
    website: string | null;
  } | null> {
    try {
      // Extract owner/repo from URL
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        this.logger.warn(`Invalid GitHub URL format: ${repoUrl}`);
        return null;
      }

      const [, owner, repo] = match;
      const repoPath = `${owner}/${repo.replace(/\.git$/, '')}`;

      // Only log if not using token (for debugging rate limit issues)
      if (!this.apiToken) {
        this.logger.debug(`Fetching GitHub repository stats for: ${repoPath}`);
      }

      // Fetch repository info
      const repoResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repoPath}`, {
        headers: this.getApiHeaders(),
        timeout: GITHUB_API_TIMEOUT,
      });

      // Fetch contributors count using Link header pagination
      let contributorsCount = 0;
      try {
        const contributorsResponse = await axios.get(
          `${GITHUB_API_BASE_URL}/repos/${repoPath}/contributors?per_page=100&anon=false`,
          {
            headers: this.getApiHeaders(),
            timeout: GITHUB_API_TIMEOUT,
          }
        );

        // Get total count from Link header if available
        const linkHeader = contributorsResponse.headers.link;
        if (linkHeader) {
          const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (lastPageMatch) {
            const lastPage = parseInt(lastPageMatch[1], 10);
            if (lastPage > 1) {
              // Fetch last page to get accurate count
              const lastPageResponse = await axios.get(
                `${GITHUB_API_BASE_URL}/repos/${repoPath}/contributors?per_page=100&page=${lastPage}&anon=false`,
                {
                  headers: this.getApiHeaders(),
                  timeout: GITHUB_API_TIMEOUT,
                }
              );
              contributorsCount = (lastPage - 1) * 100 + lastPageResponse.data.length;
            } else {
              contributorsCount = contributorsResponse.data.length;
            }
          } else {
            contributorsCount = contributorsResponse.data.length;
          }
        } else {
          contributorsCount = contributorsResponse.data.length;
        }
      } catch (_contribError) {
        this.logger.warn(`Failed to fetch contributors for ${repoPath}, using 0`);
        contributorsCount = 0;
      }

      const stats = {
        stars: repoResponse.data.stargazers_count || 0,
        contributors: contributorsCount,
        lastUpdated: repoResponse.data.updated_at
          ? new Date(repoResponse.data.updated_at)
          : new Date(),
        website: repoResponse.data.homepage || repoResponse.data.html_url || null,
      };

      // Only log success in debug mode to reduce noise
      this.logger.debug(
        `Repository stats fetched for ${repoPath}: ${stats.stars} stars, ${stats.contributors} contributors`
      );
      return stats;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        // Handle rate limiting
        if (status === 403) {
          const rateLimitRemaining = error.response?.headers['x-ratelimit-remaining'];
          const rateLimitReset = error.response?.headers['x-ratelimit-reset'];

          if (rateLimitRemaining === '0') {
            const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset, 10) * 1000) : null;
            this.logger.warn(
              `GitHub API rate limit exceeded for ${repoUrl}. ${resetTime ? `Resets at ${resetTime.toISOString()}` : 'Please wait before retrying.'}`
            );
          } else {
            this.logger.warn(`GitHub API returned 403 for ${repoUrl}: ${message}`);
          }
        } else {
          this.logger.error(
            `Failed to fetch repository stats for ${repoUrl}: ${status} - ${message}`
          );
        }
      } else {
        this.logger.error(
          `Failed to fetch repository stats for ${repoUrl}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      return null;
    }
  }

  /**
   * Fetch a GitHub issue along with its repository's primary language
   * @param owner Repository owner
   * @param repo Repository name
   * @param number Issue number
   * @returns Issue data, or null if the issue doesn't exist or isn't public
   * @throws GitHubUnavailableError if GitHub can't be reached or rate-limits the request
   */
  async fetchIssue(owner: string, repo: string, number: number): Promise<GitHubIssue | null> {
    const repoPath = `${owner}/${repo}`;

    try {
      const [issueResponse, repoResponse] = await Promise.all([
        axios.get(`${GITHUB_API_BASE_URL}/repos/${repoPath}/issues/${number}`, {
          headers: this.getApiHeaders(),
          timeout: GITHUB_API_TIMEOUT,
        }),
        axios.get(`${GITHUB_API_BASE_URL}/repos/${repoPath}`, {
          headers: this.getApiHeaders(),
          timeout: GITHUB_API_TIMEOUT,
        }),
      ]);

      const issue = issueResponse.data;
      const repository = repoResponse.data;
      const [canonicalOwner, canonicalRepo] = (repository.full_name as string).split('/');

      return {
        githubId: issue.id,
        owner: canonicalOwner,
        repo: canonicalRepo,
        number: issue.number,
        title: issue.title,
        body: issue.body ?? null,
        labels: (issue.labels ?? [])
          .map((label: string | { name?: string }) =>
            typeof label === 'string' ? label : label.name
          )
          .filter((name: string | undefined): name is string => Boolean(name)),
        language: repository.language ?? null,
        state: issue.state,
        htmlUrl: issue.html_url,
        isPullRequest: Boolean(issue.pull_request),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        // GitHub answers 404 for private repositories as well as missing ones; 410 = issue deleted
        if (status === 404 || status === 410) {
          this.logger.warn(`GitHub issue not found or not public: ${repoPath}#${number}`);
          return null;
        }

        this.logger.error(
          `Failed to fetch GitHub issue ${repoPath}#${number}: ${status} - ${message}`
        );
      } else {
        this.logger.error(
          `Failed to fetch GitHub issue ${repoPath}#${number}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      throw new GitHubUnavailableError(`Could not fetch GitHub issue ${repoPath}#${number}`);
    }
  }

  /**
   * Pull requests of the same repository that reference an issue and were opened by `authorLogin`,
   * read from the issue's timeline ("cross-referenced" events). Costs one call for the timeline,
   * plus one or two per matching pull request.
   * @returns an empty array when the issue no longer exists
   * @throws GitHubUnavailableError on rate limit, network or 5xx errors
   */
  async fetchPullRequestsForIssue(
    owner: string,
    repo: string,
    number: number,
    authorLogin: string
  ): Promise<GitHubPullRequest[]> {
    const repoPath = `${owner}/${repo}`;
    const login = authorLogin.toLowerCase();

    try {
      const timeline = await this.apiGet<
        {
          event?: string;
          source?: {
            issue?: {
              number: number;
              pull_request?: unknown;
              user?: { login?: string };
              repository?: { full_name?: string };
            };
          };
        }[]
      >(`/repos/${repoPath}/issues/${number}/timeline?per_page=100`);

      const prNumbers = [
        ...new Set(
          timeline
            .filter(
              (item) =>
                item.event === 'cross-referenced' &&
                item.source?.issue?.pull_request &&
                item.source.issue.repository?.full_name?.toLowerCase() === repoPath.toLowerCase() &&
                item.source.issue.user?.login?.toLowerCase() === login
            )
            .map((item) => item.source?.issue?.number as number)
        ),
      ];

      const pullRequests: GitHubPullRequest[] = [];
      for (const prNumber of prNumbers) {
        const pr = await this.apiGet<{
          number: number;
          state: 'open' | 'closed';
          merged: boolean;
          merged_at: string | null;
          updated_at: string;
          html_url: string;
          user: { login: string };
        }>(`/repos/${repoPath}/pulls/${prNumber}`);

        let reviewDecision: GitHubPullRequest['reviewDecision'] = null;
        if (pr.state === 'open') {
          const reviews = await this.apiGet<{ state: string; user?: { login?: string } }[]>(
            `/repos/${repoPath}/pulls/${prNumber}/reviews?per_page=100`
          );
          // Each reviewer's latest decisive review counts, like GitHub's own review decision
          const latest = new Map<string, string>();
          for (const review of reviews) {
            if (['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state)) {
              latest.set(review.user?.login ?? '', review.state);
            }
          }
          const states = [...latest.values()];
          reviewDecision = states.includes('CHANGES_REQUESTED')
            ? 'CHANGES_REQUESTED'
            : states.includes('APPROVED')
              ? 'APPROVED'
              : null;
        }

        pullRequests.push({
          number: pr.number,
          authorLogin: pr.user.login,
          state: pr.state,
          merged: pr.merged,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          updatedAt: new Date(pr.updated_at),
          htmlUrl: pr.html_url,
          reviewDecision,
        });
      }
      return pullRequests;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 404 || status === 410) {
        this.logger.warn(`GitHub issue not found or not public: ${repoPath}#${number}`);
        return [];
      }
      this.logger.error(
        `Failed to fetch pull requests for ${repoPath}#${number}: ${status ?? ''} ${error instanceof Error ? error.message : String(error)}`
      );
      throw new GitHubUnavailableError(`Could not fetch pull requests for ${repoPath}#${number}`);
    }
  }
}
