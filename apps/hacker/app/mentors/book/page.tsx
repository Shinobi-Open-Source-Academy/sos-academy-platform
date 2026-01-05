'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function BookMentorPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('hacker_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setLoading(false);
  }, [mounted, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement booking logic
    alert('Booking request submitted! (Demo)');
    router.push('/mentors');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <Link
              href="/mentors"
              className="text-xs text-zinc-500 hover:text-white mb-4 inline-flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Back to mentors
            </Link>
            <h1 className="text-2xl font-semibold text-white mt-4">Book a Session</h1>
            <p className="text-zinc-500 text-sm mt-1">Schedule a 1-on-1 mentoring session</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-5 animate-fade-in delay-150">
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">
                Select Time (UTC)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 text-sm border transition-colors ${
                      selectedTime === slot
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">
                What would you like to discuss?
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="Describe the topic or questions you'd like to cover..."
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={!selectedDate || !selectedTime || !topic}
            >
              Request Session
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
