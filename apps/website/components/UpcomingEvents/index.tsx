'use client';

import { useEffect, useState } from 'react';
import { getUpcomingEvents, type UpcomingEvent } from '../../lib/api-client';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@sos-academy/shared';
import { CalendarIcon, ClockIcon, UsersIcon } from '../icons';
import { SpotlightCard } from '@sos-academy/ui';
import { Countdown } from './Countdown';
import { MAX_EVENTS_SHOWN } from './constants';
import { EventJoinButton, SmallEventJoinButton } from './EventJoinButton';
import { ShareButtons } from './ShareButtons';
import { formatEventDate, formatEventTime, isEventToday } from './utils';

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

  const featuredEvent = events.find((e) => e.isFeatured || e.eventType === 'SPECIAL_EVENT');

  return (
    <div className="mt-8 space-y-4">
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
          .slice(0, MAX_EVENTS_SHOWN)
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
