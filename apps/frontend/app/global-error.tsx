'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-6">
          <div className="max-w-xl text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">Error</h1>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-300 mb-8">
              We encountered an unexpected error. Please try again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => reset()}
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                Try Again
              </button>
              <a
                href="/"
                className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
