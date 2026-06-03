import type { Community } from '../../../../lib/api-client';
import { ComingSoonOverlay } from './ComingSoonOverlay';

interface CommunityMentorsSectionProps {
  mentors: Community['mentors'];
}

export function CommunityMentorsSection({ mentors }: CommunityMentorsSectionProps) {
  if (!mentors || mentors.length === 0) {
    return (
      <div className="relative border border-white/10 p-6">
        <ComingSoonOverlay message="Mentors to be assigned" />
        <div className="opacity-20 pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-800" />
                  <div className="flex-1">
                    <div className="h-5 bg-zinc-800 w-32 mb-2" />
                    <div className="h-4 bg-zinc-800 w-24 mb-2" />
                    <div className="h-4 bg-zinc-800 w-full mb-1" />
                    <div className="h-4 bg-zinc-800 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {mentors.map((mentor) => (
        <div key={mentor._id} className="border border-white/10 p-6">
          <div className="flex items-start gap-4">
            {mentor.githubProfile?.avatarUrl ? (
              <img
                src={mentor.githubProfile.avatarUrl}
                alt={mentor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xl font-medium">
                {mentor.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{mentor.name}</h3>
              {mentor.title && <p className="text-sm text-gray-500 mb-1">{mentor.title}</p>}
              {mentor.description && (
                <p className="text-sm text-gray-400 mb-2">{mentor.description}</p>
              )}
              <div className="flex gap-3 mt-2">
                {mentor.githubProfile?.htmlUrl && (
                  <a
                    href={mentor.githubProfile.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    GitHub
                  </a>
                )}
                {mentor.socialLinks?.linkedin && (
                  <a
                    href={mentor.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    LinkedIn
                  </a>
                )}
                {mentor.socialLinks?.twitter && (
                  <a
                    href={mentor.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Twitter
                  </a>
                )}
                {mentor.socialLinks?.website && (
                  <a
                    href={mentor.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
