'use client';

import type { CommunityDetails, CommunityProject } from '@/app/types/community';

interface CommunityProjectsProps {
  community: CommunityDetails;
}

export default function CommunityProjects({ community }: CommunityProjectsProps) {
  const { projects } = community;

  // Helper to group projects by status
  const groupedProjects = {
    active: projects.filter((project) => project.status === 'active'),
    planned: projects.filter((project) => project.status === 'planned'),
    completed: projects.filter((project) => project.status === 'completed'),
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Projects</h2>

        {/* Show blur overlay with coming soon message */}
        <div className="relative">
          <div className="absolute inset-0 z-10 bg-gray-900/70 backdrop-blur-md flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">Coming Soon</div>
              <p className="text-gray-300 max-w-md mx-auto">
                We&apos;re still setting up projects for this community. Check back soon!
              </p>
            </div>
          </div>

          {/* Original content (blurred in background) */}
          <div className="opacity-50">
            {projects && projects.length > 0 ? (
              <div className="space-y-10">
                {/* Active Projects */}
                {groupedProjects.active.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Active Projects
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {groupedProjects.active.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Planned Projects */}
                {groupedProjects.planned.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      Planned Projects
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {groupedProjects.planned.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Projects */}
                {groupedProjects.completed.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
                      <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                      Completed Projects
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {groupedProjects.completed.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-8 text-center">
                <p className="text-gray-300">No projects have been added to this community yet.</p>
                <button className="mt-4 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300">
                  Propose a project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: CommunityProject }) {
  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced':
        return 'bg-red-600';
      case 'intermediate':
        return 'bg-yellow-600';
      case 'beginner':
      default:
        return 'bg-green-600';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const difficultyColor = getDifficultyColor(project.difficulty);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-lg font-bold text-white">{project.name}</h4>
          <div className={`${difficultyColor} px-2 py-1 rounded text-xs text-white font-medium`}>
            {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {project.technologies.map((tech, index) => (
            <span key={index} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
              {tech}
            </span>
          ))}
        </div>

        <div className="text-gray-400 text-xs flex items-center gap-4">
          <span>Started: {formatDate(project.startDate)}</span>
          {project.completionDate && <span>Completed: {formatDate(project.completionDate)}</span>}
        </div>
      </div>

      <div className="mt-auto pt-3 p-4 border-t border-gray-700/50 flex justify-between items-center bg-gray-800/80">
        <div>
          <span className="text-gray-400 text-xs">
            {project.contributors.length} contributor
            {project.contributors.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex space-x-2">
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors duration-300"
          >
            Repository
          </a>
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-1 bg-primary/80 hover:bg-primary text-white rounded transition-colors duration-300"
            >
              Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
