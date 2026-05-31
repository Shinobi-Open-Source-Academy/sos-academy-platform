'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface SearchFilterProps {
  tags: string[];
  currentTag?: string;
  currentSearch?: string;
  currentSort?: string;
  currentDateRange?: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_read', label: 'Most read' },
  { value: 'most_reacted', label: 'Most liked' },
] as const;

const DATE_OPTIONS = [
  { value: '', label: 'All time' },
  { value: 'year', label: 'This year' },
  { value: 'month', label: 'This month' },
  { value: 'week', label: 'This week' },
] as const;

export default function SearchFilter({
  tags,
  currentTag,
  currentSearch,
  currentSort = 'newest',
  currentDateRange,
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`space-y-4 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      {/* Search */}
      <div className="relative">
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
          defaultValue={currentSearch ?? ''}
          onChange={(e) => update({ search: e.target.value || null })}
          placeholder="Search posts..."
          className="w-full bg-zinc-900/50 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600 shrink-0">Sort:</span>
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ sortBy: opt.value })}
                className={`px-2.5 py-1 text-xs transition-colors border ${
                  currentSort === opt.value
                    ? 'bg-white text-black border-white'
                    : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600 shrink-0">When:</span>
          <div className="flex gap-1">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value || 'all'}
                type="button"
                onClick={() => update({ dateRange: opt.value || null })}
                className={`px-2.5 py-1 text-xs transition-colors border ${
                  (currentDateRange ?? '') === opt.value
                    ? 'bg-white text-black border-white'
                    : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topic/Tag filter */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-600 shrink-0">Topic:</span>
          <button
            type="button"
            onClick={() => update({ tag: null })}
            className={`px-3 py-1 text-xs transition-colors border ${
              !currentTag
                ? 'bg-white text-black border-white'
                : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => update({ tag: tag === currentTag ? null : tag })}
              className={`px-3 py-1 text-xs transition-colors border ${
                tag === currentTag
                  ? 'bg-white text-black border-white'
                  : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
