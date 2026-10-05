import {
  ConflictException,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HackIssueStatus } from '@sos-academy/shared';
import { Model } from 'mongoose';
import { envConfig } from '../../common/config/env.config';
import { GitHubPullRequest, GitHubService } from '../github/github.service';
import { HackIssueService } from './hack-issue.service';
import { ACTIVE_STATUSES, pathTo, SYNC_EVENTS } from './hack-issue-status-machine';
import { HackIssue, HackIssueDocument, HackIssuePullRequest } from './schemas/hack-issue.schema';

export interface SyncSummary {
  checked: number;
  updated: number;
  skipped: number;
  errors: number;
  /** The run stopped early to keep some GitHub API calls in reserve */
  stoppedForRateLimit: boolean;
}

type SyncedIssue = Pick<HackIssue, 'owner' | 'repo' | 'number' | 'status' | 'pullRequest'> & {
  _id: unknown;
  assignee?: { githubProfile?: { login?: string } } | null;
};

/**
 * The pull request that tells where the issue stands: a merged one wins, then the most
 * recently updated open one, then the most recently closed one.
 */
export function pickPullRequest(prs: GitHubPullRequest[]): GitHubPullRequest | null {
  const latest = (list: GitHubPullRequest[]) =>
    [...list].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0] ?? null;
  return (
    latest(prs.filter((pr) => pr.merged)) ??
    latest(prs.filter((pr) => pr.state === 'open')) ??
    latest(prs)
  );
}

/** Status a pull request puts its issue in */
export function statusFromPullRequest(pr: GitHubPullRequest): HackIssueStatus {
  if (pr.merged) {
    return HackIssueStatus.MERGED;
  }
  if (pr.state === 'closed') {
    return HackIssueStatus.CLOSED_UNMERGED;
  }
  return pr.reviewDecision === 'CHANGES_REQUESTED'
    ? HackIssueStatus.CHANGES_REQUESTED
    : HackIssueStatus.PR_OPEN;
}

const describePullRequest = (pr: GitHubPullRequest) =>
  pr.merged
    ? 'merged'
    : pr.state === 'closed'
      ? 'closed without merging'
      : pr.reviewDecision === 'CHANGES_REQUESTED'
        ? 'changes requested'
        : 'open';

/**
 * Polls GitHub for every issue being worked on and moves it through the status machine from
 * the assignee's pull request: opened → `PR_OPEN`, changes requested → `CHANGES_REQUESTED`,
 * merged → `MERGED`, closed → `CLOSED_UNMERGED`. Nobody has to report anything by hand.
 *
 * Re-polling an issue whose pull request hasn't changed is a no-op: no transition, no history row.
 */
@Injectable()
export class HackIssueSyncService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(HackIssueSyncService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    @InjectModel(HackIssue.name) private hackIssueModel: Model<HackIssueDocument>,
    private readonly hackIssueService: HackIssueService,
    private readonly githubService: GitHubService
  ) {}

  onApplicationBootstrap(): void {
    const { enabled, intervalMinutes } = envConfig.hack.sync;
    if (!enabled || process.env.NODE_ENV === 'test') {
      this.logger.log('GitHub sync job disabled');
      return;
    }
    const intervalMs = Math.max(intervalMinutes, 1) * 60_000;
    this.timer = setInterval(() => {
      this.syncAll().catch((error) => this.logger.error(`GitHub sync failed: ${error}`));
    }, intervalMs);
    // Don't keep the process alive just for the job
    this.timer.unref();
    this.logger.log(`GitHub sync job scheduled every ${Math.max(intervalMinutes, 1)} min`);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Checks every assigned issue once. Overlapping runs are skipped. */
  async syncAll(): Promise<SyncSummary> {
    const summary: SyncSummary = {
      checked: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      stoppedForRateLimit: false,
    };
    if (this.running) {
      this.logger.warn('GitHub sync already running, skipping this run');
      return summary;
    }

    this.running = true;
    try {
      const issues = (await this.hackIssueModel
        .find({ status: { $in: ACTIVE_STATUSES }, assignee: { $exists: true } })
        .select('owner repo number status pullRequest assignee')
        .populate('assignee', 'githubProfile.login')
        .sort({ lastSyncedAt: 1 })
        .lean()
        .exec()) as unknown as SyncedIssue[];

      for (const issue of issues) {
        const { remaining, limit } = this.githubService.rateLimit;
        // Keep a reserve for the rest of the app, but no more than a fifth of the quota: without
        // a token GitHub only allows 60 calls an hour
        const reserve = Math.min(
          envConfig.hack.sync.minRateLimit,
          limit ? Math.ceil(limit / 5) : Number.POSITIVE_INFINITY
        );
        if (remaining !== null && remaining < reserve) {
          summary.stoppedForRateLimit = true;
          this.logger.warn(
            `GitHub sync paused: ${remaining} API calls left, ${issues.length - summary.checked} issues left for the next run`
          );
          break;
        }

        summary.checked++;
        try {
          const result = await this.syncIssue(issue);
          summary[result]++;
        } catch (error) {
          summary.errors++;
          this.logger.error(
            `GitHub sync failed for ${issue.owner}/${issue.repo}#${issue.number}: ${error instanceof Error ? error.message : error}`
          );
        }
      }

      this.logger.log(
        `GitHub sync: ${summary.checked} checked, ${summary.updated} updated, ${summary.skipped} unchanged, ${summary.errors} errors`
      );
      return summary;
    } finally {
      this.running = false;
    }
  }

  /** @returns whether the issue moved */
  async syncIssue(issue: SyncedIssue): Promise<'updated' | 'skipped'> {
    const issueId = String(issue._id);
    const login = issue.assignee?.githubProfile?.login;
    if (!login) {
      // Without a GitHub login there's no way to tell the assignee's pull requests apart
      this.logger.debug(`Skipping ${issueId}: the assignee has no linked GitHub account`);
      return 'skipped';
    }

    const prs = await this.githubService.fetchPullRequestsForIssue(
      issue.owner,
      issue.repo,
      issue.number,
      login
    );
    const pr = pickPullRequest(prs);
    const now = new Date();
    if (!pr) {
      await this.hackIssueModel.updateOne({ _id: issueId }, { $set: { lastSyncedAt: now } }).exec();
      return 'skipped';
    }

    const pullRequest: HackIssuePullRequest = {
      number: pr.number,
      url: pr.htmlUrl,
      state: pr.state,
      merged: pr.merged,
      ...(pr.reviewDecision ? { reviewDecision: pr.reviewDecision } : {}),
    };
    const target = statusFromPullRequest(pr);
    const events = pathTo(issue.status, target, SYNC_EVENTS);

    if (!events?.length) {
      if (events === null) {
        this.logger.warn(
          `Can't move ${issue.owner}/${issue.repo}#${issue.number} from ${issue.status} to ${target}`
        );
      }
      await this.hackIssueModel
        .updateOne({ _id: issueId }, { $set: { pullRequest, lastSyncedAt: now } })
        .exec();
      return 'skipped';
    }

    try {
      for (const event of events) {
        await this.hackIssueService.transition(issueId, event, {
          reason: `GitHub sync: pull request #${pr.number} ${describePullRequest(pr)}`,
          set: { pullRequest, lastSyncedAt: now },
        });
      }
    } catch (error) {
      // Someone (or a manual override) changed the issue meanwhile: the next run catches up
      if (error instanceof ConflictException) {
        return 'skipped';
      }
      throw error;
    }
    return 'updated';
  }
}
