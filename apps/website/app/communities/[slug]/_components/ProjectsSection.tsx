import type { ProjectStats, ProjectsResponse } from '../../../../lib/api-client';
import { ComingSoonOverlay } from './ComingSoonOverlay';
import { ProjectCard } from './ProjectCard';
import type { SortOption } from './types';

interface ProjectsSectionProps {
  projects: ProjectsResponse['projects'];
  projectStats: Record<string, ProjectStats>;
  pagination: ProjectsResponse['pagination'];
  projectsLoading: boolean;
  searchQuery: string;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: SortOption) => void;
  onSortOrderToggle: () => void;
  onPageChange: (page: number) => void;
}

export function ProjectsSection({
  projects,
  projectStats,
  pagination,
  projectsLoading,
  searchQuery,
  sortBy,
  sortOrder,
  currentPage,
  onSearchChange,
  onSortByChange,
  onSortOrderToggle,
  onPageChange,
}: ProjectsSectionProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Current Projects</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 sm:min-w-[200px]">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Close"
                >
                  <title>Close</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOption)}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer pr-8"
            >
              <option value="rank">Sort by Rank</option>
              <option value="latest">Sort by Latest Update</option>
              <option value="stars">Sort by Stars</option>
              <option value="name">Sort by Name</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={onSortOrderToggle}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Sort ascending"
              >
                <title>Sort ascending</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Sort descending"
              >
                <title>Sort descending</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {projectsLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          <p className="mt-4 text-gray-400">Loading projects...</p>
        </div>
      ) : projects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} stats={projectStats[project._id]} />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="relative border border-white/10 p-6">
          <ComingSoonOverlay message="Projects will be announced soon" />
          <div className="opacity-20 pointer-events-none">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-white/10 p-6">
                  <div className="h-6 bg-zinc-800 w-48 mb-2" />
                  <div className="h-4 bg-zinc-800 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
