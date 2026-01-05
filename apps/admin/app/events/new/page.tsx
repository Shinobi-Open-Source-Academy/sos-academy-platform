'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { isAuthenticated } from '../../../lib/auth';
import Sidebar from '../../components/Sidebar';

export const dynamic = 'force-dynamic';

const EVENT_TYPES = [
  { value: 'WEEKLY_CALL', label: 'Weekly Call', description: 'Regular community sync' },
  { value: 'PROJECT_REVIEW', label: 'Project Review', description: 'Review ongoing projects' },
  {
    value: 'MENTORSHIP_SESSION',
    label: 'Mentorship Session',
    description: 'Group mentoring session',
  },
  { value: 'MENTOR_1V1', label: 'Mentor 1v1', description: 'One-on-one mentoring' },
  {
    value: 'COMMUNITY_MEETING',
    label: 'Community Meeting',
    description: 'General community discussion',
  },
  { value: 'SPECIAL_EVENT', label: 'Special Event', description: 'Workshops, talks, etc.' },
];

const DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

const getLocalTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  const sign = offset <= 0 ? '+' : '-';
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  // biome-ignore lint/suspicious/noExplicitAny: no needed
  const [communities, setCommunities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
    eventType: 'WEEKLY_CALL',
    meetingLink: '',
    location: '',
    organizer: '',
    community: '',
    isFeatured: false,
  });

  const timezone = useMemo(() => getLocalTimezone(), []);
  const timezoneOffset = useMemo(() => getTimezoneOffset(), []);

  // Calculate end time for preview (must be before early return to follow hooks rules)
  const endTimePreview = useMemo(() => {
    if (!formData.date || !formData.time) {
      return null;
    }
    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000);
      return endDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return null;
    }
  }, [formData.date, formData.time, formData.duration]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    setAuthChecked(true);

    const fetchCommunities = async () => {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: no needed
        const response = await apiClient.get<any[]>('/communities');
        setCommunities(response.data || []);
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      }
    };

    fetchCommunities();
  }, [mounted, router]);

  if (!mounted || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-zinc-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time into start time
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000);

      const eventData = {
        title: formData.title,
        description: formData.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        eventType: formData.eventType,
        meetingLink: formData.meetingLink,
        location: formData.location,
        organizer: '000000000000000000000000',
        community: formData.community || undefined,
        isFeatured: formData.isFeatured,
      };

      await apiClient.post('/calendar/events', eventData);
      router.push('/events');
      // biome-ignore lint/suspicious/noExplicitAny: not needed
    } catch (error: any) {
      console.error('Failed to create event:', error);
      alert(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'duration' ? Number(value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/events" className="text-zinc-500 hover:text-white transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <title>Arrow Left</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Create Event</h1>
          </div>
          <p className="text-zinc-500 text-sm">Schedule a new community event or meeting</p>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-5">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="title">
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Weekly Standup Call"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-zinc-300 mb-2"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input resize-none"
                  placeholder="What's this event about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3" htmlFor="eventType">
                  Event Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EVENT_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`
                        card p-4 cursor-pointer transition-all
                        ${
                          formData.eventType === type.value
                            ? 'border-white/30 bg-white/[0.04]'
                            : 'hover:bg-white/[0.02]'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="eventType"
                        value={type.value}
                        checked={formData.eventType === type.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          w-4 h-4 border flex items-center justify-center
                          ${formData.eventType === type.value ? 'border-white bg-white' : 'border-zinc-600'}
                        `}
                        >
                          {formData.eventType === type.value && (
                            <svg
                              className="w-3 h-3 text-black"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <title>Checkmark</title>
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{type.label}</p>
                          <p className="text-xs text-zinc-500">{type.description}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Date & Time
                </h2>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <title>Clock</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                  <span className="mono">{timezone}</span>
                  <span className="text-zinc-600">({timezoneOffset})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="date">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="time">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    id="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3" htmlFor="duration">
                  Duration
                </label>
                <div className="flex gap-2">
                  {DURATIONS.map((dur) => (
                    <label
                      key={dur.value}
                      className={`
                        flex-1 cursor-pointer transition-all text-center py-3 px-4 border
                        ${
                          formData.duration === dur.value
                            ? 'border-white bg-white text-black font-medium'
                            : 'border-white/[0.06] bg-[#111] text-zinc-400 hover:border-white/20 hover:text-white'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="duration"
                        value={dur.value}
                        checked={formData.duration === dur.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {dur.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Preview */}
              {formData.date && formData.time && (
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06]">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <title>Clock</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm">
                    <span className="text-zinc-400">Event will run from </span>
                    <span className="text-white font-medium">
                      {new Date(`${formData.date}T${formData.time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                    <span className="text-zinc-400"> to </span>
                    <span className="text-white font-medium">{endTimePreview}</span>
                    <span className="text-zinc-400"> on </span>
                    <span className="text-white font-medium">
                      {new Date(`${formData.date}T${formData.time}`).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-5">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Location
              </h2>

              <div>
                <label
                  className="block text-sm font-medium text-zinc-300 mb-2"
                  htmlFor="meetingLink"
                >
                  Meeting Link
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <title>Link</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                  <input
                    type="url"
                    name="meetingLink"
                    id="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="location">
                  Physical Location
                  <span className="text-zinc-600 font-normal ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <title>Location</title>
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
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Online / Physical address"
                  />
                </div>
              </div>
            </div>

            {/* Community */}
            <div className="space-y-5">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Scope</h2>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="community">
                  Community
                </label>
                <select
                  name="community"
                  id="community"
                  value={formData.community}
                  onChange={handleChange}
                  className="select"
                >
                  <option value="">Academy-Wide Event</option>
                  {communities.map((community) => (
                    <option key={community._id} value={community._id}>
                      {community.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-600 mt-2">
                  Leave empty to make this event available to all academy members
                </p>
              </div>

              {/* Featured Event */}
              <div className="pt-4 border-t border-white/[0.06]">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 accent-rose-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                      Featured Event
                    </span>
                    <p className="text-xs text-zinc-600 mt-1">
                      Featured events show a countdown timer on the website and are highlighted
                      prominently. Best for special events like workshops, launches, or major
                      community gatherings.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Event'
                )}
              </button>
              <Link href="/events" className="btn-secondary px-6">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
