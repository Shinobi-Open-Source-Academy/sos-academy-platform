'use client';

import { FEATURE_CARDS } from '@/app/constants/about';
import { useEffect, useRef } from 'react';
import FeatureCard from './ui/FeatureCard';

interface FeatureGridProps {
  className?: string;
}

export default function FeatureGrid({ className = '' }: FeatureGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={gridRef} className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {FEATURE_CARDS.map((feature, index) => (
        <FeatureCard key={feature.id} {...feature} index={index} />
      ))}
    </div>
  );
}
