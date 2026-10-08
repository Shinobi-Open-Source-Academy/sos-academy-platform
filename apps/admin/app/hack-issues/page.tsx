'use client';

import { formatDate, HackIssueStatus } from '@sos-academy/shared';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRequireAuth } from '../../context/AuthContext';
import { ApiError, apiClient } from '../../lib/api-client';
import Sidebar from '../components/Sidebar';

export const dynamic = 'force-dynamic';

interface HackIssue {
  _id: string;
  repository: string;
  owner: string;
  repo: string;
  number: number;
  title: string;
  labels: string[];
  language?: string;
  url: string;
  status: HackIssueStatus;
  registeredBy?: { name: string; email: string };
  createdAt: string;
}

interface HackIssuesResponse {
  issues: HackIssue[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

// Used in an HTML `pattern` attribute, compiled with the `v` flag: `/` must be escaped in classes
const GITHUB_ISSUE_URL_PATTERN = '^https?://(www\\.)?github\\.com/[^\\/]+/[^\\/]+/issues/\\d+.*$';

const STATUS_BADGES: Record<HackIssueStatus, string> = {
  [HackIssueStatus.OPEN]: 'badge-info',
  [HackIssueStatus.ASSIGNED]: 'badge-warning',
  [HackIssueStatus.IN_PROGRESS]: 'badge-warning',
  [HackIssueStatus.PR_OPEN]: 'badge-info',
  [HackIssueStatus.CHANGES_REQUESTED]: 'badge-warning',
  [HackIssueStatus.MERGED]: 'badge-success',
  [HackIssueStatus.STALE]: 'badge-danger',
  [HackIssueStatus.UNASSIGNED]: 'badge-neutral',
  [HackIssueStatus.CLOSED_UNMERGED]: 'badge-neutral',
};

const formatStatus = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');

export default function HackIssuesPage() {
  const { admin, loading: authLoading } = useRequireAuth();
  const [issues, setIssues] = useState<HackIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Register form state
  const [issueUrl, setIssueUrl] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const res = await apiClient.get<HackIssuesResponse>(`/hack-issues?${params}`);
      if (res.data) {
        setIssues(res.data.issues);
        setPagination(res.data.pagination);
      }
    } catch {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearch]);

  useEffect(() => {
    if (!authLoading && admin) fetchIssues();
  }, [authLoading, admin, fetchIssues]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setRegisterError(null);
    try {
      const res = await apiClient.post<HackIssue>('/hack-issues', { url: issueUrl.trim() });
      toast.success(
        res.data
          ? `Registered ${res.data.owner}/${res.data.repo}#${res.data.number}`
          : 'Issue registered'
      );
      setIssueUrl('');
      if (pagination.page === 1) {
        fetchIssues();
      } else {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to register issue';
      setRegisterError(message);
      toast.error(message);
    } finally {
      setRegistering(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-white">Hack Issues</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Register open-source GitHub issues that hackers can claim.
            </p>
          </div>

          {/* Register form */}
          <div className="card p-6 mb-6 border border-white/10">
            <h2 className="text-sm font-semibold text-white mb-1">Register Issue</h2>
            <p className="text-xs text-zinc-500 mb-4">
              Paste the URL of a public, open GitHub issue. Its title, labels and repository
              language are fetched from GitHub.
            </p>
            <form onSubmit={handleRegister} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="issue-url" className="sr-only">
                  GitHub issue URL
                </label>
                <input
                  id="issue-url"
                  type="url"
                  required
                  pattern={GITHUB_ISSUE_URL_PATTERN}
                  title="A GitHub issue URL, e.g. https://github.com/owner/repo/issues/123"
                  value={issueUrl}
                  onChange={(e) => {
                    setIssueUrl(e.target.value);
                    setRegisterError(null);
                  }}
                  className={`input w-full ${registerError ? 'border-red-500/50' : ''}`}
                  placeholder="https://github.com/owner/repo/issues/123"
                  aria-invalid={Boolean(registerError)}
                  aria-describedby={registerError ? 'issue-url-error' : undefined}
                />
                {registerError && (
                  <p id="issue-url-error" className="text-xs text-red-400 mt-2">
                    {registerError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={registering || !issueUrl.trim()}
                className="btn-primary px-6 py-2 text-sm disabled:opacity-50 self-start"
              >
                {registering ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="search"
              placeholder="Search by title or repository..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="input flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="select sm:w-48"
            >
              <option value="all">All Status</option>
              {Object.values(HackIssueStatus).map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Issues table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin mx-auto" />
              </div>
            ) : issues.length === 0 ? (
              <p className="p-8 text-center text-zinc-500 text-sm">
                {debouncedSearch || statusFilter !== 'all'
                  ? 'No issues match your filters.'
                  : 'No issues registered yet.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                        Issue
                      </th>
                      <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                        Language
                      </th>
                      <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                        Registered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {issues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-medium hover:underline"
                          >
                            {issue.title}
                          </a>
                          <p className="text-xs text-zinc-500 mt-1 mono">
                            {issue.owner}/{issue.repo}#{issue.number}
                          </p>
                          {issue.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {issue.labels.map((label) => (
                                <span key={label} className="badge-neutral">
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-400">{issue.language || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={STATUS_BADGES[issue.status] ?? 'badge-neutral'}>
                            {formatStatus(issue.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          <p>{formatDate(issue.createdAt)}</p>
                          {issue.registeredBy && (
                            <p className="text-xs text-zinc-500 mt-1">
                              by {issue.registeredBy.name}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} issues
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
                  disabled={pagination.page >= pagination.pages}
                  className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
