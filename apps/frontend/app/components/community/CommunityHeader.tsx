'use client';

import type { CommunityDetails } from '@/app/types/community';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CommunityHeaderProps {
  community: CommunityDetails;
}

export default function CommunityHeader({ community }: CommunityHeaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative overflow-hidden pt-24 pb-16 mb-10">
      {/* Background with color gradient matching community */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${community.color.replace(
            'bg-',
            ''
          )}50 0%, transparent 70%)`,
        }}
      />

      {/* Code snippet background */}
      <div className="absolute inset-0 z-0 text-[10px] md:text-xs font-mono text-white whitespace-pre overflow-hidden p-4 opacity-5">
        {community.codeSnippet}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Back button */}
        <Link
          href="/#communities"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 transform transition-transform group-hover:-translate-x-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to communities
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
          {/* Community icon */}
          <div
            className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundColor: community.color.replace('bg-', '') }}
          >
            {community.icon}
          </div>

          <div>
            <h1
              className={`text-3xl md:text-4xl font-bold text-white mb-2 transition-all duration-500 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              {community.name}
            </h1>

            <p
              className={`text-gray-300 md:text-lg transition-all duration-500 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              {community.description}
            </p>
          </div>
        </div>

        {/* Community stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
          <div
            className={`text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 transition-all duration-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="text-2xl font-bold text-white">{community.stats.memberCount}</div>
            <div className="text-sm text-gray-400">Members</div>
          </div>

          <div
            className={`text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 transition-all duration-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="text-2xl font-bold text-white">{community.stats.projectCount}</div>
            <div className="text-sm text-gray-400">Projects</div>
          </div>

          <div
            className={`text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 transition-all duration-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="text-2xl font-bold text-white">
              {community.stats.contributionsCount}
            </div>
            <div className="text-sm text-gray-400">Contributions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
