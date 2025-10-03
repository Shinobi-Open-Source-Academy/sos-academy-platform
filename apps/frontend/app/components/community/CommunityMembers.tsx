'use client';

import type { CommunityDetails, CommunityMember } from '@/app/types/community';
import Image from 'next/image';

interface CommunityMembersProps {
  community: CommunityDetails;
}

export default function CommunityMembers({ community }: CommunityMembersProps) {
  const { members } = community;

  // Sort members by contributions (highest first)
  const sortedMembers = [...members].sort((a, b) => b.contributions - a.contributions);

  return (
    <section className="py-10">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Community Members</h2>

        {/* Show blur overlay with coming soon message */}
        <div className="relative">
          <div className="absolute inset-0 z-10 bg-gray-900/70 backdrop-blur-md flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">Coming Soon</div>
              <p className="text-gray-300 max-w-md mx-auto">
                We&apos;re still building our community. Check back soon to see our members!
              </p>
            </div>
          </div>

          {/* Original content (blurred in background) */}
          <div className="opacity-50">
            {members && members.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-8 text-center">
                <p className="text-gray-300">No members have joined this community yet.</p>
                <button className="mt-4 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300">
                  Be the first to join
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Member Card Component
function MemberCard({ member }: { member: CommunityMember }) {
  // Get level badge color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'kage':
        return 'bg-purple-600';
      case 'jonin':
        return 'bg-red-600';
      case 'chunin':
        return 'bg-green-600';
      case 'genin':
      default:
        return 'bg-blue-600';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'kage':
        return 'Kage';
      case 'jonin':
        return 'Jonin';
      case 'chunin':
        return 'Chunin';
      case 'genin':
      default:
        return 'Genin';
    }
  };

  // Get badge based on contributions
  const getContributionBadge = (contributions: number) => {
    if (contributions >= 100) return { label: 'Elite', color: 'bg-purple-600' };
    if (contributions >= 50) return { label: 'Veteran', color: 'bg-red-600' };
    if (contributions >= 20) return { label: 'Regular', color: 'bg-green-600' };
    return { label: 'Newcomer', color: 'bg-blue-600' };
  };

  const contributionBadge = getContributionBadge(member.contributions);
  const levelColor = getLevelColor(member.level);
  const levelLabel = getLevelLabel(member.level);

  // Format joined date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 hover:border-gray-600 transition-all duration-300 group">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 flex-shrink-0">
          <Image src={member.avatar} alt={member.name} fill className="object-cover rounded-full" />
          <div
            className={`absolute -top-1 -right-1 w-5 h-5 ${levelColor} rounded-full flex items-center justify-center text-[10px] font-bold text-white`}
            title={`${levelLabel} rank`}
          >
            {member.level.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors duration-300">
                {member.name}
              </h4>
              <p className="text-gray-400 text-sm">{member.role}</p>
            </div>
            <div
              className={`${contributionBadge.color} px-2 py-1 rounded text-xs text-white font-medium`}
            >
              {contributionBadge.label}
            </div>
          </div>

          <div className="mt-2 flex justify-between items-center">
            <span className="text-gray-400 text-xs">Joined: {formatDate(member.joinedDate)}</span>
            <span className="text-gray-300 text-sm font-medium">
              {member.contributions} contributions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
