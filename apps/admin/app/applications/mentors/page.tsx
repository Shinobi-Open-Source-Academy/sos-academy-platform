'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { isAuthenticated, logout } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  expertise?: string;
  motivation?: string;
  githubProfile?: {
    login: string;
    htmlUrl: string;
    avatarUrl?: string;
  };
  status: string;
  createdAt: string;
}

export default function MentorApplicationsPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchMentors();
  }, [router]);

  const fetchMentors = async () => {
    try {
      const response = await apiClient.get<Mentor[]>('/users/admin/pending-mentors');
      setMentors(response.data || []);
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.put(`/users/${id}/approve`);
      await fetchMentors();
    } catch (error) {
      console.error('Failed to approve mentor:', error);
      alert('Failed to approve mentor');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this application?')) {
      return;
    }

    try {
      await apiClient.put(`/users/${id}/reject`);
      await fetchMentors();
    } catch (error) {
      console.error('Failed to reject mentor:', error);
      alert('Failed to reject mentor');
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
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">SOS Admin</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/"
            className="block px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/applications/mentors"
            className="block px-6 py-3 text-white bg-gray-700 border-l-4 border-blue-500"
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
        <h2 className="text-3xl font-bold text-white mb-8">
          Mentor Applications ({mentors.length})
        </h2>

        {mentors.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-400">No pending mentor applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mentors.map((mentor) => (
              <div key={mentor._id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      {mentor.githubProfile?.avatarUrl && (
                        <img
                          src={mentor.githubProfile.avatarUrl}
                          alt={mentor.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-white">{mentor.name}</h3>
                        <p className="text-gray-400">{mentor.email}</p>
                      </div>
                    </div>

                    {mentor.githubProfile && (
                      <div className="mt-3">
                        <a
                          href={mentor.githubProfile.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          @{mentor.githubProfile.login}
                        </a>
                      </div>
                    )}

                    {mentor.expertise && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-400">Expertise</h4>
                        <p className="text-white mt-1">{mentor.expertise}</p>
                      </div>
                    )}

                    {mentor.motivation && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-400">Motivation</h4>
                        <p className="text-white mt-1">{mentor.motivation}</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                        {mentor.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleApprove(mentor._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      ✓ Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(mentor._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
