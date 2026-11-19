import { useState } from 'react';
import axios from 'axios';
import { PublikDokumen, PublikCekResponse } from '@/types/publik';

export function usePublikCek() {
  const [hasil, setHasil] = useState<PublikDokumen[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catatan, setCatatan] = useState<string>('');
  const [sudahDicari, setSudahDicari] = useState(false);

  const cari = async (params: {
    nomor_gu?: string;
    nib?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await axios.get<PublikCekResponse>(
        `${baseUrl}/publik/cek`,
        { params }
      );
      setHasil(res.data.data);
      setCatatan(res.data.catatan);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setError('Terlalu banyak permintaan. Coba lagi dalam 1 menit.');
        } else {
          setError(
            err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.'
          );
        }
      } else {
        setError('Terjadi kesalahan jaringan. Coba lagi.');
      }
    } finally {
      setIsLoading(false);
      setSudahDicari(true);
    }
  };

  const reset = () => {
    setHasil([]);
    setError(null);
    setCatatan('');
    setSudahDicari(false);
  };

  return {
    hasil,
    isLoading,
    error,
    catatan,
    sudahDicari,
    cari,
    reset,
  };
}
