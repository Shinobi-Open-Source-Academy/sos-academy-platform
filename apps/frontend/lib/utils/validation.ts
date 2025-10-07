/**
 * Validation utilities for forms
 * Provides reusable validation functions and form validation logic
 */

import type { FormErrors, ValidationRule } from '../types/api';

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GitHub username validation regex
 */
export const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,38}$/;

/**
 * Validation rules for different field types
 */
export const VALIDATION_RULES: Record<string, ValidationRule> = {
  email: {
    required: true,
    email: true,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  githubHandle: {
    pattern: GITHUB_USERNAME_REGEX,
  },
  expertise: {
    maxLength: 500,
  },
  motivation: {
    maxLength: 1000,
  },
};

/**
 * Validate a single field value against its rules
 */
export function validateField(
  fieldName: string,
  value: string,
  rules: ValidationRule
): string | undefined {
  // Required validation
  if (rules.required && (!value || value.trim().length === 0)) {
    return `${fieldName} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!value || value.trim().length === 0) {
    return undefined;
  }

  // Email validation
  if (rules.email && !EMAIL_REGEX.test(value)) {
    return 'Please enter a valid email address';
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters long`;
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return `${fieldName} must be no more than ${rules.maxLength} characters long`;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return `Please enter a valid ${fieldName}`;
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return undefined;
}

/**
 * Validate an entire form object
 */
export function validateForm<T extends Record<string, string>>(
  formData: T,
  rules: Record<keyof T, ValidationRule>
): FormErrors {
  const errors: FormErrors = {};

  for (const fieldName of Object.keys(formData)) {
    const fieldRules = rules[fieldName];
    if (fieldRules) {
      const error = validateField(fieldName, formData[fieldName], fieldRules);
      if (error) {
        errors[fieldName] = error;
      }
    }
  }

  return errors;
}

/**
 * Check if form has any errors
 */
export function hasFormErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((error) => error !== undefined);
}

/**
 * Clear specific field error
 */
export function clearFieldError(errors: FormErrors, fieldName: string): FormErrors {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate GitHub username format
 */
export function isValidGitHubUsername(username: string): boolean {
  return GITHUB_USERNAME_REGEX.test(username);
}

/**
 * Sanitize form input (basic XSS prevention)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}
