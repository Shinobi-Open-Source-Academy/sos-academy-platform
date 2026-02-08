import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CodeBackground from '../../../components/CodeBackground';
import Footer from '../../../components/Footer';
import Navbar from '../../../components/Navbar';
import { getCommunityBySlug } from '../../../lib/api-client';

// Note: We can't generate static params since we need to fetch from API
// Next.js will handle dynamic routes

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community) {
    return {
      title: 'Community Not Found',
    };
  }

  return {
    title: `${community.name} Community`,
    description: community.description,
    openGraph: {
      title: `${community.name} Community`,
      description: community.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${community.name} Community`,
      description: community.description,
    },
  };
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch real community data from API
  const community = await getCommunityBySlug(slug);

  if (!community) {
    notFound();
  }

  const isActive = community.isActive ?? false;
  const communityName = community.name || '';
  const communityDescription = community.description || '';

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
              <div className="w-16 h-16 flex items-center justify-center text-xl font-bold border border-white/10 text-white">
                {communityName.charAt(0).toUpperCase()}
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
                  <div className="space-y-4">
                    {community.projects.map((project) => (
                      <a
                        key={project._id}
                        href={project.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-white/10 hover:border-white/20 p-6 transition-colors"
                      >
                        <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                        {project.description && (
                          <p className="text-sm text-gray-400">{project.description}</p>
                        )}
                      </a>
                    ))}
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
