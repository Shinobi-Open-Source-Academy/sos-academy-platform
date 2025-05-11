"use client";

import { useState, useRef, useEffect } from "react";
import { Community } from "@/app/constants/communities";
import { COMMUNITIES_CONSTANTS } from "@/app/constants/communities";
import Link from "next/link";

interface CommunityCardProps {
  community: Community;
  index: number;
  isInView: boolean;
}

export default function CommunityCard({
  community,
  index,
  isInView,
}: CommunityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const { ANIMATION, STYLE } = COMMUNITIES_CONSTANTS;

  // Setup the code scrolling animation
  useEffect(() => {
    if (codeRef.current && isInView) {
      const codeElement = codeRef.current;
      const totalHeight = codeElement.scrollHeight;
      
      // Only animate if there's enough content to scroll
      if (totalHeight > codeElement.clientHeight) {
        const scrollAnimation = codeElement.animate(
          [
            { transform: "translateY(0)" },
            { transform: `translateY(-${totalHeight - codeElement.clientHeight}px)` },
          ],
          {
            duration: ANIMATION.CODE_SCROLL_DURATION * 1000,
            iterations: Infinity,
            direction: "alternate",
            easing: "ease-in-out",
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
  }, [isInView, isHovered, ANIMATION.CODE_SCROLL_DURATION]);

  // Calculate the staggered animation delay based on index
  const animationDelay = `${index * ANIMATION.STAGGER_DELAY}s`;

  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-lg ${STYLE.CARD_BG} backdrop-blur-sm transition-all duration-500`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView
          ? isHovered
            ? "translateY(-10px)"
            : "translateY(0)"
          : "translateY(20px)",
        transition: `opacity ${ANIMATION.CARD_ANIMATION_DURATION}s ease-out ${animationDelay}, transform 0.4s ease-out`,
        borderTop: `3px solid`,
        borderColor: community.color.replace("bg-", ""),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Code snippet background */}
      <div
        ref={codeRef}
        className="absolute inset-0 text-[10px] font-mono opacity-10 text-white whitespace-pre overflow-hidden p-4 z-0"
        style={{
          transition: `opacity ${ANIMATION.HOVER_TRANSITION_DURATION} ease-out`,
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
          transition: `opacity ${ANIMATION.HOVER_TRANSITION_DURATION} ease-out`,
        }}
      />

      {/* Card content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center mb-4">
          <div 
            className={`w-10 h-10 mr-3 flex items-center justify-center rounded-full transition-all duration-300 font-bold text-white`}
            style={{ 
              backgroundColor: community.color.replace("bg-", ""),
              boxShadow: isHovered ? `0 0 15px ${community.color.replace("bg-", "")}` : 'none',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {community.icon}
          </div>
          
          <div>
            <h3 
              className={`text-xl font-bold text-white transition-all duration-300`}
              style={{
                transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
              }}
            >
              {community.name}
            </h3>
            <p className="text-sm text-gray-400">
              {community.language}
            </p>
          </div>
        </div>
        
        <p className={`${STYLE.TEXT_COLOR} transition-all duration-300`}>
          {community.description}
        </p>

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
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
      
      {/* Particle effects (only shown when hovered) */}
      {isHovered && (
        <>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 3 + 2}s infinite ease-in-out ${
                  Math.random() * 1
                }s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
} 