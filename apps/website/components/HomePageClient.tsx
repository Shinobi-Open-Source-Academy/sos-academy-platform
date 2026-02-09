'use client';

import { useEffect, useState } from 'react';
import CodeBackground from './CodeBackground';
import Footer from './Footer';
import HeroGrid from './HeroGrid';
import JoinModal from './JoinModal';
import MentorsSection from './MentorsSection';
import Navbar from './Navbar';
import SpotlightCard from './SpotlightCard';
import UpcomingEvents from './UpcomingEvents';
import { COMMUNITIES, COMPANIES, FEATURES, PROJECTS, SITE_CONFIG } from '../lib/data';
import { getActiveMentors, getRandomMentors, Mentor } from '../lib/api-client';

export default function HomePageClient() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);

  useEffect(() => {
    const handleOpenJoin = () => setJoinModalOpen(true);
    window.addEventListener('openJoinModal', handleOpenJoin);
    return () => {
      window.removeEventListener('openJoinModal', handleOpenJoin);
    };
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const allMentors = await getActiveMentors();
        const randomMentors = getRandomMentors(allMentors, 4);
        setMentors(randomMentors);
      } catch (error) {
        console.error('Failed to fetch mentors:', error);
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, []);

  // Add JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Shinobi Open-Source Academy',
    alternateName: 'SOS Academy',
    url: 'https://shinobi-open-source.academy',
    logo: 'https://shinobi-open-source.academy/shinobiLogo.png',
    description: 'Learn through practical, collaborative open-source experience.',
    email: 'contact@shinobi-open-source.academy',
    sameAs: [
      'https://github.com/Shinobi-Open-Source-Academy',
      'https://x.com/SOSAcademy_',
      'https://www.linkedin.com/company/shinobi-open-source-academy-sos-a',
      'https://discord.gg/9Wgx7bCh',
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CodeBackground />
      <Navbar />
      <JoinModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />

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

          <UpcomingEvents />
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

          <MentorsSection mentors={mentors} loading={loadingMentors} />

          <div className="text-center mt-8">
            <a
              href="/mentors#apply"
              className="inline-block px-6 py-3 border border-white/10 hover:border-white/20 transition-colors text-sm font-medium"
            >
              Become a Mentor
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
