'use client';

import { COMMUNITIES_DATA, COMMUNITIES_LIST } from '@/app/data/siteData';
import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import VideoIcon from './icons/VideoIcon';
import CommunityCard from './ui/CommunityCard';
import SectionHeading from './ui/SectionHeading';

export default function Communities() {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { weeklyCalls, stats } = COMMUNITIES_DATA;

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

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="communities"
      ref={sectionRef}
      className={`section py-20 ${COMMUNITIES_DATA.style.sectionBg}`}
    >
      <div className="container mx-auto px-4">
        <SectionHeading
          title1={COMMUNITIES_DATA.heading.title}
          description={COMMUNITIES_DATA.heading.description}
          className="mb-16"
          titleClassName="text-white"
          descriptionClassName="text-gray-300 text-lg"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COMMUNITIES_LIST.map((community, index) => (
            <CommunityCard
              key={community.id}
              community={community}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        <div className="mt-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#14182f] via-[#0d1127] to-[#060a1c] rounded-xl" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/2" />

          <div className="absolute inset-0 opacity-5 overflow-hidden">
            <div className="text-[10px] text-white/80 font-mono whitespace-pre overflow-hidden p-8">
              {weeklyCalls.codeSnippet}
            </div>
          </div>

          <div className="relative p-8 sm:p-10 rounded-xl border border-gray-800 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left md:w-2/3">
                <div className="inline-flex mb-4 items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                  <VideoIcon />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white bg-clip-text bg-gradient-to-r from-white to-gray-200">
                  {weeklyCalls.title}
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">{weeklyCalls.description}</p>
              </div>

              <div className="relative md:w-1/3 w-full rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent animate-pulse opacity-30 rounded-xl" />

                <div className="relative bg-[#0c1228]/80 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold mb-2">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                        {stats.communitiesCount}
                      </span>
                    </div>
                    <p className="text-gray-300 font-medium uppercase tracking-wider text-sm">
                      Communities
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        <CountUp
                          start={0}
                          end={Number(stats.membersCount)}
                          duration={4}
                          separator=","
                        />
                        +
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Members</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        <CountUp
                          start={0}
                          end={Number(stats.mentorsCount)}
                          duration={4}
                          separator=","
                        />
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Mentors</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        <CountUp
                          start={0}
                          end={Number(stats.projectsCount)}
                          duration={3}
                          separator=","
                        />
                        +
                      </div>

                      <p className="text-xs text-gray-400 uppercase tracking-wider">Projects</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                    <p className="text-sm text-gray-300">Next call: Thursday at 7PM UTC</p>
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
