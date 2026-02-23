/**
 * Shared API response types used by frontend applications (admin, website, hacker).
 *
 * These represent the shape of data returned by the API after population/transformation,
 * as opposed to the raw database model interfaces (IUser, ICommunity, etc.).
 */

// ─── Reusable fragments ──────────────────────────────────────────────

export interface GitHubProfileSummary {
  login: string;
  htmlUrl: string;
  avatarUrl?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── User / Member / Mentor ──────────────────────────────────────────

export interface UserSummary {
  _id: string;
  id?: string;
  name: string;
  email: string;
  githubProfile?: GitHubProfileSummary;
  status?: string;
  createdAt?: string;
}

export interface MemberSummary extends UserSummary {
  communities?: (string | { name: string; slug: string })[];
}

export interface MentorSummary extends UserSummary {
  expertise?: string;
  motivation?: string;
  title?: string;
  description?: string;
  socialLinks?: SocialLinks;
  communities?: { name: string; slug: string }[];
}

export interface PaginatedUsers<T = UserSummary> {
  users: T[];
  pagination: PaginationMeta;
}

// ─── Community ───────────────────────────────────────────────────────

export interface CommunitySummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CommunityDetail extends CommunitySummary {
  tags: string[];
  isActive: boolean;
  memberCount?: number;
  kage?: {
    _id: string;
    name: string;
    email: string;
    title?: string;
    description?: string;
    githubProfile?: GitHubProfileSummary;
  };
  mentors?: Array<{
    _id: string;
    name: string;
    email: string;
    title?: string;
    description?: string;
    githubProfile?: GitHubProfileSummary;
    socialLinks?: SocialLinks;
  }>;
  members?: Array<{
    _id: string;
    name: string;
    email: string;
    githubProfile?: GitHubProfileSummary;
  }>;
  projects?: ProjectSummary[];
}

// ─── Project ─────────────────────────────────────────────────────────

export interface ProjectSummary {
  _id: string;
  name: string;
  description?: string;
  url?: string;
  website?: string;
  githubRepo?: string;
  stars?: number;
  contributors?: number;
  lastUpdated?: string;
  technologies?: string[];
  rank?: string;
}

export interface ProjectStats {
  stars: number;
  contributors: number;
  lastUpdated: string;
  website: string | null;
}

export interface PaginatedProjects {
  projects: ProjectSummary[];
  pagination: PaginationMeta;
}

// ─── Calendar Events ─────────────────────────────────────────────────

export interface UpcomingEvent {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  eventType: string;
  meetingLink?: string;
  location?: string;
  community?: CommunitySummary;
  isFeatured?: boolean;
}

export interface CalendarEventDetail extends UpcomingEvent {
  organizer?: { name: string };
}

// ─── Broadcast ───────────────────────────────────────────────────────

export type RecipientType =
  | 'ALL_USERS'
  | 'COMMUNITY'
  | 'MENTORS'
  | 'INACTIVE_USERS'
  | 'SPECIFIC_USERS';

export interface BroadcastSummary {
  _id: string;
  subject: string;
  message: string;
  recipientType: RecipientType;
  communitySlug?: string;
  userIds?: string[];
  inactiveDays?: string;
  sentCount: number;
  totalRecipients?: number;
  scheduled: boolean;
  completed: boolean;
  sentAt?: string;
  createdAt: string;
  eventTitle?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventDuration?: string;
  eventMeetingLink?: string;
  eventDescription?: string;
}

// ─── Form payloads ───────────────────────────────────────────────────

export interface JoinCommunityPayload {
  email: string;
  name?: string;
  communities: string[];
  githubHandle?: string;
}

export interface MentorApplicationPayload {
  email: string;
  name: string;
  expertise?: string;
  githubHandle?: string;
  motivation?: string;
}

export interface NewsletterPayload {
  email: string;
}
