'use client';

import { useEffect, useRef, useState } from 'react';
import { COMPANIES } from '../constants/companies';
import { HERO_DATA } from '../data/siteData';
import CodeBackground from './CodeBackground';
import SubscriptionModal from './SubscriptionModal';
import ArrowRightFillIcon from './icons/ArrowRightFillIcon';
import CompanyMarquee from './ui/CompanyMarquee';
import HeroBanner from './ui/HeroBanner';
import HeroButton from './ui/HeroButton';
import HeroHeading from './ui/HeroHeading';
import LogoAnimation from './ui/LogoAnimation';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [dots, setDots] = useState<
    Array<{
      width: number;
      height: number;
      top: number;
      left: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    // Small delay to trigger animations after component mounts
    setTimeout(() => {
      setIsLoaded(true);
    }, HERO_DATA.loadAnimationDelay);

    // Generate random dots only on client-side to avoid hydration mismatch
    setDots(
      Array.from({ length: 5 }).map(() => ({
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: Math.random() * 5 + 10,
      }))
    );

    // Subtle parallax effect on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) {
        return;
      }

      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setMousePosition({ x, y });
    };

    // Throttled mouse move handler - limits execution to once every 50ms
    const throttledHandleMouseMove = (e: MouseEvent) => {
      if (mouseMoveTimeoutRef.current) {
        return;
      }

      mouseMoveTimeoutRef.current = setTimeout(() => {
        handleMouseMove(e);
        mouseMoveTimeoutRef.current = null;
      }, 50);
    };

    window.addEventListener('mousemove', throttledHandleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', throttledHandleMouseMove);
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative bg-[#070a1d] py-16 sm:py-20 md:py-36 overflow-hidden"
    >
      {/* Animated Code Background */}
      <CodeBackground />

      {/* Gradient overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-radial from-[#0a1135]/80 to-transparent z-0" />

      {/* Subtle moving dots background - only rendered on client side */}
      {isLoaded && (
        <div className="absolute inset-0 z-0 opacity-20">
          {dots.map((dot) => (
            <div
              key={Math.random()}
              className="absolute rounded-full bg-primary/30"
              style={{
                width: `${dot.width}px`,
                height: `${dot.height}px`,
                top: `${dot.top}%`,
                left: `${dot.left}%`,
                transform: `translate(${
                  mousePosition.x * HERO_DATA.parallaxMultipliers.dots - 10
                }px, ${mousePosition.y * HERO_DATA.parallaxMultipliers.dots - 10}px)`,
                transition: 'transform 0.5s ease-out',
                animationDuration: `${dot.duration}s`,
                animation: 'float infinite ease-in-out',
              }}
            />
          ))}
        </div>
      )}

      <div className="container relative z-10 mx-auto px-4 sm:px-5 grid md:grid-cols-5 gap-6 md:gap-10 items-center">
        <div
          className="w-full max-w-xl md:col-span-3"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: `translateY(${isLoaded ? '0' : '30px'})`,
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          {/* Banner component */}
          <HeroBanner
            text={HERO_DATA.academyBannerText}
            style={{
              transform: `translate(${mousePosition.x * HERO_DATA.parallaxMultipliers.banner}px, ${
                mousePosition.y * HERO_DATA.parallaxMultipliers.banner
              }px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />

          {/* Heading component */}
          <HeroHeading
            mainText={HERO_DATA.shinobiText}
            secondaryText={HERO_DATA.titleText}
            typingSpeed={HERO_DATA.typingSpeed}
            typingStartDelay={HERO_DATA.typingStartDelay}
            typingRestartDelay={HERO_DATA.typingRestartDelay}
            typingPauseDelay={HERO_DATA.typingPauseDelay}
            style={{
              transform: `translate(${mousePosition.x * HERO_DATA.parallaxMultipliers.heading}px, ${
                mousePosition.y * HERO_DATA.parallaxMultipliers.heading
              }px)`,
              transition: 'transform 0.5s ease-out',
            }}
          />

          {/* Subtitle */}
          <p
            className="font-sans text-lg sm:text-xl md:text-2xl text-gray-100 mb-4 sm:mb-6 font-light tracking-wide"
            style={{
              transform: `translate(${
                mousePosition.x * HERO_DATA.parallaxMultipliers.subtitle
              }px, ${mousePosition.y * HERO_DATA.parallaxMultipliers.subtitle}px)`,
              transition: 'transform 0.7s ease-out',
              opacity: isLoaded ? 1 : 0,
            }}
          >
            {HERO_DATA.subtitleText}
          </p>

          {/* Description */}
          <p
            className="font-body text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 md:mb-10 leading-relaxed"
            style={{
              transform: `translate(${
                mousePosition.x * HERO_DATA.parallaxMultipliers.description
              }px, ${mousePosition.y * HERO_DATA.parallaxMultipliers.description}px)`,
              transition: 'transform 0.9s ease-out',
              opacity: isLoaded ? 1 : 0,
            }}
          >
            {HERO_DATA.descriptionText}
          </p>

          {/* Buttons */}
          <div
            className="flex flex-wrap gap-3 sm:gap-4 mb-2"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: `translateY(${isLoaded ? '0' : '20px'})`,
              transition: 'opacity 1s ease-out 0.2s, transform 1s ease-out 0.2s',
            }}
          >
            <button
              type="button"
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="relative overflow-hidden px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-sans font-semibold text-sm sm:text-base text-white bg-primary transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                {HERO_DATA.joinButtonText}
                <ArrowRightFillIcon />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
            </button>

            <button
              type="button"
              // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
              onClick={() => (window.location.href = '/documentation')}
              className="relative overflow-hidden px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-sans font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                {HERO_DATA.learnMoreButtonText}
                <ArrowRightFillIcon />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
            </button>
          </div>
        </div>

        {/* Logo animation - hidden on mobile */}
        <div className="hidden md:flex justify-center md:col-span-2">
          <LogoAnimation
            src="/shinobiLogo.png"
            alt="Shinobi Open-Source Academy Logo"
            isLoaded={isLoaded}
            mousePosition={mousePosition}
          />
        </div>
      </div>

      {/* Companies section with auto-scrolling marquee */}
      <div
        className="container relative z-10 mx-auto px-4 sm:px-5 mt-16 sm:mt-20 md:mt-24"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1.2s ease-out 0.5s',
        }}
      >
        {/* Subtle separator line */}
        <div className="relative max-w-3xl mt-36 mx-auto mb-6 sm:mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700/30" />
          </div>
          <div className="relative flex justify-center my-4">
            <span className="bg-[#070a1d] px-4 sm:px-6 text-xs sm:text-sm uppercase tracking-wider font-medium text-gray-400">
              {HERO_DATA.companiesTitle}
            </span>
          </div>
        </div>

        <p className="font-sans text-center text-base sm:text-lg font-medium text-gray-200 mb-6 sm:mb-8">
          {HERO_DATA.companiesSubtitle}
        </p>

        {/* Company marquee component */}
        <CompanyMarquee
          companies={COMPANIES}
          speed={HERO_DATA.marqueeSpeed}
          pauseOnHover={HERO_DATA.marqueePauseOnHover}
          direction={HERO_DATA.marqueeDirection}
        />
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </section>
  );
}
