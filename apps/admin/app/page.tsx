'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { admin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(admin ? '/dashboard' : '/login');
  }, [loading, admin, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin" />
    </div>
  );
}
