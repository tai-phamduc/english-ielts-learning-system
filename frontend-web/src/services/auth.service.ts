import api from '@/lib/api';
import { STORAGE_KEYS } from '@/constants';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

export const authService = {
  /**
   * Login user and store access token
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    if (data.access_token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<any> {
    const parts = userData.fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || parts[0]; // Default to firstName if lastName is empty

    const { data } = await api.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      firstName,
      lastName,
      role: userData.role || 'STUDENT',
    });
    return data;
  },

  /**
   * Logout user and clear tokens
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get current access token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get current user
   */
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
