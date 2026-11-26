'use client';

import React, { useState, useEffect } from 'react';
import { X, MoveRight, RefreshCw, Printer, BookOpen, Clock, FileText, MapPin } from 'lucide-react';
import { DokumenDetail } from '@/types';
import { formatTanggal, getStatusColor, getStatusLabel, getAksiColor, formatDate } from '@/lib/utils';
import PrintLabel from './PrintLabel';

export interface DokumenDetailModalProps {
  dokumen: DokumenDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onPindah: () => void;
  onUpdateStatus: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
}

export const DokumenDetailModal: React.FC<DokumenDetailModalProps> = ({
  dokumen,
  isOpen,
  onClose,
  onPindah,
  onUpdateStatus,
}) => {
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !dokumen) return null;

  const noDi302 = dokumen.nomor_di302 || dokumen.nomor_gu || '-';
  const status = (dokumen as any).status_fisik || dokumen.status_berkas || 'TERSEDIA';
  const rakKode = dokumen.rak_kode || dokumen.rak?.kode || 'E';
  const noAlbum = dokumen.nomor_album || 1;
  const noUrut = dokumen.nomor_urut || 1;
  const tglMasuk = formatTanggal(dokumen.tanggal_masuk);
  const desaNama = dokumen.desa_nama || dokumen.desa?.nama || '-';
  const kecNama = dokumen.kecamatan_nama || dokumen.kecamatan?.nama || dokumen.desa?.kecamatan?.nama || '-';

  // Kapasitas album
  const albumKapasitas = dokumen.album?.kapasitas || 30;
  const albumTerisi = dokumen.album?.terisi || 30;
  const persentase = Math.min(Math.round((albumTerisi / albumKapasitas) * 100), 100);

  const logs = dokumen.log_aktivitas || [];
  const displayedLogs = showAllLogs ? logs : logs.slice(0, 8);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay Gelap */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Card di Tengah */}
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-modal-in font-sans">
          {/* Header Modal */}
          <div className="px-6 py-4 border-b border-border-color bg-white flex justify-between items-start shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                Detail Berkas Registrasi DI-302 (Gambar Ukur)
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h3 className="text-2xl font-black font-mono text-primary tracking-tight">
                  No. {noDi302}
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
                    status
                  )}`}
                >
                  {getStatusLabel(status)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-text-secondary flex items-center justify-center transition-colors shrink-0"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Modal (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-5 text-text-main text-xs">
            {/* 1. INFORMASI BERKAS */}
            <div>
              <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider border-b border-border-color pb-1.5 mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Informasi Berkas Permohonan
              </h4>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div>
                  <span className="text-text-secondary block text-[11px]">Nomor Register DI-302:</span>
                  <span className="font-mono font-bold text-sm text-primary">{noDi302}</span>
                </div>

                <div>
                  <span className="text-text-secondary block text-[11px]">Tanggal Permohonan Masuk:</span>
                  <span className="font-semibold">{tglMasuk}</span>
                </div>

                <div>
                  <span className="text-text-secondary block text-[11px]">Nama Pemohon:</span>
                  <span className="font-bold uppercase text-text-main">{dokumen.nama_pemohon || (dokumen as any).nama_pemilik || '-'}</span>
                </div>

                <div>
                  <span className="text-text-secondary block text-[11px]">Jenis Permohonan:</span>
                  <span className="font-semibold text-text-main">{dokumen.jenis_permohonan || (dokumen as any).jenis_dokumen || '-'}</span>
                </div>

                <div>
                  <span className="text-text-secondary block text-[11px]">Nomor Urut dalam Album:</span>
                  <span className="font-bold text-text-main">Ke-{noUrut} dari 30 berkas</span>
                </div>

                <div>
                  <span className="text-text-secondary block text-[11px]">Desa / Kecamatan:</span>
                  <span className="font-semibold">{desaNama}, {kecNama}</span>
                </div>
              </div>

              {/* Box Keterangan Sistem */}
              {dokumen.keterangan && (
                <div className="mt-3 p-3 bg-gray-50 border border-border-color rounded-xl">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-0.5">
                    Keterangan Nomor Berkas & Sistem:
                  </span>
                  <p className="font-medium text-text-main">{dokumen.keterangan}</p>
                </div>
              )}

              {/* Box Catatan Bebas */}
              {dokumen.catatan && (
                <div className="mt-2 p-3 bg-blue-50/50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-0.5">
                    Catatan Khusus:
                  </span>
                  <p className="font-medium text-text-main">{dokumen.catatan}</p>
                </div>
              )}
            </div>

            {/* 2. LOKASI ALBUM FISIK */}
            <div>
              <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider border-b border-border-color pb-1.5 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent-gold" />
                Lokasi Album Penyimpanan Fisik
              </h4>

              <div className="bg-[#FFFDF5] border-2 border-accent rounded-xl p-4 shadow-2xs space-y-3">
                <div className="font-mono text-sm font-black text-primary-dark space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span>Rak {rakKode}</span>
                  </div>
                  <div className="pl-6 text-xs text-text-main flex items-center gap-2">
                    <span>└── 🪜 Tingkat {dokumen.tingkat || '1'}</span>
                  </div>
                  <div className="pl-12 text-xs text-text-main flex items-center gap-2">
                    <span>└── 📖 Album {noAlbum}</span>
                  </div>
                  <div className="pl-16 text-xs font-bold text-primary">
                    <span>└── No. Urut #{noUrut} dalam Album</span>
                  </div>
                </div>

                {/* Kapasitas Bar */}
                <div className="pt-2 border-t border-accent/30 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-text-main">
                    <span>Kapasitas Album {noAlbum}:</span>
                    <span>{albumTerisi} dari {albumKapasitas} berkas terisi</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${persentase >= 90 ? 'bg-amber-500' : 'bg-primary'}`}
                      style={{ width: `${persentase}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. RIWAYAT & AUDIT TRAIL */}
            <div>
              <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider border-b border-border-color pb-1.5 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Riwayat Aktivitas & Mutasi
              </h4>

              {logs.length === 0 ? (
                <p className="text-text-secondary italic text-[11px]">Belum ada catatan aktivitas.</p>
              ) : (
                <div className="space-y-2 border-l-2 border-primary/20 pl-3 ml-1.5">
                  {displayedLogs.map((log) => (
                    <div key={log.id} className="relative text-[11px]">
                      <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getAksiColor(log.aksi)}`}>
                          {log.aksi}
                        </span>
                        <span className="text-text-secondary text-[10px]">{formatDate(log.created_at)}</span>
                        {log.user && <span className="text-text-secondary font-semibold">oleh {log.user.nama}</span>}
                      </div>
                      <p className="text-text-main mt-0.5 font-medium">{log.detail}</p>
                    </div>
                  ))}
                  {logs.length > 8 && (
                    <button
                      type="button"
                      onClick={() => setShowAllLogs(!showAllLogs)}
                      className="text-primary hover:underline text-[11px] font-semibold pt-1"
                    >
                      {showAllLogs ? 'Tampilkan lebih sedikit' : `Lihat ${logs.length - 8} aktivitas lainnya...`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Modal */}
          <div className="px-6 py-3 border-t border-border-color bg-gray-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPindah}
                className="py-2 px-3.5 rounded-xl border border-accent bg-white text-primary-dark hover:bg-accent/20 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <MoveRight className="w-3.5 h-3.5 text-accent-gold" />
                Pindah Album
              </button>

              <button
                type="button"
                onClick={onUpdateStatus}
                className="py-2 px-3.5 rounded-xl border border-border-color bg-white text-text-main hover:bg-gray-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-green-600" />
                Update Status
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPrintLabel(true)}
                className="py-2 px-3.5 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Label
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-gray-200 text-text-main hover:bg-gray-300 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Print Label Standar BPN */}
      {showPrintLabel && (
        <PrintLabel
          dokumen={dokumen}
          isOpen={showPrintLabel}
          onClose={() => setShowPrintLabel(false)}
        />
      )}
    </>
  );
};

export default DokumenDetailModal;
