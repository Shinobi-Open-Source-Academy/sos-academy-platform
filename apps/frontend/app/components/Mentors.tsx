"use client";

import { useState, useRef, useEffect } from "react";
import SectionHeading from "./ui/SectionHeading";
import MentorCard from "./MentorCard";
import { MENTORS } from "../config/mentors";

export default function Mentors() {
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
          <button className="btn-primary mr-4">Become a Mentor</button>
          <button className="btn-secondary">Schedule a Call</button>
        </div>
      </div>
    </section>
  );
}
