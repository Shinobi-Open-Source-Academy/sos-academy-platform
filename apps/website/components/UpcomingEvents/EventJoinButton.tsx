'use client';

import { useEffect, useState } from 'react';
import type { EventJoinButtonProps } from './types';

export function EventJoinButton({ meetingLink, startTime }: EventJoinButtonProps) {
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = Date.now();
      const start = new Date(startTime).getTime();
      setCanJoin(now >= start);
    };

    checkTime();
    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

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
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = Date.now();
      const start = new Date(startTime).getTime();
      setCanJoin(now >= start);
    };

    checkTime();
    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

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
