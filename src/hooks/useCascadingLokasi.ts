// ================================================================
// src/hooks/useCascadingLokasi.ts
// SIPLOK — Cascading Dropdown Hook for Physical Archive Location
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Ruang, Rak, Shaf, Boks, Lokasi, ApiResponse } from '@/types';
import { get } from '@/lib/api';

export interface UseCascadingLokasiReturn {
  lists: {
    ruangList: Ruang[];
    rakList: Rak[];
    shafList: Shaf[];
    boksList: Boks[];
  };
  selected: {
    selectedRuang: number | null;
    selectedRak: number | null;
    selectedShaf: number | null;
    selectedBoks: number | null;
  };
  handlers: {
    onRuangChange: (id: number | null) => void;
    onRakChange: (id: number | null) => void;
    onShafChange: (id: number | null) => void;
    onBoksChange: (id: number | null) => void;
  };
  loading: {
    ruang: boolean;
    rak: boolean;
    shaf: boolean;
    boks: boolean;
  };
  reset: () => void;
  setInitial: (data: Lokasi) => Promise<void>;
}

export function useCascadingLokasi(): UseCascadingLokasiReturn {
  const [ruangList, setRuangList] = useState<Ruang[]>([]);
  const [rakList, setRakList] = useState<Rak[]>([]);
  const [shafList, setShafList] = useState<Shaf[]>([]);
  const [boksList, setBoksList] = useState<Boks[]>([]);

  const [selectedRuang, setSelectedRuang] = useState<number | null>(null);
  const [selectedRak, setSelectedRak] = useState<number | null>(null);
  const [selectedShaf, setSelectedShaf] = useState<number | null>(null);
  const [selectedBoks, setSelectedBoks] = useState<number | null>(null);

  const [loading, setLoading] = useState({
    ruang: false,
    rak: false,
    shaf: false,
    boks: false,
  });

  // AbortController refs per level untuk mencegah race condition
  const ruangAbortRef = useRef<AbortController | null>(null);
  const rakAbortRef = useRef<AbortController | null>(null);
  const shafAbortRef = useRef<AbortController | null>(null);
  const boksAbortRef = useRef<AbortController | null>(null);

  // 1. Fetch Ruang saat komponen mount
  useEffect(() => {
    if (ruangAbortRef.current) ruangAbortRef.current.abort();
    const controller = new AbortController();
    ruangAbortRef.current = controller;

    setLoading((prev) => ({ ...prev, ruang: true }));
    get<ApiResponse<Ruang[]>>('/lokasi/ruang', undefined, { signal: controller.signal })
      .then((res) => {
        setRuangList(res.data);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          // Kesalahan jaringan atau server
        }
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, ruang: false }));
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Handlers untuk seleksi bertingkat
  const onRuangChange = useCallback((id: number | null) => {
    setSelectedRuang(id);
    setSelectedRak(null);
    setSelectedShaf(null);
    setSelectedBoks(null);

    setRakList([]);
    setShafList([]);
    setBoksList([]);

    if (rakAbortRef.current) rakAbortRef.current.abort();

    if (id) {
      const controller = new AbortController();
      rakAbortRef.current = controller;

      setLoading((prev) => ({ ...prev, rak: true }));
      get<ApiResponse<Rak[]>>('/lokasi/rak', { ruang_id: id }, { signal: controller.signal })
        .then((res) => {
          setRakList(res.data);
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            // Abaikan canceled
          }
        })
        .finally(() => {
          setLoading((prev) => ({ ...prev, rak: false }));
        });
    }
  }, []);

  const onRakChange = useCallback((id: number | null) => {
    setSelectedRak(id);
    setSelectedShaf(null);
    setSelectedBoks(null);

    setShafList([]);
    setBoksList([]);

    if (shafAbortRef.current) shafAbortRef.current.abort();

    if (id) {
      const controller = new AbortController();
      shafAbortRef.current = controller;

      setLoading((prev) => ({ ...prev, shaf: true }));
      get<ApiResponse<Shaf[]>>('/lokasi/shaf', { rak_id: id }, { signal: controller.signal })
        .then((res) => {
          setShafList(res.data);
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            // Abaikan canceled
          }
        })
        .finally(() => {
          setLoading((prev) => ({ ...prev, shaf: false }));
        });
    }
  }, []);

  const onShafChange = useCallback((id: number | null) => {
    setSelectedShaf(id);
    setSelectedBoks(null);

    setBoksList([]);

    if (boksAbortRef.current) boksAbortRef.current.abort();

    if (id) {
      const controller = new AbortController();
      boksAbortRef.current = controller;

      setLoading((prev) => ({ ...prev, boks: true }));
      get<ApiResponse<Boks[]>>('/lokasi/boks', { shaf_id: id }, { signal: controller.signal })
        .then((res) => {
          setBoksList(res.data);
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            // Abaikan canceled
          }
        })
        .finally(() => {
          setLoading((prev) => ({ ...prev, boks: false }));
        });
    }
  }, []);

  const onBoksChange = useCallback((id: number | null) => {
    setSelectedBoks(id);
  }, []);

  // Reset seluruh seleksi kembali ke kondisi awal
  const reset = useCallback(() => {
    setSelectedRuang(null);
    setSelectedRak(null);
    setSelectedShaf(null);
    setSelectedBoks(null);
    setRakList([]);
    setShafList([]);
    setBoksList([]);
  }, []);

  // Set nilai awal bertingkat saat mode edit dokumen
  const setInitial = useCallback(async (data: Lokasi) => {
    try {
      setSelectedRuang(data.ruang_id ?? null);
      setLoading((prev) => ({ ...prev, rak: true, shaf: true, boks: true }));

      // Fetch Rak
      const rakRes = await get<ApiResponse<Rak[]>>('/lokasi/rak', { ruang_id: data.ruang_id });
      setRakList(rakRes.data);
      setSelectedRak(data.rak_id ?? null);

      // Fetch Shaf
      const shafRes = await get<ApiResponse<Shaf[]>>('/lokasi/shaf', { rak_id: data.rak_id });
      setShafList(shafRes.data);
      setSelectedShaf(data.shaf_id ?? null);

      // Fetch Boks
      const boksRes = await get<ApiResponse<Boks[]>>('/lokasi/boks', { shaf_id: data.shaf_id });
      setBoksList(boksRes.data);
      setSelectedBoks(data.boks_id ?? null);
    } catch {
      // Tangani jika terjadi kegagalan initial fetch
    } finally {
      setLoading((prev) => ({ ...prev, rak: false, shaf: false, boks: false }));
    }
  }, []);

  return {
    lists: {
      ruangList,
      rakList,
      shafList,
      boksList,
    },
    selected: {
      selectedRuang,
      selectedRak,
      selectedShaf,
      selectedBoks,
    },
    handlers: {
      onRuangChange,
      onRakChange,
      onShafChange,
      onBoksChange,
    },
    loading,
    reset,
    setInitial,
  };
}
