'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDown, X } from 'lucide-react';
import { Dokumen, Boks } from '@/types';
import { patch } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LokasiDisplay from './LokasiDisplay';
import CascadingLokasiSelect from '@/components/form/CascadingLokasiSelect';

export interface PindahRakModalProps {
  dokumen: Dokumen | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PindahRakModal: React.FC<PindahRakModalProps> = ({
  dokumen,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedBoksId, setSelectedBoksId] = useState<number | null>(null);
  const [selectedBoksObj, setSelectedBoksObj] = useState<Boks | null>(null);
  const [alasan, setAlasan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorBoks, setErrorBoks] = useState<string>('');
  const [errorAlasan, setErrorAlasan] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedBoksId(null);
      setSelectedBoksObj(null);
      setAlasan('');
      setErrorBoks('');
      setErrorAlasan('');
    }
  }, [isOpen]);

  if (!isOpen || !dokumen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (!selectedBoksId) {
      setErrorBoks('Pilih boks tujuan pemindahan.');
      hasError = true;
    } else {
      setErrorBoks('');
    }

    if (!alasan || alasan.trim().length < 10) {
      setErrorAlasan('Alasan pemindahan minimal 10 karakter.');
      hasError = true;
    } else if (alasan.length > 255) {
      setErrorAlasan('Alasan pemindahan maksimal 255 karakter.');
      hasError = true;
    } else {
      setErrorAlasan('');
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      await patch(`/dokumen/${dokumen.id}/pindah`, {
        boks_id_baru: selectedBoksId,
        alasan: alasan.trim(),
      });

      toast.success(`Dokumen ${dokumen.nomor_gu} berhasil dipindahkan`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Gagal memindahkan lokasi dokumen';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="fixed inset-0" onClick={isSubmitting ? undefined : onClose} aria-hidden="true" />

      <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-2xl border border-border-color p-6 z-10 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 rounded-full text-text-secondary hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 pr-6">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Mutasi Lokasi Fisik
          </span>
          <h3 className="text-lg font-bold text-primary-dark">
            Pindah Lokasi: <span className="font-mono text-primary">{dokumen.nomor_gu}</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lokasi Saat Ini (Read-Only) */}
          <div className="bg-gray-50 border border-border-color rounded-xl p-3.5">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
              Lokasi Saat Ini
            </span>
            <LokasiDisplay
              lokasi={dokumen.lokasi}
              lokasiLengkap={
                dokumen.lokasi?.lokasi_lengkap ||
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (dokumen as any).lokasi_lengkap
              }
              size="compact"
            />
          </div>

          {/* Panah Pemisah */}
          <div className="flex justify-center -my-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Lokasi Tujuan Baru */}
          <div className="bg-white border-2 border-primary/30 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-3">
              Pilih Lokasi Tujuan Baru
            </span>

            <CascadingLokasiSelect
              selectedBoksId={selectedBoksId}
              onBoksSelect={(id, boksObj) => {
                setSelectedBoksId(id);
                setSelectedBoksObj(boksObj || null);
                if (id) setErrorBoks('');
              }}
              errorMessage={errorBoks}
            />

            {/* Info Kapasitas Boks Real-Time */}
            {selectedBoksObj && (
              <div className="mt-3 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-text-main flex items-center justify-between">
                <span>Kapasitas Boks {selectedBoksObj.nomor}:</span>
                <span className="font-bold text-primary">
                  {selectedBoksObj.terisi}/{selectedBoksObj.kapasitas} terisi (Sisa: {selectedBoksObj.sisa || selectedBoksObj.kapasitas - selectedBoksObj.terisi} slot)
                </span>
              </div>
            )}
          </div>

          {/* Alasan Pemindahan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                Alasan Pemindahan *
              </label>
              <span className="text-[11px] text-text-secondary font-mono">
                {alasan.length}/255
              </span>
            </div>

            <textarea
              rows={3}
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value);
                if (e.target.value.trim().length >= 10) setErrorAlasan('');
              }}
              maxLength={255}
              placeholder="Contoh: Reorganisasi rak bulan Desember, pemindahan karena rak penuh, validasi sengketa..."
              className={`w-full text-xs font-medium rounded-lg border bg-white p-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs ${
                errorAlasan ? 'border-red-500' : 'border-border-color'
              }`}
            />
            {errorAlasan && <p className="text-xs text-red-500 font-medium mt-1">{errorAlasan}</p>}
          </div>

          {/* Tombol Aksi */}
          <div className="pt-3 border-t border-border-color flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border-color text-text-main hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !selectedBoksId || alasan.trim().length < 10}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary-light text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <LoadingSpinner size="sm" color="text-white" />}
              <span>Simpan Pemindahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PindahRakModal;
