'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';

const mockMembers = [
  {
    id: 1,
    name: 'Alex Johnson',
    avatar: 'https://avatars.githubusercontent.com/u/10?v=4',
    role: 'Member',
    contributions: 15,
  },
  {
    id: 2,
    name: 'Maria Garcia',
    avatar: 'https://avatars.githubusercontent.com/u/11?v=4',
    role: 'Member',
    contributions: 23,
  },
  {
    id: 3,
    name: 'James Wilson',
    avatar: 'https://avatars.githubusercontent.com/u/12?v=4',
    role: 'Member',
    contributions: 8,
  },
  {
    id: 4,
    name: 'Emma Brown',
    avatar: 'https://avatars.githubusercontent.com/u/13?v=4',
    role: 'Mentor',
    contributions: 45,
  },
  {
    id: 5,
    name: 'Michael Lee',
    avatar: 'https://avatars.githubusercontent.com/u/14?v=4',
    role: 'Member',
    contributions: 12,
  },
  {
    id: 6,
    name: 'Sophie Davis',
    avatar: 'https://avatars.githubusercontent.com/u/15?v=4',
    role: 'Member',
    contributions: 19,
  },
];

export default function CommunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ community: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('hacker_token');
    const userStr = localStorage.getItem('hacker_user');
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    try {
      setUser(JSON.parse(userStr));
    } catch {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl font-semibold text-white">{user?.community} Community</h1>
            <p className="text-zinc-500 text-sm mt-1">Connect with fellow community members</p>
          </div>

          {/* Community stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in delay-75">
            <div className="stat-card">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Members</p>
              <p className="text-2xl font-semibold text-white">24</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Mentors</p>
              <p className="text-2xl font-semibold text-emerald-400">3</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Active Projects</p>
              <p className="text-2xl font-semibold text-white">5</p>
            </div>
          </div>

          {/* Members list */}
          <div className="animate-fade-in delay-150">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
              Members
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {mockMembers.map((member) => (
                <div key={member.id} className="card p-4 flex items-center gap-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{member.name}</p>
                    <p className="text-xs text-zinc-500">{member.contributions} contributions</p>
                  </div>
                  <span
                    className={`badge text-[10px] ${member.role === 'Mentor' ? 'badge-success' : 'badge-neutral'}`}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
