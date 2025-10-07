import type { CalendarEventType } from '../enums';

export interface ICalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  eventType: CalendarEventType;
  organizer: string;
  attendees: string[];
  community?: string;
  project?: string;
  meetingLink?: string;
  location?: string;
  isActive: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
