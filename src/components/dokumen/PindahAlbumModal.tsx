'use client';

import React, { useState, useEffect } from 'react';
import { X, MoveRight, BookOpen, AlertCircle } from 'lucide-react';
import { Dokumen, Rak, Album, ApiResponse } from '@/types';
import { get, patch } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface PindahAlbumModalProps {
  dokumen: Dokumen | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PindahAlbumModal: React.FC<PindahAlbumModalProps> = ({
  dokumen,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rakList, setRakList] = useState<Rak[]>([]);
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [selectedRakId, setSelectedRakId] = useState<number | null>(null);
  const [selectedAlbumNo, setSelectedAlbumNo] = useState<number | null>(null);
  const [nomorUrutBaru, setNomorUrutBaru] = useState<string>('');
  const [alasan, setAlasan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingRak, setLoadingRak] = useState<boolean>(false);
  const [loadingAlbum, setLoadingAlbum] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && dokumen) {
      setAlasan('');
      setNomorUrutBaru('');
      // Load raks
      setLoadingRak(true);
      get<ApiResponse<Rak[]>>('/lokasi/rak')
        .then((res) => {
          setRakList(res.data);
          const initialRakId = dokumen.rak_id || res.data[0]?.id || null;
          setSelectedRakId(initialRakId);
        })
        .catch(() => {
          toast.error('Gagal memuat data rak');
        })
        .finally(() => {
          setLoadingRak(false);
        });
    }
  }, [isOpen, dokumen]);

  // Load albums when rak changes
  useEffect(() => {
    if (selectedRakId) {
      setLoadingAlbum(true);
      get<ApiResponse<Album[]>>('/lokasi/album', { rak_id: selectedRakId })
        .then((res) => {
          setAlbumList(res.data);
        })
        .catch(() => {
          toast.error('Gagal memuat data album');
        })
        .finally(() => {
          setLoadingAlbum(false);
        });
    } else {
      setAlbumList([]);
    }
  }, [selectedRakId]);

  if (!isOpen || !dokumen) return null;

  const noDi302 = dokumen.nomor_di302 || dokumen.nomor_gu || '-';
  const rakKodeLama = dokumen.rak_kode || (dokumen as any).rak?.kode || 'E';
  const albumLama = dokumen.nomor_album || 1;
  const urutLama = dokumen.nomor_urut || 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAlbumNo) {
      toast.error('Pilih album tujuan pemindahan');
      return;
    }

    if (selectedAlbumNo === albumLama && (!selectedRakId || selectedRakId === dokumen.rak_id)) {
      toast.error('Album tujuan harus berbeda dari album saat ini');
      return;
    }

    if (!alasan || alasan.trim().length < 5) {
      toast.error('Alasan pemindahan minimal 5 karakter');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        nomor_album_baru: selectedAlbumNo,
        rak_id_baru: selectedRakId,
        alasan: alasan.trim(),
      };
      if (nomorUrutBaru) {
        payload.nomor_urut_baru = parseInt(nomorUrutBaru);
      }

      await patch(`/dokumen/${dokumen.id}/pindah-album`, payload);
      toast.success(`Berkas berhasil dipindahkan ke Album ${selectedAlbumNo}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal memindahkan album berkas';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Gelap */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-in font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-color flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent/20 text-accent-gold">
              <MoveRight className="w-5 h-5 text-accent-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary-dark">Pindah Lokasi Album</h3>
              <p className="text-xs text-text-secondary">
                DI-302 No. {noDi302} atas nama {dokumen.nama_pemohon || (dokumen as any).nama_pemilik}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-text-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Lokasi Saat Ini (Read-only) */}
          <div className="p-3 bg-gray-50 border border-border-color rounded-xl">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
              Lokasi Fisik Saat Ini:
            </span>
            <div className="font-mono text-xs font-bold text-primary-dark flex items-center gap-2">
              <span>📍 Rak {rakKodeLama}</span>
              <span>→</span>
              <span>📖 Album {albumLama}</span>
              <span>(Urut #{urutLama})</span>
            </div>
          </div>

          {/* Lokasi Tujuan Cascading */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Pilih Rak Tujuan *
              </label>
              <select
                value={selectedRakId || ''}
                onChange={(e) => {
                  const rId = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedRakId(rId);
                  setSelectedAlbumNo(null);
                }}
                disabled={loadingRak}
                className="w-full py-2 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main font-semibold"
              >
                <option value="">-- Pilih Rak --</option>
                {rakList.map((r) => (
                  <option key={r.id} value={r.id}>
                    Rak {r.kode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Pilih Album Tujuan *
              </label>
              <select
                value={selectedAlbumNo || ''}
                onChange={(e) => setSelectedAlbumNo(e.target.value ? parseInt(e.target.value) : null)}
                disabled={!selectedRakId || loadingAlbum}
                className="w-full py-2 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main font-bold"
              >
                <option value="">
                  {loadingAlbum ? 'Memuat album...' : '-- Pilih Album Tujuan --'}
                </option>
                {albumList.map((alb) => {
                  const isCurrent = alb.nomor_album === albumLama;
                  const isFull = alb.sisa <= 0;
                  return (
                    <option
                      key={alb.id}
                      value={alb.nomor_album}
                      disabled={isFull || isCurrent}
                    >
                      Album {alb.nomor_album} ({alb.terisi}/{alb.kapasitas} berkas)
                      {isCurrent ? ' (Saat ini)' : isFull ? ' — PENUH' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Nomor Urut Baru dalam Album (Opsional)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={nomorUrutBaru}
                onChange={(e) => setNomorUrutBaru(e.target.value)}
                placeholder="Otomatis slot berikutnya jika kosong"
                className="w-full py-2 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
              />
            </div>
          </div>

          {/* Alasan Pemindahan */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1">
              Alasan Pemindahan *
            </label>
            <textarea
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Jelaskan alasan pemindahan lokasi fisik album (contoh: Penataan ulang arsip seksi ukur)"
              className="w-full py-2 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
              required
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-color">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-text-main font-semibold transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !selectedAlbumNo || !alasan.trim()}
              className="py-2 px-5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="w-3.5 h-3.5" />
                  Memindahkan...
                </>
              ) : (
                'Simpan Pemindahan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PindahAlbumModal;
