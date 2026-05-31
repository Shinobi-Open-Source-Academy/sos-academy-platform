'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useRequireAuth } from '../../context/AuthContext';
import { apiClient, ApiError } from '../../lib/api-client';

export const dynamic = 'force-dynamic';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  status: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function AdminsPage() {
  const { admin, loading: authLoading } = useRequireAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Invite form state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!authLoading && admin?.isSuperAdmin) fetchAdmins();
  }, [authLoading, admin]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<AdminAccount[]>('/users/admin/admins');
      setAdmins(res.data ?? []);
    } catch {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await apiClient.post('/users/admin/admins/invite', {
        name: inviteName,
        email: inviteEmail,
        password: invitePassword,
      });
      toast.success('Admin invited successfully');
      setShowInvite(false);
      setInviteName('');
      setInviteEmail('');
      setInvitePassword('');
      fetchAdmins();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to invite admin');
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke access for ${name}? They will no longer be able to log in.`)) return;
    setRevoking(id);
    try {
      await apiClient.delete(`/users/admin/admins/${id}`);
      toast.success(`Access revoked for ${name}`);
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to revoke access');
    } finally {
      setRevoking(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  // Non-super-admins should never reach this page (sidebar hides the link),
  // but guard it defensively.
  if (!admin?.isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-zinc-500 text-sm">Access restricted to super admin.</p>
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
              <h1 className="text-xl font-semibold text-white">Admin Accounts</h1>
              <p className="text-sm text-zinc-500 mt-1">Manage who has access to this panel.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowInvite(!showInvite)}
              className="btn-primary px-4 py-2 text-sm"
            >
              {showInvite ? 'Cancel' : '+ Invite Admin'}
            </button>
          </div>

          {/* Invite form */}
          {showInvite && (
            <div className="card p-6 mb-6 border border-white/10">
              <h2 className="text-sm font-semibold text-white mb-4">Invite New Admin</h2>
              <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="invite-name" className="block text-xs text-zinc-400 mb-1">
                    Full name
                  </label>
                  <input
                    id="invite-name"
                    type="text"
                    required
                    minLength={2}
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="input w-full"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label htmlFor="invite-email" className="block text-xs text-zinc-400 mb-1">
                    Email
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input w-full"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="invite-password" className="block text-xs text-zinc-400 mb-1">
                    Password
                  </label>
                  <input
                    id="invite-password"
                    type="password"
                    required
                    minLength={8}
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    className="input w-full"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={inviting}
                    className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
                  >
                    {inviting ? 'Inviting...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admins table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin mx-auto" />
              </div>
            ) : admins.length === 0 ? (
              <p className="p-8 text-center text-zinc-500 text-sm">No admins found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                      Role
                    </th>
                    <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                      Status
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {admins.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{a.name}</td>
                      <td className="px-6 py-4 text-zinc-400">{a.email}</td>
                      <td className="px-6 py-4">
                        {a.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 border border-white/10">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs border ${
                            a.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!a.isSuperAdmin && a.id !== admin?.id && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(a.id, a.name)}
                            disabled={revoking === a.id}
                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                          >
                            {revoking === a.id ? 'Revoking...' : 'Revoke'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
