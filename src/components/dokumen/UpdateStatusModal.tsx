'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRightLeft, FileWarning } from 'lucide-react';
import { Dokumen, StatusFisik } from '@/types';
import { patch } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface UpdateStatusModalProps {
  dokumen: Dokumen | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  dokumen,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusFisik>('TERSEDIA');
  const [keterangan, setKeterangan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && dokumen) {
      const current = (dokumen as any).status_fisik || dokumen.status_berkas || 'TERSEDIA';
      setSelectedStatus(current);
      setKeterangan(dokumen.keterangan || '');
    }
  }, [isOpen, dokumen]);

  if (!isOpen || !dokumen) return null;

  const noDi302 = dokumen.nomor_di302 || dokumen.nomor_gu || '-';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await patch(`/dokumen/${dokumen.id}/status`, {
        status_fisik: selectedStatus,
        status_berkas: selectedStatus,
        keterangan: keterangan.trim() || undefined,
      });

      toast.success(`Status fisik berkas DI-302 No. ${noDi302} berhasil diperbarui!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal memperbarui status berkas';
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
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-color flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-primary-dark">Update Status Fisik Berkas</h3>
            <p className="text-xs text-text-secondary">
              DI-302 No. {noDi302} &bull; Pemohon: {dokumen.nama_pemohon || (dokumen as any).nama_pemilik}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-text-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          <div>
            <label className="block text-xs font-bold text-text-main mb-2">
              Pilih Status Fisik Warkah / Berkas <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option TERSEDIA */}
              <div
                onClick={() => setSelectedStatus('TERSEDIA')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  selectedStatus === 'TERSEDIA'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-600/20'
                    : 'border-border-color bg-gray-50/50 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${selectedStatus === 'TERSEDIA' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-text-main block">TERSEDIA</span>
                  <span className="text-[10px] text-text-secondary">Ada di album fisik</span>
                </div>
              </div>

              {/* Option HILANG */}
              <div
                onClick={() => setSelectedStatus('HILANG')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  selectedStatus === 'HILANG'
                    ? 'border-rose-600 bg-rose-50/80 shadow-xs ring-2 ring-rose-600/20'
                    : 'border-border-color bg-gray-50/50 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${selectedStatus === 'HILANG' ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-text-main block">BELUM ADA / HILANG</span>
                  <span className="text-[10px] text-text-secondary">Tidak ada di album</span>
                </div>
              </div>

              {/* Option DIPINJAM */}
              <div
                onClick={() => setSelectedStatus('DIPINJAM')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  selectedStatus === 'DIPINJAM'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-600/20'
                    : 'border-border-color bg-gray-50/50 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${selectedStatus === 'DIPINJAM' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-text-main block">DIPINJAM</span>
                  <span className="text-[10px] text-text-secondary">Sedang dipinjam petugas</span>
                </div>
              </div>

              {/* Option RUSAK */}
              <div
                onClick={() => setSelectedStatus('RUSAK')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  selectedStatus === 'RUSAK'
                    ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-2 ring-amber-600/20'
                    : 'border-border-color bg-gray-50/50 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${selectedStatus === 'RUSAK' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <FileWarning className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-text-main block">RUSAK</span>
                  <span className="text-[10px] text-text-secondary">Dalam perbaikan fisik</span>
                </div>
              </div>
            </div>
          </div>

          {/* Keterangan Status */}
          <div>
            <label className="block text-xs font-bold text-text-main mb-1">
              Catatan / Keterangan Tambahan (Opsional)
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Berkas fisik dipinjam untuk verifikasi warkah pemetaan..."
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-border-color rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-color">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-border-color text-text-secondary hover:text-text-main font-bold transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="w-3.5 h-3.5" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
