/**
 * Custom API Hooks for Shinobi Open-Source Academy
 * Provides reusable hooks for API interactions with proper state management
 */

import { useCallback, useState } from 'react';
import { ApiError, apiClient } from '../api-client';
import type { ApiMutationState, ApiState } from '../types/api';

/**
 * Generic hook for API mutations (POST, PUT, DELETE)
 */
export function useApiMutation<TData = unknown, TVariables = unknown>() {
  const [state, setState] = useState<ApiMutationState<TData>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const mutate = useCallback(
    async (endpoint: string, variables: TVariables, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
      setState((prev) => ({ ...prev, loading: true, error: null, success: false }));

      try {
        let response: { data?: TData; status: number; success: boolean };
        switch (method) {
          case 'POST':
            response = await apiClient.post<TData>(endpoint, variables);
            break;
          case 'PUT':
            response = await apiClient.put<TData>(endpoint, variables);
            break;
          case 'DELETE':
            response = await apiClient.delete<TData>(endpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        setState({
          data: response.data || null,
          loading: false,
          error: null,
          success: true,
        });

        return response.data;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError ? error.message : 'An unexpected error occurred';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false,
        });
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

/**
 * Hook for community joining
 */
export function useCommunityJoin() {
  const mutation = useApiMutation();

  const joinCommunity = useCallback(
    async (data: {
      email: string;
      name?: string;
      communities?: string[];
      githubHandle?: string;
    }) => {
      return mutation.mutate('/users/join/community', data, 'POST');
    },
    [mutation]
  );

  return {
    ...mutation,
    joinCommunity,
  };
}

/**
 * Hook for mentor applications
 */
export function useMentorApplication() {
  const mutation = useApiMutation();

  const submitApplication = useCallback(
    async (data: {
      name: string;
      email: string;
      expertise?: string;
      githubHandle?: string;
      motivation?: string;
    }) => {
      return mutation.mutate('/users/mentor-application', data, 'POST');
    },
    [mutation]
  );

  return {
    ...mutation,
    submitApplication,
  };
}

/**
 * Hook for newsletter subscription
 */
export function useNewsletterSubscription() {
  const mutation = useApiMutation();

  const subscribe = useCallback(
    async (data: { email: string; name?: string; communities?: string[] }) => {
      return mutation.mutate('/users/subscribe', data, 'POST');
    },
    [mutation]
  );

  return {
    ...mutation,
    subscribe,
  };
}

/**
 * Hook for fetching communities
 */
export function useCommunities() {
  const [state, setState] = useState<ApiState<unknown[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchCommunities = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.get<unknown[]>('/communities');
      setState({
        data: response.data || null,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to fetch communities';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    fetchCommunities,
  };
}
