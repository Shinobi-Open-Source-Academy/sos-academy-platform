'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4200/api';

type ReactionType = 'heart' | 'fire' | 'rocket' | 'clap' | 'mind_blown';

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'heart', emoji: '❤️', label: 'Love' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'rocket', emoji: '🚀', label: 'Rocket' },
  { type: 'clap', emoji: '👏', label: 'Clap' },
  { type: 'mind_blown', emoji: '🤯', label: 'Mind blown' },
];

interface ReactionsProps {
  slug: string;
  initialReactions: Record<ReactionType, number>;
}

export default function Reactions({ slug, initialReactions }: ReactionsProps) {
  const [counts, setCounts] = useState<Record<ReactionType, number>>(initialReactions);
  const [reacted, setReacted] = useState<Set<ReactionType>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem(`reacted:${slug}`);
    return stored ? new Set(JSON.parse(stored) as ReactionType[]) : new Set();
  });
  const [pending, setPending] = useState<ReactionType | null>(null);

  async function handleReact(type: ReactionType) {
    if (reacted.has(type) || pending) return;
    setPending(type);

    // Optimistic update
    setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    const newReacted = new Set(reacted).add(type);
    setReacted(newReacted);
    localStorage.setItem(`reacted:${slug}`, JSON.stringify([...newReacted]));

    try {
      const res = await fetch(`${API_URL}/blog/${slug}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setCounts(data.reactions);
      }
    } catch {
      // Keep optimistic update on error
    } finally {
      setPending(null);
    }
  }

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500">
          {totalReactions > 0
            ? `${totalReactions} reaction${totalReactions !== 1 ? 's' : ''}`
            : 'Be the first to react'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ type, emoji, label }) => {
          const hasReacted = reacted.has(type);
          const count = counts[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleReact(type)}
              disabled={hasReacted || pending !== null}
              title={hasReacted ? `You reacted with ${label}` : label}
              className={`flex items-center gap-1.5 px-3 py-1.5 border text-sm transition-all ${
                hasReacted
                  ? 'border-white/30 bg-white/5 text-white'
                  : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white hover:bg-white/5 disabled:opacity-50'
              }`}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span className={`text-xs ${hasReacted ? 'text-white' : 'text-zinc-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
