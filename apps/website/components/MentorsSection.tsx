import MentorCard from './MentorCard';
import { Mentor } from '../lib/api-client';

interface MentorsSectionProps {
  mentors: Mentor[];
}

export default function MentorsSection({ mentors }: MentorsSectionProps) {
  if (mentors.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
      {mentors.map((mentor) => {
        const expertise = mentor.expertise
          ? mentor.expertise
              .split(',')
              .map((e) => e.trim())
              .filter(Boolean)
          : [];
        // Prefer socialLinks from API, fallback to githubProfile
        const socials = {
          github: mentor.socialLinks?.github || mentor.githubProfile?.htmlUrl,
          linkedin: mentor.socialLinks?.linkedin,
          twitter: mentor.socialLinks?.twitter,
          website: mentor.socialLinks?.website,
        };

        return (
          <MentorCard
            key={mentor.id}
            name={mentor.name}
            role={mentor.title || (expertise.length > 0 ? expertise[0] : 'Mentor')}
            image={mentor.githubProfile?.avatarUrl || '/images/mentor1.jpeg'}
            bio={mentor.description}
            expertise={expertise}
            socials={socials}
            variant="full"
          />
        );
      })}
    </div>
  );
}
