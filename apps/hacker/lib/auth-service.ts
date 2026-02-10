import { IUser } from '@sos-academy/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api';

export const AuthService = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('hacker_token');
  },

  getUserFromLocalStorage(): IUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('hacker_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuthData(accessToken: string, user: IUser) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('hacker_token', accessToken);
    localStorage.setItem('hacker_user', JSON.stringify(user));
  },

  clearAuthData() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('hacker_token');
    localStorage.removeItem('hacker_user');
  },

  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('hacker_token', data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthData();
      return null;
    }
  },

  async logout() {
    try {
      const token = this.getAccessToken();
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.clearAuthData();
    }
  },

  initiateGitHubLogin() {
    window.location.href = `${API_URL}/auth/github`;
  },
};
