'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../../lib/api-client';
import { isAuthenticated } from '../../lib/auth';
import Sidebar from '../components/Sidebar';

export const dynamic = 'force-dynamic';

interface Community {
  _id: string;
  name: string;
  slug: string;
}

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
}

type RecipientType = 'ALL_USERS' | 'COMMUNITY' | 'MENTORS' | 'INACTIVE_USERS' | 'SPECIFIC_USERS';

const DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

interface Broadcast {
  _id: string;
  subject: string;
  message: string;
  recipientType: RecipientType;
  communitySlug?: string;
  userIds?: string[];
  inactiveDays?: string;
  sentCount: number;
  totalRecipients?: number;
  scheduled: boolean;
  completed: boolean;
  sentAt?: string;
  createdAt: string;
  eventTitle?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventMeetingLink?: string;
  eventDescription?: string;
}

export default function BroadcastsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retriggering, setRetriggering] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [retriggerModal, setRetriggerModal] = useState<Broadcast | null>(null);
  const [sendingBroadcastId, setSendingBroadcastId] = useState<string | null>(null);

  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<RecipientType>('ALL_USERS');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [inactiveDays, setInactiveDays] = useState('30');
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventDuration, setEventDuration] = useState('30');
  const [eventMeetingLink, setEventMeetingLink] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    fetchCommunities();
    fetchBroadcasts();
    if (recipientType === 'SPECIFIC_USERS') {
      fetchUsers();
    }
  }, [mounted, router, recipientType]);

  // Poll for broadcast progress if there's a sending broadcast
  useEffect(() => {
    if (!sendingBroadcastId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await apiClient.get<Broadcast>(`/broadcast/${sendingBroadcastId}`);
        const broadcast = response.data;

        // Update the broadcast in the list
        setBroadcasts((prev) =>
          prev.map((b) => (b._id === sendingBroadcastId ? broadcast : b))
        );

        // If completed, show final toast and stop polling
        if (broadcast.completed) {
          clearInterval(pollInterval);
          setSendingBroadcastId(null);
          toast.success(
            `Broadcast completed! Sent to ${broadcast.sentCount} of ${broadcast.totalRecipients || broadcast.sentCount} recipients`
          );
        }
      } catch (error) {
        console.error('Failed to poll broadcast status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [sendingBroadcastId]);

  const fetchCommunities = async () => {
    try {
      const response = await apiClient.get<Community[]>('/communities');
      setCommunities(response.data || []);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get<{ users: User[] }>('/users/admin/users?limit=100');
      setUsers(response.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const response = await apiClient.get<Broadcast[]>('/broadcast?limit=50');
      setBroadcasts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        subject,
        message,
        recipientType,
      };

      if (recipientType === 'COMMUNITY' && selectedCommunity) {
        const community = communities.find((c) => c._id === selectedCommunity);
        if (community) {
          payload.communitySlug = community.slug;
        }
      }

      if (recipientType === 'SPECIFIC_USERS' && selectedUserIds.length > 0) {
        payload.userIds = selectedUserIds;
      }

      if (recipientType === 'INACTIVE_USERS') {
        payload.inactiveDays = inactiveDays;
      }

      if (eventTitle) {
        payload.eventTitle = eventTitle;
        if (eventStartTime) {
          payload.eventStartTime = new Date(eventStartTime).toISOString();
        }
        if (eventDuration) {
          payload.eventDuration = eventDuration;
        }
        if (eventMeetingLink) payload.eventMeetingLink = eventMeetingLink;
        if (eventDescription) payload.eventDescription = eventDescription;
      }

      if (scheduledAt) {
        payload.scheduledAt = scheduledAt;
      }

      const response = await apiClient.post<{
        sent: number;
        scheduled: boolean;
        id: string;
        totalRecipients: number;
      }>('/broadcast', payload);

      // Hide form immediately and show initial toast
      resetForm();
      setShowForm(false);
      setSendingBroadcastId(response.data?.id || null);
      toast.success(`Broadcast queued! Sending to ${response.data?.totalRecipients || 0} recipients...`);

      // Refresh broadcasts list
      await fetchBroadcasts();
    } catch (error: any) {
      console.error('Failed to send broadcast:', error);
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubject('');
    setMessage('');
    setRecipientType('ALL_USERS');
    setSelectedCommunity('');
    setSelectedUserIds([]);
    setInactiveDays('30');
    setEventTitle('');
    setEventStartTime('');
    setEventDuration('30');
    setEventMeetingLink('');
    setEventDescription('');
    setScheduledAt('');
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const openRetriggerModal = async (broadcast: Broadcast) => {
    // Pre-fill form with broadcast data
    setSubject(broadcast.subject);
    setMessage(broadcast.message);
    setRecipientType(broadcast.recipientType);

    // Find community by slug if needed
    if (broadcast.recipientType === 'COMMUNITY' && broadcast.communitySlug) {
      const community = communities.find((c) => c.slug === broadcast.communitySlug);
      if (community) {
        setSelectedCommunity(community._id);
      }
    }

    if (broadcast.userIds) {
      setSelectedUserIds(broadcast.userIds);
    }

    if (broadcast.inactiveDays) {
      setInactiveDays(broadcast.inactiveDays);
    }

    if (broadcast.eventTitle) {
      setEventTitle(broadcast.eventTitle);
    }

    if (broadcast.eventStartTime) {
      // Convert ISO string to datetime-local format
      const startDate = new Date(broadcast.eventStartTime);
      setEventStartTime(startDate.toISOString().slice(0, 16));
    }

    if (broadcast.eventDuration) {
      setEventDuration(broadcast.eventDuration);
    } else if (broadcast.eventStartTime && broadcast.eventEndTime) {
      // Calculate duration from start and end times for backward compatibility
      const start = new Date(broadcast.eventStartTime);
      const end = new Date(broadcast.eventEndTime);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      if (durationMinutes > 0) {
        setEventDuration(String(durationMinutes));
      }
    }

    if (broadcast.eventMeetingLink) {
      setEventMeetingLink(broadcast.eventMeetingLink);
    }

    if (broadcast.eventDescription) {
      setEventDescription(broadcast.eventDescription);
    }

    // Fetch users if needed for SPECIFIC_USERS
    if (broadcast.recipientType === 'SPECIFIC_USERS') {
      await fetchUsers();
    }

    setRetriggerModal(broadcast);
    setShowForm(false);
  };

  const closeRetriggerModal = () => {
    setRetriggerModal(null);
    resetForm();
  };

  const handleRetriggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retriggerModal) return;

    setRetriggering(retriggerModal._id);
    setLoading(true);

    try {
      const payload: any = {
        subject,
        message,
        recipientType,
      };

      if (recipientType === 'COMMUNITY' && selectedCommunity) {
        const community = communities.find((c) => c._id === selectedCommunity);
        if (community) {
          payload.communitySlug = community.slug;
        }
      }

      if (recipientType === 'SPECIFIC_USERS' && selectedUserIds.length > 0) {
        payload.userIds = selectedUserIds;
      }

      if (recipientType === 'INACTIVE_USERS') {
        payload.inactiveDays = inactiveDays;
      }

      if (eventTitle) {
        payload.eventTitle = eventTitle;
        if (eventStartTime) {
          payload.eventStartTime = new Date(eventStartTime).toISOString();
        }
        if (eventDuration) {
          payload.eventDuration = eventDuration;
        }
        if (eventMeetingLink) payload.eventMeetingLink = eventMeetingLink;
        if (eventDescription) payload.eventDescription = eventDescription;
      }

      const response = await apiClient.post<{
        sent: number;
        scheduled: boolean;
        id: string;
        totalRecipients: number;
      }>(`/broadcast/${retriggerModal._id}/retrigger`, payload);

      // Hide modal immediately and show initial toast
      closeRetriggerModal();
      setSendingBroadcastId(response.data?.id || null);
      toast.success(`Broadcast queued! Sending to ${response.data?.totalRecipients || 0} recipients...`);

      // Refresh broadcasts list
      await fetchBroadcasts();
    } catch (error: any) {
      console.error('Failed to retrigger broadcast:', error);
      toast.error(error.response?.data?.message || 'Failed to retrigger broadcast');
    } finally {
      setRetriggering(null);
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getRecipientLabel = (broadcast: Broadcast) => {
    switch (broadcast.recipientType) {
      case 'ALL_USERS':
        return 'All Active Users';
      case 'COMMUNITY':
        return broadcast.communitySlug ? `Community: ${broadcast.communitySlug}` : 'Community';
      case 'MENTORS':
        return 'All Mentors';
      case 'INACTIVE_USERS':
        return 'Inactive Users';
      case 'SPECIFIC_USERS':
        return 'Specific Users';
      default:
        return broadcast.recipientType;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-zinc-400 text-sm">Loading...</span>
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
            <h1 className="text-2xl font-semibold text-white tracking-tight">Broadcasts</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Send messages and event notifications to users
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ New Broadcast'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card p-6" style={{ marginBottom: '2rem' }}>
            <h2 className="text-xl font-semibold text-white mb-6">Create Broadcast</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input"
                placeholder="e.g., Weekly Community Call Reminder"
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input"
                rows={6}
                placeholder="Enter your message here. HTML is supported."
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Recipients *
              </label>
              <select
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value as RecipientType)}
                className="select"
                required
              >
                <option value="ALL_USERS">All Active Users</option>
                <option value="COMMUNITY">Specific Community</option>
                <option value="MENTORS">All Mentors</option>
                <option value="INACTIVE_USERS">Inactive Users</option>
                <option value="SPECIFIC_USERS">Specific Users</option>
              </select>
            </div>

            {recipientType === 'COMMUNITY' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Select Community *
                </label>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="select"
                  required
                >
                  <option value="">Choose a community...</option>
                  {communities.map((community) => (
                    <option key={community._id} value={community._id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {recipientType === 'INACTIVE_USERS' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Days of Inactivity *
                </label>
                <input
                  type="number"
                  value={inactiveDays}
                  onChange={(e) => setInactiveDays(e.target.value)}
                  className="input"
                  min="1"
                  required
                />
                <small style={{ color: '#9e9e9e', display: 'block', marginTop: '0.5rem' }}>
                  Users inactive for this many days or more
                </small>
              </div>
            )}

            {recipientType === 'SPECIFIC_USERS' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Select Users *
                </label>
                <div
                  style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '0.5rem',
                  }}
                >
                  {users.map((user) => (
                    <label
                      key={user._id || user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user._id || user.id || '')}
                        onChange={() => toggleUserSelection(user._id || user.id || '')}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <span>
                        {user.name} ({user.email})
                      </span>
                    </label>
                  ))}
                </div>
                {selectedUserIds.length > 0 && (
                  <small style={{ color: '#9e9e9e', display: 'block', marginTop: '0.5rem' }}>
                    {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
                  </small>
                )}
              </div>
            )}

            <div
              style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e9ecef' }}
            >
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Event Details (Optional)</h3>

              <div style={{ marginBottom: '1rem' }}>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="input"
                  placeholder="e.g., Weekly Community Call"
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Duration
                  </label>
                  <div className="flex gap-2">
                    {DURATIONS.map((dur) => (
                      <label
                        key={dur.value}
                        className={`
                          flex-1 cursor-pointer transition-all text-center py-3 px-4 border
                          ${
                            eventDuration === String(dur.value)
                              ? 'border-white bg-white text-black font-medium'
                              : 'border-white/[0.06] bg-[#111] text-zinc-400 hover:border-white/20 hover:text-white'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="eventDuration"
                          value={dur.value}
                          checked={eventDuration === String(dur.value)}
                          onChange={(e) => setEventDuration(e.target.value)}
                          className="sr-only"
                        />
                        {dur.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={eventMeetingLink}
                  onChange={(e) => setEventMeetingLink(e.target.value)}
                  className="input"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Event Description
                </label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Additional details about the event..."
                />
              </div>
            </div>

            <div
              style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e9ecef' }}
            >
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Schedule Send (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="input"
              />
              <small style={{ color: '#9e9e9e', display: 'block', marginTop: '0.5rem' }}>
                Leave empty to send immediately
              </small>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending...' : scheduledAt ? 'Schedule Broadcast' : 'Send Broadcast'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Reset
              </button>
            </div>
          </form>
        )}

        {!showForm && (
          <>
            <div className="card p-6 mb-6">
              <p className="text-zinc-400 text-sm">
                Use broadcasts to send important messages, reminders, and event notifications to
                selected groups of users. Recipients will receive emails with calendar links if
                event details are provided.
              </p>
            </div>

            {/* Recent Broadcasts */}
            <div className="card">
              <div className="p-6 border-b border-white/[0.06]">
                <h2 className="text-lg font-semibold text-white">Recent Broadcasts</h2>
              </div>
              {broadcasts.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-zinc-500 text-sm">
                    No broadcasts yet. Create your first broadcast above.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {broadcasts.map((broadcast) => (
                    <div
                      key={broadcast._id}
                      className="p-6 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-semibold text-white">
                              {broadcast.subject}
                            </h3>
                            {broadcast.eventTitle && (
                              <span className="badge-info text-xs">
                                Event: {broadcast.eventTitle}
                              </span>
                            )}
                          </div>
                          <p
                            className="text-zinc-400 text-sm mb-3"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {broadcast.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                            <span>To: {getRecipientLabel(broadcast)}</span>
                            <span>•</span>
                            {broadcast.completed ? (
                              <span>Sent: {broadcast.sentCount} recipients</span>
                            ) : broadcast.totalRecipients ? (
                              <span className="text-blue-400">
                                Sending: {broadcast.sentCount} / {broadcast.totalRecipients}
                              </span>
                            ) : (
                              <span>Sent: {broadcast.sentCount} recipients</span>
                            )}
                            <span>•</span>
                            <span>
                              {broadcast.sentAt
                                ? formatDate(broadcast.sentAt)
                                : formatDate(broadcast.createdAt)}
                            </span>
                            {broadcast.completed && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400">Completed</span>
                              </>
                            )}
                            {!broadcast.completed && broadcast.totalRecipients && (
                              <>
                                <span>•</span>
                                <span className="text-blue-400 flex items-center gap-1">
                                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent animate-spin" />
                                  Sending...
                                </span>
                              </>
                            )}
                          </div>
                          {!broadcast.completed && broadcast.totalRecipients && broadcast.totalRecipients > 0 && (
                            <div className="mt-2">
                              <div className="w-full bg-zinc-800 h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 transition-all duration-300"
                                  style={{
                                    width: `${Math.min((broadcast.sentCount / broadcast.totalRecipients) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => openRetriggerModal(broadcast)}
                          disabled={retriggering === broadcast._id || !broadcast.completed}
                          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          type="button"
                        >
                          Retrigger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Retrigger Modal */}
        {retriggerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h2 className="text-lg font-semibold text-white">Retrigger Broadcast</h2>
                <button
                  type="button"
                  onClick={closeRetriggerModal}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <title>Close</title>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRetriggerSubmit} className="p-6">
                <p className="text-zinc-400 text-sm mb-6">
                  Update the broadcast details below. Only changed fields will be updated.
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input"
                    placeholder="e.g., Weekly Community Call Reminder"
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input"
                    rows={6}
                    placeholder="Enter your message here. HTML is supported."
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Recipients *
                  </label>
                  <select
                    value={recipientType}
                    onChange={async (e) => {
                      const newType = e.target.value as RecipientType;
                      setRecipientType(newType);
                      // Reset dependent fields when changing recipient type
                      setSelectedCommunity('');
                      setSelectedUserIds([]);
                      setInactiveDays('30');
                      // Fetch users if switching to SPECIFIC_USERS
                      if (newType === 'SPECIFIC_USERS') {
                        await fetchUsers();
                      }
                    }}
                    className="select"
                    required
                  >
                    <option value="ALL_USERS">All Active Users</option>
                    <option value="COMMUNITY">Specific Community</option>
                    <option value="MENTORS">All Mentors</option>
                    <option value="INACTIVE_USERS">Inactive Users</option>
                    <option value="SPECIFIC_USERS">Specific Users</option>
                  </select>
                </div>

                {recipientType === 'COMMUNITY' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Select Community *
                    </label>
                    <select
                      value={selectedCommunity}
                      onChange={(e) => setSelectedCommunity(e.target.value)}
                      className="select"
                      required
                    >
                      <option value="">Choose a community...</option>
                      {communities.map((community) => (
                        <option key={community._id} value={community._id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {recipientType === 'INACTIVE_USERS' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Days of Inactivity *
                    </label>
                    <input
                      type="number"
                      value={inactiveDays}
                      onChange={(e) => setInactiveDays(e.target.value)}
                      className="input"
                      min="1"
                      required
                    />
                    <small style={{ color: '#9e9e9e', display: 'block', marginTop: '0.5rem' }}>
                      Users inactive for this many days or more
                    </small>
                  </div>
                )}

                {recipientType === 'SPECIFIC_USERS' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Select Users *
                    </label>
                    <div
                      style={{
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        padding: '0.5rem',
                      }}
                    >
                      {users.map((user) => (
                        <label
                          key={user._id || user.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.5rem',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user._id || user.id || '')}
                            onChange={() => toggleUserSelection(user._id || user.id || '')}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span>
                            {user.name} ({user.email})
                          </span>
                        </label>
                      ))}
                    </div>
                    {selectedUserIds.length > 0 && (
                      <small style={{ color: '#9e9e9e', display: 'block', marginTop: '0.5rem' }}>
                        {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''}{' '}
                        selected
                      </small>
                    )}
                  </div>
                )}

                <div
                  style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e9ecef',
                  }}
                >
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                    Event Details (Optional)
                  </h3>

                  <div style={{ marginBottom: '1rem' }}>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="input"
                      placeholder="e.g., Weekly Community Call"
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                        Duration
                      </label>
                      <div className="flex gap-2">
                        {DURATIONS.map((dur) => (
                          <label
                            key={dur.value}
                            className={`
                              flex-1 cursor-pointer transition-all text-center py-3 px-4 border
                              ${
                                eventDuration === String(dur.value)
                                  ? 'border-white bg-white text-black font-medium'
                                  : 'border-white/[0.06] bg-[#111] text-zinc-400 hover:border-white/20 hover:text-white'
                              }
                            `}
                          >
                            <input
                              type="radio"
                              name="eventDuration"
                              value={dur.value}
                              checked={eventDuration === String(dur.value)}
                              onChange={(e) => setEventDuration(e.target.value)}
                              className="sr-only"
                            />
                            {dur.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={eventMeetingLink}
                      onChange={(e) => setEventMeetingLink(e.target.value)}
                      className="input"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Event Description
                    </label>
                    <textarea
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      className="input"
                      rows={3}
                      placeholder="Additional details about the event..."
                    />
                  </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || retriggering === retriggerModal._id}
                  >
                    {loading || retriggering === retriggerModal._id
                      ? 'Sending...'
                      : 'Send Updated Broadcast'}
                  </button>
                  <button type="button" onClick={closeRetriggerModal} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
