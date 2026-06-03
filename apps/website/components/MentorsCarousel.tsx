'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import MentorCard from './MentorCard';
import { Mentor } from '../lib/api-client';

const VISIBLE = 2;
const INTERVAL_MS = 4000;
const TRANSITION_MS = 500;

function toCardProps(mentor: Mentor) {
  const expertise = mentor.expertise
    ? mentor.expertise
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
    : [];
  return {
    name: mentor.name,
    role: mentor.title || expertise[0] || 'Mentor',
    image: mentor.githubProfile?.avatarUrl || '/images/mentor1.jpeg',
    bio: mentor.description,
    expertise,
    socials: {
      github: mentor.socialLinks?.github || mentor.githubProfile?.htmlUrl,
      linkedin: mentor.socialLinks?.linkedin,
      twitter: mentor.socialLinks?.twitter,
      website: mentor.socialLinks?.website,
    },
    variant: 'full' as const,
  };
}

interface Props {
  mentors: Mentor[];
  loading?: boolean;
}

export default function MentorsCarousel({ mentors, loading }: Props) {
  const n = mentors.length;

  // Track: [last VISIBLE clones] [...mentors] [first VISIBLE clones]
  // This enables seamless infinite looping in both directions.
  const extended =
    n > 0 ? [...mentors.slice(-VISIBLE), ...mentors, ...mentors.slice(0, VISIBLE)] : [];
  const total = extended.length; // n + 2*VISIBLE

  // idx = index of left-most visible card in `extended`; starts at VISIBLE (first real card)
  const [idx, setIdx] = useState(VISIBLE);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);
  const resetting = useRef(false);

  // Which real mentor is on the left
  const realIdx = n > 0 ? (((idx - VISIBLE) % n) + n) % n : 0;

  const advance = useCallback(() => {
    if (resetting.current) return;
    setAnimated(true);
    setIdx((prev) => prev + 1);
  }, []);

  const retreat = useCallback(() => {
    if (resetting.current) return;
    setAnimated(true);
    setIdx((prev) => prev - 1);
  }, []);

  const goToReal = useCallback((realI: number) => {
    if (resetting.current) return;
    setAnimated(true);
    setIdx(realI + VISIBLE);
  }, []);

  // Auto-advance (pauses on hover)
  useEffect(() => {
    if (paused || n <= VISIBLE) return;
    const id = setInterval(advance, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, advance, n]);

  // Seamless loop: after transition, silently reset idx to real equivalent
  useEffect(() => {
    if (n <= VISIBLE) return;

    if (idx >= n + VISIBLE) {
      resetting.current = true;
      const t = setTimeout(() => {
        setAnimated(false);
        setIdx(VISIBLE);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setAnimated(true);
            resetting.current = false;
          })
        );
      }, TRANSITION_MS);
      return () => clearTimeout(t);
    }

    if (idx < VISIBLE) {
      resetting.current = true;
      const t = setTimeout(() => {
        setAnimated(false);
        setIdx(n + VISIBLE - 1);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setAnimated(true);
            resetting.current = false;
          })
        );
      }, TRANSITION_MS);
      return () => clearTimeout(t);
    }
  }, [idx, n]);

  // Reset position when mentor list changes (e.g. community filter)
  useEffect(() => {
    setIdx(VISIBLE);
  }, [n]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {[0, 1].map((i) => (
          <div key={i} className="border border-white/5 h-40 bg-black/50 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[38%] bg-white/5 animate-pulse" />
            <div className="relative z-20 h-full p-3 pl-[36%] flex flex-col gap-2">
              <div className="h-4 w-24 bg-white/5 animate-pulse" />
              <div className="h-3 w-20 bg-white/5 animate-pulse" />
              <div className="h-3 w-full bg-white/5 animate-pulse" />
              <div className="h-3 w-3/4 bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (n === 0) return null;

  // ── Static layout when ≤ VISIBLE mentors ─────────────────────────────────
  if (n <= VISIBLE) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {mentors.map((m) => (
          <MentorCard key={m.id} {...toCardProps(m)} />
        ))}
      </div>
    );
  }

  // ── Carousel math ─────────────────────────────────────────────────────────
  // Container = C; each card = C/VISIBLE = C/2
  // Track width (% of container) = total * 50
  // translateX (% of track) = -idx * (100/total)
  const trackW = `${total * 50}%`;
  const translateX = `${-(idx * (100 / total))}%`;

  return (
    <div className="relative max-w-5xl mx-auto">
      <div
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex"
          style={{
            width: trackW,
            transform: `translateX(${translateX})`,
            transition: animated ? `transform ${TRANSITION_MS}ms ease-in-out` : 'none',
          }}
        >
          {extended.map((mentor, i) => (
            <div key={`${mentor.id}-${i}`} style={{ width: `${100 / total}%` }} className="px-2">
              <MentorCard {...toCardProps(mentor)} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls: prev · dots · next */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={retreat}
          className="p-2 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-colors"
          aria-label="Previous mentor"
        >
          <ChevronLeftIcon />
        </button>

        <div className="flex gap-1.5 items-center">
          {mentors.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToReal(i)}
              className={`rounded-full transition-all duration-300 ${
                i === realIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to mentor ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={advance}
          className="p-2 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-colors"
          aria-label="Next mentor"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
