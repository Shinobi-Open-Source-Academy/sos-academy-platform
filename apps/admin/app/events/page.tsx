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
  organizer?: { name: string };
  community?: { name: string };
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchEvents();
  }, [router]);

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
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await apiClient.delete(`/calendar/events/${id}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Events</h2>
            <p className="text-gray-400 mt-1">Manage community events and meetings</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchEvents}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>🔄</span>
              Refresh
            </button>
            <Link
              href="/events/new"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>+</span>
              Create Event
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg border border-gray-700/50 text-center">
            <p className="text-gray-400">No events created yet</p>
            <Link
              href="/events/new"
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                    {event.description && <p className="text-gray-400 mt-2">{event.description}</p>}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Start:</span>{' '}
                        <span className="text-white">
                          {new Date(event.startTime).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">End:</span>{' '}
                        <span className="text-white">
                          {new Date(event.endTime).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                          {event.eventType}
                        </span>
                      </div>
                    </div>

                    {event.meetingLink && (
                      <div className="mt-3">
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-sm"
                        >
                          {event.meetingLink}
                        </a>
                      </div>
                    )}

                    {event.community && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-400">Community:</span>{' '}
                        <span className="text-white">{event.community.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => getInviteLink(event._id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      📅 Calendar Link
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(event._id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
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
