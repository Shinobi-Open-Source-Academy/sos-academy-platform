'use client';

import { useState } from 'react';
import { COMMUNITIES } from '../constants/communities';
import Modal from './ui/Modal';
import MultiSelect from './ui/MultiSelect';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  email: string;
  name: string;
  communities: string[];
  githubHandle: string;
}

interface FormErrors {
  email?: string;
  communities?: string;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    communities: [],
    githubHandle: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Communities validation
    if (formData.communities.length === 0) {
      newErrors.communities = 'Please select at least one community';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || undefined,
          communities: formData.communities,
          githubHandle: formData.githubHandle || undefined,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        // Reset form after 2 seconds and close modal
        setTimeout(() => {
          setFormData({ email: '', name: '', communities: [], githubHandle: '' });
          setIsSuccess(false);
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrors({ email: errorData.message || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setErrors({ email: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Welcome to SOS Academy!">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Subscription Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to the Shinobi Open-Source Academy! You'll receive a confirmation email shortly
            with details about your selected communities and upcoming meetings.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join SOS Academy">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
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
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name (Optional)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            placeholder="John Doe"
            disabled={isSubmitting}
          />
        </div>

        {/* Communities */}
        <MultiSelect
          label="Communities"
          placeholder="Select communities you're interested in..."
          options={COMMUNITIES}
          selectedValues={formData.communities}
          onChange={(values) => handleInputChange('communities', values)}
          required
          error={errors.communities}
        />

        {/* GitHub Handle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub Handle (Optional)
          </label>
          <input
            type="text"
            value={formData.githubHandle}
            onChange={(e) => handleInputChange('githubHandle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            placeholder="username"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Help us connect your profile and showcase your contributions
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
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
              'Join SOS Academy'
            )}
          </button>
        </div>

        {/* Info Text */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By joining, you agree to receive community updates and meeting invitations every Monday.
          </p>
        </div>
      </form>
    </Modal>
  );
}
