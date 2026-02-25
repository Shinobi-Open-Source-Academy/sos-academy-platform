/**
 * API Client for Admin Panel
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface ApiErrorData {
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  useCache?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private cache: Map<string, { data: ApiResponse<unknown>; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api';
    this.defaultTimeout = 10000;
    this.cache = new Map();
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Clear cache for a specific endpoint
   */
  clearCacheForEndpoint(endpoint: string) {
    const url = `${this.baseUrl}${endpoint}`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(url)) {
        this.cache.delete(key);
      }
    }
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      useCache = false,
    } = config;

    const url = `${this.baseUrl}${endpoint}`;

    // Check cache for GET requests when caching is enabled
    if (method === 'GET' && useCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return Promise.resolve(cached.data as ApiResponse<T>);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const error = new ApiError(
          data.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
        throw error;
      }

      const result: ApiResponse<T> = {
        data,
        status: response.status,
        success: true,
      };

      // Cache GET responses when caching is enabled
      if (method === 'GET' && useCache) {
        this.cache.set(url, { data: result, timestamp: Date.now() });
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 0);
      }

      throw new ApiError('Unknown error occurred', 0);
    }
  }

  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const apiClient = new ApiClient();
