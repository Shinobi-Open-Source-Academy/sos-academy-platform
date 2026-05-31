'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await apiClient.get<AdminUser>('/users/admin/me');
      setAdmin(res.data ?? null);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/users/admin/logout');
    } finally {
      setAdmin(null);
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ admin, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Drop-in hook for protected pages: redirects to /login if not authenticated */
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.admin) {
      window.location.href = '/login';
    }
  }, [auth.loading, auth.admin]);

  return auth;
}
