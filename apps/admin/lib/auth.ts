import { apiClient } from './api-client';

export async function logout() {
  try {
    await apiClient.post('/users/admin/logout');
  } finally {
    window.location.href = '/login';
  }
}
