'use client';

import { useEffect, useState } from 'react';
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MIN, MS_PER_SEC } from '../../lib/constants';
import { POLL_INTERVAL_MS } from './constants';
import type { CountdownProps } from './types';

export function Countdown({ targetDate, onStatusChange }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
      }

      return {
        days: Math.floor(difference / MS_PER_DAY),
        hours: Math.floor((difference % MS_PER_DAY) / MS_PER_HOUR),
        minutes: Math.floor((difference % MS_PER_HOUR) / MS_PER_MIN),
        seconds: Math.floor((difference % MS_PER_MIN) / MS_PER_SEC),
        started: false,
      };
    };

    const result = calculateTimeLeft();
    setTimeLeft(result);
    setHasStarted(result.started);
    onStatusChange?.(result.started);

    const timer = setInterval(() => {
      const result = calculateTimeLeft();
      setTimeLeft(result);
      if (result.started !== hasStarted) {
        setHasStarted(result.started);
        onStatusChange?.(result.started);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [targetDate, onStatusChange, hasStarted]);

  if (hasStarted) {
    return <div className="text-emerald-400 font-medium text-sm">🔴 Live Now</div>;
  }

  return (
    <div className="flex items-center gap-3">
      {timeLeft.days > 0 && (
        <div className="text-center">
          <div className="text-2xl font-bold text-white tabular-nums">{timeLeft.days}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Days</div>
        </div>
      )}
      <div className="text-center">
        <div className="text-2xl font-bold text-white tabular-nums">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Hours</div>
      </div>
      <div className="text-gray-600 text-xl">:</div>
      <div className="text-center">
        <div className="text-2xl font-bold text-white tabular-nums">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Min</div>
      </div>
      <div className="text-gray-600 text-xl">:</div>
      <div className="text-center">
        <div className="text-2xl font-bold text-rose-400 tabular-nums animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Sec</div>
      </div>
    </div>
  );
}
