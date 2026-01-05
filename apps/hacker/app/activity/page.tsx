'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';

const mockActivity = [
  {
    id: 1,
    type: 'pr',
    title: 'Fix auth flow in login component',
    repo: 'twentyhq/twenty',
    time: '2 hours ago',
    status: 'merged',
  },
  {
    id: 2,
    type: 'issue',
    title: 'Add dark mode support',
    repo: 'calcom/cal.com',
    time: '1 day ago',
    status: 'open',
  },
  {
    id: 3,
    type: 'pr',
    title: 'Update documentation for API',
    repo: 'twentyhq/twenty',
    time: '3 days ago',
    status: 'review',
  },
  {
    id: 4,
    type: 'pr',
    title: 'Implement webhook handlers',
    repo: 'calcom/cal.com',
    time: '5 days ago',
    status: 'merged',
  },
  {
    id: 5,
    type: 'issue',
    title: 'Bug: Calendar sync failing',
    repo: 'twentyhq/twenty',
    time: '1 week ago',
    status: 'closed',
  },
  {
    id: 6,
    type: 'pr',
    title: 'Add unit tests for utils',
    repo: 'twentyhq/twenty',
    time: '2 weeks ago',
    status: 'merged',
  },
];

export default function ActivityPage() {
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
            <h1 className="text-2xl font-semibold text-white">Activity</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Your open-source contributions and activity
            </p>
          </div>

          <div className="card overflow-hidden animate-fade-in delay-150">
            {mockActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div
                  className={`w-9 h-9 flex items-center justify-center border ${
                    activity.type === 'pr'
                      ? 'border-violet-500/30 text-violet-400'
                      : 'border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {activity.type === 'pr' ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{activity.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    <span className="mono">{activity.repo}</span> · {activity.time}
                  </p>
                </div>
                <span
                  className={`badge ${
                    activity.status === 'merged' || activity.status === 'closed'
                      ? 'badge-success'
                      : activity.status === 'review'
                        ? 'badge-warning'
                        : 'badge-info'
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
