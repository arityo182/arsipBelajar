'use client';

import { useState, useCallback, useEffect } from 'react';
import { Ruang, Rak, Shaf, Boks, Album, ApiResponse } from '@/types';
import { get, post, put, del } from '@/lib/api';
import toast from 'react-hot-toast';

export function useLokasiAdmin() {
  const [ruangList, setRuangList] = useState<Ruang[]>([]);
  const [rakList, setRakList] = useState<Rak[]>([]);
  const [shafList, setShafList] = useState<Shaf[]>([]);
  const [boksList, setBoksList] = useState<Boks[]>([]);
  const [albumList, setAlbumList] = useState<Album[]>([]);

  const [isLoading, setIsLoading] = useState({
    global: true,
    ruang: false,
    rak: false,
    shaf: false,
    boks: false,
    album: false,
  });

  // ================================================================
  // FETCHERS
  // ================================================================

  const fetchRuang = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, ruang: true }));
    try {
      const res = await get<ApiResponse<Ruang[]>>('/admin/lokasi/ruang');
      setRuangList(res.data);
      return res.data;
    } catch {
      toast.error('Gagal memuat data ruang');
      return [];
    } finally {
      setIsLoading((prev) => ({ ...prev, ruang: false }));
    }
  }, []);

  const fetchRak = useCallback(async (ruangId?: number | null) => {
    setIsLoading((prev) => ({ ...prev, rak: true }));
    try {
      const params = ruangId ? { ruang_id: ruangId } : undefined;
      const res = await get<ApiResponse<Rak[]>>('/admin/lokasi/rak', params);
      setRakList(res.data);
      return res.data;
    } catch {
      toast.error('Gagal memuat data rak');
      return [];
    } finally {
      setIsLoading((prev) => ({ ...prev, rak: false }));
    }
  }, []);

  const fetchAlbum = useCallback(async (rakId?: number | null) => {
    setIsLoading((prev) => ({ ...prev, album: true }));
    try {
      const params = rakId ? { rak_id: rakId } : undefined;
      const res = await get<ApiResponse<Album[]>>('/admin/lokasi/album', params);
      setAlbumList(res.data);
      return res.data;
    } catch {
      toast.error('Gagal memuat data album');
      return [];
    } finally {
      setIsLoading((prev) => ({ ...prev, album: false }));
    }
  }, []);

  const fetchShaf = useCallback(async (rakId?: number | null) => {
    setIsLoading((prev) => ({ ...prev, shaf: true }));
    try {
      const params = rakId ? { rak_id: rakId } : undefined;
      const res = await get<ApiResponse<Shaf[]>>('/admin/lokasi/shaf', params);
      setShafList(res.data);
      return res.data;
    } catch {
      toast.error('Gagal memuat data shaf');
      return [];
    } finally {
      setIsLoading((prev) => ({ ...prev, shaf: false }));
    }
  }, []);

  const fetchBoks = useCallback(async (shafId?: number | null) => {
    setIsLoading((prev) => ({ ...prev, boks: true }));
    try {
      const params = shafId ? { shaf_id: shafId } : undefined;
      const res = await get<ApiResponse<Boks[]>>('/admin/lokasi/boks', params);
      setBoksList(res.data);
      return res.data;
    } catch {
      toast.error('Gagal memuat data boks');
      return [];
    } finally {
      setIsLoading((prev) => ({ ...prev, boks: false }));
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, global: true }));
    try {
      const [resRuang, resRak, resShaf, resAlbum] = await Promise.all([
        get<ApiResponse<Ruang[]>>('/admin/lokasi/ruang').catch(() => ({ data: [] })),
        get<ApiResponse<Rak[]>>('/admin/lokasi/rak').catch(() => ({ data: [] })),
        get<ApiResponse<Shaf[]>>('/admin/lokasi/tingkat').catch(() => ({ data: [] })),
        get<ApiResponse<Album[]>>('/admin/lokasi/album').catch(() => ({ data: [] })),
      ]);

      setRuangList(resRuang.data || []);
      setRakList(resRak.data || []);
      setShafList(resShaf.data || []);
      setAlbumList(resAlbum.data || []);
    } catch {
      toast.error('Gagal memuat master data lokasi arsip');
    } finally {
      setIsLoading((prev) => ({ ...prev, global: false }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ================================================================
  // MUTATIONS: RUANG
  // ================================================================

  const createRuang = async (payload: { nama: string; kode: string; deskripsi?: string }) => {
    const res = await post<ApiResponse<Ruang>>('/admin/lokasi/ruang', payload);
    await fetchRuang();
    return res.data;
  };

  const updateRuang = async (id: number, payload: { nama: string; kode: string; deskripsi?: string }) => {
    const res = await put<ApiResponse<Ruang>>(`/admin/lokasi/ruang/${id}`, payload);
    await fetchRuang();
    return res.data;
  };

  const deleteRuang = async (id: number) => {
    const res = await del<ApiResponse<null>>(`/admin/lokasi/ruang/${id}`);
    await fetchRuang();
    return res;
  };

  // ================================================================
  // MUTATIONS: RAK
  // ================================================================

  const createRak = async (payload: { kode: string; ruang_id: number; nama?: string }) => {
    const res = await post<ApiResponse<Rak>>('/admin/lokasi/rak', payload);
    await fetchRak();
    return res.data;
  };

  const updateRak = async (id: number, payload: { kode: string; ruang_id: number; nama?: string }) => {
    const res = await put<ApiResponse<Rak>>(`/admin/lokasi/rak/${id}`, payload);
    await fetchRak();
    return res.data;
  };

  const deleteRak = async (id: number) => {
    const res = await del<ApiResponse<null>>(`/admin/lokasi/rak/${id}`);
    await fetchRak();
    return res;
  };

  // ================================================================
  // MUTATIONS: TINGKATAN RAK (SHAF)
  // ================================================================

  const createTingkat = async (payload: { kode: string; rak_id: number }) => {
    const res = await post<ApiResponse<Shaf>>('/admin/lokasi/tingkat', payload);
    await fetchShaf();
    return res.data;
  };

  const updateTingkat = async (id: number, payload: { kode: string; rak_id: number }) => {
    const res = await put<ApiResponse<Shaf>>(`/admin/lokasi/tingkat/${id}`, payload);
    await fetchShaf();
    return res.data;
  };

  const deleteTingkat = async (id: number) => {
    const res = await del<ApiResponse<null>>(`/admin/lokasi/tingkat/${id}`);
    await fetchShaf();
    return res;
  };

  // ================================================================
  // MUTATIONS: ALBUM
  // ================================================================

  const createAlbum = async (payload: { rak_id: number; nomor_album: number; tingkat?: string | null; posisi?: string | null; kapasitas: number }) => {
    const res = await post<ApiResponse<Album>>('/admin/lokasi/album', payload);
    await fetchAlbum();
    return res.data;
  };

  const updateAlbum = async (id: number, payload: { rak_id: number; nomor_album: number; tingkat?: string | null; posisi?: string | null; kapasitas: number }) => {
    const res = await put<ApiResponse<Album>>(`/admin/lokasi/album/${id}`, payload);
    await fetchAlbum();
    return res.data;
  };

  const deleteAlbum = async (id: number) => {
    const res = await del<ApiResponse<null>>(`/admin/lokasi/album/${id}`);
    await fetchAlbum();
    return res;
  };

  return {
    ruangList,
    rakList,
    shafList,
    tingkatList: shafList,
    boksList,
    albumList,
    isLoading,
    fetchAll,
    fetchRuang,
    fetchRak,
    fetchShaf,
    fetchTingkat: fetchShaf,
    fetchAlbum,
    createRuang,
    updateRuang,
    deleteRuang,
    createRak,
    updateRak,
    deleteRak,
    createShaf: createTingkat,
    updateShaf: updateTingkat,
    deleteShaf: deleteTingkat,
    createTingkat,
    updateTingkat,
    deleteTingkat,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    createBoks: async () => {},
    updateBoks: async () => {},
    deleteBoks: async () => {},
  };
}
