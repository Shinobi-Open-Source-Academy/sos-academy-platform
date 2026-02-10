'use client';
import { useEffect, useState, ComponentType, FC } from 'react';
import { useRouter } from 'next/navigation';
import { IUser } from '@sos-academy/shared';

/**
 * Higher-Order Component for protected pages
 */
export default function withAuth<T extends object>(Component: ComponentType<T>) {
  const ProtectedRoute: FC<T> = (props) => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>(
      'checking'
    );

    useEffect(() => {
      setMounted(true);
    }, []);

    // Check auth and redirect if not authenticated
    useEffect(() => {
      if (!mounted) {
        return;
      }

      const token = localStorage.getItem('hacker_token');
      const userStr = localStorage.getItem('hacker_user');

      if (!token || !userStr) {
        setAuthState('unauthenticated');
        router.replace('/auth/login');
        return;
      }

      console.log('token', token);
      console.log('userStr', userStr);

      try {
        JSON.parse(userStr);
        setAuthState('authenticated');
      } catch {
        localStorage.removeItem('hacker_token');
        localStorage.removeItem('hacker_user');
        setAuthState('unauthenticated');
        router.replace('/auth/login');
      }
    }, [router, mounted]);

    // Show loading while checking auth or redirecting
    if (authState === 'checking' || authState === 'unauthenticated') {
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
