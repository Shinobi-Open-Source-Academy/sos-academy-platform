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
        cache: 'no-store', // Always fetch fresh data on client-side
      }
    );
    if (!response.ok) {
      console.error('Failed to fetch mentors:', response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    const mentors = data.users || [];
    console.log(`Fetched ${mentors.length} active mentors`);
    return mentors;
  } catch (error) {
    console.error('Error fetching mentors:', error);
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

export interface Community {
  _id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  isActive: boolean;
  memberCount?: number;
  kage?: {
    _id: string;
    name: string;
    email: string;
    title?: string;
    description?: string;
    githubProfile?: {
      login: string;
      htmlUrl: string;
      avatarUrl?: string;
    };
  };
  mentors?: Array<{
    _id: string;
    name: string;
    email: string;
    title?: string;
    description?: string;
    githubProfile?: {
      login: string;
      htmlUrl: string;
      avatarUrl?: string;
    };
    socialLinks?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
  }>;
  members?: Array<{
    _id: string;
    name: string;
    email: string;
    githubProfile?: {
      login: string;
      htmlUrl: string;
      avatarUrl?: string;
    };
  }>;
  projects?: Array<{
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
  }>;
}

export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  try {
    const response = await fetch(`${API_URL}/communities/slug/${slug}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch community');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching community:', error);
    return null;
  }
}

export async function getMentorsByCommunity(communitySlug: string): Promise<Mentor[]> {
  try {
    const response = await fetch(
      `${API_URL}/users/admin/users?role=MENTOR&status=ACTIVE&community=${communitySlug}&limit=100`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching mentors by community:', error);
    return [];
  }
}

export async function getMembersByCommunity(communitySlug: string): Promise<number> {
  try {
    const response = await fetch(
      `${API_URL}/users/admin/users?role=MEMBER&status=ACTIVE&community=${communitySlug}&limit=1`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );
    if (!response.ok) {
      return 0;
    }
    const data = await response.json();
    return data.pagination?.total || 0;
  } catch (error) {
    console.error('Error fetching members count:', error);
    return 0;
  }
}

export interface ProjectStats {
  stars: number;
  contributors: number;
  lastUpdated: string;
  website: string | null;
}

export async function getProjectStats(projectId: string): Promise<ProjectStats | null> {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return null;
  }
}

export interface ProjectsResponse {
  projects: Array<{
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
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function getProjects(params: {
  community?: string;
  search?: string;
  sortBy?: 'rank' | 'latest' | 'stars' | 'name';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<ProjectsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params.community) queryParams.set('community', params.community);
    if (params.search) queryParams.set('search', params.search);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.order) queryParams.set('order', params.order);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());

    const response = await fetch(`${API_URL}/projects?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return { projects: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projects: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };
  }
}
