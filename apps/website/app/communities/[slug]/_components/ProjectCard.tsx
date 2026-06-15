import { ClockIcon, StarIcon, UserGroupIcon } from '../../../../components/icons';
import SpotlightCard from '../../../../components/SpotlightCard';
import type { ProjectStats, ProjectsResponse } from '../../../../lib/api-client';
import { MAX_TECHNOLOGIES_SHOWN, RANK_COLORS, RANK_TOOLTIPS } from './constants';
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
            <StarIcon />
            <span className="font-medium">
              {displayStars > 0 ? displayStars.toLocaleString() : '—'}
            </span>
            <span className="text-gray-500">stars</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <UserGroupIcon />
            <span className="font-medium">
              {displayContributors > 0 ? displayContributors : '—'}
            </span>
            <span className="text-gray-500">contributors</span>
          </div>
          {displayLastUpdated && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <ClockIcon strokeWidth={2} />
              <span>Updated {formatRelativeDate(displayLastUpdated)}</span>
            </div>
          )}
        </div>

        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
            {project.technologies.slice(0, MAX_TECHNOLOGIES_SHOWN).map((tech) => (
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
