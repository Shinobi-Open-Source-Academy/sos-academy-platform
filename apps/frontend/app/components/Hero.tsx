"use client";

import { useEffect, useState, useRef } from "react";
import CodeBackground from "./CodeBackground";
import { HERO_CONFIG } from "../constants/hero";
import { COMPANIES } from "../constants/companies";
import HeroHeading from "./ui/HeroHeading";
import HeroBanner from "./ui/HeroBanner";
import HeroButton from "./ui/HeroButton";
import LogoAnimation from "./ui/LogoAnimation";
import CompanyMarquee from "./ui/CompanyMarquee";

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
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
    }, HERO_CONFIG.LOAD_ANIMATION_DELAY);

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
      if (!heroRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative bg-[#070a1d] py-16 sm:py-20 md:py-36 overflow-hidden"
    >
      {/* Animated Code Background */}
      <CodeBackground />

      {/* Gradient overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-radial from-[#0a1135]/80 to-transparent z-0"></div>

      {/* Subtle moving dots background - only rendered on client side */}
      {isLoaded && (
        <div className="absolute inset-0 z-0 opacity-20">
          {dots.map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/30"
              style={{
                width: `${dot.width}px`,
                height: `${dot.height}px`,
                top: `${dot.top}%`,
                left: `${dot.left}%`,
                transform: `translate(${
                  mousePosition.x * HERO_CONFIG.PARALLAX_MULTIPLIERS.DOTS - 10
                }px, ${
                  mousePosition.y * HERO_CONFIG.PARALLAX_MULTIPLIERS.DOTS - 10
                }px)`,
                transition: "transform 0.5s ease-out",
                animationDuration: `${dot.duration}s`,
                animation: "float infinite ease-in-out",
              }}
            ></div>
          ))}
        </div>
      )}

      <div className="container relative z-10 mx-auto px-4 sm:px-5 grid md:grid-cols-5 gap-6 md:gap-10 items-center">
        <div
          className="w-full max-w-xl md:col-span-3"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: `translateY(${isLoaded ? "0" : "30px"})`,
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          }}
        >
          {/* Banner component */}
          <HeroBanner
            text={HERO_CONFIG.ACADEMY_BANNER_TEXT}
            style={{
              transform: `translate(${
                mousePosition.x * HERO_CONFIG.PARALLAX_MULTIPLIERS.BANNER
              }px, ${
                mousePosition.y * HERO_CONFIG.PARALLAX_MULTIPLIERS.BANNER
              }px)`,
              transition: "transform 0.3s ease-out",
            }}
          />

          {/* Heading component */}
          <HeroHeading
            mainText={HERO_CONFIG.SHINOBI_TEXT}
            secondaryText={HERO_CONFIG.TITLE_TEXT}
            typingSpeed={HERO_CONFIG.TYPING_SPEED}
            typingStartDelay={HERO_CONFIG.TYPING_START_DELAY}
            typingRestartDelay={HERO_CONFIG.TYPING_RESTART_DELAY}
            typingPauseDelay={HERO_CONFIG.TYPING_PAUSE_DELAY}
            style={{
              transform: `translate(${
                mousePosition.x * HERO_CONFIG.PARALLAX_MULTIPLIERS.HEADING
              }px, ${
                mousePosition.y * HERO_CONFIG.PARALLAX_MULTIPLIERS.HEADING
              }px)`,
              transition: "transform 0.5s ease-out",
            }}
          />

          {/* Subtitle */}
          <p
            className="font-sans text-lg sm:text-xl md:text-2xl text-gray-100 mb-4 sm:mb-6 font-light tracking-wide"
            style={{
              transform: `translate(${
                mousePosition.x * HERO_CONFIG.PARALLAX_MULTIPLIERS.SUBTITLE
              }px, ${
                mousePosition.y * HERO_CONFIG.PARALLAX_MULTIPLIERS.SUBTITLE
              }px)`,
              transition: "transform 0.7s ease-out",
              opacity: isLoaded ? 1 : 0,
            }}
          >
            {HERO_CONFIG.SUBTITLE_TEXT}
          </p>

          {/* Description */}
          <p
            className="font-body text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 md:mb-10 leading-relaxed"
            style={{
              transform: `translate(${
                mousePosition.x * HERO_CONFIG.PARALLAX_MULTIPLIERS.DESCRIPTION
              }px, ${
                mousePosition.y * HERO_CONFIG.PARALLAX_MULTIPLIERS.DESCRIPTION
              }px)`,
              transition: "transform 0.9s ease-out",
              opacity: isLoaded ? 1 : 0,
            }}
          >
            {HERO_CONFIG.DESCRIPTION_TEXT}
          </p>

          {/* Buttons */}
          <div
            className="flex flex-wrap gap-3 sm:gap-4 mb-2"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: `translateY(${isLoaded ? "0" : "20px"})`,
              transition:
                "opacity 1s ease-out 0.2s, transform 1s ease-out 0.2s",
            }}
          >
            <HeroButton
              text={HERO_CONFIG.JOIN_BUTTON_TEXT}
              href={HERO_CONFIG.JOIN_URL}
              isPrimary
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 transform transition-transform group-hover:translate-x-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />

            <HeroButton
              text={HERO_CONFIG.LEARN_MORE_BUTTON_TEXT}
              href={HERO_CONFIG.LEARN_MORE_URL}
            />
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
          transition: "opacity 1.2s ease-out 0.5s",
        }}
      >
        {/* Subtle separator line */}
        <div className="relative max-w-3xl mx-auto mb-6 sm:mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700/30"></div>
          </div>
          <div className="relative flex justify-center my-4">
            <span className="bg-[#070a1d] px-4 sm:px-6 text-xs sm:text-sm uppercase tracking-wider font-medium text-gray-400">
              {HERO_CONFIG.COMPANIES_TITLE}
            </span>
          </div>
        </div>

        <p className="font-sans text-center text-base sm:text-lg font-medium text-gray-200 mb-6 sm:mb-8">
          {HERO_CONFIG.COMPANIES_SUBTITLE}
        </p>

        {/* Company marquee component */}
        <CompanyMarquee
          companies={COMPANIES}
          speed={HERO_CONFIG.MARQUEE_SPEED}
          pauseOnHover={HERO_CONFIG.MARQUEE_PAUSE_ON_HOVER}
          direction={HERO_CONFIG.MARQUEE_DIRECTION}
        />
      </div>
    </section>
  );
}
