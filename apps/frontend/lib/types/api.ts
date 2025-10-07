/**
 * API Types for Shinobi Open-Source Academy
 * Type definitions for all API requests and responses
 */

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  githubHandle?: string;
  profilePicture?: string;
  role: 'member' | 'mentor' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  communities: string[];
  createdAt: string;
  updatedAt: string;
}

// Community Types
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  language: string;
  color: string;
  icon: string;
  codeSnippet: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

// Request DTOs
export interface CommunityJoinRequest {
  email: string;
  name?: string;
  communities?: string[];
  githubHandle?: string;
}

export interface MentorApplicationRequest {
  name: string;
  email: string;
  expertise?: string;
  githubHandle?: string;
  motivation?: string;
}

export interface NewsletterSubscriptionRequest {
  email: string;
  name?: string;
  communities?: string[];
}

// Response DTOs
export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  githubHandle?: string;
  profilePicture?: string;
  role: string;
  status: string;
  communities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  language: string;
  color: string;
  icon: string;
  codeSnippet: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Hook States
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Form Validation Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}
