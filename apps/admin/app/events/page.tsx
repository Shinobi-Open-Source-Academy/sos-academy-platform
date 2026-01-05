'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { isAuthenticated } from '../../lib/auth';
import Sidebar from '../components/Sidebar';

export const dynamic = 'force-dynamic';

interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  eventType: string;
  meetingLink?: string;
  location?: string;
  organizer?: { name: string };
  community?: { name: string };
}

type TabType = 'upcoming' | 'past' | 'all';

const EVENT_TYPE_LABELS: Record<string, string> = {
  WEEKLY_CALL: 'Weekly Call',
  PROJECT_REVIEW: 'Project Review',
  MENTORSHIP_SESSION: 'Mentorship',
  MENTOR_1V1: '1v1 Session',
  COMMUNITY_MEETING: 'Community',
  SPECIAL_EVENT: 'Special Event',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  WEEKLY_CALL: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  PROJECT_REVIEW: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  MENTORSHIP_SESSION: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  MENTOR_1V1: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  COMMUNITY_MEETING: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  SPECIAL_EVENT: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
};

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    fetchEvents();
  }, [mounted, router]);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get<CalendarEvent[]>('/calendar/events');
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/calendar/events/${id}`);
      setDeleteConfirm(null);
      await fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  };

  const getInviteLink = async (id: string) => {
    try {
      const response = await apiClient.get<{ googleCalendarLink: string; icalLink: string }>(
        `/calendar/events/${id}/invite-link`
      );
      const link = response.data?.googleCalendarLink;
      if (link) {
        window.open(link, '_blank');
      }
    } catch (error) {
      console.error('Failed to get invite link:', error);
    }
  };

  const now = new Date();

  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.startTime);
      if (activeTab === 'upcoming') return eventDate >= now;
      if (activeTab === 'past') return eventDate < now;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return activeTab === 'past' ? dateB - dateA : dateA - dateB;
    });

  const upcomingCount = events.filter((e) => new Date(e.startTime) >= now).length;
  const pastCount = events.filter((e) => new Date(e.startTime) < now).length;

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatEventTime = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  const isEventToday = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    return eventDate.toDateString() === now.toDateString();
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-zinc-400 text-sm">Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Events</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage community events and meetings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchEvents}
              className="btn-secondary flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Refresh
            </button>
            <Link href="/events/new" className="btn-primary flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Event
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`tab ${activeTab === 'upcoming' ? 'tab-active' : ''}`}
          >
            Upcoming
            {upcomingCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/10">{upcomingCount}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`tab ${activeTab === 'past' ? 'tab-active' : ''}`}
          >
            Past
            {pastCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/10">{pastCount}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
          >
            All Events
          </button>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="card p-12 text-center">
            <svg
              className="w-12 h-12 text-zinc-700 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <p className="text-zinc-400 mb-4">
              {activeTab === 'upcoming'
                ? 'No upcoming events scheduled'
                : activeTab === 'past'
                  ? 'No past events'
                  : 'No events created yet'}
            </p>
            <Link href="/events/new" className="btn-primary inline-flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Event
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event, index) => (
              <div
                key={event._id}
                className="card p-5 animate-fade-in group"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-start gap-5">
                  {/* Date Column */}
                  <div className="w-20 flex-shrink-0 text-center">
                    <div
                      className={`text-2xl font-semibold ${isEventToday(event.startTime) ? 'text-emerald-400' : 'text-white'}`}
                    >
                      {new Date(event.startTime).getDate()}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase">
                      {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    {isEventToday(event.startTime) && (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                          Today
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-white truncate">{event.title}</h3>
                          <span
                            className={`badge ${EVENT_TYPE_COLORS[event.eventType] || 'badge-neutral'}`}
                          >
                            {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                          </span>
                        </div>

                        {event.description && (
                          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                          <div className="flex items-center gap-2 text-zinc-500">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {formatEventTime(event.startTime, event.endTime)}
                          </div>

                          {event.community ? (
                            <div className="flex items-center gap-2 text-zinc-500">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                />
                              </svg>
                              {event.community.name}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-zinc-500">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                                />
                              </svg>
                              Academy-Wide
                            </div>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-2 text-zinc-500">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                />
                              </svg>
                              {event.location}
                            </div>
                          )}
                        </div>

                        {event.meetingLink && (
                          <div className="mt-3">
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                />
                              </svg>
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => getInviteLink(event._id)}
                          className="btn-secondary px-3 py-1.5 text-xs"
                          title="Add to Calendar"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                            />
                          </svg>
                        </button>
                        {deleteConfirm === event._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(event._id)}
                              className="btn-danger px-3 py-1.5 text-xs"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(null)}
                              className="btn-secondary px-3 py-1.5 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(event._id)}
                            className="btn-ghost px-2 py-1.5 text-zinc-500 hover:text-red-400"
                            title="Delete Event"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
