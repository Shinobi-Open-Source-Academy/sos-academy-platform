'use client';

import Footer from '@/app/components/Footer';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { useEffect } from 'react';

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">500</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Something went wrong!</h2>
          <p className="text-gray-300 mb-8">
            We encountered an unexpected error. Please try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
