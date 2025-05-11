"use client";

import { useState, useRef, useEffect } from "react";
import SectionHeading from "./ui/SectionHeading";
import CommunityCard from "./ui/CommunityCard";
import {
  COMMUNITIES,
  COMMUNITIES_CONSTANTS,
} from "@/app/constants/communities";

export default function Communities() {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { WEEKLY_CALLS, STATS } = COMMUNITIES_CONSTANTS;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
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
      id="communities"
      ref={sectionRef}
      className={`section py-20 ${COMMUNITIES_CONSTANTS.STYLE.SECTION_BG}`}
    >
      <div className="container mx-auto px-4">
        <SectionHeading
          title1="Our Communities"
          description="Join specialized sub-communities based on programming languages and domains, each led by experienced mentors who will guide your open-source journey."
          className="mb-16"
          titleClassName="text-white"
          descriptionClassName="text-gray-300 text-lg"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COMMUNITIES.map((community, index) => (
            <CommunityCard
              key={community.id}
              community={community}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        <div className="mt-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#14182f] via-[#0d1127] to-[#060a1c] rounded-xl"></div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/2"></div>

          <div className="absolute inset-0 opacity-5 overflow-hidden">
            <div className="text-[10px] text-white/80 font-mono whitespace-pre overflow-hidden p-8">
              {WEEKLY_CALLS.CODE_SNIPPET}
            </div>
          </div>

          <div className="relative p-8 sm:p-10 rounded-xl border border-gray-800 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left md:w-2/3">
                <div className="inline-flex mb-4 items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white bg-clip-text bg-gradient-to-r from-white to-gray-200">
                  {WEEKLY_CALLS.TITLE}
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {WEEKLY_CALLS.DESCRIPTION}
                </p>

                <button className="mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-transform duration-300 hover:scale-105 inline-flex items-center group">
                  <span>Join Next Call</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>

              <div className="relative md:w-1/3 w-full rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent animate-pulse opacity-30 rounded-xl"></div>

                <div className="relative bg-[#0c1228]/80 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold mb-2">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                        {STATS.COMMUNITIES_COUNT}
                      </span>
                    </div>
                    <p className="text-gray-300 font-medium uppercase tracking-wider text-sm">
                      Communities
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {STATS.MEMBERS_COUNT}
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        Members
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {STATS.MENTORS_COUNT}
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        Mentors
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {STATS.PROJECTS_COUNT}
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        Projects
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <p className="text-sm text-gray-300">
                      Next call: Thursday at 7PM UTC
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
