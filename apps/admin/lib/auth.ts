/**
 * Simple admin authentication
 */

const AUTH_KEY = 'admin_authenticated';

export const setAuthenticated = (value: boolean) => {
  if (value) {
    localStorage.setItem(AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = '/login';
};
