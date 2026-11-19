// ================================================================
// src/hooks/useDokumen.ts
// SIPLOK — Dokumen Pertanahan Data Fetching Hook
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Dokumen, PaginationMeta, PaginatedResponse, SearchParams } from '@/types';
import { get } from '@/lib/api';

export interface UseDokumenReturn {
  dokumen: Dokumen[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook untuk mengambil daftar dokumen terpaginasi dengan pencarian real-time dan AbortController
 */
export function useDokumen({ search, page, per_page }: SearchParams): UseDokumenReturn {
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Menyimpan referensi kata kunci pencarian sebelumnya untuk mendeteksi perubahan
  const prevSearchRef = useRef<string>(search);
  const activeControllerRef = useRef<AbortController | null>(null);

  const fetchDokumen = useCallback(
    async (currentPage: number, currentSearch: string, signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await get<PaginatedResponse<Dokumen>>(
          '/dokumen',
          {
            search: currentSearch,
            page: currentPage,
            per_page,
          },
          { signal }
        );

        setDokumen(response.data);
        setMeta(response.meta);
      } catch (err: unknown) {
        // Jangan tampilkan toast/error jika request sengaja dibatalkan oleh user/cleanup
        if (axios.isCancel(err) || (err instanceof Error && err.name === 'CanceledError')) {
          return;
        }

        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Gagal memuat data dokumen pertanahan.';

        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [per_page]
  );

  useEffect(() => {
    // Batalkan request yang sedang berjalan jika ada pergantian filter/halaman
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;

    let targetPage = page;

    // Jika search berubah dari state sebelumnya, otomatis reset ke halaman 1
    if (prevSearchRef.current !== search) {
      prevSearchRef.current = search;
      targetPage = 1;
    }

    fetchDokumen(targetPage, search, controller.signal);

    return () => {
      controller.abort();
    };
  }, [search, page, fetchDokumen]);

  const refetch = useCallback(async () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;
    await fetchDokumen(page, search, controller.signal);
  }, [fetchDokumen, page, search]);

  return {
    dokumen,
    meta,
    isLoading,
    error,
    refetch,
  };
}
