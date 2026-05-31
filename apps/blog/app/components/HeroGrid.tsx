'use client';

import { useEffect, useRef, useState } from 'react';

export default function HeroGrid({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 });
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (!hasInteracted) setHasInteracted(true);
  };

  const totalCells = 6 * 4;

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full h-full">
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none">
        {Array.from({ length: totalCells }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static grid cells
          <div key={i} className="border border-white/[0.023]" />
        ))}
      </div>
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: mousePosition.x >= 0 ? (hasInteracted ? 1 : 0.6) : 0,
          background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.08), transparent 60%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
