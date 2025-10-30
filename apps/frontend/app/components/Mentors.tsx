'use client';

import { useEffect, useRef, useState } from 'react';
import { MENTORS_DATA, MENTORS_LIST } from '../data/siteData';
import MentorApplicationModal from './MentorApplicationModal';
import MentorCard from './MentorCard';
import SectionHeading from './ui/SectionHeading';

export default function Mentors() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMentorApplicationModalOpen, setIsMentorApplicationModalOpen] = useState(false);
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
    <section ref={sectionRef} id="mentors" className="section bg-white dark:bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title1={MENTORS_DATA.heading.title}
          description={MENTORS_DATA.heading.description}
          className="mb-16"
        />

        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          {MENTORS_LIST.map((mentor, index) => (
            <MentorCard key={index} {...mentor} />
          ))}
        </div>

        <div
          className="mt-16 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
          }}
        >
          <button
            onClick={() => setIsMentorApplicationModalOpen(true)}
            className="relative overflow-hidden cursor-pointer px-6 py-3 rounded-lg font-medium text-white bg-primary transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl"
          >
            <span className="relative z-10">{MENTORS_DATA.cta.buttonText}</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
          </button>
        </div>
      </div>

      {/* Mentor Application Modal */}
      <MentorApplicationModal
        isOpen={isMentorApplicationModalOpen}
        onClose={() => setIsMentorApplicationModalOpen(false)}
      />
    </section>
  );
}
