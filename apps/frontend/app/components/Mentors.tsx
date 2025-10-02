"use client";

import { useState, useRef, useEffect } from "react";
import SectionHeading from "./ui/SectionHeading";
import MentorCard from "./MentorCard";
import { MENTORS } from "../config/mentors";
import MentorApplicationModal from "./MentorApplicationModal";

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
    <section
      ref={sectionRef}
      id="mentors"
      className="section bg-white dark:bg-gray-900 py-20"
    >
      <div className="container mx-auto px-4">
        <SectionHeading
          title1="Expert Mentors"
          description="Learn from industry professionals with years of experience in their fields. Our mentors are passionate about sharing their knowledge and helping you grow."
          className="mb-16"
        />

        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          }}
        >
          {MENTORS.map((mentor, index) => (
            <MentorCard key={index} {...mentor} />
          ))}
        </div>

        <div
          className="mt-16 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s",
          }}
        >
          <button
            onClick={() => setIsMentorApplicationModalOpen(true)}
            className="relative overflow-hidden cursor-pointer px-6 py-3 rounded-lg font-medium text-white bg-primary transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl"
          >
            <span className="relative z-10">Become a Mentor</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0"></span>
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
