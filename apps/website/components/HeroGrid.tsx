'use client';

import { useEffect, useRef, useState } from 'react';

interface HeroGridProps {
  children: React.ReactNode;
}

export default function HeroGrid({ children }: HeroGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 });
  const [hasInteracted, setHasInteracted] = useState(false);

  // Set initial position to center on mount
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: rect.width / 2,
        y: rect.height / 2,
      });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  // Create grid pattern
  const gridCols = 6;
  const gridRows = 4;
  const totalCells = gridCols * gridRows;

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full h-full">
      {/* Grid overlay - increased visibility by 15% (0.02 -> 0.023) */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none">
        {Array.from({ length: totalCells }).map((_) => (
          <div key={Math.random()} className="border border-white/[0.023]" />
        ))}
      </div>

      {/* Spotlight effect - visible from initial load */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: mousePosition.x >= 0 ? (hasInteracted ? 1 : 0.6) : 0,
          background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.08), transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
