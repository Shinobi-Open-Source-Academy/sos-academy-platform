'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCommunityBySlug, getProjectStats, type Community, type ProjectStats } from '../../../lib/api-client';
import { COMMUNITIES } from '../../../lib/data';
import CodeBackground from '../../../components/CodeBackground';
import Footer from '../../../components/Footer';
import Navbar from '../../../components/Navbar';
import SpotlightCard from '../../../components/SpotlightCard';

interface CommunityClientProps {
  slug: string;
}

export default function CommunityClient({ slug }: CommunityClientProps) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});

  useEffect(() => {
    async function fetchCommunity() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCommunityBySlug(slug);
        if (!data) {
          setError('Community not found');
          return;
        }
        setCommunity(data);
      } catch (err) {
        console.error('Error fetching community:', err);
        setError('Failed to load community data');
      } finally {
        setLoading(false);
      }
    }

    fetchCommunity();
  }, [slug]);

  // Fetch stats for individual projects after initial render
  useEffect(() => {
    if (!community?.projects) return;

    // Fetch stats for each project individually (non-blocking)
    community.projects.forEach((project) => {
      if (!project._id || !project.githubRepo) return;

      // Small delay to stagger requests and avoid rate limiting
      setTimeout(async () => {
        const stats = await getProjectStats(project._id);
        if (stats) {
          setProjectStats((prev) => ({
            ...prev,
            [project._id]: stats,
          }));
        }
      }, Math.random() * 500); // Random delay 0-500ms to stagger requests
    });
  }, [community?.projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <CodeBackground />
        <Navbar />
        <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="mt-4 text-gray-400">Loading community...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-black text-white">
        <CodeBackground />
        <Navbar />
        <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center py-24">
              <h1 className="text-2xl font-bold mb-4">Community Not Found</h1>
              <p className="text-gray-400 mb-8">{error || 'The community you are looking for does not exist.'}</p>
              <Link
                href="/#communities"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                ← Back to Communities
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isActive = community.isActive ?? false;
  const communityName = community.name || '';
  const communityDescription = community.description || '';

  // Get color and icon from static data to match home page styling
  const staticCommunity = COMMUNITIES.find((c) => c.id === slug);
  const communityColor = staticCommunity?.color || '#777BB4';
  const communityIcon = staticCommunity?.icon || communityName.charAt(0).toUpperCase();

  // Get counts from real data
  const mentorCount = community.mentors?.length || 0;
  const memberCount = community.members?.length || 0;
  const projectCount = community.projects?.length || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <CodeBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/#communities"
              className="text-sm text-gray-400 hover:text-white transition-colors mb-4 inline-block"
            >
              ← Back to Communities
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 flex items-center justify-center text-xl font-bold border"
                style={{ borderColor: `${communityColor}40`, color: communityColor }}
              >
                {communityIcon}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{communityName}</h1>
              </div>
            </div>
            {communityDescription && (
              <p className="text-lg text-gray-400">{communityDescription}</p>
            )}
          </div>

          {isActive ? (
            <>
              {/* Kage Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Community Kage</h2>
                {community.kage ? (
                  <div className="border border-white/10 p-6">
                    <div className="flex items-start gap-4">
                      {community.kage.githubProfile?.avatarUrl ? (
                        <img
                          src={community.kage.githubProfile.avatarUrl}
                          alt={community.kage.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-2xl font-medium">
                          {community.kage.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{community.kage.name}</h3>
                        {community.kage.title && (
                          <p className="text-sm text-gray-500 mb-2">{community.kage.title}</p>
                        )}
                        {community.kage.description && (
                          <p className="text-sm text-gray-400">{community.kage.description}</p>
                        )}
                        {community.kage.githubProfile?.htmlUrl && (
                          <a
                            href={community.kage.githubProfile.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
                          >
                            View GitHub Profile →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative border border-white/10 p-6">
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-10">
                      <div className="text-center">
                        <p className="text-gray-400">Kage to be assigned</p>
                      </div>
                    </div>
                    <div className="opacity-20 pointer-events-none">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-full bg-zinc-800" />
                        <div className="flex-1">
                          <div className="h-6 bg-zinc-800 w-32 mb-2" />
                          <div className="h-4 bg-zinc-800 w-24 mb-2" />
                          <div className="h-4 bg-zinc-800 w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-12">
                <div className="border border-white/10 p-6">
                  <div className="text-3xl font-bold mb-2">{memberCount}</div>
                  <div className="text-sm text-gray-400">Active Members</div>
                </div>
                <div className="border border-white/10 p-6">
                  <div className="text-3xl font-bold mb-2">{mentorCount}</div>
                  <div className="text-sm text-gray-400">Mentors</div>
                </div>
                <div className="border border-white/10 p-6">
                  <div className="text-3xl font-bold mb-2">{projectCount}</div>
                  <div className="text-sm text-gray-400">Active Projects</div>
                </div>
              </div>

              {/* Mentors Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Mentors</h2>
                {community.mentors && community.mentors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {community.mentors.map((mentor) => (
                      <div key={mentor._id} className="border border-white/10 p-6">
                        <div className="flex items-start gap-4">
                          {mentor.githubProfile?.avatarUrl ? (
                            <img
                              src={mentor.githubProfile.avatarUrl}
                              alt={mentor.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xl font-medium">
                              {mentor.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{mentor.name}</h3>
                            {mentor.title && (
                              <p className="text-sm text-gray-500 mb-1">{mentor.title}</p>
                            )}
                            {mentor.description && (
                              <p className="text-sm text-gray-400 mb-2">{mentor.description}</p>
                            )}
                            <div className="flex gap-3 mt-2">
                              {mentor.githubProfile?.htmlUrl && (
                                <a
                                  href={mentor.githubProfile.htmlUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                  GitHub
                                </a>
                              )}
                              {mentor.socialLinks?.linkedin && (
                                <a
                                  href={mentor.socialLinks.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                  LinkedIn
                                </a>
                              )}
                              {mentor.socialLinks?.twitter && (
                                <a
                                  href={mentor.socialLinks.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                  Twitter
                                </a>
                              )}
                              {mentor.socialLinks?.website && (
                                <a
                                  href={mentor.socialLinks.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative border border-white/10 p-6">
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-10">
                      <div className="text-center">
                        <p className="text-gray-400">Mentors to be assigned</p>
                      </div>
                    </div>
                    <div className="opacity-20 pointer-events-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="border border-white/10 p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-full bg-zinc-800" />
                              <div className="flex-1">
                                <div className="h-5 bg-zinc-800 w-32 mb-2" />
                                <div className="h-4 bg-zinc-800 w-24 mb-2" />
                                <div className="h-4 bg-zinc-800 w-full mb-1" />
                                <div className="h-4 bg-zinc-800 w-3/4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Projects */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Current Projects</h2>
                {community.projects && community.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {community.projects.map((project) => {
                      // Use fresh stats if available, otherwise fall back to DB stats
                      const freshStats = projectStats[project._id];
                      const displayStars = freshStats?.stars ?? project.stars ?? 0;
                      const displayContributors = freshStats?.contributors ?? project.contributors ?? 0;
                      const displayLastUpdated = freshStats?.lastUpdated ?? project.lastUpdated;
                      const displayWebsite = freshStats?.website ?? project.website ?? project.url ?? '#';
                      
                      const projectUrl = displayWebsite;
                      const formatDate = (dateString?: string) => {
                        if (!dateString) return null;
                        try {
                          const date = new Date(dateString);
                          const now = new Date();
                          const diffTime = Math.abs(now.getTime() - date.getTime());
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays < 7) {
                            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                          } else if (diffDays < 30) {
                            const weeks = Math.floor(diffDays / 7);
                            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
                          } else {
                            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                          }
                        } catch {
                          return null;
                        }
                      };
                      const rankTooltips: Record<string, string> = {
                        D: 'Beginner friendly - Great for getting started',
                        C: 'Intermediate level - Some experience recommended',
                        B: 'Advanced - Requires solid understanding',
                        A: 'Expert level - Significant experience needed',
                        S: 'Only Chonin recommended to contribute - Master level project',
                      };
                      const rankColors: Record<string, string> = {
                        D: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                        C: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
                        B: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                        A: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
                        S: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
                      };

                      return (
                        <SpotlightCard
                          key={project._id}
                          className="border border-white/5 hover:border-white/10 transition-all duration-300 group"
                        >
                          <a
                            href={projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-6"
                          >
                            {/* Header with rank badge */}
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
                                  className={`ml-4 flex-shrink-0 text-xs font-bold px-2.5 py-1 border ${rankColors[project.rank] || 'border-white/20 bg-white/5 text-gray-300'} cursor-help`}
                                  title={rankTooltips[project.rank] || 'Project rank'}
                                >
                                  {project.rank}
                                </div>
                              )}
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-medium">
                                  {displayStars > 0 ? displayStars.toLocaleString() : '—'}
                                </span>
                                <span className="text-gray-500">stars</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="font-medium">
                                  {displayContributors > 0 ? displayContributors : '—'}
                                </span>
                                <span className="text-gray-500">contributors</span>
                              </div>
                              {displayLastUpdated && (
                                <div className="flex items-center gap-1.5 text-gray-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Updated {formatDate(displayLastUpdated)}</span>
                                </div>
                              )}
                            </div>

                            {/* Technology Tags */}
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                                {project.technologies.slice(0, 4).map((tech, idx) => (
                                  <span
                                    key={idx}
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
                    })}
                  </div>
                ) : (
                  <div className="relative border border-white/10 p-6">
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-10">
                      <div className="text-center">
                        <p className="text-gray-400">Projects will be announced soon</p>
                      </div>
                    </div>
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
              </section>
            </>
          ) : (
            /* Coming Soon Sections */
            <div className="space-y-12">
              <section className="relative">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-10">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                    <p className="text-gray-400">This community is being set up</p>
                  </div>
                </div>
                <div className="opacity-20 pointer-events-none">
                  <h2 className="text-2xl font-bold mb-6">Community Kage</h2>
                  <div className="border border-white/10 p-6 h-32" />
                </div>
              </section>

              <section className="relative">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-10">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                    <p className="text-gray-400">Projects will be announced soon</p>
                  </div>
                </div>
                <div className="opacity-20 pointer-events-none">
                  <h2 className="text-2xl font-bold mb-6">Current Projects</h2>
                  <div className="border border-white/10 p-6 h-48" />
                </div>
              </section>

              <section className="relative">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-10">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                    <p className="text-gray-400">Meeting schedule TBA</p>
                  </div>
                </div>
                <div className="opacity-20 pointer-events-none">
                  <h2 className="text-2xl font-bold mb-6">Next Meeting</h2>
                  <div className="border border-white/10 p-6 h-48" />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
