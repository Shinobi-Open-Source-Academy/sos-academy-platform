import Link from 'next/link';
import { notFound } from 'next/navigation';
import CodeBackground from '../../../components/CodeBackground';
import Footer from '../../../components/Footer';
import Navbar from '../../../components/Navbar';
import { COMMUNITIES } from '../../../lib/data';

export function generateStaticParams() {
  return COMMUNITIES.map((community) => ({
    slug: community.id,
  }));
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = COMMUNITIES.find((c) => c.id === slug);

  if (!community) {
    notFound();
  }

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
                style={{ borderColor: `${community.color}40`, color: community.color }}
              >
                {community.icon}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{community.name}</h1>
                <p className="text-gray-400 mt-1">{community.language} Development</p>
              </div>
            </div>
            <p className="text-lg text-gray-400">{community.longDescription}</p>
          </div>

          {community.isActive ? (
            <>
              {/* Kage Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Community Kage</h2>
                <div className="border border-white/10 p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={community.kage?.image}
                      alt={community.kage?.name}
                      className="w-20 h-20 object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{community.kage?.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{community.kage?.role}</p>
                      <p className="text-sm text-gray-400">{community.kage?.bio}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-12">
                <div className="border border-white/10 p-6">
                  <div className="text-3xl font-bold mb-2">{community.members}</div>
                  <div className="text-sm text-gray-400">Active Members</div>
                </div>
                <div className="border border-white/10 p-6">
                  <div className="text-3xl font-bold mb-2">{community.mentors?.length || 0}</div>
                  <div className="text-sm text-gray-400">Mentors</div>
                </div>
                <div className="border border-white/10 p-6">
                  <div className="text-3xl font-bold mb-2">{community.projects?.length || 0}</div>
                  <div className="text-sm text-gray-400">Active Projects</div>
                </div>
              </div>

              {/* Projects */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Current Projects</h2>
                <div className="space-y-4">
                  {community.projects?.map((project, idx) => (
                    <a
                      key={idx}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-white/10 hover:border-white/20 p-6 transition-colors"
                    >
                      <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                      <p className="text-sm text-gray-400">{project.description}</p>
                    </a>
                  ))}
                </div>
              </section>

              {/* Next Meeting */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Next Meeting</h2>
                <div className="border border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-gray-400">
                      {community.meetingDay} at {community.nextMeeting?.time}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{community.nextMeeting?.topic}</h3>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Agenda:</h4>
                    <ul className="space-y-2">
                      {community.nextMeeting?.agenda.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-gray-600">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
