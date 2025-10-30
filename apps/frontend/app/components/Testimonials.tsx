'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaLinkedin, FaQuoteLeft, FaStar, FaTwitter } from 'react-icons/fa';
import SectionHeading from './ui/SectionHeading';

interface TestimonialProps {
  content: string;
  author: string;
  position: string;
  company: string;
  image: string;
  rating: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
}

const TestimonialCard = ({
  content,
  author,
  position,
  company,
  image,
  rating,
  socialLinks,
  index = 0,
}: TestimonialProps & { index?: number }) => {
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
      className="bg-white dark:bg-gray-800 rounded-lg p-7 shadow-sm relative border border-transparent hover:border-gray-200 dark:hover:border-gray-700 overflow-hidden"
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
        boxShadow: isHovered ? '0 10px 30px rgba(0, 0, 0, 0.08)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-0" />
      <FaQuoteLeft className="text-primary/20 text-5xl absolute top-6 left-6 z-0" />
      <div className="flex items-center mb-5 relative z-10">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${
              i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            } h-4 w-4 ${isHovered ? 'animate-pulse' : ''}`}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6 z-10 relative">
        <span className="text-primary font-bold text-lg leading-loose">&ldquo;</span>
        {content}
        <span className="text-primary font-bold text-lg">&rdquo;</span>
      </p>
      <div className="flex items-center relative z-10">
        <div className="relative h-14 w-14 rounded-full overflow-hidden mr-4 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
          <Image
            src={image}
            alt={author}
            fill
            loading="lazy"
            className="object-cover"
            style={{
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          />
        </div>
        <div>
          <h4
            className="font-bold transition-colors duration-300 flex items-center"
            style={{ color: isHovered ? 'var(--primary)' : 'inherit' }}
          >
            {author}
            <div
              className={`ml-2 h-1 w-0 bg-primary rounded-full transition-all duration-300 ${isHovered ? 'w-12' : ''}`}
            />
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {position} at {company}
          </p>
          {socialLinks && (
            <div className="flex mt-2 space-x-2">
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors duration-300"
                >
                  <FaLinkedin className="h-4 w-4" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors duration-300"
                >
                  <FaTwitter className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Testimonials() {
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

  const testimonials: TestimonialProps[] = useMemo(() => [
    {
      content:
        "Joining Shinobi Academy transformed my career. The structured learning path and supportive community helped me contribute to my first open-source project within weeks. I've grown more in 3 months here than in a year of self-study.",
      author: 'Sarah Chen',
      position: 'Junior Developer',
      company: 'TechStart',
      image: '/images/testimonial1.jpg',
      rating: 5,
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarah-chen',
        twitter: 'https://twitter.com/sarahcodes',
      },
    },
    {
      content:
        "As a senior developer, I was looking for ways to give back to the community. Shinobi's mentorship program provided the perfect framework to share my knowledge while keeping me engaged with cutting-edge technologies.",
      author: 'Michael Rodriguez',
      position: 'Senior Engineer',
      company: 'CloudScale',
      image: '/images/testimonial2.jpg',
      rating: 5,
      socialLinks: {
        linkedin: 'https://linkedin.com/in/michaelrodriguez',
      },
    },
    {
      content:
        'The hands-on project experience at Shinobi Academy is unmatched. I collaborated with developers across different timezones on real-world projects that actually matter. This practical experience was key to landing my dream job.',
      author: 'Jordan Taylor',
      position: 'Full Stack Developer',
      company: 'InnovateX',
      image: '/images/testimonial3.jpg',
      rating: 4,
      socialLinks: {
        twitter: 'https://twitter.com/jordantcodes',
      },
    },
    {
      content:
        "Transitioning from a non-tech background was intimidating, but Shinobi's step-by-step guidance and inclusive community made it approachable. The focus on both technical skills and collaboration practices prepared me for the real world.",
      author: 'Priya Patel',
      position: 'Backend Developer',
      company: 'DataFlow',
      image: '/images/testimonial4.jpg',
      rating: 5,
      socialLinks: {
        linkedin: 'https://linkedin.com/in/priyapatel',
        twitter: 'https://twitter.com/priyacodes',
      },
    },
    {
      content:
        "I've tried numerous coding platforms, but Shinobi stands out for its emphasis on production-quality code and industry best practices. The code reviews from experienced mentors significantly accelerated my growth as a developer.",
      author: 'David Kim',
      position: 'Software Architect',
      company: 'TechNova',
      image: '/images/testimonial5.jpg',
      rating: 5,
      socialLinks: {
        linkedin: 'https://linkedin.com/in/davidkim',
      },
    },
    {
      content:
        "The weekly calls and pair programming sessions at Shinobi created accountability and kept me motivated. The community's focus on quality over quantity helped me develop a professional mindset that employers value.",
      author: 'Emma Wilson',
      position: 'DevOps Engineer',
      company: 'InfraStack',
      image: '/images/testimonial6.jpg',
      rating: 4,
      socialLinks: {
        twitter: 'https://twitter.com/emmabuilds',
      },
    },
  ], []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="section bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-24"
    >
      <div className="container mx-auto px-4">
        {/* Decorative elements */}
        <div className="relative">
          <div
            className="absolute -top-12 left-1/3 transform -translate-x-1/2 w-72 h-72 rounded-full bg-primary/5 blur-3xl opacity-70 -z-10"
            style={{
              opacity: isVisible ? 0.7 : 0,
              transition: 'opacity 1.5s ease-out',
            }}
          />
          <div
            className="absolute -top-20 right-1/4 transform -translate-x-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl opacity-60 -z-10"
            style={{
              opacity: isVisible ? 0.6 : 0,
              transition: 'opacity 1.5s ease-out 0.3s',
            }}
          />
        </div>

        <SectionHeading
          title1="Success Stories"
          description="Hear from our community members who have transformed their coding careers through structured learning and real-world project experience."
          className="mb-20"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} index={index} />
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
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
              Ready to share your own success story with our community?
            </p>
            <button className="btn-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              Share Your Story
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
