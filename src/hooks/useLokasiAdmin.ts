'use client';

import { useState, useCallback, useEffect } from 'react';
import { Ruang, Rak, Shaf, Boks, ApiResponse } from '@/types';
import { get, post, put, del } from '@/lib/api';
import toast from 'react-hot-toast';

export function useLokasiAdmin() {
  const [ruangList, setRuangList] = useState<Ruang[]>([]);
  const [rakList, setRakList] = useState<Rak[]>([]);
  const [shafList, setShafList] = useState<Shaf[]>([]);
  const [boksList, setBoksList] = useState<Boks[]>([]);

  const [isLoading, setIsLoading] = useState({
    global: true,
    ruang: false,
    rak: false,
    shaf: false,
    boks: false,
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
      const [resRuang, resRak, resShaf, resBoks] = await Promise.all([
        get<ApiResponse<Ruang[]>>('/admin/lokasi/ruang'),
        get<ApiResponse<Rak[]>>('/admin/lokasi/rak'),
        get<ApiResponse<Shaf[]>>('/admin/lokasi/shaf'),
        get<ApiResponse<Boks[]>>('/admin/lokasi/boks'),
      ]);

      setRuangList(resRuang.data);
      setRakList(resRak.data);
      setShafList(resShaf.data);
      setBoksList(resBoks.data);
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
  // CRUD RUANG
  // ================================================================

  const createRuang = async (data: { nama: string; kode: string; deskripsi?: string }) => {
    const res = await post<ApiResponse<Ruang>>('/admin/lokasi/ruang', data);
    toast.success('Berhasil menambahkan ruang baru');
    await fetchRuang();
    return res.data;
  };

  const updateRuang = async (id: number, data: { nama: string; kode: string; deskripsi?: string }) => {
    const res = await put<ApiResponse<Ruang>>(`/admin/lokasi/ruang/${id}`, data);
    toast.success('Berhasil memperbarui data ruang');
    await fetchRuang();
    return res.data;
  };

  const deleteRuang = async (id: number) => {
    await del(`/admin/lokasi/ruang/${id}`);
    toast.success('Ruang berhasil dihapus');
    await fetchAll();
  };

  // ================================================================
  // CRUD RAK
  // ================================================================

  const createRak = async (data: { ruang_id: number; kode: string; nama?: string }) => {
    const res = await post<ApiResponse<Rak>>('/admin/lokasi/rak', data);
    toast.success('Berhasil menambahkan rak baru');
    await fetchRak();
    return res.data;
  };

  const updateRak = async (id: number, data: { ruang_id: number; kode: string; nama?: string }) => {
    const res = await put<ApiResponse<Rak>>(`/admin/lokasi/rak/${id}`, data);
    toast.success('Berhasil memperbarui data rak');
    await fetchRak();
    return res.data;
  };

  const deleteRak = async (id: number) => {
    await del(`/admin/lokasi/rak/${id}`);
    toast.success('Rak berhasil dihapus');
    await fetchAll();
  };

  // ================================================================
  // CRUD SHAF
  // ================================================================

  const createShaf = async (data: { rak_id: number; kode: string; nama?: string }) => {
    const res = await post<ApiResponse<Shaf>>('/admin/lokasi/shaf', data);
    toast.success('Berhasil menambahkan shaf baru');
    await fetchShaf();
    return res.data;
  };

  const updateShaf = async (id: number, data: { rak_id: number; kode: string; nama?: string }) => {
    const res = await put<ApiResponse<Shaf>>(`/admin/lokasi/shaf/${id}`, data);
    toast.success('Berhasil memperbarui data shaf');
    await fetchShaf();
    return res.data;
  };

  const deleteShaf = async (id: number) => {
    await del(`/admin/lokasi/shaf/${id}`);
    toast.success('Shaf berhasil dihapus');
    await fetchAll();
  };

  // ================================================================
  // CRUD BOKS
  // ================================================================

  const createBoks = async (data: { shaf_id: number; nomor: string; kapasitas: number }) => {
    const res = await post<ApiResponse<Boks>>('/admin/lokasi/boks', data);
    toast.success('Berhasil menambahkan boks baru');
    await fetchBoks();
    return res.data;
  };

  const updateBoks = async (id: number, data: { shaf_id: number; nomor: string; kapasitas: number }) => {
    const res = await put<ApiResponse<Boks>>(`/admin/lokasi/boks/${id}`, data);
    toast.success('Berhasil memperbarui data boks');
    await fetchBoks();
    return res.data;
  };

  const deleteBoks = async (id: number) => {
    await del(`/admin/lokasi/boks/${id}`);
    toast.success('Boks berhasil dihapus');
    await fetchAll();
  };

  return {
    ruangList,
    rakList,
    shafList,
    boksList,
    isLoading,
    fetchAll,
    fetchRuang,
    fetchRak,
    fetchShaf,
    fetchBoks,
    createRuang,
    updateRuang,
    deleteRuang,
    createRak,
    updateRak,
    deleteRak,
    createShaf,
    updateShaf,
    deleteShaf,
    createBoks,
    updateBoks,
    deleteBoks,
  };
}
