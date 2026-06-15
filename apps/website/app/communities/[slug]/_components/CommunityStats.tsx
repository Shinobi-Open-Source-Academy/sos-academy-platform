interface CommunityStatsProps {
  memberCount: number;
  mentorCount: number;
  projectCount: number;
}

export function CommunityStats({ memberCount, mentorCount, projectCount }: CommunityStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-12">
      <div className="border border-white/10 p-6">
        <div className="text-3xl font-bold mb-2">{memberCount}</div>
        <div className="text-sm text-gray-400">Active Members</div>
      </div>
      <div className="border border-white/10 p-6">
        <div className="text-3xl font-bold mb-2">{mentorCount}</div>
        <div className="text-sm text-gray-400">Mentors</div>
      </div>
      <div className="border border-white/10 p-6">
        <div className="text-3xl font-bold mb-2">{projectCount}</div>
        <div className="text-sm text-gray-400">Active Projects</div>
      </div>
    </div>
  );
}
