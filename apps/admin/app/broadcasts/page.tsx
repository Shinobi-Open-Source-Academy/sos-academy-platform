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

interface Broadcast {
  _id: string;
  subject: string;
  message: string;
  recipientType: RecipientType;
  communitySlug?: string;
  sentCount: number;
  scheduled: boolean;
  completed: boolean;
  sentAt?: string;
  createdAt: string;
  eventTitle?: string;
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

  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<RecipientType>('ALL_USERS');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [inactiveDays, setInactiveDays] = useState('30');
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
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
        if (eventStartTime) payload.eventStartTime = eventStartTime;
        if (eventEndTime) payload.eventEndTime = eventEndTime;
        if (eventMeetingLink) payload.eventMeetingLink = eventMeetingLink;
        if (eventDescription) payload.eventDescription = eventDescription;
      }

      if (scheduledAt) {
        payload.scheduledAt = scheduledAt;
      }

      const response = await apiClient.post<{ sent: number; scheduled: boolean; id: string }>(
        '/broadcast',
        payload
      );
      toast.success(`Broadcast sent to ${response.data?.sent || 0} recipients`);
      resetForm();
      setShowForm(false);
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
    setEventEndTime('');
    setEventMeetingLink('');
    setEventDescription('');
    setScheduledAt('');
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleRetrigger = async (id: string) => {
    setRetriggering(id);
    try {
      const response = await apiClient.post<{ sent: number; scheduled: boolean; id: string }>(
        `/broadcast/${id}/retrigger`
      );
      toast.success(`Broadcast resent to ${response.data?.sent || 0} recipients`);
      await fetchBroadcasts();
    } catch (error: any) {
      console.error('Failed to retrigger broadcast:', error);
      toast.error(error.response?.data?.message || 'Failed to retrigger broadcast');
    } finally {
      setRetriggering(null);
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
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="input"
                  />
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
                            <span>Sent: {broadcast.sentCount} recipients</span>
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
                          </div>
                        </div>
                        <button
                          onClick={() => handleRetrigger(broadcast._id)}
                          disabled={retriggering === broadcast._id}
                          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          type="button"
                        >
                          {retriggering === broadcast._id ? 'Resending...' : 'Retrigger'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
