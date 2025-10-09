'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { isAuthenticated } from '../../../lib/auth';
import DeleteModal from '../../components/DeleteModal';
import QuickActionsMenu from '../../components/QuickActionsMenu';
import Sidebar from '../../components/Sidebar';

export const dynamic = 'force-dynamic';

interface Member {
  _id: string;
  name: string;
  email: string;
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
  users: Member[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [communityFilter, setCommunityFilter] = useState<string>('all');
  const [communities, setCommunities] = useState<{ name: string; slug: string }[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; member: Member | null }>({
    isOpen: false,
    member: null,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchMembers();
  }, [router]);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await apiClient.get<{ name: string; slug: string }[]>('/communities');
      setCommunities(response.data || []);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: 'MEMBER',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (communityFilter !== 'all') {
        params.append('community', communityFilter);
      }

      const response = await apiClient.get<PaginatedResponse>(`/users/admin/users?${params}`);
      if (response.data) {
        setMembers(response.data.users || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reason: string) => {
    if (!deleteModal.member) {
      return;
    }

    try {
      console.log('Delete reason:', reason);
      await apiClient.delete(`/users/${deleteModal.member._id}`);
      setDeleteModal({ isOpen: false, member: null });
      await fetchMembers();
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('Failed to delete member');
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
      INACTIVE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
      >
        {status}
      </span>
    );
  };

  if (loading && members.length === 0) {
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
            <h2 className="text-3xl font-bold text-white">Members</h2>
            <p className="text-gray-400 mt-1">View and manage community members</p>
          </div>
          <button
            type="button"
            onClick={fetchMembers}
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
            value={communityFilter}
            onChange={(e) => {
              setCommunityFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Communities</option>
            {communities.map((community) => (
              <option key={community.slug} value={community.slug}>
                {community.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Member
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
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No members found
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.githubProfile?.avatarUrl && (
                            <img
                              src={member.githubProfile.avatarUrl}
                              alt={member.name}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">{member.name}</div>
                            <div className="text-sm text-gray-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.githubProfile ? (
                          <a
                            href={member.githubProfile.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            @{member.githubProfile.login}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.communities && member.communities.length > 0 ? (
                            member.communities.map((community) => (
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
                      <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(member.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <QuickActionsMenu
                          githubUrl={member.githubProfile?.htmlUrl}
                          onDelete={() => setDeleteModal({ isOpen: true, member })}
                          onViewActivity={() => console.log('View activity', member._id)}
                        />
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
            members
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
        onClose={() => setDeleteModal({ isOpen: false, member: null })}
        onConfirm={handleDelete}
        userName={deleteModal.member?.name || ''}
      />
    </div>
  );
}
