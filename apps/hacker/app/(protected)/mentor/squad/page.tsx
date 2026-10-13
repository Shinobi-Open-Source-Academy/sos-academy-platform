'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/Sidebar';
import { apiFetch } from '../../../../lib/api-client';

interface RosterMember {
  id: string;
  name: string;
  githubLogin: string | null;
  avatarUrl: string | null;
  joinedAt?: string;
}

interface SquadRoster {
  id: string;
  community: { name?: string; slug?: string };
  capacity: number;
  members: RosterMember[];
}

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

function MemberAvatar({ member }: { member: RosterMember }) {
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        className="w-10 h-10 rounded-full border border-white/10"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="w-10 h-10 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300"
    >
      {member.name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function MentorSquadPage() {
  const [squads, setSquads] = useState<SquadRoster[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<SquadRoster[]>('/squads/mine')
      .then(setSquads)
      .catch(() => setError('We could not load your squad. Please try again.'));
  }, []);

  return (
    <div className="min-h-screen bg-black md:flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <span className="badge badge-success text-[10px] mb-3">Sensei</span>
            <h1 className="text-2xl font-semibold text-white">My Squad</h1>
            <p className="text-zinc-500 text-sm mt-1">The mentees you are guiding.</p>
          </div>

          {error ? (
            <div className="card p-6 text-sm text-red-400" role="alert">
              {error}
            </div>
          ) : squads === null ? (
            <div className="card p-8 flex justify-center">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
            </div>
          ) : squads.length === 0 ? (
            <div className="card p-8 text-center animate-fade-in">
              <h2 className="text-white font-medium">No squad assigned yet</h2>
              <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
                An admin or a kage will assign you a squad of mentees. They will show up here as
                soon as it's done.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in delay-75">
              {squads.map((squad) => (
                <section key={squad.id} aria-labelledby={`squad-${squad.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2
                      id={`squad-${squad.id}`}
                      className="text-sm font-medium text-zinc-400 uppercase tracking-wider"
                    >
                      {squad.community.name ?? 'Squad'}
                    </h2>
                    <span className="badge badge-neutral text-[10px]">
                      {squad.members.length}/{squad.capacity} mentees
                    </span>
                  </div>

                  {squad.members.length === 0 ? (
                    <div className="card p-6 text-sm text-zinc-500">
                      No mentees in this squad yet.
                    </div>
                  ) : (
                    <ul className="grid md:grid-cols-2 gap-3">
                      {squad.members.map((member) => (
                        <li key={member.id} className="card p-4 flex items-center gap-4">
                          <MemberAvatar member={member} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{member.name}</p>
                            {member.githubLogin ? (
                              <a
                                href={`https://github.com/${member.githubLogin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-zinc-500 hover:text-white transition-colors truncate block"
                              >
                                @{member.githubLogin}
                              </a>
                            ) : (
                              <p className="text-xs text-zinc-600">No GitHub account linked</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                              Joined
                            </p>
                            <p className="text-xs text-zinc-400">{formatDate(member.joinedAt)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
