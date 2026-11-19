'use client';

import React, { useState } from 'react';
import { MapPin, Copy, Check, Printer } from 'lucide-react';
import { Lokasi } from '@/types';
import toast from 'react-hot-toast';

export interface LokasiDisplayProps {
  lokasi?: Lokasi | null;
  lokasiLengkap?: string;
  size?: 'compact' | 'full';
  showCopy?: boolean;
  showPrint?: boolean;
  onPrint?: () => void;
  className?: string;
}

export const LokasiDisplay: React.FC<LokasiDisplayProps> = ({
  lokasi,
  lokasiLengkap,
  size = 'full',
  showCopy = true,
  showPrint = false,
  onPrint,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // Fallback string lokasi lengkap
  const ruangText = lokasi?.ruang_nama
    ? (lokasi.ruang_nama.startsWith('Ruang') ? lokasi.ruang_nama : `Ruang ${lokasi.ruang_nama}`)
    : '-';

  const stringLokasi =
    lokasiLengkap ||
    lokasi?.lokasi_lengkap ||
    (lokasi
      ? `${ruangText} → Rak ${lokasi.rak_kode || '-'} → Shaf ${lokasi.shaf_kode || '-'} → Boks ${lokasi.boks_nomor || '-'}`
      : 'Lokasi Belum Ditentukan');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stringLokasi);
      setCopied(true);
      toast.success('Lokasi fisik berhasil disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin lokasi ke clipboard');
    }
  };

  // 1. TAMPILAN COMPACT (Untuk Tabel & Badge Ringkas)
  if (size === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-[#FFF8E1] border border-accent rounded-lg px-2.5 py-1 text-xs font-semibold text-primary-dark shadow-2xs max-w-[240px] truncate ${className}`}
        title={stringLokasi}
      >
        <span className="flex-shrink-0 text-sm">📍</span>
        <span className="truncate">{stringLokasi}</span>
      </div>
    );
  }

  // 2. TAMPILAN FULL (Untuk Modal Detail & Kartu Informasi)
  return (
    <div
      className={`bg-[#FFF8E1] border-2 border-accent rounded-xl p-4 shadow-[0_2px_8px_rgba(255,215,0,0.2)] relative ${className}`}
    >
      {/* Header Kartu Lokasi */}
      <div className="flex items-center justify-between pb-3 border-b border-accent/40 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-primary-dark font-sans leading-none">
              Lokasi Fisik Dokumen
            </h4>
            <span className="text-[11px] text-text-secondary">Penempatan Arsip Resmi BPN</span>
          </div>
        </div>

        {/* Tombol Aksi Kanan Atas */}
        <div className="flex items-center gap-1.5">
          {showPrint && onPrint && (
            <button
              type="button"
              onClick={onPrint}
              title="Cetak Label Lokasi"
              className="p-1.5 rounded-lg bg-white border border-accent/60 text-primary-dark hover:bg-accent/20 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all shadow-2xs ${
                copied
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white border-accent/80 text-primary-dark hover:bg-accent/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-primary" />
                  <span>Salin</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Hierarki Visual Breadcrumb Vertikal */}
      <div className="space-y-1.5 font-sans text-xs font-medium text-text-main pl-1">
        <div className="flex items-center gap-2 text-primary-dark font-semibold">
          <span className="text-base">🏢</span>
          <span>
            {lokasi?.ruang_nama
              ? (lokasi.ruang_nama.startsWith('Ruang') ? lokasi.ruang_nama : `Ruang: ${lokasi.ruang_nama}`)
              : 'Ruang Arsip Terdata'}
          </span>
        </div>

        <div className="flex items-center gap-2 pl-4 text-text-main">
          <span className="text-gray-400 font-mono">└──</span>
          <span className="text-base">📦</span>
          <span>Rak: <strong>{lokasi?.rak_kode || '-'}</strong></span>
        </div>

        <div className="flex items-center gap-2 pl-8 text-text-main">
          <span className="text-gray-400 font-mono">└──</span>
          <span className="text-base">📂</span>
          <span>Shaf: <strong>{lokasi?.shaf_kode || '-'}</strong></span>
        </div>

        <div className="flex items-center gap-2 pl-12 text-primary font-bold">
          <span className="text-gray-400 font-mono">└──</span>
          <span className="text-base">🗃️</span>
          <span>Boks: <strong>{lokasi?.boks_nomor || '-'}</strong></span>
        </div>
      </div>

      {/* Rangkuman 1 Baris Tebal */}
      <div className="mt-4 pt-3 border-t border-accent/40 bg-white/70 rounded-lg p-2.5 text-xs text-primary-dark font-bold font-sans flex items-center gap-2">
        <span className="text-accent-dark">📌</span>
        <span className="break-all">{stringLokasi}</span>
      </div>
    </div>
  );
};

export default LokasiDisplay;
