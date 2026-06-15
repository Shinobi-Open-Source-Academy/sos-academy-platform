'use client';

import { useEffect, useRef, useState } from 'react';
import { CodeBackground, SpotlightCard } from '@sos-academy/ui';
import Footer from '../../components/Footer';
import MentorApplicationForm from '../../components/MentorApplicationForm';
import MentorsCarousel from '../../components/MentorsCarousel';
import Navbar from '../../components/Navbar';
import { getActiveMentors, type Mentor } from '../../lib/api-client';
import {
  AdjustmentsIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  ClipboardListIcon,
  TrendingUpIcon,
} from '../../components/icons';
import { COMMUNITIES, SITE_CONFIG } from '../../lib/data';
import { REQUIREMENTS } from './_data';

const HASH_SCROLL_DELAY_MS = 100;

export default function MentorsClient() {
  const applyRef = useRef<HTMLDivElement>(null);
  const [allMentors, setAllMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');

  useEffect(() => {
    // Check if URL has #apply hash and scroll to it
    if (window.location.hash === '#apply') {
      setTimeout(() => {
        applyRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, HASH_SCROLL_DELAY_MS);
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
                  <TrendingUpIcon className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-white mb-2">Genin → Chunin</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Guide beginners through their first meaningful contributions.
                </p>
              </SpotlightCard>
              <SpotlightCard className="border border-white/5 bg-black/40 p-6 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <ClipboardListIcon className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-white mb-2">Assign Missions</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Create challenges that push their limits.
                </p>
              </SpotlightCard>
              <SpotlightCard className="border border-white/5 bg-black/40 p-6 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <ChatBubbleIcon className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-white mb-2">Code Reviews</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Share wisdom through thoughtful, constructive feedback.
                </p>
              </SpotlightCard>
              <SpotlightCard className="border border-white/5 bg-black/40 p-6 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <AdjustmentsIcon className="w-5 h-5 text-amber-500" />
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
                <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
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

          {/* Mentors Carousel */}
          <div className="mb-8">
            {!loadingMentors && filteredMentors.length === 0 ? (
              <div className="text-center py-12 border border-white/5 bg-white/[0.02] rounded">
                <p className="text-gray-400">No mentors found for this community.</p>
              </div>
            ) : (
              <>
                <MentorsCarousel
                  key={selectedCommunity}
                  mentors={filteredMentors}
                  loading={loadingMentors}
                />
                {!loadingMentors && filteredMentors.length > 0 && (
                  <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                      {filteredMentors.length} sensei{filteredMentors.length !== 1 ? 's' : ''}
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
