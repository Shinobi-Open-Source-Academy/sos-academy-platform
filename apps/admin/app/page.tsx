'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { isAuthenticated } from '../lib/auth';
import Sidebar from './components/Sidebar';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalUsers: number;
  pendingMentors: number;
  pendingMembers: number;
  activeUsers: number;
  totalCommunities: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchStats();
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <p className="text-gray-400 mt-1">Platform overview and statistics</p>
          </div>
          <button
            type="button"
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Pending Mentors</h3>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pendingMentors}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Pending Members</h3>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pendingMembers}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Active Users</h3>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.activeUsers}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Communities</h3>
              <p className="text-3xl font-bold text-blue-400 mt-2">{stats.totalCommunities}</p>
            </div>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/applications/mentors"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Review Mentor Apps
            </Link>
            <Link
              href="/applications/members"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Members
            </Link>
            <Link
              href="/events/new"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
