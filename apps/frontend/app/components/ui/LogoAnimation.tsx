'use client';

import Image from 'next/image';

interface LogoAnimationProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  mousePosition?: { x: number; y: number };
  isLoaded?: boolean;
}

export default function LogoAnimation({
  src,
  alt,
  width = 320,
  height = 320,
  className = '',
  style = {},
  mousePosition = { x: 0, y: 0 },
  isLoaded = true,
}: LogoAnimationProps) {
  return (
    <div
      className="relative"
      style={{
        opacity: isLoaded ? 1 : 0,
        transform: `translateY(${isLoaded ? '0' : '30px'}) translate(${
          mousePosition.x * 10
        }px, ${mousePosition.y * 10}px)`,
        transition: 'opacity 1s ease-out, transform 1s ease-out',
        ...style,
      }}
    >
      {/* Pulsing light behind the logo */}
      <div className="absolute -z-10 w-72 h-72 bg-[#304FFE]/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />

      {/* Multiple glowing circles */}
      <div className="absolute -z-10 w-56 h-56 border-2 border-[#304FFE]/40 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
      <div
        className="absolute -z-10 w-64 h-64 border border-[#304FFE]/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow"
        style={{
          animationDirection: 'reverse',
          animationDuration: '25s',
        }}
      />

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`filter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform transition-all duration-700 hover:scale-105 animate-float ${className}`}
        style={{
          filter: `drop-shadow(0 0 8px rgba(48,79,254,${0.3 + mousePosition.x * 0.3}))`,
        }}
        priority
      />
    </div>
  );
}
