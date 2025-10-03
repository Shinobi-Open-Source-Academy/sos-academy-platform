'use client';

import type { CommunityDetails } from '@/app/types/community';
import CalendarIcon from '../icons/CalendarIcon';
import ClockIcon from '../icons/ClockIcon';
import DiscordIcon from '../icons/DiscordIcon';
import DocumentIcon from '../icons/DocumentIcon';
import GithubIcon from '../icons/GithubIcon';
import LinkIcon from '../icons/LinkIcon';
import PlayCircleIcon from '../icons/PlayCircleIcon';
import VideoIcon from '../icons/VideoIcon';

interface CommunityAboutProps {
  community: CommunityDetails;
}

export default function CommunityAbout({ community }: CommunityAboutProps) {
  return (
    <section className="py-10">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">About This Community</h2>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-line">{community.longDescription}</p>
          </div>

          {/* Meeting Information */}
          {(community.meetingDay || community.meetingTime) && (
            <div className="mt-8 border-t border-gray-700/60 pt-6">
              <h3 className="text-xl font-bold text-white mb-4">Weekly Meetings</h3>
              <div className="bg-black/30 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex items-center">
                  <CalendarIcon />
                  <span className="text-gray-200">{community.meetingDay || 'TBA'}</span>
                </div>

                <div className="flex items-center">
                  <ClockIcon />
                  <span className="text-gray-200">{community.meetingTime || 'TBA'}</span>
                </div>

                {community.meetingLink && (
                  <div className="ml-auto">
                    <a
                      href={community.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
                    >
                      <VideoIcon className="h-4 w-4 mr-2" />
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resources */}
          {community.resourceLinks && community.resourceLinks.length > 0 && (
            <div className="mt-8 border-t border-gray-700/60 pt-6">
              <h3 className="text-xl font-bold text-white mb-4">Resources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {community.resourceLinks.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg border border-gray-700 transition-all duration-300 flex items-center"
                  >
                    <ResourceIcon type={resource.type} />
                    <span className="ml-3 text-gray-200">{resource.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Resource Icon Component
function ResourceIcon({ type }: { type: string }) {
  // Common styles for all icons
  const iconClass = 'h-5 w-5 text-primary';

  switch (type) {
    case 'documentation':
      return <DocumentIcon className={iconClass} />;
    case 'tutorial':
      return <VideoIcon className={iconClass} />;
    case 'video':
      return <PlayCircleIcon className={iconClass} />;
    case 'github':
      return <GithubIcon className={iconClass} />;
    case 'discord':
      return <DiscordIcon className={iconClass} />;
    default:
      return <LinkIcon className={iconClass} />;
  }
}
