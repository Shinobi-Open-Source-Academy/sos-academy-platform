'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';

const mockMentors = [
  {
    id: 1,
    name: 'Pacifique Linjanja',
    role: 'Senior Backend Engineer',
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    expertise: ['JavaScript', 'TypeScript', 'NestJS', 'System Design'],
    community: 'Konoha',
    available: true,
  },
  {
    id: 2,
    name: 'David Katho',
    role: 'Senior Protocol Engineer',
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    expertise: ['Rust', 'Blockchain', 'Smart Contracts'],
    community: 'Suna',
    available: true,
  },
  {
    id: 3,
    name: 'Sarah Chen',
    role: 'Staff Frontend Engineer',
    avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
    expertise: ['React', 'Next.js', 'Performance'],
    community: 'Konoha',
    available: false,
  },
];

export default function MentorsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('hacker_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setLoading(false);
  }, [mounted, router]);

  if (!mounted || loading) {
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
            <h1 className="text-2xl font-semibold text-white">Mentors</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Connect with experienced mentors for guidance
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 animate-fade-in delay-150">
            {mockMentors.map((mentor) => (
              <div key={mentor.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-12 h-12 rounded-full border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{mentor.name}</h3>
                      <span
                        className={`w-2 h-2 rounded-full ${mentor.available ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{mentor.role}</p>
                    <p className="text-xs text-emerald-400 mt-0.5">{mentor.community} Community</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {mentor.expertise.map((skill) => (
                    <span key={skill} className="badge badge-neutral text-[10px]">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <Link
                    href={`/mentors/book?mentor=${mentor.id}`}
                    className={`btn w-full justify-center text-xs ${mentor.available ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                  >
                    {mentor.available ? 'Book Session' : 'Unavailable'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
