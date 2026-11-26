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
 * Hook untuk mengambil daftar dokumen terpaginasi dengan pencarian real-time dan multi-filter
 */
export function useDokumen({
  search,
  page,
  per_page,
  status_berkas,
  nomor_album,
  jenis_permohonan,
  rak_id
}: SearchParams): UseDokumenReturn {
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const prevFiltersRef = useRef<string>('');
  const activeControllerRef = useRef<AbortController | null>(null);

  const currentFiltersKey = `${search}|${status_berkas || ''}|${nomor_album || ''}|${jenis_permohonan || ''}|${rak_id || ''}`;

  const fetchDokumen = useCallback(
    async (currentPage: number, currentSearch: string, signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = {
          search: currentSearch,
          page: currentPage,
          per_page,
        };

        if (status_berkas) params.status_berkas = status_berkas;
        if (nomor_album) params.nomor_album = nomor_album;
        if (jenis_permohonan) params.jenis_permohonan = jenis_permohonan;
        if (rak_id) params.rak_id = rak_id;

        const response = await get<PaginatedResponse<Dokumen>>(
          '/dokumen',
          params,
          { signal }
        );

        setDokumen(response.data);
        setMeta(response.meta);
      } catch (err: unknown) {
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
    [per_page, status_berkas, nomor_album, jenis_permohonan, rak_id]
  );

  useEffect(() => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;

    let targetPage = page;

    if (prevFiltersRef.current !== currentFiltersKey) {
      prevFiltersRef.current = currentFiltersKey;
      targetPage = 1;
    }

    fetchDokumen(targetPage, search, controller.signal);

    return () => {
      controller.abort();
    };
  }, [search, page, currentFiltersKey, fetchDokumen]);

  const refetch = useCallback(async () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;
    await fetchDokumen(page, search, controller.signal);
  }, [page, search, fetchDokumen]);

  return { dokumen, meta, isLoading, error, refetch };
}
