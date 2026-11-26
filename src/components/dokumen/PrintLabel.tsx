'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { DokumenDetail } from '@/types';
import { formatTanggal, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export interface PrintLabelProps {
  dokumen: DokumenDetail | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const PrintLabel: React.FC<PrintLabelProps> = ({ dokumen, isOpen, onClose }) => {
  const { user } = useAuthStore();
  if (!dokumen) return null;

  const noDi302 = dokumen.nomor_di302 || dokumen.nomor_gu || '-';
  const namaPemohon = dokumen.nama_pemohon || (dokumen as any).nama_pemilik || '-';
  const jenis = dokumen.jenis_permohonan || (dokumen as any).jenis_dokumen || '-';
  const tglMasuk = formatTanggal(dokumen.tanggal_masuk);
  const rakKode = dokumen.rak_kode || dokumen.rak?.kode || 'E';
  const noAlbum = dokumen.nomor_album || 1;
  const noUrut = dokumen.nomor_urut || 1;
  const desa = dokumen.desa_nama || dokumen.desa?.nama || '-';
  const kec = dokumen.kecamatan_nama || dokumen.kecamatan?.nama || dokumen.desa?.kecamatan?.nama || 'Banyumas';
  const status = dokumen.status_berkas || (dokumen as any).status_fisik || 'PROSES';
  const statusIcon = status === 'SELESAI' ? '✅ SELESAI' : '⏳ MASIH PROSES';

  const handlePrint = () => {
    window.print();
  };

  const labelCard = (
    <div className="border-2 border-black p-5 rounded-lg max-w-md mx-auto bg-white font-sans text-black leading-tight text-xs">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <h2 className="text-xs font-black uppercase tracking-wider m-0">
          🏛️ KANTOR PERTANAHAN KAB. BANYUMAS
        </h2>
        <h3 className="text-[11px] font-bold uppercase tracking-tight m-0 mt-0.5">
          ATR / BPN
        </h3>
      </div>

      {/* Arsip DI-302 Details */}
      <div className="space-y-1 mb-3">
        <div className="text-xs font-black uppercase text-primary border-b border-gray-300 pb-1 mb-1">
          ARSIP DI-302 (BUKU REGISTER UKUR)
        </div>
        <div className="flex">
          <span className="w-28 font-bold">No. Register</span>
          <span className="w-3">:</span>
          <span className="font-mono font-black text-sm">{noDi302}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold">Nama Pemohon</span>
          <span className="w-3">:</span>
          <span className="font-bold uppercase truncate">{namaPemohon}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold">Jenis</span>
          <span className="w-3">:</span>
          <span>{jenis}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold">Tanggal</span>
          <span className="w-3">:</span>
          <span>{tglMasuk}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold">Desa</span>
          <span className="w-3">:</span>
          <span>{desa}, {kec}</span>
        </div>
      </div>

      {/* Lokasi Penyimpanan Fisik */}
      <div className="border-2 border-dashed border-black p-2.5 my-3 bg-gray-50 text-center">
        <div className="text-[10px] font-bold uppercase text-gray-700 mb-1">
          📍 LOKASI PENYIMPANAN
        </div>
        <div className="grid grid-cols-2 text-center py-0.5">
          <div className="border-r border-black">
            <span className="text-[9px] block font-bold text-gray-600">RAK</span>
            <span className="text-base font-black">{rakKode}</span>
          </div>
          <div>
            <span className="text-[9px] block font-bold text-gray-600">ALBUM</span>
            <span className="text-base font-black">{noAlbum} (Urut ke-{noUrut})</span>
          </div>
        </div>
      </div>

      {/* Status & Keterangan */}
      <div className="pt-2 border-t border-black space-y-1">
        <div className="flex">
          <span className="w-28 font-bold">STATUS</span>
          <span className="w-3">:</span>
          <span className="font-bold">{statusIcon}</span>
        </div>
        {dokumen.keterangan && (
          <div className="flex">
            <span className="w-28 font-bold">Ket</span>
            <span className="w-3">:</span>
            <span className="font-medium text-[11px]">{dokumen.keterangan}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-1.5 border-t border-gray-400 flex justify-between text-[8px] text-gray-600">
        <span>Petugas: {user?.nama || 'SIPLOK Operator'}</span>
        <span>Dicetak: {formatDate(new Date().toISOString())}</span>
      </div>
    </div>
  );

  // Jika dipanggil sebagai Modal Preview
  if (isOpen && onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-in font-sans p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-color">
            <h3 className="text-sm font-bold text-primary-dark flex items-center gap-2">
              <Printer className="w-4 h-4 text-primary" />
              Preview Label Berkas DI-302
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-text-secondary flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2">
            {labelCard}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-color">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-text-main"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Sekarang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback print only CSS
  return <div className="hidden print:block">{labelCard}</div>;
};

export default PrintLabel;
