'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { isAuthenticated } from '../../../lib/auth';
import DeleteModal from '../../components/DeleteModal';
import QuickActionsMenu from '../../components/QuickActionsMenu';
import Sidebar from '../../components/Sidebar';

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
  communities?: { name: string; slug: string }[];
  status: string;
  createdAt: string;
}

interface PaginatedResponse {
  users: Mentor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function MentorsPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; mentor: Mentor | null }>({
    isOpen: false,
    mentor: null,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchMentors();
  }, [router]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: 'MENTOR',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await apiClient.get<PaginatedResponse>(`/users/admin/users?${params}`);
      if (response.data) {
        setMentors(response.data.users || []);
        setPagination(response.data.pagination);
      }
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
    const confirmReject = window.confirm('Are you sure you want to reject this application?');
    if (!confirmReject) {
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

  const handleDelete = async (reason: string) => {
    if (!deleteModal.mentor) {
      return;
    }

    try {
      console.log('Delete reason:', reason);
      await apiClient.delete(`/users/${deleteModal.mentor._id}`);
      setDeleteModal({ isOpen: false, mentor: null });
      await fetchMentors();
    } catch (error) {
      console.error('Failed to delete mentor:', error);
      alert('Failed to delete mentor');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
      PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      APPLIED_MENTOR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading && mentors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Mentors</h2>
            <p className="text-gray-400 mt-1">Manage mentor applications and active mentors</p>
          </div>
          <button
            type="button"
            onClick={fetchMentors}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or GitHub..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="APPLIED_MENTOR">Applied</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Mentor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    GitHub
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Communities
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {mentors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No mentors found
                    </td>
                  </tr>
                ) : (
                  mentors.map((mentor) => (
                    <tr key={mentor._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {mentor.githubProfile?.avatarUrl && (
                            <img
                              src={mentor.githubProfile.avatarUrl}
                              alt={mentor.name}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">{mentor.name}</div>
                            <div className="text-sm text-gray-400">{mentor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {mentor.githubProfile ? (
                          <a
                            href={mentor.githubProfile.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            @{mentor.githubProfile.login}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {mentor.communities && mentor.communities.length > 0 ? (
                            mentor.communities.map((community) => (
                              <span
                                key={community.slug}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400"
                              >
                                {community.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(mentor.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(mentor.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {(mentor.status === 'PENDING' || mentor.status === 'APPLIED_MENTOR') && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(mentor._id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(mentor._id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <QuickActionsMenu
                            githubUrl={mentor.githubProfile?.htmlUrl}
                            onDelete={() => setDeleteModal({ isOpen: true, mentor })}
                            onViewActivity={() => console.log('View activity', mentor._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            mentors
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, mentor: null })}
        onConfirm={handleDelete}
        userName={deleteModal.mentor?.name || ''}
      />
    </div>
  );
}
