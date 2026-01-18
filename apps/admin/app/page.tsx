'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAuthenticated } from '../lib/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect based on auth status
    if (isAuthenticated()) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // Minimal loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
    </div>
  );
}
