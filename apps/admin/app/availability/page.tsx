'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api-client';
import { isAuthenticated } from '../../lib/auth';
import Sidebar from '../components/Sidebar';

export const dynamic = 'force-dynamic';

interface Mentor {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

interface AvailabilitySlot {
  _id: string;
  startTime: string;
  endTime: string;
}

interface BlockedDate {
  _id: string;
  date: string;
  reason?: string;
}

interface BookedSession {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees?: { name: string; email: string }[];
}

interface PaginatedUsersResponse {
  users: Mentor[];
}

function getMentorId(mentor: Mentor): string {
  const id = mentor.id ?? mentor._id;
  if (typeof id === 'string') return id;
  if (
    id != null &&
    typeof id === 'object' &&
    typeof (id as { toString?: () => string }).toString === 'function'
  ) {
    return (id as { toString: () => string }).toString();
  }
  return '';
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function endOfWeek(date: Date) {
  const end = addDays(date, 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimeRange(start: string, end: string) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  return `${startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export default function AvailabilityPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([]);
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => startOfWeek(new Date()));
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:00');
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeSlot, setActiveSlot] = useState<AvailabilitySlot | null>(null);
  const [activeSession, setActiveSession] = useState<BookedSession | null>(null);

  const weekEndDate = useMemo(() => endOfWeek(weekStartDate), [weekStartDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i)),
    [weekStartDate]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    fetchMentors();
  }, [mounted, router]);

  useEffect(() => {
    if (!selectedMentorId) return;
    fetchAvailability();
  }, [selectedMentorId, weekStartDate]);

  const fetchMentors = async () => {
    try {
      const response = await apiClient.get<PaginatedUsersResponse>(
        '/users/admin/users?role=MENTOR&limit=100'
      );
      const data = response.data?.users ?? [];
      setMentors(data);
      if (!selectedMentorId && data.length > 0) {
        setSelectedMentorId(getMentorId(data[0]));
      }
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      toast.error('Failed to load mentors');
    }
  };

  const fetchAvailability = async () => {
    if (!selectedMentorId) return;
    setLoading(true);
    const start = weekStartDate.toISOString();
    const end = weekEndDate.toISOString();

    try {
      const [slotsResponse, blockedResponse, bookedResponse] = await Promise.all([
        apiClient.get<AvailabilitySlot[]>(
          `/calendar/availability/slots?mentorId=${selectedMentorId}&start=${start}&end=${end}`
        ),
        apiClient.get<BlockedDate[]>(
          `/calendar/availability/blocked?mentorId=${selectedMentorId}&start=${start}&end=${end}`
        ),
        apiClient.get<BookedSession[]>(
          `/calendar/availability/booked?mentorId=${selectedMentorId}&start=${start}&end=${end}`
        ),
      ]);

      setAvailabilitySlots(slotsResponse.data ?? []);
      setBlockedDates(blockedResponse.data ?? []);
      setBookedSessions(bookedResponse.data ?? []);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedMentorId) {
      toast.error('Select a mentor first');
      return;
    }

    if (!newSlotDate || !newSlotStart || !newSlotEnd) {
      toast.error('Provide date and time range');
      return;
    }

    const startTime = new Date(`${newSlotDate}T${newSlotStart}`);
    const endTime = new Date(`${newSlotDate}T${newSlotEnd}`);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      toast.error('Invalid date or time');
      return;
    }

    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/calendar/availability/slots', {
        mentorId: selectedMentorId,
        startTime,
        endTime,
      });
      toast.success('Availability slot added');
      setNewSlotDate('');

      await fetchAvailability();
    } catch (error) {
      console.error('Failed to add availability slot:', error);
      toast.error('Failed to add slot');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockDate = async () => {
    if (!selectedMentorId) {
      toast.error('Select a mentor first');
      return;
    }

    if (!blockDate) {
      toast.error('Select a date to block');
      return;
    }

    const date = new Date(`${blockDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      toast.error('Invalid date');
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/calendar/availability/blocked', {
        mentorId: selectedMentorId,
        date,
        reason: blockReason || undefined,
      });
      toast.success('Date blocked');
      setBlockDate('');
      setBlockReason('');
      await fetchAvailability();
    } catch (error) {
      console.error('Failed to block date:', error);
      toast.error('Failed to block date');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await apiClient.delete(`/calendar/availability/slots/${slotId}`);
      toast.success('Availability slot removed');
      await fetchAvailability();
    } catch (error) {
      console.error('Failed to delete slot:', error);
      toast.error('Failed to remove slot');
    }
  };

  const handleDeleteBlockedDate = async (blockedId: string) => {
    try {
      await apiClient.delete(`/calendar/availability/blocked/${blockedId}`);
      toast.success('Blocked date removed');
      await fetchAvailability();
    } catch (error) {
      console.error('Failed to delete blocked date:', error);
      toast.error('Failed to remove blocked date');
    }
  };

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return bookedSessions.filter((session) => new Date(session.startTime) >= now).slice(0, 6);
  }, [bookedSessions]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-zinc-400 text-sm">Loading availability...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Mentor Availability
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Manage weekly availability, blocked dates, and booked sessions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWeekStartDate(startOfWeek(new Date()))}
              className="btn-secondary"
            >
              This Week
            </button>
            <button type="button" onClick={fetchAvailability} className="btn-secondary">
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6">
          <div className="space-y-6">
            <div className="card p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[220px]">
                  <label className="text-xs text-zinc-500 uppercase tracking-widest">Mentor</label>
                  <select
                    className="select mt-2"
                    value={selectedMentorId}
                    onChange={(event) => setSelectedMentorId(event.target.value)}
                  >
                    {mentors.map((mentor) => {
                      const id = getMentorId(mentor);
                      return (
                        <option key={id} value={id}>
                          {mentor.name} ({mentor.email})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest">
                    date: {formatDate(weekStartDate)} - {formatDate(weekEndDate)}
                  </label>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setWeekStartDate(addDays(weekStartDate, -7))}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setWeekStartDate(addDays(weekStartDate, 7))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Add Availability Slot</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <input
                      type="date"
                      className="input"
                      value={newSlotDate}
                      onChange={(event) => setNewSlotDate(event.target.value)}
                    />
                    <input
                      type="time"
                      className="input"
                      value={newSlotStart}
                      onChange={(event) => setNewSlotStart(event.target.value)}
                    />
                    <input
                      type="time"
                      className="input"
                      value={newSlotEnd}
                      onChange={(event) => setNewSlotEnd(event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary mt-3"
                    onClick={handleAddSlot}
                    disabled={saving}
                  >
                    Add Slot
                  </button>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white">Block Date</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <input
                      type="date"
                      className="input"
                      value={blockDate}
                      onChange={(event) => setBlockDate(event.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      className="input"
                      value={blockReason}
                      onChange={(event) => setBlockReason(event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-secondary mt-3"
                    onClick={handleBlockDate}
                    disabled={saving}
                  >
                    Block Date
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDays.map((day) => {
                  const daySlots = availabilitySlots.filter((slot) =>
                    isSameDay(new Date(slot.startTime), day)
                  );
                  const dayBooked = bookedSessions.filter((session) =>
                    isSameDay(new Date(session.startTime), day)
                  );
                  const dayBlocked = blockedDates.find((blocked) =>
                    isSameDay(new Date(blocked.date), day)
                  );

                  return (
                    <div
                      key={day.toISOString()}
                      className={`rounded-lg border border-white/[0.06] p-3 min-h-[220px] ${
                        dayBlocked ? 'bg-white/[0.04]' : 'bg-[#0a0a0a]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-white font-medium">{formatDate(day)}</p>
                          <p className="text-xs text-zinc-500">{day.toLocaleDateString('en-US')}</p>
                        </div>
                        {dayBlocked && null}
                      </div>

                      <div className="space-y-2">
                        {daySlots.length === 0 && dayBooked.length === 0 && !dayBlocked && (
                          <p className="text-xs text-zinc-600">No slots</p>
                        )}

                        {daySlots.map((slot) => (
                          <div
                            key={slot._id}
                            className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 rounded-md px-2 py-1 text-xs cursor-pointer hover:border-emerald-500/60 transition-colors"
                            onClick={() => setActiveSlot(slot)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                setActiveSlot(slot);
                              }
                            }}
                          >
                            <span className="break-words">
                              {formatTimeRange(slot.startTime, slot.endTime)}
                            </span>
                          </div>
                        ))}

                        {dayBooked.map((session) => (
                          <div
                            key={session._id}
                            className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 rounded-md px-2 py-1.5 text-xs cursor-pointer hover:border-cyan-500/60 transition-colors"
                            onClick={() => setActiveSession(session)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                setActiveSession(session);
                              }
                            }}
                          >
                            <div className="font-medium">{session.title || 'Booked Session'}</div>
                            <div>{formatTimeRange(session.startTime, session.endTime)}</div>
                          </div>
                        ))}

                        {dayBlocked && dayBlocked.reason && (
                          <p className="text-[11px] text-amber-200/80 mt-2">
                            Reason: {dayBlocked.reason}
                          </p>
                        )}
                        {dayBlocked && (
                          <button
                            type="button"
                            className="btn-ghost mt-2 text-[11px]"
                            onClick={() => handleDeleteBlockedDate(dayBlocked._id)}
                          >
                            Remove Block
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-white">Upcoming Booked Sessions</h2>
              {upcomingSessions.length === 0 && (
                <p className="text-xs text-zinc-500">No upcoming sessions scheduled.</p>
              )}
              {upcomingSessions.map((session) => (
                <div
                  key={session._id}
                  className="border border-white/[0.08] rounded-lg p-3 bg-black/40"
                >
                  <div className="text-sm text-white font-medium">
                    {session.title || 'Booked Session'}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {formatTimeRange(session.startTime, session.endTime)}
                  </div>
                  {session.attendees && session.attendees.length > 0 && (
                    <div className="text-xs text-zinc-600 mt-2">
                      Attendees: {session.attendees.map((a) => a.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-white">Blocked Dates (This Week)</h2>
              {blockedDates.length === 0 && (
                <p className="text-xs text-zinc-500">No blocked dates this week.</p>
              )}
              {blockedDates.map((blocked) => (
                <div
                  key={blocked._id}
                  className="border border-amber-500/30 bg-amber-500/10 text-amber-200 rounded-md px-3 py-2 text-xs flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(blocked.date).toLocaleDateString('en-US')}
                    </div>
                    {blocked.reason && <div className="text-amber-200/70">{blocked.reason}</div>}
                  </div>
                  <button
                    type="button"
                    className="text-amber-200/70 hover:text-amber-200"
                    onClick={() => handleDeleteBlockedDate(blocked._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {(activeSlot || activeSession) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md bg-[#0b0b0b] border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {activeSlot ? 'Availability Slot' : 'Booked Session'}
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  {activeSlot
                    ? formatTimeRange(activeSlot.startTime, activeSlot.endTime)
                    : activeSession
                      ? formatTimeRange(activeSession.startTime, activeSession.endTime)
                      : ''}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => {
                  setActiveSlot(null);
                  setActiveSession(null);
                }}
              >
                Close
              </button>
            </div>

            {activeSession && (
              <div className="mt-4 space-y-3 text-sm">
                <div className="text-white font-medium">
                  {activeSession.title || 'Booked Session'}
                </div>
                {activeSession.attendees && activeSession.attendees.length > 0 && (
                  <div className="text-zinc-400 text-xs">
                    Attendees: {activeSession.attendees.map((a) => a.name).join(', ')}
                  </div>
                )}
              </div>
            )}

            {activeSlot && (
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setActiveSlot(null);
                    setActiveSession(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={async () => {
                    const slotId = activeSlot._id;
                    setActiveSlot(null);
                    await handleDeleteSlot(slotId);
                  }}
                >
                  Remove Slot
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
