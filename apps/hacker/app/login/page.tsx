'use client';

import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>(
    'checking'
  );

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if already logged in (only on client)
  useEffect(() => {
    if (!mounted) {
      return;
    }

    const token = localStorage.getItem('hacker_token');
    if (token) {
      setAuthState('authenticated');
    } else {
      setAuthState('unauthenticated');
    }
  }, [mounted]);

  // Redirect authenticated users to dashboard
  if (authState === 'authenticated') {
    redirect('/');
  }

  // Show loading while checking auth
  if (!mounted || authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-zinc-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const handleGitHubLogin = () => {
    setIsLoading(true);
    // TODO: Implement actual GitHub OAuth
    // For now, simulate login
    setTimeout(() => {
      localStorage.setItem('hacker_token', 'demo_token');
      localStorage.setItem(
        'hacker_user',
        JSON.stringify({
          id: '1',
          name: 'Demo Hacker',
          email: 'hacker@example.com',
          avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
          githubHandle: 'demo-hacker',
          community: 'Konoha',
        })
      );
      router.push('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Gradient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
            <img
              src="/shinobiLogo.png"
              alt="SOS Academy"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Hacker Portal</h1>
          <p className="text-zinc-500 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Login card */}
        <div className="card p-6">
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="btn-github w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-5 text-center text-xs text-zinc-500">
            <p>Under construction — contributions are welcome!</p>
            <a
              href="https://github.com/Shinobi-Open-Source-Academy/sos-academy-platform/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              View issues →
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-xs text-zinc-500 text-center">
              Only approved members can access this portal.
              <br />
              <a
                href="https://shinobi-open-source.academy"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Apply to join the academy
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Shinobi Open-Source Academy
          </p>
        </div>
      </div>
    </div>
  );
}
