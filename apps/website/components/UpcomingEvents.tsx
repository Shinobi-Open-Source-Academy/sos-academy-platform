'use client';

import { useEffect, useState } from 'react';
import { getUpcomingEvents, type UpcomingEvent } from '../lib/api-client';
import SpotlightCard from './SpotlightCard';

const EVENT_TYPE_COLORS: Record<string, string> = {
  WEEKLY_CALL: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  PROJECT_REVIEW: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  MENTORSHIP_SESSION: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  MENTOR_1V1: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  COMMUNITY_MEETING: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  SPECIAL_EVENT: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  WEEKLY_CALL: 'Weekly Call',
  PROJECT_REVIEW: 'Project Review',
  MENTORSHIP_SESSION: 'Mentorship',
  MENTOR_1V1: '1v1 Session',
  COMMUNITY_MEETING: 'Community',
  SPECIAL_EVENT: 'Special Event',
};

interface CountdownProps {
  targetDate: Date;
}

function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

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

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatEventTime(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

function isEventToday(dateStr: string) {
  const eventDate = new Date(dateStr);
  const now = new Date();
  return eventDate.toDateString() === now.toDateString();
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getUpcomingEvents();
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 p-6 border border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
          <div className="h-4 w-32 bg-white/5 animate-pulse" />
        </div>
        <div className="h-4 w-64 bg-white/5 animate-pulse mt-2" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="mt-8 p-6 border border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="text-sm font-semibold">Weekly Community Calls</h3>
        </div>
        <p className="text-sm text-gray-400">
          Each community hosts weekly calls where members discuss projects and get guidance from
          mentors. Check back soon for upcoming events!
        </p>
      </div>
    );
  }

  // Find featured event (usually SPECIAL_EVENT with isFeatured flag)
  const featuredEvent = events.find((e) => e.isFeatured || e.eventType === 'SPECIAL_EVENT');

  return (
    <div className="mt-8 space-y-4">
      {/* Featured Event with Countdown */}
      {featuredEvent && (
        <SpotlightCard className="border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent p-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span
                  className={`text-xs px-2 py-0.5 border ${EVENT_TYPE_COLORS[featuredEvent.eventType] || 'border-white/10 text-gray-400'}`}
                >
                  {EVENT_TYPE_LABELS[featuredEvent.eventType] || featuredEvent.eventType}
                </span>
                {isEventToday(featuredEvent.startTime) && (
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Today
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{featuredEvent.title}</h3>
              {featuredEvent.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {featuredEvent.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                  {formatEventDate(featuredEvent.startTime)}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatEventTime(featuredEvent.startTime, featuredEvent.endTime)}
                </div>
                {featuredEvent.community && (
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                      />
                    </svg>
                    {featuredEvent.community.name}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Starts in</div>
              <Countdown targetDate={new Date(featuredEvent.startTime)} />
              {featuredEvent.meetingLink && (
                <a
                  href={featuredEvent.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 px-4 py-2 bg-white text-black text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  Join Event →
                </a>
              )}
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* Regular Upcoming Events */}
      <div className="border border-white/5 bg-white/[0.02] divide-y divide-white/5">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-sm font-semibold">Upcoming Events</h3>
          </div>
          <span className="text-xs text-gray-500">{events.length} scheduled</span>
        </div>
        {events
          .filter((e) => e._id !== featuredEvent?._id)
          .slice(0, 4)
          .map((event, index) => (
            <div
              key={event._id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors animate-[fadeInUp_0.4s_ease-out]"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-center flex-shrink-0 w-12">
                  <div
                    className={`text-lg font-semibold ${isEventToday(event.startTime) ? 'text-emerald-400' : 'text-white'}`}
                  >
                    {new Date(event.startTime).getDate()}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">
                    {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{event.title}</h4>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 border flex-shrink-0 ${EVENT_TYPE_COLORS[event.eventType] || 'border-white/10 text-gray-400'}`}
                    >
                      {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatEventTime(event.startTime, event.endTime)}</span>
                    {event.community && <span>• {event.community.name}</span>}
                  </div>
                </div>
              </div>
              {event.meetingLink && (
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  Join →
                </a>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
