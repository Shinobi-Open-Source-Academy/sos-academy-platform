'use client';

import Link from 'next/link';

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Something went wrong!</h2>
        <div className="space-x-4">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 inline-block"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
