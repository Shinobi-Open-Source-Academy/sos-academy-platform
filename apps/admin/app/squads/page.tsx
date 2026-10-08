'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useRequireAuth } from '../../context/AuthContext';
import { ApiError, apiClient } from '../../lib/api-client';
import Sidebar from '../components/Sidebar';

export const dynamic = 'force-dynamic';

interface SquadUser {
  _id: string;
  name: string;
  email?: string;
  githubProfile?: { login?: string; avatarUrl?: string };
}

interface Squad {
  _id: string;
  mentor: SquadUser;
  community: { _id: string; name: string; slug: string };
  members: SquadUser[];
  capacity: number;
  isActive: boolean;
}

interface Community {
  _id: string;
  name: string;
}

// `/users/admin/users` serializes users with `id` (UserResponseDto), populated squads keep `_id`
interface ListedUser {
  id: string;
  name: string;
  githubProfile?: { login?: string };
}

interface UsersResponse {
  users: ListedUser[];
}

const DEFAULT_CAPACITY = 5;

export default function SquadsPage() {
  const { loading: authLoading } = useRequireAuth();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [mentors, setMentors] = useState<ListedUser[]>([]);
  const [members, setMembers] = useState<ListedUser[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [mentorId, setMentorId] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [capacity, setCapacity] = useState(DEFAULT_CAPACITY);
  const [creating, setCreating] = useState(false);

  // Per-squad "add member" selection and pending action
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const fetchSquads = useCallback(async () => {
    const res = await apiClient.get<Squad[]>('/squads');
    setSquads(res.data ?? []);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const load = async () => {
      setLoading(true);
      try {
        const [, mentorsRes, membersRes, communitiesRes] = await Promise.all([
          fetchSquads(),
          apiClient.get<UsersResponse>('/users/admin/users?role=MENTOR&status=ACTIVE&limit=100'),
          apiClient.get<UsersResponse>('/users/admin/users?role=MEMBER&status=ACTIVE&limit=100'),
          apiClient.get<Community[]>('/communities'),
        ]);
        setMentors(mentorsRes.data?.users ?? []);
        setMembers(membersRes.data?.users ?? []);
        setCommunities(communitiesRes.data ?? []);
      } catch {
        toast.error('Failed to load squads');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, fetchSquads]);

  // A mentee is in at most one active squad, so only offer the ones still free
  const availableMembers = useMemo(() => {
    const taken = new Set(
      squads.filter((s) => s.isActive).flatMap((s) => s.members.map((m) => m._id))
    );
    return members.filter((m) => !taken.has(m.id));
  }, [squads, members]);

  const replaceSquad = (updated: Squad) =>
    setSquads((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiClient.post('/squads', { mentor: mentorId, community: communityId, capacity });
      toast.success('Squad created');
      setShowCreate(false);
      setMentorId('');
      setCommunityId('');
      setCapacity(DEFAULT_CAPACITY);
      await fetchSquads();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create squad');
    } finally {
      setCreating(false);
    }
  };

  const handleAdd = async (squad: Squad) => {
    const userId = selected[squad._id];
    if (!userId) return;
    setBusy(squad._id);
    try {
      const res = await apiClient.post<Squad>(`/squads/${squad._id}/members`, { userId });
      if (res.data) replaceSquad(res.data);
      setSelected((prev) => ({ ...prev, [squad._id]: '' }));
      toast.success('Mentee added');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add mentee');
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async (squad: Squad, member: SquadUser) => {
    if (!confirm(`Remove ${member.name} from ${squad.mentor.name}'s squad?`)) return;
    setBusy(`${squad._id}:${member._id}`);
    try {
      const res = await apiClient.delete<Squad>(`/squads/${squad._id}/members/${member._id}`);
      if (res.data) replaceSquad(res.data);
      toast.success(`${member.name} removed`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove mentee');
    } finally {
      setBusy(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">Squads</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Pair approved mentees with a mentor. A mentee belongs to one active squad at a time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreate(!showCreate)}
              className="btn-primary px-4 py-2 text-sm"
            >
              {showCreate ? 'Cancel' : '+ New Squad'}
            </button>
          </div>

          {/* Create form */}
          {showCreate && (
            <div className="card p-6 mb-6 border border-white/10">
              <h2 className="text-sm font-semibold text-white mb-4">New Squad</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="squad-mentor" className="block text-xs text-zinc-400 mb-1">
                    Mentor
                  </label>
                  <select
                    id="squad-mentor"
                    required
                    value={mentorId}
                    onChange={(e) => setMentorId(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Select a mentor</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="squad-community" className="block text-xs text-zinc-400 mb-1">
                    Community
                  </label>
                  <select
                    id="squad-community"
                    required
                    value={communityId}
                    onChange={(e) => setCommunityId(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Select a community</option>
                    {communities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="squad-capacity" className="block text-xs text-zinc-400 mb-1">
                    Capacity
                  </label>
                  <input
                    id="squad-capacity"
                    type="number"
                    min={1}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="input w-full"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Squad'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Squads */}
          {loading ? (
            <div className="card p-8 text-center">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin mx-auto" />
            </div>
          ) : squads.length === 0 ? (
            <div className="card p-8 text-center text-zinc-500 text-sm">
              No squads yet. Create one to start pairing mentees with a mentor.
            </div>
          ) : (
            <div className="space-y-4">
              {squads.map((squad) => {
                const isFull = squad.members.length >= squad.capacity;
                return (
                  <div key={squad._id} className="card overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                      <div>
                        <p className="text-white font-medium">{squad.mentor?.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {squad.community?.name}
                          {!squad.isActive && ' · inactive'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs border ${
                          isFull
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {squad.members.length}/{squad.capacity} {isFull ? 'full' : 'members'}
                      </span>
                    </div>

                    {squad.members.length === 0 ? (
                      <p className="px-6 py-4 text-sm text-zinc-500">No mentees yet.</p>
                    ) : (
                      <ul className="divide-y divide-white/[0.04]">
                        {squad.members.map((member) => (
                          <li
                            key={member._id}
                            className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
                          >
                            <div>
                              <p className="text-sm text-white">{member.name}</p>
                              {member.githubProfile?.login && (
                                <p className="text-xs text-zinc-500">
                                  @{member.githubProfile.login}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemove(squad, member)}
                              disabled={busy === `${squad._id}:${member._id}`}
                              className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                            >
                              {busy === `${squad._id}:${member._id}` ? 'Removing...' : 'Remove'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {squad.isActive && (
                      <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.06]">
                        <select
                          aria-label={`Add a mentee to ${squad.mentor?.name}'s squad`}
                          value={selected[squad._id] ?? ''}
                          onChange={(e) =>
                            setSelected((prev) => ({ ...prev, [squad._id]: e.target.value }))
                          }
                          disabled={isFull}
                          className="input flex-1 disabled:opacity-50"
                        >
                          <option value="">
                            {isFull
                              ? 'Squad is full'
                              : availableMembers.length === 0
                                ? 'No mentee available'
                                : 'Add a mentee'}
                          </option>
                          {availableMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                              {m.githubProfile?.login ? ` (@${m.githubProfile.login})` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAdd(squad)}
                          disabled={isFull || !selected[squad._id] || busy === squad._id}
                          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                        >
                          {busy === squad._id ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
