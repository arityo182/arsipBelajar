// ================================================================
// src/store/authStore.ts
// SIPLOK — Zustand Authentication Store
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User, AuthResponse, ApiResponse } from '@/types';
import { post, get } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, getStore) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  /**
   * Login pengguna, simpan token & user ke sessionStorage serta cookies untuk Edge Middleware
   */
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      const { token, user } = response.data;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('siplok_token', token);
        sessionStorage.setItem('siplok_user', JSON.stringify(user));

        // Sinkronisasi cookie untuk Edge Runtime middleware (kedaluwarsa 8 jam / 0.33 hari)
        Cookies.set('siplok_token', token, { expires: 1 / 3, sameSite: 'strict' });
        Cookies.set('siplok_role', user.role, { expires: 1 / 3, sameSite: 'strict' });
      }

      set({
        token,
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Logout pengguna, blacklist token di server, lalu hapus sessionStorage & cookies
   */
  logout: async () => {
    try {
      // Fire and forget, abaikan jika terjadi error di jaringan
      await post('/auth/logout').catch(() => {
        // Abaikan error pada logout
      });
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('siplok_token');
        sessionStorage.removeItem('siplok_user');
        Cookies.remove('siplok_token');
        Cookies.remove('siplok_role');
      }

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  /**
   * Verifikasi validitas token aktif ke backend (/auth/me)
   */
  checkAuth: async () => {
    if (typeof window === 'undefined') return;

    const token = sessionStorage.getItem('siplok_token');
    if (!token) {
      return;
    }

    set({ token, isAuthenticated: true });

    try {
      const response = await get<ApiResponse<User>>('/auth/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error: unknown) {
      // Type narrowing aman tanpa tipe 'any' untuk menangani variasi format rejection AxiosError
      if (
        typeof error === 'object' &&
        error !== null &&
        (('response' in error && (error as { response?: { status?: number } }).response?.status === 401) ||
          ('status' in error && (error as { status?: number }).status === 401))
      ) {
        await getStore().logout();
      }
    }
  },

  /**
   * Inisialisasi cepat dari sessionStorage pada saat mount aplikasi (tanpa blocking render)
   */
  initFromStorage: () => {
    if (typeof window === 'undefined') return;

    const token = sessionStorage.getItem('siplok_token');
    const userJson = sessionStorage.getItem('siplok_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        set({
          token,
          user,
          isAuthenticated: true,
        });
      } catch {
        sessionStorage.removeItem('siplok_token');
        sessionStorage.removeItem('siplok_user');
      }
    }
  },
}));
