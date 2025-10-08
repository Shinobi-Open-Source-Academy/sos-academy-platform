'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { isAuthenticated, logout } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

interface Member {
  _id: string;
  name: string;
  email: string;
  communities?: { name: string; slug: string }[];
  status: string;
  createdAt: string;
}

export default function MemberRegistrationsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchMembers();
  }, [router]);

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get<Member[]>('/users/admin/pending-members');
      setMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.put(`/users/${id}/approve`);
      await fetchMembers();
    } catch (error) {
      console.error('Failed to approve member:', error);
      alert('Failed to approve member');
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
            className="block px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Mentor Applications
          </Link>
          <Link
            href="/applications/members"
            className="block px-6 py-3 text-white bg-gray-700 border-l-4 border-blue-500"
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
          Member Registrations ({members.length})
        </h2>

        {members.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-400">No pending member registrations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member._id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                    <p className="text-gray-400">{member.email}</p>

                    {member.communities && member.communities.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-400">Communities</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {member.communities.map((community) => (
                            <span
                              key={community.slug}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400"
                            >
                              {community.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                        {member.status}
                      </span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      type="button"
                      onClick={() => handleApprove(member._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      ✓ Approve
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
