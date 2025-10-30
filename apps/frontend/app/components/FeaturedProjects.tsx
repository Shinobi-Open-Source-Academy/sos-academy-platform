'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { FEATURED_PROJECTS_DATA, FEATURED_PROJECTS_LIST } from '../data/siteData';
import SectionHeading from './ui/SectionHeading';

// Type for featured project props
type FeaturedProjectProps = {
  title: string;
  description: string;
  image: string;
  tags: string[];
  url: string;
  githubStars: string;
  contributors: string;
  isInternal?: boolean;
};

const FeaturedProjectCard = ({
  title,
  description,
  image,
  tags,
  url,
  githubStars,
  contributors,
  isInternal = false,
  index = 0,
}: FeaturedProjectProps & { index?: number }) => {
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
      {/* Top Tag */}
      <div className="absolute top-0 right-0 mt-4 mr-4 z-10">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
          {tags[0]}
        </span>
      </div>

      {/* Image Section */}
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

        {/* Coming Soon Overlay for Internal Projects */}
        {isInternal && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <div className="px-4 py-2 bg-primary/90 rounded-md text-white font-semibold text-sm">
              Coming Soon
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
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

        {/* GitHub Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-yellow-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold">{githubStars}</span>
          </div>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-blue-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="font-semibold">{contributors}</span>
          </div>
        </div>

        {/* Tags */}
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

        {/* Explore Link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-primary font-medium hover:text-primary/80 transition-colors duration-300 flex items-center ${
            isInternal ? 'opacity-70 pointer-events-none' : ''
          }`}
          style={{
            transform: isHovered && !isInternal ? 'translateX(8px)' : 'translateX(0)',
            transition: 'transform 0.3s ease',
          }}
        >
          {isInternal ? 'Join Our Community' : 'Explore Project'}
          <svg
            className={`w-4 h-4 ml-1 transition-transform duration-300 ${
              isHovered && !isInternal ? 'translate-x-1' : ''
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

export default function FeaturedProjects() {
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
          title1={FEATURED_PROJECTS_DATA.heading.title}
          description={FEATURED_PROJECTS_DATA.heading.description}
          className="mb-20"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {FEATURED_PROJECTS_LIST.map((project, index) => (
            <FeaturedProjectCard key={index} {...project} index={index} />
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
              Join our community to work on these and other exciting open-source projects.
              We&apos;ll help you connect with maintainers, understand project requirements, and
              make your first contributions.
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/documentation';
              }}
              className="relative overflow-hidden px-6 py-3 rounded-lg font-medium text-white bg-primary transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
