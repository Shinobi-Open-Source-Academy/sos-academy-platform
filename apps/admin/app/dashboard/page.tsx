'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { isAuthenticated } from '../../lib/auth';
import Sidebar from '../components/Sidebar';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalUsers: number;
  pendingMentors: number;
  pendingMembers: number;
  activeUsers: number;
  totalCommunities: number;
}

const StatCard = ({
  label,
  value,
  variant = 'default',
  delay = 0,
}: {
  label: string;
  value: number;
  variant?: 'default' | 'warning' | 'success' | 'info';
  delay?: number;
}) => {
  const valueColors = {
    default: 'text-white',
    warning: 'text-amber-400',
    success: 'text-emerald-400',
    info: 'text-blue-400',
  };

  return (
    <div className="stat-card card p-6 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">{label}</p>
      <p className={`text-4xl font-semibold tracking-tight ${valueColors[variant]}`}>{value}</p>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    fetchStats();
  }, [mounted, router]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<DashboardStats>('/users/admin/stats');
      setStats(response.data || null);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-zinc-400 text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
              <p className="text-zinc-500 text-sm mt-1">Platform overview and statistics</p>
            </div>
            <button
              type="button"
              onClick={fetchStats}
              className="btn-secondary flex items-center gap-2"
            >
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
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Refresh
            </button>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              <StatCard label="Total Users" value={stats.totalUsers} delay={0} />
              <StatCard
                label="Pending Mentors"
                value={stats.pendingMentors}
                variant="warning"
                delay={50}
              />
              <StatCard
                label="Pending Members"
                value={stats.pendingMembers}
                variant="warning"
                delay={100}
              />
              <StatCard
                label="Active Users"
                value={stats.activeUsers}
                variant="success"
                delay={150}
              />
              <StatCard
                label="Communities"
                value={stats.totalCommunities}
                variant="info"
                delay={200}
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/applications/mentors"
                className="card group p-6 flex items-start gap-4 hover:bg-white/[0.02]"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium group-hover:text-zinc-200">
                    Review Mentor Apps
                  </h3>
                  <p className="text-zinc-500 text-sm mt-1">
                    Review and approve pending mentor applications
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Link>

              <Link
                href="/applications/members"
                className="card group p-6 flex items-start gap-4 hover:bg-white/[0.02]"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-violet-500/20 bg-violet-500/10 text-violet-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium group-hover:text-zinc-200">View Members</h3>
                  <p className="text-zinc-500 text-sm mt-1">
                    Manage community members and their status
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Link>

              <Link
                href="/events/new"
                className="card group p-6 flex items-start gap-4 hover:bg-white/[0.02]"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium group-hover:text-zinc-200">Create Event</h3>
                  <p className="text-zinc-500 text-sm mt-1">
                    Schedule a new community event or meeting
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
