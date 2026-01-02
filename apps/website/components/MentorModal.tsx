'use client';

import { useState } from 'react';
import { applyAsMentor } from '../lib/api-client';

interface MentorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MentorModal({ isOpen, onClose }: MentorModalProps) {
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
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-black border border-white/10 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Become a Mentor</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors text-xl"
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <div className="text-green-500 text-3xl">✓</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Application Submitted!</h3>
              <p className="text-gray-400 text-sm">
                We'll review your application and get back to you within 3-5 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2" htmlFor="email">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 focus:border-white/20 outline-none transition-colors text-sm"
                  placeholder="your.email@example.com"
                  required
                  id="email"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2" htmlFor="name">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 focus:border-white/20 outline-none transition-colors text-sm"
                  placeholder="Ngandu Paul"
                  required
                  id="name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2" htmlFor="expertise">
                  Areas of Expertise
                </label>
                <textarea
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 focus:border-white/20 outline-none transition-colors resize-none text-sm"
                  placeholder="e.g., React, Node.js, Python, System Design..."
                  rows={3}
                  id="expertise"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2" htmlFor="githubHandle">
                  GitHub Handle
                </label>
                <input
                  type="text"
                  value={githubHandle}
                  onChange={(e) => setGithubHandle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 focus:border-white/20 outline-none transition-colors text-sm"
                  placeholder="ngandupaul"
                  id="githubHandle"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2" htmlFor="motivation">
                  Why do you want to be a mentor?
                </label>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 focus:border-white/20 outline-none transition-colors resize-none text-sm"
                  placeholder="Share your motivation..."
                  rows={3}
                  id="motivation"
                />
              </div>

              {error && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
