'use client';

import Link from 'next/link';

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js error page convention
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-md mx-4">
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-red-500/30 bg-red-500/10">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-zinc-500 mb-8 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary px-6">
            Try again
          </button>
          <Link href="/" className="btn-secondary px-6">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
