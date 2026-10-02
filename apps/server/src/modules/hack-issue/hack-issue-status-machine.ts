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
const ACTIVE = [S.ASSIGNED, S.IN_PROGRESS, S.PR_OPEN, S.CHANGES_REQUESTED];

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
