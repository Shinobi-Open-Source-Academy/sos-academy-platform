'use client';

import type React from 'react';

interface HeroBannerProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function HeroBanner({ text, className = '', style = {} }: HeroBannerProps) {
  return (
    <div
      className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-primary/10 mb-4 sm:mb-6 relative overflow-hidden ${className}`}
      style={style}
    >
      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary mr-1.5 sm:mr-2 animate-pulse" />
      <span className="text-primary text-[10px] sm:text-xs font-medium relative">
        {text}
        {/* Shimmer effect */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
      </span>
    </div>
  );
}
