'use client';

import { useState } from 'react';
import { useCommunityJoin } from '../../lib/hooks/use-api';
import type { FormErrors } from '../../lib/types/api';
import {
  VALIDATION_RULES,
  clearFieldError,
  hasFormErrors,
  validateForm,
} from '../../lib/utils/validation';
import Modal from './ui/Modal';

interface CommunityJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityName?: string;
  communityId?: string;
}

interface FormData extends Record<string, string> {
  email: string;
  name: string;
  githubHandle: string;
}

export default function CommunityJoinModal({
  isOpen,
  onClose,
  communityName,
  communityId,
}: CommunityJoinModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    githubHandle: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const { joinCommunity, loading, error, success, reset } = useCommunityJoin();

  const validateFormData = (): boolean => {
    const validationRules = {
      email: VALIDATION_RULES.email,
      name: VALIDATION_RULES.name,
      githubHandle: VALIDATION_RULES.githubHandle,
    };

    const newErrors = validateForm(formData, validationRules);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormData()) {
      return;
    }

    try {
      await joinCommunity({
        email: formData.email,
        name: formData.name,
        githubHandle: formData.githubHandle || undefined,
        communities: communityId ? [communityId] : undefined,
      });

      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        setFormData({ email: '', name: '', githubHandle: '' });
        reset();
        onClose();
      }, 3000);
    } catch (err) {
      // Error is handled by the hook
      console.error('Community join failed:', err);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(clearFieldError(errors, field as string));
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Welcome to the Community!">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Successfully Joined!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {communityName
              ? `Welcome to the ${communityName} community! You'll receive a confirmation email shortly with next steps.`
              : "Welcome to Shinobi Open-Source Academy! You'll receive a confirmation email shortly with next steps."}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Join ${communityName || 'Community'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            placeholder="your.email@example.com"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Name */}
        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.name
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            placeholder="John Doe"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        {/* GitHub Handle */}
        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub Handle (Optional)
          </label>
          <input
            type="text"
            value={formData.githubHandle}
            onChange={(e) => handleInputChange('githubHandle', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.githubHandle
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            placeholder="username"
            disabled={loading}
          />
          {errors.githubHandle && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.githubHandle}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Help us understand your open-source contributions
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                Joining...
              </>
            ) : (
              `Join ${communityName || 'Community'}`
            )}
          </button>
        </div>

        {/* API Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Info Text */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You'll receive a confirmation email with community details and next steps.
          </p>
        </div>
      </form>
    </Modal>
  );
}
