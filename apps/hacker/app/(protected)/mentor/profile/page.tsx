'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Sidebar from '../../../../components/Sidebar';
import { ApiError } from '../../../../lib/api-client';
import {
  getMyMentorProfile,
  type MentorProfileInput,
  type SocialLink,
  toMentorProfileInput,
  updateMyMentorProfile,
} from '../../../../lib/mentor-profile';

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000';
const DESCRIPTION_MAX = 1000;
const TITLE_MAX = 100;

const SOCIAL_FIELDS: { key: SocialLink; label: string; placeholder: string }[] = [
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/username' },
  { key: 'website', label: 'Website', placeholder: 'https://example.com' },
];

const EMPTY: MentorProfileInput = {
  title: '',
  description: '',
  github: '',
  linkedin: '',
  twitter: '',
  website: '',
};

type LoadState = 'loading' | 'ready' | 'error';

export default function MentorProfilePage() {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [saved, setSaved] = useState<MentorProfileInput>(EMPTY);
  const [form, setForm] = useState<MentorProfileInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const values = toMentorProfileInput(await getMyMentorProfile());
      setSaved(values);
      setForm(values);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isDirty = (Object.keys(form) as (keyof MentorProfileInput)[]).some(
    (key) => form[key].trim() !== saved[key].trim()
  );

  const update =
    (key: keyof MentorProfileInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setMessage(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const values = toMentorProfileInput(await updateMyMentorProfile(form));
      setSaved(values);
      setForm(values);
      setMessage({
        tone: 'success',
        text: 'Profile saved. It now shows on the public mentor directory.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text:
          error instanceof ApiError
            ? error.message
            : 'Could not save your profile, please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black md:flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <Link
              href="/mentor"
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              ← Mentor Space
            </Link>
            <h1 className="text-2xl font-semibold text-white mt-3">My Profile</h1>
            <p className="text-zinc-500 text-sm mt-1">
              What hackers see about you on the{' '}
              <a
                href={`${WEBSITE_URL}/mentors`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                public mentor directory
              </a>
              .
            </p>
          </div>

          {loadState === 'loading' && (
            <div className="card p-6 space-y-4" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}

          {loadState === 'error' && (
            <div className="card p-6 text-center">
              <p className="text-white font-medium">We couldn't load your profile</p>
              <p className="text-sm text-zinc-500 mt-1">Check your connection and try again.</p>
              <button type="button" onClick={load} className="btn btn-primary mt-4">
                Try again
              </button>
            </div>
          )}

          {loadState === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
              <section className="card p-5 sm:p-6 space-y-5">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  About
                </h2>
                <div>
                  <label htmlFor="title" className="block text-xs text-zinc-400 mb-1.5">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    maxLength={TITLE_MAX}
                    value={form.title}
                    onChange={update('title')}
                    className="input w-full"
                    placeholder="Senior Backend Engineer"
                  />
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label htmlFor="description" className="block text-xs text-zinc-400">
                      Description
                    </label>
                    <span
                      className={`text-[11px] ${form.description.length > DESCRIPTION_MAX - 50 ? 'text-amber-400' : 'text-zinc-600'}`}
                    >
                      {form.description.length}/{DESCRIPTION_MAX}
                    </span>
                  </div>
                  <textarea
                    id="description"
                    rows={6}
                    maxLength={DESCRIPTION_MAX}
                    value={form.description}
                    onChange={update('description')}
                    className="input w-full resize-y min-h-[8rem]"
                    placeholder="Your experience, what you can help with, the stack you know best…"
                  />
                </div>
              </section>

              <section className="card p-5 sm:p-6 space-y-5">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Links
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label htmlFor={key} className="block text-xs text-zinc-400 mb-1.5">
                        {label}
                      </label>
                      <input
                        id={key}
                        type="url"
                        inputMode="url"
                        value={form[key]}
                        onChange={update(key)}
                        className="input w-full"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-600">Leave a field empty to remove it.</p>
              </section>

              {message && (
                <p
                  role={message.tone === 'error' ? 'alert' : 'status'}
                  className={`text-sm px-4 py-3 border ${
                    message.tone === 'success'
                      ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                      : 'text-red-400 border-red-500/20 bg-red-500/10'
                  }`}
                >
                  {message.text}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setForm(saved);
                    setMessage(null);
                  }}
                  disabled={!isDirty || saving}
                  className="btn btn-secondary justify-center disabled:opacity-40"
                >
                  Discard changes
                </button>
                <button
                  type="submit"
                  disabled={!isDirty || saving}
                  className="btn btn-primary justify-center disabled:opacity-40"
                >
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
