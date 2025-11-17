import CodeBackground from '../components/CodeBackground';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { COMMUNITIES, COMPANIES, FEATURES, MENTORS, PROJECTS, SITE_CONFIG } from '../lib/data';

export default function Index() {
  return (
    <div className="min-h-screen bg-black text-white">
      <CodeBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 pt-16">
          <div className="inline-block px-3 py-1 text-xs border border-white/10 text-gray-400 mb-4">
            OPEN SOURCE ACADEMY
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Build and deploy
            <br />
            <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              open-source skills
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {SITE_CONFIG.description}
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <a
              href={SITE_CONFIG.urls.discord}
              className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Join Academy
            </a>
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
                <span key={company.name} className="text-gray-600 text-sm font-medium">
                  {company.name}
                </span>
              ))}
            </div>
          </div>
        </div>
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
              <div
                key={feature.title}
                className="bg-black p-8 border border-white/5 hover:border-white/10 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
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
              <div
                key={community.id}
                className="border border-white/5 hover:border-white/10 p-6 transition-colors group"
              >
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
                <h3 className="text-lg font-semibold mb-2">{community.name}</h3>
                <p className="text-sm text-gray-400">{community.description}</p>
              </div>
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
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/5 hover:border-white/10 p-6 transition-colors group"
              >
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
              <div
                key={mentor.id}
                className="border border-white/5 hover:border-white/10 p-6 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <img src={mentor.image} alt={mentor.name} className="w-16 h-16 object-cover" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{mentor.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{mentor.role}</p>
                    <p className="text-sm text-gray-400 mb-3">{mentor.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 border border-white/5 text-gray-500"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href={SITE_CONFIG.urls.discord}
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
