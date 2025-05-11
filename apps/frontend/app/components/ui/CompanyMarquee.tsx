"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Company } from "@/app/constants/companies";

interface CompanyMarqueeProps {
  companies: Company[];
  speed?: number; // seconds for one full cycle
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  className?: string;
}

export default function CompanyMarquee({
  companies,
  speed = 25,
  pauseOnHover = true,
  direction = "left",
  className = ""
}: CompanyMarqueeProps) {
  const [duplicatedCompanies, setDuplicatedCompanies] = useState<Company[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Duplicate companies to ensure smooth infinite scroll
  useEffect(() => {
    setDuplicatedCompanies([...companies, ...companies]);
  }, [companies]);
  
  // Calculate container width for animation 
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.scrollWidth / 2);
      }
    };
    
    // Update width initially and on resize
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => window.removeEventListener('resize', updateWidth);
  }, [duplicatedCompanies]);
  
  return (
    <div 
      className={`overflow-hidden w-full ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        ref={containerRef}
        className="flex items-center whitespace-nowrap"
        style={{
          animationName: `scroll${direction === 'left' ? 'Left' : 'Right'}`,
          animationDuration: `${speed}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: isPaused ? 'paused' : 'running',
          transform: `translateX(${direction === 'left' ? '0' : `-${containerWidth}px`})`,
        }}
      >
        {duplicatedCompanies.map((company, idx) => (
          <Link 
            href={company.url}
            target="_blank"
            rel="noopener noreferrer"
            key={`${company.name}-${idx}`} 
            className="mx-3 sm:mx-6 px-2 sm:px-4 py-1 sm:py-2 font-sans text-base sm:text-lg font-bold text-gray-200 opacity-70 hover:opacity-100 hover:text-primary transition-all duration-300 transform hover:scale-105"
          >
            {company.name}
          </Link>
        ))}
      </div>
      
      <style jsx global>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${containerWidth}px);
          }
        }
        
        @keyframes scrollRight {
          0% {
            transform: translateX(-${containerWidth}px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
} 