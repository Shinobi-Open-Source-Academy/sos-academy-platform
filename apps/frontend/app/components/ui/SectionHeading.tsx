"use client";

import { useEffect, useState, useRef } from "react";

interface SectionHeadingProps {
  title1: string;
  title2?: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  animationDelay?: number;
}

export default function SectionHeading({
  title1,
  title2,
  description,
  className = "",
  titleClassName = "bg-gradient-to-r from-primary to-gray-800 dark:from-primary dark:to-gray-400 bg-clip-text text-transparent",
  descriptionClassName = "text-gray-600 dark:text-gray-400 text-lg",
  animationDelay = 0.3,
}: SectionHeadingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (headingRef.current) {
      observer.observe(headingRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={headingRef}
      className={`max-w-3xl mx-auto text-center ${className}`}
    >
      {/* Decorative element */}
      <div className="flex justify-center mb-4">
        <div 
          className="h-1.5 w-16 bg-primary/30 rounded-full"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scaleX(1)" : "scaleX(0.3)",
            transition: `opacity 0.5s ease-out, transform 0.5s ease-out`,
          }}
        />
      </div>

      <h2
        className={`text-3xl md:text-4xl font-bold mb-6 relative ${titleClassName}`}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.8s ease-out, transform 0.8s ease-out`,
        }}
      >
        {title1}
        {title2 && (
          <>
            <br />
            <span
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(15px)",
                transition: `opacity 0.8s ease-out ${animationDelay}s, transform 0.8s ease-out ${animationDelay}s`,
                display: "inline-block",
              }}
            >
              {title2}
            </span>
          </>
        )}

        {/* Animated underline */}
        <div
          className="h-1 bg-gradient-to-r from-primary/50 to-primary/0 rounded-full mx-auto mt-4 max-w-[100px]"
          style={{
            width: isVisible ? "100px" : "0px",
            opacity: isVisible ? 1 : 0,
            transition: `width 1s ease-out ${
              animationDelay + 0.2
            }s, opacity 1s ease-out ${animationDelay + 0.2}s`,
          }}
        />
      </h2>

      <p
        className={`${descriptionClassName} max-w-2xl mx-auto`}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(15px)",
          transition: `opacity 0.8s ease-out ${
            animationDelay * 1.5
          }s, transform 0.8s ease-out ${animationDelay * 1.5}s`,
        }}
      >
        {description}
      </p>
    </div>
  );
}
