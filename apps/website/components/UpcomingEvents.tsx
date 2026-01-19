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
  onStatusChange?: (hasStarted: boolean) => void;
}

function Countdown({ targetDate, onStatusChange }: CountdownProps) {
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
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
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
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onStatusChange, hasStarted]);

  if (hasStarted) {
    return (
      <div className="text-emerald-400 font-medium text-sm">
        🔴 Live Now
      </div>
    );
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

interface EventJoinButtonProps {
  meetingLink: string;
  startTime: string;
}

function EventJoinButton({ meetingLink, startTime }: EventJoinButtonProps) {
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

function SmallEventJoinButton({ meetingLink, startTime }: EventJoinButtonProps) {
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

  return (
    <span className="text-xs text-zinc-600 flex-shrink-0 cursor-not-allowed">
      Join →
    </span>
  );
}

interface ShareButtonsProps {
  title: string;
  description?: string;
  startTime: string;
  meetingLink?: string;
}

function ShareButtons({ title, description, startTime, meetingLink }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    const date = new Date(startTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    let text = `🥷 *${title}*\n📅 ${date}`;
    if (description) {
      text += `\n\n${description}`;
    }
    if (meetingLink) {
      text += `\n\n🔗 Join here: ${meetingLink}`;
    }
    text += '\n\n— Shinobi Open-Source Academy';
    return text;
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyLink = async () => {
    if (!meetingLink) return;
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={shareOnWhatsApp}
        className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors"
        title="Share on WhatsApp"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>
      <button
        type="button"
        onClick={copyLink}
        className={`p-2 rounded transition-colors ${copied ? 'text-green-500 bg-green-500/10' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
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
              <div className="flex items-center gap-2">
                {featuredEvent.meetingLink && (
                  <EventJoinButton
                    meetingLink={featuredEvent.meetingLink}
                    startTime={featuredEvent.startTime}
                  />
                )}
                <ShareButtons
                  title={featuredEvent.title}
                  description={featuredEvent.description}
                  startTime={featuredEvent.startTime}
                  meetingLink={featuredEvent.meetingLink}
                />
              </div>
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
                <SmallEventJoinButton
                  meetingLink={event.meetingLink}
                  startTime={event.startTime}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
