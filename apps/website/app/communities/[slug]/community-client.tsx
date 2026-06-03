'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CodeBackground from '../../../components/CodeBackground';
import Footer from '../../../components/Footer';
import Navbar from '../../../components/Navbar';
import {
  type Community,
  getCommunityBySlug,
  getProjectStats,
  getProjects,
  type ProjectStats,
  type ProjectsResponse,
} from '../../../lib/api-client';
import { COMMUNITIES } from '../../../lib/data';
import { ComingSoonOverlay } from './_components/ComingSoonOverlay';
import { CommunityMentorsSection } from './_components/CommunityMentorsSection';
import { CommunityStats } from './_components/CommunityStats';
import { KageSection } from './_components/KageSection';
import { ProjectsSection } from './_components/ProjectsSection';
import type { SortOption } from './_components/types';

interface CommunityClientProps {
  slug: string;
}

export default function CommunityClient({ slug }: CommunityClientProps) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});
  const [projects, setProjects] = useState<ProjectsResponse['projects']>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [pagination, setPagination] = useState<ProjectsResponse['pagination']>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    async function fetchProjects() {
      if (!community) return;
      setProjectsLoading(true);
      try {
        const response = await getProjects({
          community: slug,
          search: searchQuery || undefined,
          sortBy,
          order: sortOrder,
          page: currentPage,
          limit: 10,
        });
        setProjects(response.projects);
        setPagination(response.pagination);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setProjectsLoading(false);
      }
    }
    fetchProjects();
  }, [slug, community, searchQuery, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    if (!projects.length) return;
    for (const project of projects) {
      if (!project._id || !project.githubRepo) continue;
      setTimeout(async () => {
        const stats = await getProjectStats(project._id);
        if (stats) {
          setProjectStats((prev) => ({ ...prev, [project._id]: stats }));
        }
      }, Math.random() * 500);
    }
  }, [projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <CodeBackground />
        <Navbar />
        <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
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
              <p className="text-gray-400 mb-8">
                {error || 'The community you are looking for does not exist.'}
              </p>
              <Link href="/#communities" className="text-blue-400 hover:text-blue-300 underline">
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
  const staticCommunity = COMMUNITIES.find((c) => c.id === slug);
  const communityColor = staticCommunity?.color || '#777BB4';
  const communityIcon = staticCommunity?.icon || communityName.charAt(0).toUpperCase();
  const mentorCount = community.mentors?.length || 0;
  const memberCount = community.memberCount ?? community.members?.length ?? 0;
  const projectCount = community.projects?.length || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <CodeBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
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
              <h1 className="text-4xl font-bold">{communityName}</h1>
            </div>
            {communityDescription && (
              <p className="text-lg text-gray-400">{communityDescription}</p>
            )}
          </div>

          {isActive ? (
            <>
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Community Kage</h2>
                <KageSection kage={community.kage} communityColor={communityColor} />
              </section>

              <CommunityStats
                memberCount={memberCount}
                mentorCount={mentorCount}
                projectCount={projectCount}
              />

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Mentors</h2>
                <CommunityMentorsSection mentors={community.mentors} />
              </section>

              <section className="mb-12">
                <ProjectsSection
                  projects={projects}
                  projectStats={projectStats}
                  pagination={pagination}
                  projectsLoading={projectsLoading}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  currentPage={currentPage}
                  onSearchChange={setSearchQuery}
                  onSortByChange={setSortBy}
                  onSortOrderToggle={() =>
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  onPageChange={setCurrentPage}
                />
              </section>
            </>
          ) : (
            <div className="space-y-12">
              <section className="relative">
                <ComingSoonOverlay title="Coming Soon" message="This community is being set up" />
                <div className="opacity-20 pointer-events-none">
                  <h2 className="text-2xl font-bold mb-6">Community Kage</h2>
                  <div className="border border-white/10 p-6 h-32" />
                </div>
              </section>

              <section className="relative">
                <ComingSoonOverlay title="Coming Soon" message="Projects will be announced soon" />
                <div className="opacity-20 pointer-events-none">
                  <h2 className="text-2xl font-bold mb-6">Current Projects</h2>
                  <div className="border border-white/10 p-6 h-48" />
                </div>
              </section>

              <section className="relative">
                <ComingSoonOverlay title="Coming Soon" message="Meeting schedule TBA" />
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
