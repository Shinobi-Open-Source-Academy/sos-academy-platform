'use client';

import type { FeatureCard as FeatureCardType } from '@/app/constants/about';
import { ABOUT_CONSTANTS } from '@/app/constants/about';
import { useEffect, useRef, useState } from 'react';

interface FeatureCardProps extends FeatureCardType {
  index: number;
}

const FeatureCard = ({ title, description, icon, index }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { ANIMATION, STYLE } = ABOUT_CONSTANTS;

  // Calculate animation delay based on index
  const animationDelay = index * ANIMATION.STAGGER_DELAY;

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`${STYLE.CARD_BG} rounded-xl p-6 shadow-sm transition-all duration-300 h-full border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity ${ANIMATION.CARD_ANIMATION_DURATION}s ease-out ${animationDelay}s, 
                     transform ${ANIMATION.CARD_ANIMATION_DURATION}s ease-out ${animationDelay}s`,
        background: isHovered
          ? 'linear-gradient(145deg, var(--card-bg-color), var(--card-bg-color-darker))'
          : 'var(--card-bg-color)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon container with pulsing animation */}
      <div
        className={`${STYLE.ICON_BG} w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 ${
          isHovered ? STYLE.ICON_HOVER_BG : ''
        }`}
        style={{
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isHovered ? '0 0 15px rgba(48,79,254,0.25)' : 'none',
        }}
      >
        <svg
          className={`w-6 h-6 ${STYLE.ICON_COLOR} transition-all duration-300`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{
            filter: isHovered ? STYLE.ICON_HOVER_GLOW : 'none',
            animation: `pulse ${ANIMATION.ICON_PULSE_DURATION}s infinite ${
              isHovered ? 'alternate' : 'alternate-reverse'
            }`,
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>

      {/* Title and description */}
      <div className="space-y-2">
        <h3
          className="text-xl font-bold transition-all duration-300"
          style={{
            color: isHovered ? 'var(--primary-color)' : 'inherit',
            transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
          }}
        >
          {title}
        </h3>
        <p
          className={`${STYLE.TEXT_COLOR} transition-all duration-300`}
          style={{
            opacity: isHovered ? 0.95 : 0.8,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
