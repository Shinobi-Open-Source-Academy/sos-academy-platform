'use client';

import { useEffect, useState } from 'react';
import CodeBackground from '../components/CodeBackground';
import Footer from '../components/Footer';
import HeroGrid from '../components/HeroGrid';
import JoinModal from '../components/JoinModal';
import MentorModal from '../components/MentorModal';
import Navbar from '../components/Navbar';
import SpotlightCard from '../components/SpotlightCard';
import { COMMUNITIES, COMPANIES, FEATURES, MENTORS, PROJECTS, SITE_CONFIG } from '../lib/data';

export default function Index() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [mentorModalOpen, setMentorModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenJoin = () => setJoinModalOpen(true);
    const handleOpenMentor = () => setMentorModalOpen(true);
    window.addEventListener('openJoinModal', handleOpenJoin);
    window.addEventListener('openMentorModal', handleOpenMentor);
    return () => {
      window.removeEventListener('openJoinModal', handleOpenJoin);
      window.removeEventListener('openMentorModal', handleOpenMentor);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <CodeBackground />
      <Navbar />
      <JoinModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
      <MentorModal isOpen={mentorModalOpen} onClose={() => setMentorModalOpen(false)} />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <HeroGrid>
          <div className="max-w-4xl mx-auto text-center space-y-8 pt-16">
            <div className="inline-block px-3 py-1 text-xs border border-white/10 text-gray-400 mb-4">
              OPEN SOURCE ACADEMY
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Empowering the Next Generation
              <br />
              <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                of Open-Source Warriors
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {SITE_CONFIG.description}
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setJoinModalOpen(true)}
                className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium"
                type="button"
              >
                Join Academy
              </button>
              <a
                href="#about"
                className="px-6 py-3 border border-white/10 hover:border-white/20 transition-colors text-sm font-medium"
              >
                Learn More
              </a>
            </div>

            {/* Companies */}
            <div className="pt-16">
              <p className="text-sm text-gray-500 mb-6">
                Shipping 15,000+ PRs at forward-thinking companies
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {COMPANIES.slice(0, 6).map((company) => (
                  <a
                    key={company.name}
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-400 text-sm font-medium transition-colors"
                  >
                    {company.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </HeroGrid>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Bring your backlog.
              <br />
              We'll handle the rest.
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Our mission is to train, empower, and nurture a community of developers who not only
              contribute to open-source projects but also lead and innovate within it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {FEATURES.map((feature) => (
              <SpotlightCard
                key={feature.title}
                className="bg-black p-8 border border-white/5 hover:border-white/10 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Communities Section */}
      <section
        id="communities"
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Communities</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Join specialized sub-communities based on programming languages, each led by
              experienced mentors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMUNITIES.map((community) => (
              <SpotlightCard
                key={community.id}
                className="border border-white/5 hover:border-white/10 transition-colors group"
              >
                <a href={`/communities/${community.id}`} className="block p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center text-xs font-bold border"
                      style={{ borderColor: `${community.color}40`, color: community.color }}
                    >
                      {community.icon}
                    </div>
                    <span className="text-xs text-gray-500">
                      {community.meetingDay} {community.meetingTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-gray-300 transition-colors">
                    {community.name}
                  </h3>
                  <p className="text-sm text-gray-400">{community.description}</p>
                </a>
              </SpotlightCard>
            ))}
          </div>

          <div className="mt-8 p-6 border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-sm font-semibold">Weekly Community Calls</h3>
            </div>
            <p className="text-sm text-gray-400">
              Each community hosts weekly calls where members discuss projects and get guidance from
              mentors.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Projects</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              High-impact projects where our community members make contributions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECTS.map((project) => (
              <SpotlightCard
                key={project.id}
                className="border border-white/5 hover:border-white/10 p-6 transition-colors group"
              >
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="block">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-gray-300">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">{project.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{project.stars} stars</span>
                    <span>{project.contributors} contributors</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 border border-white/5 text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section
        id="mentors"
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Expert Mentors</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Learn from industry professionals with years of experience in their fields.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {MENTORS.map((mentor) => (
              <SpotlightCard
                key={mentor.id}
                className="border border-white/5 hover:border-white/10 p-6 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <img src={mentor.image} alt={mentor.name} className="w-16 h-16 object-cover" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{mentor.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{mentor.role}</p>
                    <p className="text-sm text-gray-400 mb-3">{mentor.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {mentor.expertise.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 border border-white/5 text-gray-500"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      {mentor.socials.github && (
                        <a
                          href={mentor.socials.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-white transition-colors"
                          title="GitHub"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <title>GitHub</title>
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </a>
                      )}
                      {mentor.socials.linkedin && (
                        <a
                          href={mentor.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-white transition-colors"
                          title="LinkedIn"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <title>LinkedIn</title>
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      )}
                      {mentor.socials.twitter && (
                        <a
                          href={mentor.socials.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-white transition-colors"
                          title="Twitter/X"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <title>Twitter/X</title>
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      )}
                      {mentor.socials.website && (
                        <a
                          href={mentor.socials.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-white transition-colors"
                          title="Website"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <title>Website</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setMentorModalOpen(true)}
              className="inline-block px-6 py-3 border border-white/10 hover:border-white/20 transition-colors text-sm font-medium"
              type="button"
            >
              Become a Mentor
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
