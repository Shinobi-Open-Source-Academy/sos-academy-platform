'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FOOTER_DATA } from '../../data/siteData';

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api';
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
        <h3 className="text-xl font-bold mt-4 mb-2">Shinobi Open-Source Academy</h3>
        <p className="text-gray-400">Empowering the Next Generation of Open-Source Warriors</p>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-4">{FOOTER_DATA.newsletter.title}</h4>
        <p className="text-gray-400 mb-4">{FOOTER_DATA.newsletter.description}</p>
        {success ? (
          <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-4">
            Thanks for joining! Please check your email for confirmation.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={FOOTER_DATA.newsletter.placeholder}
              required
              className="px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-primary w-full"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`relative overflow-hidden whitespace-nowrap shrink-0 px-6 py-3 rounded-lg font-medium text-white bg-primary transition-all duration-300 ease-in-out transform group cursor-pointer ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'
              }`}
            >
              <span className="relative z-10">
                {isLoading ? 'Joining...' : FOOTER_DATA.newsletter.buttonText}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
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
