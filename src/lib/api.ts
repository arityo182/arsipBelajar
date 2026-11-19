// ================================================================
// src/lib/api.ts
// SIPLOK Axios HTTP Client Instance & Interceptors
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { ApiError } from '@/types';

// SECURITY NOTE: Token di sessionStorage bersifat sementara.
// Upgrade ke httpOnly cookie saat backend mendukungnya.
// sessionStorage lebih aman dari localStorage karena tidak
// persisten antar tab dan terhapus saat browser ditutup.

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Injeksi Bearer JWT Token dari sessionStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('siplok_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Penanganan Otomatis Status 401, 422, dan Status Lainnya
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status, data } = error.response;

      // Status 401: Unauthorized / Sesi Berakhir
      if (status === 401) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('siplok_token');
          sessionStorage.removeItem('siplok_user');
          Cookies.remove('siplok_token');
          Cookies.remove('siplok_role');

          // Hindari loop redirect jika sudah berada di halaman login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        const authError: ApiError = {
          message: data?.message || 'Sesi login telah berakhir, silakan masuk kembali.',
        };
        return Promise.reject(authError);
      }

      // Status 422: Validasi Gagal (Shape: { message, errors })
      if (status === 422) {
        const validationError: ApiError = {
          message: data?.message || 'Validasi formulir gagal.',
          errors: data?.errors || {},
        };
        return Promise.reject(validationError);
      }

      // Status Lainnya (400, 403, 404, 500, dll.)
      const generalError: ApiError = {
        message: data?.message || error.message || 'Terjadi kesalahan pada server.',
      };
      return Promise.reject(generalError);
    }

    // Network Error / Timeout
    const networkError: ApiError = {
      message: error.message || 'Koneksi ke server gagal. Periksa jaringan Anda.',
    };
    return Promise.reject(networkError);
  }
);

// Helper Functions
export const get = async <T>(url: string, params?: Record<string, unknown>, config?: { signal?: AbortSignal }): Promise<T> => {
  const response = await api.get<T>(url, { params, signal: config?.signal });
  return response.data;
};

export const post = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.post<T>(url, data);
  return response.data;
};

export const put = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.put<T>(url, data);
  return response.data;
};

export const patch = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.patch<T>(url, data);
  return response.data;
};

export const del = async <T>(url: string): Promise<T> => {
  const response = await api.delete<T>(url);
  return response.data;
};

export default api;
