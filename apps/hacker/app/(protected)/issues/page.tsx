'use client';

import { useCallback, useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { ApiError, apiFetch } from '../../../lib/api-client';

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
  status: string;
  assignedAt?: string;
}

interface AvailableResponse {
  issues: HackIssue[];
  pagination: { total: number; page: number; pages: number };
}

interface MineResponse {
  issues: HackIssue[];
  activeCount: number;
  maxActiveClaims: number;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ASSIGNED: { label: 'Assigned', className: 'badge-info' },
  IN_PROGRESS: { label: 'In progress', className: 'badge-info' },
  PR_OPEN: { label: 'PR open', className: 'badge-warning' },
  CHANGES_REQUESTED: { label: 'Changes requested', className: 'badge-warning' },
};

function IssueRow({ issue, action }: { issue: HackIssue; action: React.ReactNode }) {
  const badge = STATUS_BADGE[issue.status];
  return (
    <li className="activity-item">
      <div className="w-9 h-9 shrink-0 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white hover:underline break-words"
        >
          {issue.title}
        </a>
        <p className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="mono">
            {issue.owner}/{issue.repo}#{issue.number}
          </span>
          {issue.language && <span>· {issue.language}</span>}
          {issue.labels.slice(0, 3).map((label) => (
            <span key={label} className="badge badge-neutral text-[10px]">
              {label}
            </span>
          ))}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {badge && (
          <span className={`badge ${badge.className} hidden sm:inline-flex`}>{badge.label}</span>
        )}
        {action}
      </div>
    </li>
  );
}

export default function IssuesPage() {
  const [mine, setMine] = useState<MineResponse | null>(null);
  const [available, setAvailable] = useState<AvailableResponse | null>(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const params = query ? `?search=${encodeURIComponent(query)}` : '';
      const [mineRes, availableRes] = await Promise.all([
        apiFetch<MineResponse>('/hack-issues/mine'),
        apiFetch<AvailableResponse>(`/hack-issues/available${params}`),
      ]);
      setMine(mineRes);
      setAvailable(availableRes);
    } catch {
      setMessage({ type: 'error', text: 'We could not load the issues. Please try again.' });
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (issue: HackIssue, action: 'claim' | 'release') => {
    if (
      action === 'release' &&
      !confirm(`Release "${issue.title}"? It goes back to the pool for someone else to claim.`)
    ) {
      return;
    }
    setBusy(issue._id);
    setMessage(null);
    try {
      await apiFetch(`/hack-issues/${issue._id}/${action}`, { method: 'POST' });
      setMessage({
        type: 'success',
        text:
          action === 'claim'
            ? `You claimed "${issue.title}". Comment on the GitHub issue to let the maintainers know.`
            : `"${issue.title}" is back in the pool.`,
      });
      await load();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Something went wrong, please try again.',
      });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const atLimit = mine ? mine.activeCount >= mine.maxActiveClaims : false;

  return (
    <div className="min-h-screen bg-black md:flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl font-semibold text-white">Issues</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Claim an open-source issue, open a pull request, get it merged.
            </p>
          </div>

          {message && (
            <div
              role={message.type === 'error' ? 'alert' : 'status'}
              className={`card p-4 mb-6 text-sm ${
                message.type === 'error' ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* My issues */}
          <section className="mb-10 animate-fade-in delay-75" aria-labelledby="my-issues">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="my-issues"
                className="text-sm font-medium text-zinc-400 uppercase tracking-wider"
              >
                My issues
              </h2>
              {mine && (
                <span
                  className={`badge ${atLimit ? 'badge-warning' : 'badge-neutral'} text-[10px]`}
                >
                  {mine.activeCount}/{mine.maxActiveClaims} in progress
                </span>
              )}
            </div>
            {mine === null ? (
              <div className="card p-6 flex justify-center">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
              </div>
            ) : mine.issues.length === 0 ? (
              <div className="card p-6 text-sm text-zinc-500">
                You haven't claimed any issue yet. Pick one below to get started.
              </div>
            ) : (
              <ul className="card overflow-hidden">
                {mine.issues.map((issue) => (
                  <IssueRow
                    key={issue._id}
                    issue={issue}
                    action={
                      issue.status !== 'PR_OPEN' && (
                        <button
                          type="button"
                          onClick={() => act(issue, 'release')}
                          disabled={busy === issue._id}
                          className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-50"
                        >
                          {busy === issue._id ? 'Releasing...' : 'Release'}
                        </button>
                      )
                    }
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Open issues */}
          <section className="animate-fade-in delay-150" aria-labelledby="open-issues">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2
                id="open-issues"
                className="text-sm font-medium text-zinc-400 uppercase tracking-wider"
              >
                Open issues
                {available && (
                  <span className="text-zinc-600 normal-case"> · {available.pagination.total}</span>
                )}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setQuery(search.trim());
                }}
                className="flex gap-2"
              >
                <input
                  type="search"
                  aria-label="Search issues by title or repository"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title or repository"
                  className="input text-sm w-full sm:w-64"
                />
              </form>
            </div>

            {atLimit && (
              <p className="text-xs text-amber-400 mb-3">
                You have reached the limit of {mine?.maxActiveClaims} issues in progress. Finish or
                release one to claim another.
              </p>
            )}

            {available === null ? (
              <div className="card p-6 flex justify-center">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
              </div>
            ) : available.issues.length === 0 ? (
              <div className="card p-6 text-sm text-zinc-500">
                {query
                  ? 'No open issue matches your search.'
                  : 'No open issue right now. Check back soon!'}
              </div>
            ) : (
              <ul className="card overflow-hidden">
                {available.issues.map((issue) => (
                  <IssueRow
                    key={issue._id}
                    issue={issue}
                    action={
                      <button
                        type="button"
                        onClick={() => act(issue, 'claim')}
                        disabled={atLimit || busy === issue._id}
                        className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                      >
                        {busy === issue._id ? 'Claiming...' : 'Claim'}
                      </button>
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
