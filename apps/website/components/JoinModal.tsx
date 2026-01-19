'use client';

import { useState } from 'react';
import { joinCommunity } from '../lib/api-client';
import { COMMUNITIES } from '../lib/data';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinModal({ isOpen, onClose }: JoinModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [githubHandle, setGithubHandle] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || selectedCommunities.length === 0) {
      setError('Email and at least one community are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinCommunity({
        email,
        name,
        communities: selectedCommunities,
        githubHandle,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 5000);
    } catch (_err) {
      setError('Failed to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setSelectedCommunities([]);
    setGithubHandle('');
    setAcceptTerms(false);
    setSuccess(false);
    setError('');
  };

  const toggleCommunity = (id: string) => {
    setSelectedCommunities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-black border border-white/10 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Join SOS Academy</h2>
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
              <h3 className="text-lg font-semibold mb-2">Welcome to SOS Academy!</h3>
              <p className="text-gray-400 text-sm">Check your email for confirmation details.</p>
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
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 focus:border-white/20 outline-none transition-colors text-sm"
                  placeholder="Ngandu Paul"
                  id="name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3" htmlFor="communities">
                  Communities *
                </label>
                <div className="space-y-2.5">
                  {COMMUNITIES.map((community) => (
                    <label
                      key={community.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCommunities.includes(community.id)}
                        onChange={() => toggleCommunity(community.id)}
                        className="w-4 h-4 accent-white"
                      />
                      <span className="text-sm group-hover:text-white transition-colors">
                        {community.language} - {community.name}
                      </span>
                    </label>
                  ))}
                </div>
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
                  placeholder="username"
                  id="githubHandle"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-white flex-shrink-0"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                    I agree to receive community event invitations, weekly updates, and
                    announcements via email
                  </span>
                </label>
              </div>

              {error && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Academy'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
