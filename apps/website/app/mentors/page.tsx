'use client';

import { useEffect, useRef } from 'react';
import CodeBackground from '../../components/CodeBackground';
import Footer from '../../components/Footer';
import MentorApplicationForm from '../../components/MentorApplicationForm';
import MentorCard from '../../components/MentorCard';
import Navbar from '../../components/Navbar';
import SpotlightCard from '../../components/SpotlightCard';
import { MENTORS, SITE_CONFIG } from '../../lib/data';

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

export default function MentorsPage() {
  const applyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if URL has #apply hash and scroll to it
    if (window.location.hash === '#apply') {
      setTimeout(() => {
        applyRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

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
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The Way of the Shinobi</h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  <strong className="text-white">SOS Academy</strong> is gamified around the
                  legendary Shinobi world. Every developer who joins starts as a{' '}
                  <strong className="text-gray-300">Genin</strong> (beginner ninja) and progresses
                  through ranks by completing missions and mastering their craft.
                </p>
                <p>
                  As a <strong className="text-white">Sensei</strong>, you'll be the guiding force
                  behind their journey. You'll assign missions tailored to their skill level, review
                  their jutsu (code), and help them climb the ranks — from Genin to Chunin, Jonin,
                  and eventually <strong className="text-gray-300">Sannin</strong> or even{' '}
                  <strong className="text-gray-300">Kage</strong> (community leader).
                </p>
                <p>
                  Your mission assignments will shape the future of open-source. Every PR merged,
                  every issue solved, every mentee who levels up — that's your legacy.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SpotlightCard className="border border-white/5 p-5 hover:border-white/10 transition-colors">
                <div className="text-2xl mb-2">🥷</div>
                <h3 className="font-semibold text-sm mb-1">Genin → Chunin</h3>
                <p className="text-xs text-gray-500">
                  Guide beginners through their first contributions
                </p>
              </SpotlightCard>
              <SpotlightCard className="border border-white/5 p-5 hover:border-white/10 transition-colors">
                <div className="text-2xl mb-2">⚔️</div>
                <h3 className="font-semibold text-sm mb-1">Assign Missions</h3>
                <p className="text-xs text-gray-500">Create challenges that push growth</p>
              </SpotlightCard>
              <SpotlightCard className="border border-white/5 p-5 hover:border-white/10 transition-colors">
                <div className="text-2xl mb-2">📜</div>
                <h3 className="font-semibold text-sm mb-1">Code Reviews</h3>
                <p className="text-xs text-gray-500">Share wisdom through thoughtful feedback</p>
              </SpotlightCard>
              <SpotlightCard className="border border-white/5 p-5 hover:border-white/10 transition-colors">
                <div className="text-2xl mb-2">👑</div>
                <h3 className="font-semibold text-sm mb-1">Shape Kages</h3>
                <p className="text-xs text-gray-500">Mentor future community leaders</p>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* Current Mentors Section */}
      <section
        id="mentors"
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Senseis</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Meet the experienced developers guiding our communities. Learn from the best in the
              industry.
            </p>
          </div>

          {/* Featured Mentors - Full Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {MENTORS.map((mentor, index) => (
              <div
                key={mentor.id}
                className="animate-[fadeInUp_0.5s_ease-out]"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <MentorCard
                  name={mentor.name}
                  role={mentor.role}
                  image={mentor.image}
                  bio={mentor.bio}
                  expertise={mentor.expertise}
                  socials={mentor.socials}
                  variant="full"
                />
              </div>
            ))}
          </div>

          {/* More Mentors Coming Soon */}
          <div className="mt-8 p-6 border border-dashed border-white/10 bg-white/[0.02] text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-semibold">Growing Our Dojo</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              We're actively expanding our team of Senseis across all tech stacks.
            </p>
            <button
              onClick={scrollToApply}
              className="text-sm text-white hover:text-gray-300 transition-colors underline underline-offset-4"
              type="button"
            >
              Join our ranks →
            </button>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Look For</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We don't measure experience in years — we measure it in impact. Here's what makes a
              great Sensei.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REQUIREMENTS.map((req, index) => (
              <SpotlightCard
                key={req.title}
                className="border border-white/5 hover:border-white/10 p-6 transition-all duration-300 animate-[fadeInUp_0.5s_ease-out]"
                style={
                  {
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'both',
                  } as React.CSSProperties
                }
              >
                <div className="text-2xl mb-3">{req.icon}</div>
                <h3 className="text-base font-semibold mb-2">{req.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{req.description}</p>
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
