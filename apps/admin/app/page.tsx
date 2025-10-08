'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { isAuthenticated, logout } from '../lib/auth';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const response = await apiClient.get<any>('/users/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">SOS Admin</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/"
            className="block px-6 py-3 text-white bg-gray-700 border-l-4 border-blue-500"
          >
            Dashboard
          </Link>
          <Link
            href="/applications/mentors"
            className="block px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Mentor Applications
          </Link>
          <Link
            href="/applications/members"
            className="block px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Member Registrations
          </Link>
          <Link
            href="/events"
            className="block px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Events
          </Link>
          <button
            type="button"
            onClick={logout}
            className="w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white mt-4"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-white mb-8">Dashboard</h2>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Pending Mentors</h3>
              <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.pendingMentors}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Pending Members</h3>
              <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.pendingMembers}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Active Users</h3>
              <p className="text-3xl font-bold text-green-500 mt-2">{stats.activeUsers}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Total Communities</h3>
              <p className="text-3xl font-bold text-blue-500 mt-2">{stats.totalCommunities}</p>
            </div>
          </div>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <Link
              href="/applications/mentors"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Review Mentor Apps
            </Link>
            <Link
              href="/events/new"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
