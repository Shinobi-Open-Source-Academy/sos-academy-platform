import { apiFetch } from './api-client';

export const SOCIAL_LINKS = ['github', 'linkedin', 'twitter', 'website'] as const;
export type SocialLink = (typeof SOCIAL_LINKS)[number];

export interface MentorProfile {
  title: string | null;
  description: string | null;
  socialLinks: Record<SocialLink, string | null>;
}

/** Form values: empty strings clear a field on save */
export type MentorProfileInput = { title: string; description: string } & Record<
  SocialLink,
  string
>;

export const getMyMentorProfile = () => apiFetch<MentorProfile>('/users/me/mentor-profile');

export const updateMyMentorProfile = (input: MentorProfileInput) =>
  apiFetch<MentorProfile>('/users/me/mentor-profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const toMentorProfileInput = (profile: MentorProfile): MentorProfileInput => ({
  title: profile.title ?? '',
  description: profile.description ?? '',
  github: profile.socialLinks.github ?? '',
  linkedin: profile.socialLinks.linkedin ?? '',
  twitter: profile.socialLinks.twitter ?? '',
  website: profile.socialLinks.website ?? '',
});
