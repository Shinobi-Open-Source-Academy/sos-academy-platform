'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '../../../lib/auth-service';
import { IUser } from '@sos-academy/shared';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const userParam = searchParams.get('user');

    if (accessToken && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam)) as IUser;
        AuthService.setAuthData(accessToken, user);
        window.location.href = '/';
      } catch (error) {
        console.error('Failed to parse user data:', error);
        router.push('/auth/login?error=auth_failed');
      }
    } else {
      router.push('/auth/login?error=missing_params');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Authenticating...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="text-slate-400 mt-4">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
