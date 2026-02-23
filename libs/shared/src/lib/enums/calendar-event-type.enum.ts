/**
 * Calendar event types
 */
export enum CalendarEventType {
  WEEKLY_CALL = 'WEEKLY_CALL',
  PROJECT_REVIEW = 'PROJECT_REVIEW',
  MENTORSHIP_SESSION = 'MENTORSHIP_SESSION',
  MENTOR_1V1 = 'MENTOR_1V1',
  COMMUNITY_MEETING = 'COMMUNITY_MEETING',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
}

export const CALENDAR_EVENT_TYPE_LABELS: Record<string, string> = {
  [CalendarEventType.WEEKLY_CALL]: 'Weekly Call',
  [CalendarEventType.PROJECT_REVIEW]: 'Project Review',
  [CalendarEventType.MENTORSHIP_SESSION]: 'Mentorship',
  [CalendarEventType.MENTOR_1V1]: '1v1 Session',
  [CalendarEventType.COMMUNITY_MEETING]: 'Community',
  [CalendarEventType.SPECIAL_EVENT]: 'Special Event',
};

export const CALENDAR_EVENT_TYPE_COLORS: Record<string, string> = {
  [CalendarEventType.WEEKLY_CALL]: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  [CalendarEventType.PROJECT_REVIEW]: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  [CalendarEventType.MENTORSHIP_SESSION]:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  [CalendarEventType.MENTOR_1V1]: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  [CalendarEventType.COMMUNITY_MEETING]: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  [CalendarEventType.SPECIAL_EVENT]: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
};
