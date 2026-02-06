const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api';

interface JoinCommunityData {
  email: string;
  name?: string;
  communities: string[];
  githubHandle?: string;
}

interface MentorApplicationData {
  email: string;
  name: string;
  expertise?: string;
  githubHandle?: string;
  motivation?: string;
}

interface NewsletterData {
  email: string;
}

export async function joinCommunity(data: JoinCommunityData) {
  const response = await fetch(`${API_URL}/users/join/community`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to join community');
  }
  return response.json();
}

export async function applyAsMentor(data: MentorApplicationData) {
  const response = await fetch(`${API_URL}/users/apply/mentor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to submit application');
  }
  return response.json();
}

export async function subscribeNewsletter(data: NewsletterData) {
  const response = await fetch(`${API_URL}/users/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to subscribe');
  }
  return response.json();
}

export interface UpcomingEvent {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  eventType: string;
  meetingLink?: string;
  location?: string;
  community?: { name: string; slug: string };
  isFeatured?: boolean;
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  try {
    const response = await fetch(`${API_URL}/calendar/events/upcoming`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch {
    return [];
  }
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise?: string;
  title?: string;
  description?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  githubProfile?: {
    login: string;
    htmlUrl: string;
    avatarUrl?: string;
  };
  communities?: { name: string; slug: string }[];
}

export async function getActiveMentors(): Promise<Mentor[]> {
  try {
    const response = await fetch(
      `${API_URL}/users/admin/users?role=MENTOR&status=ACTIVE&limit=100`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.users || [];
  } catch {
    return [];
  }
}

export function getRandomMentors(mentors: Mentor[], count: number = 4): Mentor[] {
  if (mentors.length <= count) {
    return mentors;
  }
  const shuffled = [...mentors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
