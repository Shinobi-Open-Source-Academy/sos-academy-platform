'use client';

import { useState } from 'react';
import { applyAsMentor } from '../lib/api-client';

interface MentorApplicationFormProps {
  className?: string;
  onSuccess?: () => void;
}

export default function MentorApplicationForm({
  className = '',
  onSuccess,
}: MentorApplicationFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [expertise, setExpertise] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [motivation, setMotivation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError('Email and name are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await applyAsMentor({ email, name, expertise, githubHandle, motivation });
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        resetForm();
      }, 5000);
    } catch (_err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setExpertise('');
    setGithubHandle('');
    setMotivation('');
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="w-20 h-20 mx-auto mb-6 border border-green-500/20 bg-green-500/5 flex items-center justify-center animate-[fadeIn_0.5s_ease-out]">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Checkmark</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3">Application Submitted!</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Thank you for your interest in becoming a Sensei at SOS Academy. We'll review your
          application and get back to you within 3-5 business days.
        </p>
        <p className="text-gray-500 text-xs mt-4">Check your email for a confirmation message.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="animate-[fadeInUp_0.4s_ease-out]" style={{ animationFillMode: 'both' }}>
          <label className="block text-sm text-gray-400 mb-2" htmlFor="mentor-email">
            Email <span className="text-gray-600">*</span>
          </label>
          <input
            type="email"
            id="mentor-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all duration-300 text-sm placeholder:text-gray-600"
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div
          className="animate-[fadeInUp_0.4s_ease-out]"
          style={{ animationDelay: '50ms', animationFillMode: 'both' }}
        >
          <label className="block text-sm text-gray-400 mb-2" htmlFor="mentor-name">
            Full Name <span className="text-gray-600">*</span>
          </label>
          <input
            type="text"
            id="mentor-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all duration-300 text-sm placeholder:text-gray-600"
            placeholder="Your full name"
            required
          />
        </div>
      </div>

      <div
        className="animate-[fadeInUp_0.4s_ease-out]"
        style={{ animationDelay: '100ms', animationFillMode: 'both' }}
      >
        <label className="block text-sm text-gray-400 mb-2" htmlFor="mentor-github">
          GitHub Handle <span className="text-gray-600">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
            github.com/
          </span>
          <input
            type="text"
            id="mentor-github"
            value={githubHandle}
            onChange={(e) => setGithubHandle(e.target.value)}
            className="w-full pl-[100px] pr-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all duration-300 text-sm placeholder:text-gray-600"
            placeholder="yourusername"
            required
          />
        </div>
        <p className="text-xs text-gray-600 mt-1.5">We'll review your open-source contributions</p>
      </div>

      <div
        className="animate-[fadeInUp_0.4s_ease-out]"
        style={{ animationDelay: '150ms', animationFillMode: 'both' }}
      >
        <label className="block text-sm text-gray-400 mb-2" htmlFor="mentor-expertise">
          Areas of Expertise
        </label>
        <textarea
          id="mentor-expertise"
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all duration-300 resize-none text-sm placeholder:text-gray-600"
          placeholder="e.g., React, Node.js, Python, System Design, DevOps..."
          rows={2}
        />
      </div>

      <div
        className="animate-[fadeInUp_0.4s_ease-out]"
        style={{ animationDelay: '200ms', animationFillMode: 'both' }}
      >
        <label className="block text-sm text-gray-400 mb-2" htmlFor="mentor-motivation">
          Why do you want to become a Sensei?
        </label>
        <textarea
          id="mentor-motivation"
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all duration-300 resize-none text-sm placeholder:text-gray-600"
          placeholder="Share your motivation and what you hope to bring to the academy..."
          rows={3}
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-[shake_0.5s_ease-out]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-4 bg-white text-black hover:bg-gray-200 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        style={{ animationDelay: '250ms', animationFillMode: 'both' }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <title>Loading</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </span>
      </button>
    </form>
  );
}
