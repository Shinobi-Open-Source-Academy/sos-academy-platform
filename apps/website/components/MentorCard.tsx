'use client';

import { GitHubIcon, GlobeIcon, LinkedInIcon, TwitterIcon } from './icons';
import SpotlightCard from './SpotlightCard';

interface MentorSocials {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

interface MentorCardProps {
  name: string;
  role: string;
  image: string;
  bio?: string;
  expertise?: string[];
  socials: MentorSocials;
  variant?: 'full' | 'compact';
  className?: string;
}

export default function MentorCard({
  name,
  role,
  image,
  bio,
  expertise = [],
  socials,
  variant = 'full',
  className = '',
}: MentorCardProps) {
  if (variant === 'compact') {
    return (
      <SpotlightCard
        className={`border border-white/5 hover:border-white/10 p-4 transition-all duration-300 group ${className}`}
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 overflow-hidden">
            <img
              src={image}
              alt={name}
              className="w-20 h-20 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <h3 className="text-sm font-semibold group-hover:text-white transition-colors">{name}</h3>
          <p className="text-xs text-gray-500 mb-2">{role}</p>
          <div className="flex items-center gap-2">
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                title="GitHub"
              >
                <GitHubIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                title="LinkedIn"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                title="Twitter/X"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </SpotlightCard>
    );
  }

  // Full variant - original layout with reduced height
  return (
    <SpotlightCard
      className={`border border-white/5 hover:border-white/10 transition-colors h-40 group bg-black/50 ${className}`}
    >
      {/* Image on left side */}
      <div className="absolute inset-y-0 left-0 w-[38%] overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-black/50 to-black" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top opacity-80 group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
        />
      </div>

      {/* Content on right side */}
      <div className="relative z-20 h-full p-3 pl-[36%] flex flex-col items-start text-left">
        <h3 className="text-sm font-bold text-white">{name}</h3>
        <p className="text-emerald-400 text-[11px] font-medium mb-1">{role}</p>
        {bio && <p className="text-gray-400 text-[11px] line-clamp-2 leading-snug">{bio}</p>}

        <div className="mt-auto space-y-1.5 w-full">
          {expertise.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {expertise.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[9px] px-1.5 py-0.5 border border-white/10 bg-white/5 text-gray-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                title="GitHub"
              >
                <GitHubIcon className="w-3 h-3" />
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                title="LinkedIn"
              >
                <LinkedInIcon className="w-3 h-3" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                title="Twitter/X"
              >
                <TwitterIcon className="w-3 h-3" />
              </a>
            )}
            {socials.website && (
              <a
                href={socials.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                title="Website"
              >
                <GlobeIcon className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
