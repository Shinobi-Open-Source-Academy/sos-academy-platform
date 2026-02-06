'use client';

import { useEffect, useRef, useState } from 'react';
import CodeBackground from '../../components/CodeBackground';
import Footer from '../../components/Footer';
import MentorApplicationForm from '../../components/MentorApplicationForm';
import MentorsSection from '../../components/MentorsSection';
import Navbar from '../../components/Navbar';
import SpotlightCard from '../../components/SpotlightCard';
import { COMMUNITIES, SITE_CONFIG } from '../../lib/data';
import { getActiveMentors, Mentor } from '../../lib/api-client';

const REQUIREMENTS = [
  {
    icon: '🔥',
    title: 'Outstanding Open-Source Impact',
    description:
      "We value meaningful contributions over years of experience. Show us projects you've impacted, PRs that made a difference, or communities you've helped grow.",
  },
  {
    icon: '⏰',
    title: 'At Least 4 Hours Per Week',
    description:
      'Commit to volunteering at least 4 hours weekly to guide hackers, review code, and participate in community activities.',
  },
  {
    icon: '🎯',
    title: 'Teaching & Communication',
    description:
      'Ability to explain complex concepts clearly, provide constructive feedback, and adapt your mentoring style to different skill levels.',
  },
  {
    icon: '🤝',
    title: 'Collaborative Spirit',
    description:
      'Enthusiasm for working with developers from diverse backgrounds and fostering an inclusive, supportive learning environment.',
  },
  {
    icon: '📋',
    title: 'Mission Assignment Skills',
    description:
      'Capability to identify appropriate challenges for hackers, break down complex projects into achievable missions, and track progress.',
  },
  {
    icon: '🌟',
    title: 'Any Tech Stack Welcome',
    description:
      "We welcome mentors from all technical backgrounds. We'll match you with communities and hackers based on your expertise.",
  },
];

export default function MentorsClient() {
  const applyRef = useRef<HTMLDivElement>(null);
  const [allMentors, setAllMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [displayedCount, setDisplayedCount] = useState(4);

  useEffect(() => {
    // Check if URL has #apply hash and scroll to it
    if (window.location.hash === '#apply') {
      setTimeout(() => {
        applyRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const mentors = await getActiveMentors();
        setAllMentors(mentors);
      } catch (error) {
        console.error('Failed to fetch mentors:', error);
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, []);

  // Filter mentors by community
  const filteredMentors = allMentors.filter((mentor) => {
    if (selectedCommunity === 'all') return true;
    const selectedComm = COMMUNITIES.find((c) => c.id === selectedCommunity);
    if (!selectedComm) return true;
    // Match by slug or name (slug is like 'konoha', name is like 'Konoha Community')
    return mentor.communities?.some(
      (comm) =>
        comm.slug?.toLowerCase() === selectedComm.id.toLowerCase() ||
        comm.name.toLowerCase().includes(selectedComm.name.toLowerCase())
    );
  });

  // Get displayed mentors (first N)
  const displayedMentors = filteredMentors.slice(0, displayedCount);
  const hasMore = filteredMentors.length > displayedCount;

  // Reset displayed count when filter changes
  useEffect(() => {
    setDisplayedCount(4);
  }, [selectedCommunity]);

  const scrollToApply = () => {
    applyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <CodeBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-block px-3 py-1 text-xs border border-white/10 text-gray-400 mb-6 animate-[fadeIn_0.6s_ease-out]"
            style={{ animationFillMode: 'both' }}
          >
            BECOME A SENSEI
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-[fadeInUp_0.6s_ease-out]"
            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
          >
            Guide the Next Generation of
            <br />
            <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              Open-Source Warriors
            </span>
          </h1>
          <p
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-[fadeInUp_0.6s_ease-out]"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            At {SITE_CONFIG.fullName}, mentors are called{' '}
            <strong className="text-white">Senseis</strong> — master teachers who guide aspiring
            hackers on their path to becoming legendary open-source contributors.
          </p>
          <div
            className="flex items-center justify-center gap-4 animate-[fadeInUp_0.6s_ease-out]"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <button
              onClick={scrollToApply}
              className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium"
              type="button"
            >
              Apply Now
            </button>
            <a
              href="#mentors"
              className="px-6 py-3 border border-white/10 hover:border-white/20 transition-colors text-sm font-medium"
            >
              Meet Our Senseis
            </a>
          </div>
        </div>
      </section>

      {/* About SOS Academy - Shinobi Context */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 text-xs font-mono text-emerald-500 mb-6 border border-emerald-500/20 bg-emerald-500/5 rounded-full">
                THE PHILOSOPHY
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                The Way of the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Shinobi
                </span>
              </h2>
              <div className="space-y-6 text-lg text-gray-400 leading-relaxed font-light">
                <p>
                  <span className="text-emerald-400 font-medium">SOS Academy</span> is more than a
                  platform; it's a journey gamified around the legendary Shinobi world. Every
                  developer starts as a <span className="text-white font-medium">Genin</span> and
                  rises through the ranks by mastering their craft.
                </p>
                <p>
                  We are looking for <span className="text-emerald-400 font-medium">Senseis</span>
                  —experienced developers willing to guide these aspiring ninjas. Your role is not
                  just to teach, but to inspire. You assign missions, review code (jutsu), and help
                  them ascend to <span className="text-white font-medium">Chunin</span>,{' '}
                  <span className="text-white font-medium">Jonin</span>, and beyond.
                </p>
                <p>
                  Your mentorship shapes the future of open-source. Help us build a generation of
                  developers who are skilled, collaborative, and ready to protect the code.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SpotlightCard className="border border-white/5 bg-black/40 p-6 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Genin → Chunin</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Guide beginners through their first meaningful contributions.
                </p>
              </SpotlightCard>
              <SpotlightCard className="border border-white/5 bg-black/40 p-6 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Assign Missions</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Create challenges that push their limits.
                </p>
              </SpotlightCard>
              <SpotlightCard className="border border-white/5 bg-black/40 p-6 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Code Reviews</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Share wisdom through thoughtful, constructive feedback.
                </p>
              </SpotlightCard>
              <SpotlightCard className="border border-white/5 bg-black/40 p-6 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <svg
                    className="w-5 h-5 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Shape Leaders</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Identified future Kages and community pillars.
                </p>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* Current Mentors Section */}
      <section id="mentors" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Senseis</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg font-light">
              Meet the experienced developers guiding our communities. Learn from the best in the
              industry.
            </p>
          </div>

          {/* Filter Section */}
          <div className="mb-12 py-4 flex flex-col sm:flex-row items-center justify-end gap-4">
            <span className="text-sm text-gray-400 font-light">Filter by community:</span>
            <div className="relative group">
              <select
                id="community-filter"
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="appearance-none bg-black/50 border border-white/10 hover:border-white/20 px-4 py-2.5 pr-10 text-sm text-white rounded focus:outline-none focus:border-white/30 transition-all cursor-pointer min-w-[200px] backdrop-blur-sm"
              >
                <option value="all">All Communities</option>
                {COMMUNITIES.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
            {selectedCommunity !== 'all' && (
              <button
                onClick={() => setSelectedCommunity('all')}
                className="text-xs text-gray-500 hover:text-white transition-colors underline"
                type="button"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Featured Mentors - Full Cards */}
          <div className="mb-8">
            {loadingMentors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border border-white/5 hover:border-white/10 transition-colors h-40 group bg-black/50 relative overflow-hidden"
                  >
                    {/* Image skeleton on left side */}
                    <div className="absolute inset-y-0 left-0 w-[38%] bg-white/5 animate-pulse" />

                    {/* Content skeleton on right side */}
                    <div className="relative z-20 h-full p-3 pl-[36%] flex flex-col items-start text-left">
                      <div className="h-4 w-24 bg-white/5 animate-pulse mb-2 rounded" />
                      <div className="h-3 w-20 bg-white/5 animate-pulse mb-2 rounded" />
                      <div className="h-3 w-full bg-white/5 animate-pulse mb-1 rounded" />
                      <div className="h-3 w-3/4 bg-white/5 animate-pulse mb-4 rounded" />

                      <div className="mt-auto space-y-1.5 w-full">
                        {/* Expertise tags skeleton */}
                        <div className="flex flex-wrap gap-1">
                          <div className="h-4 w-12 bg-white/5 animate-pulse rounded" />
                          <div className="h-4 w-16 bg-white/5 animate-pulse rounded" />
                          <div className="h-4 w-14 bg-white/5 animate-pulse rounded" />
                        </div>

                        {/* Social links skeleton */}
                        <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
                          <div className="h-3 w-3 bg-white/5 animate-pulse rounded" />
                          <div className="h-3 w-3 bg-white/5 animate-pulse rounded" />
                          <div className="h-3 w-3 bg-white/5 animate-pulse rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedMentors.length === 0 ? (
              <div className="text-center py-12 border border-white/5 bg-white/[0.02] rounded">
                <p className="text-gray-400">No mentors found for this community.</p>
              </div>
            ) : (
              <>
                <MentorsSection mentors={displayedMentors} />
                <div className="text-center mt-8">
                  {hasMore && (
                    <button
                      onClick={() => setDisplayedCount((prev) => prev + 4)}
                      className="text-sm text-gray-400 hover:text-white transition-colors underline"
                      type="button"
                    >
                      See More Mentors ({filteredMentors.length - displayedCount} remaining) →
                    </button>
                  )}
                  {displayedCount > 4 && (
                    <button
                      onClick={() => setDisplayedCount(4)}
                      className="text-sm text-gray-400 hover:text-white transition-colors underline ml-4"
                      type="button"
                    >
                      ← Show Less
                    </button>
                  )}
                </div>
                {!hasMore && filteredMentors.length > 0 && displayedCount <= 4 && (
                  <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                      Showing all {filteredMentors.length} mentor
                      {filteredMentors.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* More Mentors Coming Soon */}
          <div className="p-8 border border-dashed border-white/10 bg-white/[0.02] text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-semibold text-white">Growing Our Dojo</h3>
            </div>
            <p className="text-gray-400 max-w-lg mx-auto mb-6 font-light">
              We're actively looking for passionate developers to join our ranks. If you have the
              will to teach, we have the students ready to learn.
            </p>
            <button
              onClick={scrollToApply}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition-all hover:scale-105"
              type="button"
            >
              Join our ranks →
            </button>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Who We Look For</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
              We prize impact and attitude over years on a resume. A true Sensei is defined by their
              willingness to lift others up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REQUIREMENTS.map((req, index) => (
              <SpotlightCard
                key={req.title}
                className="h-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-8 transition-all duration-300 group"
                style={
                  {
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'both',
                  } as React.CSSProperties
                }
              >
                <div className="text-3xl mb-6 bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {req.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {req.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  {req.description}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Application Section */}
      <section
        id="apply"
        ref={applyRef}
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Become a Sensei</h2>
            <p className="text-gray-400">
              Ready to guide the next generation? Submit your application and join our team of
              mentors. We review all applications and will match you with the right community.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-8">
            <MentorApplicationForm />
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            By applying, you agree to volunteer at least 4 hours per week and follow our community
            guidelines.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
