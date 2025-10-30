'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import SectionHeading from './ui/SectionHeading';

interface ProjectProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  url: string;
}

const ProjectCard = ({
  title,
  description,
  image,
  tags,
  url,
  index = 0,
}: ProjectProps & { index?: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, index * 100); // Staggered animation based on index
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? isHovered
            ? 'translateY(-8px)'
            : 'translateY(0)'
          : 'translateY(30px)',
        transition: 'transform 0.3s ease, opacity 0.6s ease, box-shadow 0.3s ease',
        boxShadow: isHovered ? '0 10px 30px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="absolute top-0 right-0 mt-4 mr-4 z-10">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
          {tags[0]}
        </span>
      </div>
      <div className="relative overflow-hidden h-52">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Image
          src={image}
          alt={title}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500"
          style={{
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          }}
        />
      </div>
      <div className="p-6">
        <h3
          className="text-xl font-bold mb-2 transition-colors duration-300 flex items-center"
          style={{ color: isHovered ? 'var(--primary)' : 'inherit' }}
        >
          {title}
          <div
            className={`ml-2 h-1 w-0 bg-primary rounded-full transition-all duration-300 ${
              isHovered ? 'w-12' : ''
            }`}
          />
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(1).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:text-primary/80 transition-colors duration-300 flex items-center"
          style={{
            transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
            transition: 'transform 0.3s ease',
          }}
        >
          Explore Project
          <svg
            className={`w-4 h-4 ml-1 transition-transform duration-300 ${
              isHovered ? 'translate-x-1' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default function Projects() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const projects: ProjectProps[] = useMemo(
    () => [
      {
        title: 'Rust Logger',
        description:
          'A lightweight, configurable logging library for Rust applications with multiple output formats and log level filtering.',
        image: '/images/project1.jpg',
        tags: ['Rust', 'CLI', 'Logging', 'Beginner-Friendly'],
        url: 'https://github.com/example/rust-logger',
      },
      {
        title: 'GoMicro',
        description:
          'A microservices framework in Go that simplifies service discovery, communication, and deployment for distributed systems.',
        image: '/images/project2.jpg',
        tags: ['Go', 'Microservices', 'Docker', 'Intermediate'],
        url: 'https://github.com/example/gomicro',
      },
      {
        title: 'TypeStruct',
        description:
          'TypeScript utility library providing strongly-typed data structures with comprehensive validation and transformation capabilities.',
        image: '/images/project3.jpg',
        tags: ['TypeScript', 'Data Structures', 'Validation', 'Advanced'],
        url: 'https://github.com/example/typestruct',
      },
      {
        title: 'Community Dashboard',
        description:
          'An open-source dashboard for tracking contributions, maintaining project health, and recognizing community members.',
        image: '/images/project4.jpg',
        tags: ['React', 'Node.js', 'GitHub API', 'Intermediate'],
        url: 'https://github.com/example/community-dashboard',
      },
      {
        title: 'Learning Path Generator',
        description:
          'Tool that creates personalized learning paths for developers based on their experience level and learning goals.',
        image: '/images/project5.jpg',
        tags: ['JavaScript', 'Machine Learning', 'Education', 'Beginner-Friendly'],
        url: 'https://github.com/example/learning-path-generator',
      },
      {
        title: 'Contribution Matcher',
        description:
          'Matches developers with open-source projects based on their skills, interests, and project requirements.',
        image: '/images/project6.jpg',
        tags: ['Python', 'Django', 'Recommendation System', 'Advanced'],
        url: 'https://github.com/example/contribution-matcher',
      },
    ],
    []
  );

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="section bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-24"
    >
      <div className="container mx-auto px-4">
        {/* Decorative element */}
        <div className="relative">
          <div
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-70 -z-10"
            style={{
              opacity: isVisible ? 0.7 : 0,
              transition: 'opacity 1.5s ease-out',
            }}
          />
        </div>

        <SectionHeading
          title1="Featured Open-Source Projects"
          description="Explore real-world projects where our members are making meaningful contributions and building their portfolios."
          className="mb-20"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} index={index} />
          ))}
        </div>

        <div
          className="mt-20 text-center relative"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out 0.5s, transform 0.8s ease-out 0.5s',
          }}
        >
          <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-t-lg" />
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Ready to contribute? Join our community to work on these and other exciting
              open-source projects. We help match you with projects that align with your skills and
              interests.
            </p>
            <button className="btn-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              Browse All Projects
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
