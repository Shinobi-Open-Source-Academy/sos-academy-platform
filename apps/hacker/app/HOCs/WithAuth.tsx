'use client';

import { type UserRole, UserStatus } from '@sos-academy/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ComponentType, type FC, useEffect, useState } from 'react';
import { ApiError, getCurrentUser } from '../../lib/api-client';
import { AuthService } from '../../lib/auth-service';

interface WithAuthOptions {
  /**
   * Only let users with one of these roles through. Checked against the server, since the
   * user stored in localStorage can be stale (role changed since login) or edited by hand.
   */
  roles?: UserRole[];
}

type AuthState = 'checking' | 'authenticated' | 'unauthenticated' | 'forbidden' | 'error';

export default function withAuth<T extends object>(
  Component: ComponentType<T>,
  { roles }: WithAuthOptions = {}
) {
  const ProtectedRoute: FC<T> = (props) => {
    const router = useRouter();
    const [authState, setAuthState] = useState<AuthState>('checking');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
      let cancelled = false;

      const redirectToLogin = () => {
        AuthService.clearAuthData();
        setAuthState('unauthenticated');
        router.replace('/auth/login');
      };

      const checkAuth = async () => {
        const token = localStorage.getItem('hacker_token');
        const userStr = localStorage.getItem('hacker_user');
        if (!token || !userStr) {
          redirectToLogin();
          return;
        }

        let storedUser: Record<string, unknown>;
        try {
          storedUser = JSON.parse(userStr);
        } catch {
          redirectToLogin();
          return;
        }

        if (!roles?.length) {
          setAuthState('authenticated');
          return;
        }

        try {
          const user = await getCurrentUser();
          if (cancelled) return;

          if (user.role !== storedUser.role) {
            localStorage.setItem('hacker_user', JSON.stringify({ ...storedUser, role: user.role }));
          }

          const allowed =
            roles.includes(user.role) && user.isActive && user.status === UserStatus.ACTIVE;
          setAuthState(allowed ? 'authenticated' : 'forbidden');
        } catch (error) {
          if (cancelled) return;
          if (error instanceof ApiError && error.status === 401) {
            redirectToLogin();
          } else {
            setAuthState('error');
          }
        }
      };

      checkAuth();
      return () => {
        cancelled = true;
      };
    }, [router, attempt]);

    if (authState === 'forbidden' || authState === 'error') {
      const forbidden = authState === 'forbidden';
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-6">
          <div className="card p-8 max-w-sm w-full text-center animate-fade-in">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
              {forbidden ? 'Access restricted' : 'Something went wrong'}
            </p>
            <h1 className="text-lg font-semibold text-white">
              {forbidden ? "You don't have access to this page" : "We couldn't verify your access"}
            </h1>
            <p className="text-sm text-zinc-500 mt-2">
              {forbidden
                ? 'This area is reserved for approved mentors.'
                : 'Check your connection and try again.'}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {!forbidden && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthState('checking');
                    setAttempt((n) => n + 1);
                  }}
                  className="btn btn-primary justify-center"
                >
                  Try again
                </button>
              )}
              <Link href="/" className="btn btn-secondary justify-center">
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (authState !== 'authenticated') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-zinc-400 text-sm">
              {authState === 'unauthenticated' ? 'Redirecting...' : 'Loading...'}
            </span>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  return ProtectedRoute;
}
