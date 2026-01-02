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
