'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ComingSoon } from '../components/ComingSoon';
import Sidebar from '../components/Sidebar';

interface User {
  name: string;
  email: string;
  avatar: string;
  githubHandle: string;
  community: string;
}

// Mock data for the dashboard
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
];

const mockEvents = [
  { id: 1, title: 'Weekly Konoha Standup', date: 'Jan 7', time: '19:00 UTC', type: 'standup' },
  { id: 2, title: 'Code Review Session', date: 'Jan 9', time: '18:00 UTC', type: 'workshop' },
  { id: 3, title: 'Monthly All Hands', date: 'Jan 15', time: '17:00 UTC', type: 'meeting' },
];

const mockStats = {
  contributions: 24,
  prsThisMonth: 8,
  eventsAttended: 12,
  mentorSessions: 3,
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client after mount
    if (!mounted) {
      return;
    }

    const token = localStorage.getItem('hacker_token');
    const userStr = localStorage.getItem('hacker_user');

    if (!token || !userStr) {
      router.replace('/login');
      return;
    }

    try {
      setUser(JSON.parse(userStr));
      setLoading(false);
    } catch {
      localStorage.removeItem('hacker_token');
      localStorage.removeItem('hacker_user');
      router.replace('/login');
    }
  }, [mounted, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-zinc-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Welcome header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl font-semibold text-white">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Here's what's happening in your open-source journey
            </p>
          </div>

          {/* Stats grid */}
          <ComingSoon className="mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card animate-fade-in">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Total Contributions
                </p>
                <p className="text-3xl font-semibold text-white">{mockStats.contributions}</p>
              </div>
              <div className="stat-card animate-fade-in delay-75">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  PRs This Month
                </p>
                <p className="text-3xl font-semibold text-emerald-400">{mockStats.prsThisMonth}</p>
              </div>
              <div className="stat-card animate-fade-in delay-150">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Events Attended
                </p>
                <p className="text-3xl font-semibold text-white">{mockStats.eventsAttended}</p>
              </div>
              <div className="stat-card animate-fade-in delay-225">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Mentor Sessions
                </p>
                <p className="text-3xl font-semibold text-white">{mockStats.mentorSessions}</p>
              </div>
            </div>
          </ComingSoon>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 animate-fade-in delay-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Recent Activity
                </h2>
                <span className="text-xs text-zinc-600">View all</span>
              </div>
              <ComingSoon>
                <div className="card overflow-hidden">
                  {mockActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div
                        className={`w-8 h-8 flex items-center justify-center border ${
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
                            <title>Pull Request</title>
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
                            <title>Issue</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{activity.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          <span className="mono">{activity.repo}</span> · {activity.time}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          activity.status === 'merged'
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
              </ComingSoon>
            </div>

            {/* Upcoming Events */}
            <div className="animate-fade-in delay-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Upcoming Events
                </h2>
                <span className="text-xs text-zinc-600">View all</span>
              </div>
              <ComingSoon>
                <div className="space-y-3">
                  {mockEvents.map((event) => (
                    <div key={event.id} className="event-card">
                      <div className="event-date">
                        <span className="text-xs font-medium">{event.date.split(' ')[0]}</span>
                        <span className="text-lg font-semibold">{event.date.split(' ')[1]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{event.title}</p>
                        <p className="text-xs text-zinc-500 mt-1">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ComingSoon>

              {/* Book Mentor CTA */}
              <ComingSoon className="mt-6">
                <div className="card p-4 border-emerald-500/20 bg-emerald-500/[0.03]">
                  <h3 className="text-sm font-medium text-white mb-2">Need guidance?</h3>
                  <p className="text-xs text-zinc-500 mb-4">
                    Book a 1-on-1 session with a mentor for personalized help
                  </p>
                  <span className="btn-primary text-xs py-2">Book a Session</span>
                </div>
              </ComingSoon>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
