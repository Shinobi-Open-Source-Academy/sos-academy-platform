import { HackIssueStatus } from '@sos-academy/shared';

/**
 * What can happen to a registered issue. Each event moves the issue to one status, and is only
 * allowed from the statuses listed in `TRANSITIONS`.
 */
export enum HackIssueEvent {
  /** A hacker claims the issue */
  ASSIGN = 'ASSIGN',
  /** The assignee starts working on it */
  START = 'START',
  /** A pull request is opened for it */
  OPEN_PR = 'OPEN_PR',
  /** A maintainer asks for changes on the pull request */
  REQUEST_CHANGES = 'REQUEST_CHANGES',
  /** The assignee works on the requested changes (feedback loop) */
  RESUME = 'RESUME',
  /** The pull request is merged upstream */
  MERGE = 'MERGE',
  /** The pull request is closed without being merged */
  CLOSE_UNMERGED = 'CLOSE_UNMERGED',
  /** The assignee gives the issue up (or is removed from it) */
  UNASSIGN = 'UNASSIGN',
  /** No activity for too long */
  MARK_STALE = 'MARK_STALE',
  /** Put the issue back in the pool so someone can claim it again */
  RELEASE = 'RELEASE',
}

const S = HackIssueStatus;

/** Statuses an issue is being worked on in (assigned, in progress or under review) */
export const ACTIVE_STATUSES = [S.ASSIGNED, S.IN_PROGRESS, S.PR_OPEN, S.CHANGES_REQUESTED];
const ACTIVE = ACTIVE_STATUSES;

/**
 * The whole lifecycle in one place: event → statuses it is allowed from → resulting status.
 * `MERGED` is final.
 */
export const TRANSITIONS: Record<HackIssueEvent, { from: HackIssueStatus[]; to: HackIssueStatus }> =
  {
    [HackIssueEvent.ASSIGN]: { from: [S.OPEN, S.UNASSIGNED], to: S.ASSIGNED },
    [HackIssueEvent.START]: { from: [S.ASSIGNED], to: S.IN_PROGRESS },
    [HackIssueEvent.OPEN_PR]: {
      from: [S.ASSIGNED, S.IN_PROGRESS, S.CHANGES_REQUESTED],
      to: S.PR_OPEN,
    },
    [HackIssueEvent.REQUEST_CHANGES]: { from: [S.PR_OPEN], to: S.CHANGES_REQUESTED },
    [HackIssueEvent.RESUME]: { from: [S.CHANGES_REQUESTED], to: S.IN_PROGRESS },
    [HackIssueEvent.MERGE]: { from: [S.PR_OPEN], to: S.MERGED },
    [HackIssueEvent.CLOSE_UNMERGED]: {
      from: [S.PR_OPEN, S.CHANGES_REQUESTED],
      to: S.CLOSED_UNMERGED,
    },
    [HackIssueEvent.UNASSIGN]: {
      from: [S.ASSIGNED, S.IN_PROGRESS, S.CHANGES_REQUESTED],
      to: S.UNASSIGNED,
    },
    [HackIssueEvent.MARK_STALE]: { from: ACTIVE, to: S.STALE },
    [HackIssueEvent.RELEASE]: { from: [S.STALE, S.UNASSIGNED, S.CLOSED_UNMERGED], to: S.OPEN },
  };

export class IllegalTransitionError extends Error {
  constructor(
    public readonly from: HackIssueStatus,
    public readonly event: HackIssueEvent
  ) {
    super(
      `Cannot ${event} an issue that is ${from} (allowed from: ${TRANSITIONS[event].from.join(', ')})`
    );
    this.name = 'IllegalTransitionError';
  }
}

/**
 * Status an issue moves to when `event` happens while it is `from`
 * @throws IllegalTransitionError when the event isn't allowed from that status
 */
export function nextStatus(from: HackIssueStatus, event: HackIssueEvent): HackIssueStatus {
  const transition = TRANSITIONS[event];
  if (!transition.from.includes(from)) {
    throw new IllegalTransitionError(from, event);
  }
  return transition.to;
}

/**
 * Shortest sequence of events leading from one status to another, using only `events`
 * (e.g. the ones GitHub activity can trigger). `[]` when already there, `null` when unreachable.
 * @example pathTo(ASSIGNED, MERGED, SYNC_EVENTS) → [OPEN_PR, MERGE]
 */
export function pathTo(
  from: HackIssueStatus,
  to: HackIssueStatus,
  events: HackIssueEvent[] = Object.values(HackIssueEvent)
): HackIssueEvent[] | null {
  const queue: { status: HackIssueStatus; path: HackIssueEvent[] }[] = [{ status: from, path: [] }];
  const seen = new Set([from]);
  while (queue.length) {
    const { status, path } = queue.shift() as { status: HackIssueStatus; path: HackIssueEvent[] };
    if (status === to) {
      return path;
    }
    for (const event of events) {
      const { from: allowed, to: next } = TRANSITIONS[event];
      if (allowed.includes(status) && !seen.has(next)) {
        seen.add(next);
        queue.push({ status: next, path: [...path, event] });
      }
    }
  }
  return null;
}

/** Events the GitHub sync job can trigger on its own, from pull request activity */
export const SYNC_EVENTS = [
  HackIssueEvent.OPEN_PR,
  HackIssueEvent.REQUEST_CHANGES,
  HackIssueEvent.MERGE,
  HackIssueEvent.CLOSE_UNMERGED,
];

/** Events allowed from a status, e.g. to show the possible actions in a UI */
export const allowedEvents = (from: HackIssueStatus): HackIssueEvent[] =>
  (Object.keys(TRANSITIONS) as HackIssueEvent[]).filter((event) =>
    TRANSITIONS[event].from.includes(from)
  );

/** Name of the domain event emitted after every status change */
export const HACK_ISSUE_STATUS_CHANGED = 'hack-issue.status-changed';

/** Payload of `HACK_ISSUE_STATUS_CHANGED` (consumed by the leaderboard and the mentor dashboard) */
export interface HackIssueStatusChangedEvent {
  issueId: string;
  from: HackIssueStatus;
  to: HackIssueStatus;
  event: HackIssueEvent;
  actorId?: string;
  reason?: string;
  at: Date;
}
