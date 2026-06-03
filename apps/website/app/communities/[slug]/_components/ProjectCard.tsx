import SpotlightCard from '../../../../components/SpotlightCard';
import type { ProjectStats, ProjectsResponse } from '../../../../lib/api-client';
import { RANK_COLORS, RANK_TOOLTIPS } from './constants';
import { formatRelativeDate } from './utils';

type Project = ProjectsResponse['projects'][number];

interface ProjectCardProps {
  project: Project;
  stats?: ProjectStats;
}

export function ProjectCard({ project, stats }: ProjectCardProps) {
  const displayStars = stats?.stars ?? project.stars ?? 0;
  const displayContributors = stats?.contributors ?? project.contributors ?? 0;
  const displayLastUpdated = stats?.lastUpdated ?? project.lastUpdated;
  const projectUrl = stats?.website ?? project.website ?? project.url ?? '#';

  return (
    <SpotlightCard className="border border-white/5 hover:border-white/10 transition-all duration-300 group">
      <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="block p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
            )}
          </div>
          {project.rank && (
            <div
              className={`ml-4 flex-shrink-0 text-xs font-bold px-2.5 py-1 border ${RANK_COLORS[project.rank] || 'border-white/20 bg-white/5 text-gray-300'} cursor-help`}
              title={RANK_TOOLTIPS[project.rank] || 'Project rank'}
            >
              {project.rank}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-label="Stars">
              <title>Stars</title>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium">
              {displayStars > 0 ? displayStars.toLocaleString() : '—'}
            </span>
            <span className="text-gray-500">stars</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Contributors"
            >
              <title>Contributors</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="font-medium">
              {displayContributors > 0 ? displayContributors : '—'}
            </span>
            <span className="text-gray-500">contributors</span>
          </div>
          {displayLastUpdated && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Last updated"
              >
                <title>Last updated</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Updated {formatRelativeDate(displayLastUpdated)}</span>
            </div>
          )}
        </div>

        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="text-xs px-2 py-1 bg-white/5 border border-white/10 text-gray-400 hover:border-white/20 transition-colors"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="text-xs px-2 py-1 text-gray-500">
                +{project.technologies.length - 4} more
              </span>
            )}
          </div>
        )}
      </a>
    </SpotlightCard>
  );
}
