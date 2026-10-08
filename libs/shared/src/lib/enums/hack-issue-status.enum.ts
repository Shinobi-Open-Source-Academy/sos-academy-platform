/**
 * Lifecycle status of a GitHub issue registered on the hack platform.
 * Transitions between statuses are handled by the issue state machine.
 */
export enum HackIssueStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PR_OPEN = 'PR_OPEN',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  MERGED = 'MERGED',
  STALE = 'STALE',
  UNASSIGNED = 'UNASSIGNED',
  CLOSED_UNMERGED = 'CLOSED_UNMERGED',
}
