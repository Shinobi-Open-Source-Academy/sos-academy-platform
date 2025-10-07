'use client';

import type { CommunityDetails } from '@/app/types/community';
import Image from 'next/image';
import GithubIcon from '../icons/GithubIcon';
import LinkedinIcon from '../icons/LinkedinIcon';
import XIcon from '../icons/XIcon';

interface CommunityLeadershipProps {
  community: CommunityDetails;
}

interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
}

interface Person {
  name: string;
  role: string;
  bio: string;
  image: string;
  expertise: string[];
  social: SocialLinks;
}

interface KageProps {
  kage: Person;
}

interface MentorProps {
  mentor: Person;
}

export default function CommunityLeadership({ community }: CommunityLeadershipProps) {
  const { kage, mentors } = community;

  return (
    <section className="py-10">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Leadership</h2>

        {/* Kage (Community Leader) */}
        {kage && (
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary mr-2 text-sm">
                K
              </span>
              Kage (Community Leader)
            </h3>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 md:p-6">
              <KageCard kage={kage} />
            </div>
          </div>
        )}

        {/* Mentors */}
        {mentors && mentors.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80 mr-2 text-sm">
                M
              </span>
              Mentors
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {mentors
                .filter(
                  (mentor) =>
                    // Only compare by name since the id field doesn't exist
                    mentor.name !== kage?.name
                )
                .map((mentor) => (
                  <div
                    key={`${mentor.name}-${mentor.role}`}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4"
                  >
                    <MentorCard mentor={mentor} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Kage Card Component (more prominent display)
function KageCard({ kage }: KageProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
      <div className="relative h-32 w-32 md:h-40 md:w-40 flex-shrink-0">
        <Image src={kage.image} alt={kage.name} fill className="object-cover rounded-lg" />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-white">
          K
        </div>
      </div>
      <div className="flex-1 text-center md:text-left">
        <h4 className="text-xl font-bold text-white mb-1">{kage.name}</h4>
        <p className="text-primary font-medium">{kage.role}</p>

        <p className="text-gray-300 my-3">{kage.bio}</p>

        <div className="flex flex-wrap gap-2 my-3">
          {kage.expertise.map((skill, index) => (
            <span
              key={index + skill}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="flex space-x-3 mt-4 justify-center md:justify-start">
          {kage.social.github && (
            <a
              href={kage.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors duration-300"
              aria-label="GitHub Profile"
            >
              <GithubIcon />
            </a>
          )}
          {kage.social.twitter && (
            <a
              href={kage.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors duration-300"
              aria-label="X (Twitter) Profile"
            >
              <XIcon />
            </a>
          )}
          {kage.social.linkedin && (
            <a
              href={kage.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors duration-300"
              aria-label="LinkedIn Profile"
            >
              <LinkedinIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Mentor Card Component (simpler display for regular mentors)
function MentorCard({ mentor }: MentorProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="relative h-16 w-16 flex-shrink-0">
        <Image src={mentor.image} alt={mentor.name} fill className="object-cover rounded-full" />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-bold text-white">{mentor.name}</h4>
        <p className="text-gray-400 text-sm">{mentor.role}</p>

        <div className="flex flex-wrap gap-1 mt-1 mb-2">
          {mentor.expertise.slice(0, 3).map((skill, index) => (
            <span
              key={index + skill}
              className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {mentor.expertise.length > 3 && (
            <span className="px-1.5 py-0.5 text-gray-400 text-xs">
              +{mentor.expertise.length - 3} more
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          {mentor.social.github && (
            <a
              href={mentor.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors duration-300"
              aria-label="GitHub Profile"
            >
              <GithubIcon />
            </a>
          )}
          {mentor.social.twitter && (
            <a
              href={mentor.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors duration-300"
              aria-label="X (Twitter) Profile"
            >
              <XIcon />
            </a>
          )}
          {mentor.social.linkedin && (
            <a
              href={mentor.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors duration-300"
              aria-label="LinkedIn Profile"
            >
              <LinkedinIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
