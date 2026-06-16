'use client';

import { useEffect, useState } from 'react';
import { POLL_INTERVAL_MS } from './constants';
import type { EventJoinButtonProps } from './types';

function useCanJoin(startTime: string): boolean {
  const [canJoin, setCanJoin] = useState(() => Date.now() >= new Date(startTime).getTime());

  useEffect(() => {
    const check = () => setCanJoin(Date.now() >= new Date(startTime).getTime());
    const timer = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [startTime]);

  return canJoin;
}

export function EventJoinButton({ meetingLink, startTime }: EventJoinButtonProps) {
  const canJoin = useCanJoin(startTime);

  if (canJoin) {
    return (
      <a
        href={meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 px-4 py-2 bg-white text-black text-xs font-medium hover:bg-gray-200 transition-colors"
      >
        Join Event →
      </a>
    );
  }

  return (
    <span className="mt-2 px-4 py-2 bg-zinc-700 text-zinc-400 text-xs font-medium cursor-not-allowed">
      Join Event →
    </span>
  );
}

export function SmallEventJoinButton({ meetingLink, startTime }: EventJoinButtonProps) {
  const canJoin = useCanJoin(startTime);

  if (canJoin) {
    return (
      <a
        href={meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-400 hover:text-white transition-colors flex-shrink-0"
      >
        Join →
      </a>
    );
  }

  return <span className="text-xs text-zinc-600 flex-shrink-0 cursor-not-allowed">Join →</span>;
}
