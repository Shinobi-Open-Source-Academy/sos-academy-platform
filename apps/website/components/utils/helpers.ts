import type { Mentor } from '../../lib/api-client';

export function toCardProps(mentor: Mentor) {
  const expertise = mentor.expertise
    ? mentor.expertise
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
    : [];
  return {
    name: mentor.name,
    role: mentor.title || expertise[0] || 'Mentor',
    image: mentor.githubProfile?.avatarUrl || '/images/mentor1.jpeg',
    bio: mentor.description,
    expertise,
    socials: {
      github: mentor.socialLinks?.github || mentor.githubProfile?.htmlUrl,
      linkedin: mentor.socialLinks?.linkedin,
      twitter: mentor.socialLinks?.twitter,
      website: mentor.socialLinks?.website,
    },
    variant: 'full' as const,
  };
}
