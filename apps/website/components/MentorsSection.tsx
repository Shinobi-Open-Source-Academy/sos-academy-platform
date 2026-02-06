import MentorCard from './MentorCard';
import { Mentor } from '../lib/api-client';

interface MentorsSectionProps {
  mentors: Mentor[];
  loading?: boolean;
}

export default function MentorsSection({ mentors, loading }: MentorsSectionProps) {
  if (loading) {
    // Loading state is handled by the parent component on mentors page
    // This is a fallback for other pages (like home page)
    return (
      <div className="p-6 border border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
          <div className="h-4 w-32 bg-white/5 animate-pulse" />
        </div>
        <div className="h-4 w-64 bg-white/5 animate-pulse mt-2" />
      </div>
    );
  }

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
