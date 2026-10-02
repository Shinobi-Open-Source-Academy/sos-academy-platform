import { HackIssueStatus as S } from '@sos-academy/shared';
import {
  allowedEvents,
  HackIssueEvent as E,
  IllegalTransitionError,
  nextStatus,
  TRANSITIONS,
} from './hack-issue-status-machine';

/** Every legal (from, event) → to, written out independently of TRANSITIONS */
const LEGAL: [S, E, S][] = [
  [S.OPEN, E.ASSIGN, S.ASSIGNED],
  [S.UNASSIGNED, E.ASSIGN, S.ASSIGNED],
  [S.ASSIGNED, E.START, S.IN_PROGRESS],
  [S.ASSIGNED, E.OPEN_PR, S.PR_OPEN],
  [S.IN_PROGRESS, E.OPEN_PR, S.PR_OPEN],
  [S.CHANGES_REQUESTED, E.OPEN_PR, S.PR_OPEN],
  [S.PR_OPEN, E.REQUEST_CHANGES, S.CHANGES_REQUESTED],
  [S.CHANGES_REQUESTED, E.RESUME, S.IN_PROGRESS],
  [S.PR_OPEN, E.MERGE, S.MERGED],
  [S.PR_OPEN, E.CLOSE_UNMERGED, S.CLOSED_UNMERGED],
  [S.CHANGES_REQUESTED, E.CLOSE_UNMERGED, S.CLOSED_UNMERGED],
  [S.ASSIGNED, E.UNASSIGN, S.UNASSIGNED],
  [S.IN_PROGRESS, E.UNASSIGN, S.UNASSIGNED],
  [S.CHANGES_REQUESTED, E.UNASSIGN, S.UNASSIGNED],
  [S.ASSIGNED, E.MARK_STALE, S.STALE],
  [S.IN_PROGRESS, E.MARK_STALE, S.STALE],
  [S.PR_OPEN, E.MARK_STALE, S.STALE],
  [S.CHANGES_REQUESTED, E.MARK_STALE, S.STALE],
  [S.STALE, E.RELEASE, S.OPEN],
  [S.UNASSIGNED, E.RELEASE, S.OPEN],
  [S.CLOSED_UNMERGED, E.RELEASE, S.OPEN],
];

const isLegal = (from: S, event: E) => LEGAL.some(([f, e]) => f === from && e === event);

describe('hack issue status machine', () => {
  it.each(LEGAL)('%s --%s--> %s', (from, event, to) => {
    expect(nextStatus(from, event)).toBe(to);
  });

  // Every other (status, event) pair must be rejected
  const illegal = Object.values(S).flatMap((from) =>
    Object.values(E)
      .filter((event) => !isLegal(from, event))
      .map((event) => [from, event] as [S, E])
  );

  it.each(illegal)('rejects %s --%s-->', (from, event) => {
    expect(() => nextStatus(from, event)).toThrow(IllegalTransitionError);
  });

  it('covers every status and event', () => {
    expect(LEGAL.length + illegal.length).toBe(Object.values(S).length * Object.values(E).length);
    expect(Object.keys(TRANSITIONS).sort()).toEqual(Object.values(E).sort());
  });

  it('supports the feedback loop: changes requested goes back to in progress', () => {
    let status = nextStatus(S.OPEN, E.ASSIGN);
    status = nextStatus(status, E.START);
    status = nextStatus(status, E.OPEN_PR);
    status = nextStatus(status, E.REQUEST_CHANGES);
    status = nextStatus(status, E.RESUME);
    status = nextStatus(status, E.OPEN_PR);
    expect(nextStatus(status, E.MERGE)).toBe(S.MERGED);
  });

  it('treats MERGED as final', () => {
    expect(allowedEvents(S.MERGED)).toEqual([]);
  });

  it('explains why a transition is rejected', () => {
    expect(() => nextStatus(S.OPEN, E.MERGE)).toThrow(
      'Cannot MERGE an issue that is OPEN (allowed from: PR_OPEN)'
    );
  });
});
