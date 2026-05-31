'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import PasswordInput from '../../components/PasswordInput';
import { apiClient, ApiError } from '../../lib/api-client';

export const dynamic = 'force-dynamic';

type Step = 'form' | 'success' | 'invalid';

// Exported page wraps the content in Suspense — required by Next.js when useSearchParams is used
export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [step, setStep] = useState<Step>('form');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setStep('invalid');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/users/admin/accept-invite', { token, password });
      setStep('success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setStep('invalid');
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-zinc-900/50 to-transparent" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-zinc-900/30 to-transparent" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image
            src="/shinobiLogo.png"
            alt="SOS Academy"
            width={40}
            height={40}
            className="object-contain"
          />
          <div className="text-left">
            <h1 className="text-lg font-semibold text-white tracking-tight">SOS Academy</h1>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        <div className="card p-8">
          {step === 'invalid' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Invalid or expired link</h2>
              <p className="text-sm text-zinc-500">
                This invite link is no longer valid. Ask a super admin to send you a new one.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Password set!</h2>
              <p className="text-sm text-zinc-500">Your account is active. You can now sign in.</p>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="btn-primary w-full py-2.5 text-sm mt-2"
              >
                Go to login
              </button>
            </div>
          )}

          {step === 'form' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-white">Set your password</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Choose a strong password to activate your admin account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <PasswordInput
                  id="password"
                  label="Password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />

                <PasswordInput
                  id="confirm"
                  label="Confirm password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />

                {error && (
                  <div className="flex items-center gap-3 p-3 border border-red-500/30 bg-red-500/10">
                    <svg
                      className="w-4 h-4 text-red-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin" />
                      Activating...
                    </span>
                  ) : (
                    'Activate account'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
