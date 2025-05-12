'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setError('');

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api';
      const response = await fetch(`${apiUrl}/users/join/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join community');
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error joining community:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Image
          src="/shinobiLogo.png"
          alt="Shinobi Open-Source Academy"
          width={100}
          height={100}
          className="hover:scale-110 transition-all duration-300"
        />
        <h3 className="text-xl font-bold mt-4 mb-2">
          Shinobi Open-Source Academy
        </h3>
        <p className="text-gray-400">
          Empowering the Next Generation of Open-Source Warriors
        </p>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-4">Stay Updated</h4>
        <p className="text-gray-400 mb-4">
          Subscribe to our newsletter to get the latest updates on our
          communities, projects, and upcoming events.
        </p>
        {success ? (
          <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-4">
            Thanks for joining! Please check your email for confirmation.
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-primary w-full"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`btn-primary whitespace-nowrap shrink-0 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Subscribe'}
            </button>
          </form>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
