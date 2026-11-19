'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, Clock, AlertTriangle, HelpCircle } from 'lucide-react';
import { Dokumen, StatusFisik } from '@/types';
import { patch } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { getStatusLabel } from '@/lib/utils';

export interface UpdateStatusModalProps {
  dokumen: Dokumen | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StatusOption {
  value: StatusFisik;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  badgeVariant: StatusFisik;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'TERSEDIA',
    title: 'Tersedia di Kantor',
    description: 'Dokumen berada aman di boks dan rak penyimpanan fisik.',
    icon: CheckCircle2,
    activeClass: 'border-green-600 bg-green-50/80 text-green-950 ring-2 ring-green-600/30',
    badgeVariant: 'TERSEDIA',
  },
  {
    value: 'DIPINJAM',
    title: 'Sedang Dipinjam / Proses',
    description: 'Dipinjam oleh seksi teknis lain untuk validasi atau pelayanan warkah.',
    icon: Clock,
    activeClass: 'border-yellow-600 bg-yellow-50/80 text-yellow-950 ring-2 ring-yellow-600/30',
    badgeVariant: 'DIPINJAM',
  },
  {
    value: 'RUSAK',
    title: 'Dalam Perbaikan / Rusak',
    description: 'Fisik warkah lapuk, robek, atau membutuhkan tindakan restorasi arsip.',
    icon: AlertTriangle,
    activeClass: 'border-red-600 bg-red-50/80 text-red-950 ring-2 ring-red-600/30',
    badgeVariant: 'RUSAK',
  },
  {
    value: 'HILANG',
    title: 'Tidak Ditemukan / Hilang',
    description: 'Fisik dokumen tidak berada di lokasi boks koordinat terdaftar.',
    icon: HelpCircle,
    activeClass: 'border-gray-600 bg-gray-100 text-gray-950 ring-2 ring-gray-600/30',
    badgeVariant: 'HILANG',
  },
];

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  dokumen,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusFisik>('TERSEDIA');
  const [keterangan, setKeterangan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen && dokumen) {
      setSelectedStatus(dokumen.status_fisik || 'TERSEDIA');
      setKeterangan('');
      setErrorMessage('');
    }
  }, [isOpen, dokumen]);

  if (!isOpen || !dokumen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStatus === dokumen.status_fisik && !keterangan.trim()) {
      setErrorMessage('Pilih status baru yang berbeda dari status saat ini, atau cantumkan catatan perubahan.');
      return;
    }

    if (keterangan.length > 255) {
      setErrorMessage('Keterangan maksimal 255 karakter.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await patch(`/dokumen/${dokumen.id}/status`, {
        status_fisik: selectedStatus,
        keterangan: keterangan.trim() || undefined,
      });

      toast.success(`Status dokumen ${dokumen.nomor_gu} berhasil diubah ke ${getStatusLabel(selectedStatus)}`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Gagal memperbarui status fisik dokumen';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="fixed inset-0" onClick={isSubmitting ? undefined : onClose} aria-hidden="true" />

      <div className="relative w-full max-w-[540px] bg-white rounded-2xl shadow-2xl border border-border-color p-6 z-10 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 rounded-full text-text-secondary hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="mb-5 pr-6 border-b border-border-color pb-3">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <RefreshCw className="w-4 h-4" />
            <span>Pembaruan Status Fisik</span>
          </div>
          <h3 className="text-lg font-black text-primary-dark tracking-tight">
            Ubah Status: <span className="font-mono text-primary">{dokumen.nomor_gu}</span>
          </h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
            <span>Status Saat Ini:</span>
            <Badge variant={dokumen.status_fisik} size="sm" />
            <span className="text-gray-300">•</span>
            <span>NIB: <strong className="font-mono text-text-main">{dokumen.nib}</strong></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilihan Status */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Pilih Status Fisik Baru <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedStatus === opt.value;
                const isCurrent = dokumen.status_fisik === opt.value;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(opt.value);
                      setErrorMessage('');
                    }}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? opt.activeClass
                        : 'border-border-color bg-gray-50/50 hover:bg-gray-50 text-text-main'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-current' : 'text-text-secondary'}`} />
                        <span className="text-xs font-bold leading-tight">{opt.title}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary leading-normal">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keterangan / Alasan */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="keterangan" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                Catatan / Alasan Perubahan
              </label>
              <span className="text-[10px] text-text-secondary font-mono">
                {keterangan.length}/255
              </span>
            </div>
            <textarea
              id="keterangan"
              rows={3}
              maxLength={255}
              value={keterangan}
              onChange={(e) => {
                setKeterangan(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Contoh: Dipinjam oleh Seksi Penetapan Hak untuk keperluan verifikasi warkah PTSL..."
              className="w-full text-xs rounded-xl border border-border-color bg-white px-3 py-2 text-text-main placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <p className="text-[10px] text-text-secondary mt-1">
              Catatan ini akan tersimpan permanen di riwayat aktivitas mutasi dokumen sebagai rekam jejak petugas.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Tombol Aksi */}
          <div className="pt-3 border-t border-border-color flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-color bg-white hover:bg-gray-100 text-text-secondary transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
