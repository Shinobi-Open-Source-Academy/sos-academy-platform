'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../../../lib/api-client';
import { isAuthenticated } from '../../../lib/auth';
import DeleteModal from '../../components/DeleteModal';
import QuickActionsMenu from '../../components/QuickActionsMenu';
import Sidebar from '../../components/Sidebar';

export const dynamic = 'force-dynamic';

interface Member {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  githubProfile?: {
    login: string;
    htmlUrl: string;
    avatarUrl?: string;
  };
  communities?: (string | { name: string; slug: string })[];
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

// Helper to read URL params client-side only
function getInitialUrlParams() {
  if (typeof window === 'undefined') {
    return { search: '', community: 'all', page: 1 };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get('search') || '',
    community: params.get('community') || 'all',
    page: Number(params.get('page')) || 1,
  };
}

function buildFilterParams(opts: {
  search?: string;
  community?: string;
  page?: number;
  limit?: number;
  role?: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (opts.role) params.set('role', opts.role);
  if (opts.search) params.set('search', opts.search);
  if (opts.community && opts.community !== 'all') params.set('community', opts.community);
  if (opts.page && opts.page > 1) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));
  return params;
}

export default function MembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [communityFilter, setCommunityFilter] = useState<string>('all');
  const [communities, setCommunities] = useState<{ name: string; slug: string }[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; member: Member | null }>({
    isOpen: false,
    member: null,
  });
  const [mounted, setMounted] = useState(false);

  // Track if URL params have been initialized
  const urlParamsInitialized = useRef(false);

  // Initialize from URL params on mount (client-side only)
  useEffect(() => {
    if (!urlParamsInitialized.current) {
      const initialParams = getInitialUrlParams();
      setSearchTerm(initialParams.search);
      setCommunityFilter(initialParams.community);
      setPagination((prev) => ({ ...prev, page: initialParams.page }));
      urlParamsInitialized.current = true;
    }
    setMounted(true);
  }, []);

  // Function to update URL query params without triggering a navigation
  const updateUrlParams = useCallback(
    (params: { search?: string; community?: string; page?: number }) => {
      if (typeof window === 'undefined') return;

      const search = params.search ?? searchTerm;
      const community = params.community ?? communityFilter;
      const page = params.page ?? pagination.page;

      const newParams = buildFilterParams({ search, community, page });
      const queryString = newParams.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;
      // Use replaceState to update URL without triggering navigation
      window.history.replaceState({}, '', newUrl);
    },
    [searchTerm, communityFilter, pagination.page]
  );

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    void fetchMembers();
  }, [mounted, router]);

  useEffect(() => {
    // Reset selection when members change
    setSelectedMembers(new Set());
  }, [members]);

  useEffect(() => {
    void fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await apiClient.get<{ name: string; slug: string }[]>('/communities');
      setCommunities(response.data || []);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  const fetchMembers = useCallback(
    async (
      pageOverride?: number,
      communityOverride?: string | null,
      searchOverride?: string | null,
      options?: { skipCache?: boolean }
    ) => {
      if (!mounted) return;
      setLoading(true);
      try {
        const pageToUse = pageOverride ?? pagination.page;
        const communityToUse = communityOverride ?? communityFilter;
        const searchToUse = searchOverride ?? searchTerm;

        // Update URL params to reflect current filters
        updateUrlParams({
          search: searchToUse,
          community: communityToUse,
          page: pageToUse,
        });

        const params = buildFilterParams({
          role: 'MEMBER',
          search: searchToUse,
          community: communityToUse,
          page: pageToUse,
          limit: pagination.limit,
        });

        // Use caching for GET requests unless explicitly skipped (e.g., after mutations)
        const response = await apiClient.get<PaginatedResponse>(`/users/admin/users?${params}`, {
          useCache: !options?.skipCache,
        });
        if (response.data) {
          setMembers(response.data.users || []);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
        toast.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    },
    [mounted, pagination.page, pagination.limit, searchTerm, communityFilter, updateUrlParams]
  );

  const handleDelete = async (reason: string) => {
    if (!deleteModal.member) {
      return;
    }

    try {
      console.log('Delete reason:', reason);
      await apiClient.delete(`/users/${getMemberId(deleteModal.member)}`);
      setDeleteModal({ isOpen: false, member: null });
      await fetchMembers(undefined, undefined, undefined, { skipCache: true });
      toast.success('Member deleted successfully');
    } catch (error) {
      console.error('Failed to delete member:', error);
      toast.error('Failed to delete member');
    }
  };

  const getMemberId = (member: Member): string => {
    return member.id || member._id || '';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(
        new Set(members.map((m) => getMemberId(m)).filter((id) => id && id.length === 24))
      );
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleBulkActivate = async () => {
    if (selectedMembers.size === 0) return;

    setBulkUpdating(true);
    try {
      const userIds = Array.from(selectedMembers).filter((id) => id && id.length === 24);
      if (userIds.length === 0) {
        toast.error('No valid member IDs selected');
        setBulkUpdating(false);
        return;
      }

      const response = await apiClient.put<{ updated: number }>('/users/bulk/status', {
        userIds,
        status: 'ACTIVE',
      });
      const updatedCount = response.data?.updated ?? userIds.length;
      toast.success(`Successfully activated ${updatedCount} member(s)`);
      setSelectedMembers(new Set());
      await fetchMembers(undefined, undefined, undefined, { skipCache: true });
    } catch (error) {
      console.error('Failed to activate members:', error);
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to activate members'
          : 'Failed to activate members';
      toast.error(errorMessage);
    } finally {
      setBulkUpdating(false);
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
    const styles: Record<string, string> = {
      ACTIVE: 'badge-success',
      PENDING: 'badge-warning',
      INACTIVE: 'badge-neutral',
    };

    return <span className={styles[status] || 'badge-neutral'}>{status}</span>;
  };

  if (!mounted || (loading && members.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-zinc-400 text-sm">Loading members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Members</h1>
            <p className="text-zinc-500 text-sm mt-1">View and manage community members</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchMembers()}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <title>Refresh</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedMembers.size > 0 && (
          <div className="mb-4 p-4 bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-sm text-white">
              {selectedMembers.size} member{selectedMembers.size > 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              onClick={handleBulkActivate}
              disabled={bulkUpdating}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {bulkUpdating ? 'Activating...' : 'Mark as Active'}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <title>Search</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or GitHub..."
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
                void fetchMembers(1, undefined, value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void fetchMembers(1, undefined, searchTerm);
                }
              }}
              className="input pl-10"
            />
          </div>
          <select
            value={communityFilter}
            onChange={(e) => {
              const val = e.target.value;
              setCommunityFilter(val);
              setPagination((prev) => ({ ...prev, page: 1 }));
              // pass the new community value (and current searchTerm) to avoid stale state
              void fetchMembers(1, val, searchTerm);
            }}
            className="select w-48"
          >
            <option value="all">All Communities</option>
            {communities.map((community) => (
              <option key={community.slug} value={community.slug}>
                {community.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-5 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedMembers.size === members.length && members.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 border-white/20 bg-white/5 checked:bg-blue-500"
                    />
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    GitHub
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Communities
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-8 h-8 text-zinc-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1}
                        >
                          <title>Empty inbox</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-zinc-500 text-sm">No members found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => {
                    const memberId = getMemberId(member);
                    return (
                      <tr
                        key={memberId}
                        className="table-row animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedMembers.has(memberId)}
                            onChange={(e) => handleSelectMember(memberId, e.target.checked)}
                            className="w-4 h-4 border-white/20 bg-white/5 checked:bg-blue-500"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {member.githubProfile?.avatarUrl ? (
                              <img
                                src={member.githubProfile.avatarUrl}
                                alt={member.name}
                                className="w-9 h-9 object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-white">{member.name}</p>
                              <p className="text-xs text-zinc-500 mono">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {member.githubProfile ? (
                            <a
                              href={member.githubProfile.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-zinc-400 hover:text-white transition-colors mono"
                            >
                              @{member.githubProfile.login}
                            </a>
                          ) : (
                            <span className="text-sm text-zinc-600">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {member.communities && member.communities.length > 0 ? (
                              member.communities.map((community) => {
                                const name =
                                  typeof community === 'string' ? community : community.name;
                                const key =
                                  typeof community === 'string' ? community : community.slug;
                                return (
                                  <span key={key} className="badge-info">
                                    {name}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-sm text-zinc-600">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(member.status)}</td>
                        <td className="px-5 py-4 text-sm text-zinc-500">
                          {formatDate(member.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end">
                            <QuickActionsMenu
                              githubUrl={member.githubProfile?.htmlUrl}
                              email={member.email}
                              onDelete={() => setDeleteModal({ isOpen: true, member })}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            members
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const newPage = pagination.page - 1;
                setPagination((prev) => ({ ...prev, page: newPage }));
                void fetchMembers(newPage, undefined, undefined);
              }}
              disabled={pagination.page === 1}
              className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm text-zinc-500">
              Page {pagination.page} of {pagination.pages || 1}
            </span>
            <button
              type="button"
              onClick={() => {
                const newPage = pagination.page + 1;
                setPagination((prev) => ({ ...prev, page: newPage }));
                void fetchMembers(newPage, undefined, undefined);
              }}
              disabled={pagination.page === pagination.pages || pagination.pages === 0}
              className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
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
