'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../../../lib/api-client';
import { isAuthenticated } from '../../../lib/auth';
import DeleteModal from '../../components/DeleteModal';
import QuickActionsMenu from '../../components/QuickActionsMenu';
import Sidebar from '../../components/Sidebar';

export const dynamic = 'force-dynamic';

interface Mentor {
  _id?: string;
  id?: string;
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

/** Get a string user id from API response (DTO returns `id`, raw may have `_id` as string or object). */
function getMentorId(mentor: Mentor): string {
  const id = mentor.id ?? mentor._id;
  if (typeof id === 'string') return id;
  if (id != null && typeof id === 'object' && typeof (id as { toString?: () => string }).toString === 'function') {
    return (id as { toString: () => string }).toString();
  }
  return '';
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

interface CommunityOption {
  _id: string;
  name: string;
  slug: string;
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
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; mentor: Mentor | null }>({
    isOpen: false,
    mentor: null,
  });
  const [detailsSubForm, setDetailsSubForm] = useState<'approve' | 'reject' | null>(null);
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [approveCustomMessage, setApproveCustomMessage] = useState('');
  const [approveCommunityIds, setApproveCommunityIds] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCommunityId, setRejectCommunityId] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

    fetchMentors();
  }, [mounted, router]);

  useEffect(() => {
    if ((detailsSubForm === 'approve' || detailsSubForm === 'reject') && detailsModal.mentor) {
      fetchCommunities();
    }
  }, [detailsSubForm]);

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
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await apiClient.get<CommunityOption[]>('/communities');
      if (response.data && Array.isArray(response.data)) {
        setCommunities(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  const openDetailsModal = (mentor: Mentor, subForm?: 'approve' | 'reject') => {
    setDetailsModal({ isOpen: true, mentor });
    setDetailsSubForm(subForm ?? null);
    setApproveCustomMessage('');
    setApproveCommunityIds([]);
    setRejectReason('');
    setRejectCommunityId('');
    if (subForm === 'reject') fetchCommunities();
  };

  const closeDetailsModal = () => {
    setDetailsModal({ isOpen: false, mentor: null });
    setDetailsSubForm(null);
    setApproveCustomMessage('');
    setApproveCommunityIds([]);
    setRejectReason('');
    setRejectCommunityId('');
  };

  const handleApprove = async (
    id: string,
    payload?: { customMessage?: string; communityIds?: string[] }
  ) => {
    setSubmitting(true);
    try {
      await apiClient.put(`/users/${String(id)}/approve`, {
        customMessage: payload?.customMessage || undefined,
        communityIds: payload?.communityIds ?? [],
      });
      await fetchMentors();
      closeDetailsModal();
      toast.success('Mentor approved successfully');
    } catch (error) {
      console.error('Failed to approve mentor:', error);
      toast.error('Failed to approve mentor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (
    id: string,
    payload?: { reason: string; communityId?: string }
  ) => {
    if (payload && !payload.reason?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.put(`/users/${String(id)}/reject`, {
        reason:
          payload?.reason ??
          'We have decided not to move forward with your application at this time.',
        communityId: payload?.communityId?.trim() || undefined,
      });
      await fetchMentors();
      closeDetailsModal();
      toast.success('Mentor rejected successfully');
    } catch (error) {
      console.error('Failed to reject mentor:', error);
      toast.error('Failed to reject mentor');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCommunitySelection = (id: string) => {
    setApproveCommunityIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDelete = async (reason: string) => {
    if (!deleteModal.mentor) {
      return;
    }

    try {
      console.log('Delete reason:', reason);
      await apiClient.delete(`/users/${getMentorId(deleteModal.mentor)}`);
      setDeleteModal({ isOpen: false, mentor: null });
      await fetchMentors();
      toast.success('Mentor deleted successfully');
    } catch (error) {
      console.error('Failed to delete mentor:', error);
      toast.error('Failed to delete mentor');
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
      APPLIED_MENTOR: 'badge-info',
      REJECTED: 'badge-danger',
    };

    return <span className={styles[status] || 'badge-neutral'}>{status.replace('_', ' ')}</span>;
  };

  if (!mounted || (loading && mentors.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-zinc-400 text-sm">Loading mentors...</span>
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
            <h1 className="text-2xl font-semibold text-white tracking-tight">Mentors</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Manage mentor applications and active mentors
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMentors}
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
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="select w-40"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="APPLIED_MENTOR">Applied</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-5 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Mentor
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
                {mentors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-8 h-8 text-zinc-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1}
                        >
                          <title>No mentors found</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-zinc-500 text-sm">No mentors found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mentors.map((mentor, index) => (
                    <tr
                      key={getMentorId(mentor) || `mentor-${index}`}
                      className="table-row animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {mentor.githubProfile?.avatarUrl ? (
                            <img
                              src={mentor.githubProfile.avatarUrl}
                              alt={mentor.name}
                              className="w-9 h-9 object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm font-medium">
                              {mentor.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{mentor.name}</p>
                            <p className="text-xs text-zinc-500 mono">{mentor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {mentor.githubProfile ? (
                          <a
                            href={mentor.githubProfile.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-zinc-400 hover:text-white transition-colors mono"
                          >
                            @{mentor.githubProfile.login}
                          </a>
                        ) : (
                          <span className="text-sm text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {mentor.communities && mentor.communities.length > 0 ? (
                            mentor.communities.map((community) => (
                              <span key={community.slug} className="badge-info">
                                {community.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-zinc-600">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(mentor.status)}</td>
                      <td className="px-5 py-4 text-sm text-zinc-500">
                        {formatDate(mentor.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {(mentor.status === 'PENDING' || mentor.status === 'APPLIED_MENTOR') && (
                            <>
                              <button
                                type="button"
                                onClick={() => openDetailsModal(mentor, 'approve')}
                                className="btn-success text-xs px-3 py-1.5"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => openDetailsModal(mentor, 'reject')}
                                className="btn-danger text-xs px-3 py-1.5"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <QuickActionsMenu
                            githubUrl={mentor.githubProfile?.htmlUrl}
                            email={mentor.email}
                            onDelete={() => setDeleteModal({ isOpen: true, mentor })}
                            onViewDetails={() => openDetailsModal(mentor)}
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

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            mentors
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
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
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
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
        onClose={() => setDeleteModal({ isOpen: false, mentor: null })}
        onConfirm={handleDelete}
        userName={deleteModal.mentor?.name || ''}
      />

      {/* Application Details Modal */}
      {detailsModal.isOpen && detailsModal.mentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">
                {detailsSubForm === 'approve'
                  ? 'Approve application'
                  : detailsSubForm === 'reject'
                    ? 'Reject application'
                    : 'Application Details'}
              </h2>
              <button
                type="button"
                onClick={closeDetailsModal}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <title>Close</title>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailsSubForm === 'approve' ? (
              <div className="p-5 space-y-4">
                <p className="text-sm text-zinc-400">
                  Optional custom message and communities for the approval email sent to{' '}
                  <strong className="text-white">{detailsModal.mentor.name}</strong>.
                </p>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Custom email message (optional)
                  </label>
                  <textarea
                    value={approveCustomMessage}
                    onChange={(e) => setApproveCustomMessage(e.target.value)}
                    placeholder="e.g. We are excited to have you lead our React community."
                    rows={4}
                    className="input w-full resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Communities the mentor will lead
                  </label>
                  <div className="border border-white/10 rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
                    {communities.length === 0 ? (
                      <p className="text-sm text-zinc-500 py-2">Loading communities…</p>
                    ) : (
                      communities.map((c) => (
                        <label
                          key={c._id}
                          className="flex items-center gap-2 py-2 px-2 rounded hover:bg-white/[0.04] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={approveCommunityIds.includes(c._id)}
                            onChange={() => toggleCommunitySelection(c._id)}
                            className="rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500/50"
                          />
                          <span className="text-sm text-zinc-300">{c.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDetailsSubForm(null)}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      handleApprove(getMentorId(detailsModal.mentor!), {
                        customMessage: approveCustomMessage.trim() || undefined,
                        communityIds: approveCommunityIds,
                      })
                    }
                    className="btn-success flex-1 disabled:opacity-50"
                  >
                    {submitting ? 'Sending…' : 'Approve & send email'}
                  </button>
                </div>
              </div>
            ) : detailsSubForm === 'reject' ? (
              <div className="p-5 space-y-4">
                <p className="text-sm text-zinc-400">
                  Provide a reason for rejection. This will be included in the email sent to{' '}
                  <strong className="text-white">{detailsModal.mentor.name}</strong>. You can
                  optionally assign them to a community as a member (hacker).
                </p>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Reason for rejection <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. We have decided to pursue other candidates at this time."
                    rows={4}
                    className="input w-full resize-y"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Assign to community as member (optional)
                  </label>
                  <select
                    value={rejectCommunityId}
                    onChange={(e) => setRejectCommunityId(e.target.value)}
                    className="select w-full"
                  >
                    <option value="">No community — reject only</option>
                    {communities.length === 0 ? (
                      <option disabled>Loading communities…</option>
                    ) : (
                      communities.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">
                    If selected, they will be added as a member (hacker) to this community and can
                    use the member portal.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDetailsSubForm(null)}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={submitting || !rejectReason.trim()}
                    onClick={() =>
                      handleReject(getMentorId(detailsModal.mentor!), {
                        reason: rejectReason.trim(),
                        communityId: rejectCommunityId.trim() || undefined,
                      })
                    }
                    className="btn-danger flex-1 disabled:opacity-50"
                  >
                    {submitting ? 'Sending…' : 'Reject & send email'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-5 space-y-4">
                  {/* Header with avatar */}
                  <div className="flex items-center gap-4 pb-4 border-b border-white/[0.06]">
                    {detailsModal.mentor.githubProfile?.avatarUrl ? (
                      <img
                        src={detailsModal.mentor.githubProfile.avatarUrl}
                        alt={detailsModal.mentor.name}
                        className="w-14 h-14 object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-zinc-800 flex items-center justify-center text-zinc-500 text-xl font-medium">
                        {detailsModal.mentor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{detailsModal.mentor.name}</h3>
                      <p className="text-sm text-zinc-400 mono">{detailsModal.mentor.email}</p>
                    </div>
                    {getStatusBadge(detailsModal.mentor.status)}
                  </div>

                  {/* GitHub */}
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">GitHub</p>
                    {detailsModal.mentor.githubProfile ? (
                      <a
                        href={detailsModal.mentor.githubProfile.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 mono"
                      >
                        github.com/{detailsModal.mentor.githubProfile.login}
                      </a>
                    ) : (
                      <p className="text-sm text-zinc-600 italic">Not provided</p>
                    )}
                  </div>

                  {/* Expertise */}
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Areas of Expertise
                    </p>
                    {detailsModal.mentor.expertise ? (
                      <p className="text-sm text-zinc-300">{detailsModal.mentor.expertise}</p>
                    ) : (
                      <p className="text-sm text-zinc-600 italic">Not provided</p>
                    )}
                  </div>

                  {/* Motivation */}
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Why They Want to Be a Sensei
                    </p>
                    {detailsModal.mentor.motivation ? (
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {detailsModal.mentor.motivation}
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-600 italic">Not provided</p>
                    )}
                  </div>

                  {/* Communities */}
                  {detailsModal.mentor.communities &&
                    detailsModal.mentor.communities.length > 0 && (
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                          Communities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {detailsModal.mentor.communities.map((community) => (
                            <span key={community.slug} className="badge-info">
                              {community.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Applied Date */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <p className="text-xs text-zinc-600">
                      Applied on {formatDate(detailsModal.mentor.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-white/[0.06] flex gap-3">
                  {(detailsModal.mentor.status === 'PENDING' ||
                    detailsModal.mentor.status === 'APPLIED_MENTOR') && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDetailsSubForm('approve')}
                        className="btn-success flex-1"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailsSubForm('reject')}
                        className="btn-danger flex-1"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <a
                    href={`mailto:${detailsModal.mentor.email}`}
                    className="btn-secondary flex-1 text-center"
                  >
                    Contact
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
