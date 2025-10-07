'use client';

import { COMMUNITIES_DATA } from '@/app/data/siteData';

type Community = {
  id: string;
  name: string;
  language: string;
  icon: string;
  color: string;
  description: string;
  codeSnippet: string;
};
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CommunityJoinModal from '../CommunityJoinModal';

interface CommunityCardProps {
  community: Community;
  index: number;
  isInView: boolean;
}

export default function CommunityCard({ community, index, isInView }: CommunityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const { animation: ANIMATION, style: STYLE } = COMMUNITIES_DATA;

  // Prevent hydration mismatch by only showing particles on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Setup the code scrolling animation
  useEffect(() => {
    if (codeRef.current && isInView) {
      const codeElement = codeRef.current;
      const totalHeight = codeElement.scrollHeight;

      // Only animate if there's enough content to scroll
      if (totalHeight > codeElement.clientHeight) {
        const scrollAnimation = codeElement.animate(
          [
            { transform: 'translateY(0)' },
            { transform: `translateY(-${totalHeight - codeElement.clientHeight}px)` },
          ],
          {
            duration: ANIMATION.codeScrollDuration * 1000,
            iterations: Number.POSITIVE_INFINITY,
            direction: 'alternate',
            easing: 'ease-in-out',
          }
        );

        // Pause animation when not hovered
        if (!isHovered) {
          scrollAnimation.playbackRate = 0.3;
        } else {
          scrollAnimation.playbackRate = 1;
        }

        return () => {
          scrollAnimation.cancel();
        };
      }
    }
  }, [isInView, isHovered, ANIMATION.codeScrollDuration]);

  // Calculate the staggered animation delay based on index
  const animationDelay = `${index * ANIMATION.staggerDelay}s`;

  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-lg ${STYLE.cardBg} backdrop-blur-sm transition-all duration-500`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView
          ? isHovered
            ? 'translateY(-10px)'
            : 'translateY(0)'
          : 'translateY(20px)',
        transition: `opacity ${ANIMATION.cardAnimationDuration}s ease-out ${animationDelay}, transform 0.4s ease-out`,
        borderTop: '3px solid',
        borderColor: community.color.replace('bg-', ''),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Code snippet background */}
      <div
        ref={codeRef}
        className="absolute inset-0 text-[10px] font-mono opacity-10 text-white whitespace-pre overflow-hidden p-4 z-0"
        style={{
          transition: `opacity ${ANIMATION.hoverTransitionDuration} ease-out`,
          opacity: isHovered ? 0.15 : 0.05,
        }}
      >
        {community.codeSnippet}
      </div>

      {/* Hover effect overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-0"
        style={{
          opacity: isHovered ? 0.9 : 0.5,
          transition: `opacity ${ANIMATION.hoverTransitionDuration} ease-out`,
        }}
      />

      {/* Card content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center mb-4">
          <div
            className={
              'w-10 h-10 mr-3 flex items-center justify-center rounded-full transition-all duration-300 font-bold text-white'
            }
            style={{
              backgroundColor: community.color.replace('bg-', ''),
              boxShadow: isHovered ? `0 0 15px ${community.color.replace('bg-', '')}` : 'none',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {community.icon}
          </div>

          <div>
            <h3
              className={'text-xl font-bold text-white transition-all duration-300'}
              style={{
                transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
              }}
            >
              {community.name}
            </h3>
            <p className="text-sm text-gray-400">{community.language}</p>
          </div>
        </div>

        <p className={`${STYLE.textColor} transition-all duration-300`}>{community.description}</p>
        {/* Learn more button - appears on hover */}
        <Link
          href={`/communities/${community.id}`}
          className="mt-4 text-primary py-1 px-0 group flex items-center text-sm font-medium opacity-0 transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          Learn more
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <title>Learn more</title>
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>

      {/* Particle effects (only shown when hovered and mounted on client) */}
      {isMounted &&
        isHovered &&
        [...Array(3)].map((_, i) => {
          const size = Math.random() * 4 + 2;
          const topPos = Math.random() * 100;
          const leftPos = Math.random() * 100;
          const duration = Math.random() * 3 + 2;
          const delay = Math.random() * 1;

          return (
            <div
              key={`particle-${community.id}-${i}`}
              className="absolute rounded-full bg-white/30"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${topPos}%`,
                left: `${leftPos}%`,
                animation: `float ${duration}s infinite ease-in-out ${delay}s`,
              }}
            />
          );
        })}

      {/* Community Join Modal */}
      <CommunityJoinModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        communityName={community.name}
        communityId={community.id}
      />
    </div>
  );
}
