'use client';

import { useEffect, useState } from 'react';
import { getUpcomingEvents, type UpcomingEvent } from '../lib/api-client';
import { CalendarIcon, CheckIcon, ClockIcon, CopyIcon, UsersIcon, WhatsAppIcon } from './icons';
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

  return <span className="text-xs text-zinc-600 flex-shrink-0 cursor-not-allowed">Join →</span>;
}

interface ShareButtonsProps {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
}

function ShareButtons({ title, description, startTime, endTime, meetingLink }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Close calendar dropdown when clicking outside
  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutside = () => setShowCalendar(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showCalendar]);

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

  const getGoogleCalendarUrl = () => {
    const start = new Date(startTime).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(endTime).toISOString().replace(/-|:|\.\d+/g, '');

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', title);
    url.searchParams.append('dates', `${start}/${end}`);
    if (description) url.searchParams.append('details', description);
    if (meetingLink) url.searchParams.append('location', meetingLink);

    return url.toString();
  };

  const downloadIcs = () => {
    const start = new Date(startTime).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(endTime).toISOString().replace(/-|:|\.\d+/g, '');

    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      description ? `DESCRIPTION:${description}` : '',
      meetingLink ? `LOCATION:${meetingLink}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2 relative">
      <button
        type="button"
        onClick={shareOnWhatsApp}
        className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors"
        title="Share on WhatsApp"
      >
        <WhatsAppIcon className="w-4 h-4" />
      </button>

      {/* Calendar Button */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowCalendar(!showCalendar);
          }}
          className={`p-2 rounded transition-colors ${showCalendar ? 'text-white bg-white/10' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
          title="Add to Calendar"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>

        {showCalendar && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 z-50 animate-[fadeIn_0.1s_ease-out] backdrop-blur-xl">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <title>Google Calendar</title>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google Calendar
            </a>
            <button
              type="button"
              onClick={downloadIcs}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <title>Download</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download .ICS
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={copyLink}
        className={`p-2 rounded transition-colors ${copied ? 'text-green-500 bg-green-500/10' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
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
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {formatEventDate(featuredEvent.startTime)}
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {formatEventTime(featuredEvent.startTime, featuredEvent.endTime)}
                </div>
                {featuredEvent.community && (
                  <div className="flex items-center gap-1.5">
                    <UsersIcon className="w-3.5 h-3.5" />
                    {featuredEvent.community.name}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
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
                  endTime={featuredEvent.endTime}
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
                <SmallEventJoinButton meetingLink={event.meetingLink} startTime={event.startTime} />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
