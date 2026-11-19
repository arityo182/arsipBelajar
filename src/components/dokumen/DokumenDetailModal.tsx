'use client';

import React, { useState, useEffect } from 'react';
import { X, MoveRight, RefreshCw, Printer, Clock } from 'lucide-react';
import { DokumenDetail } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getAksiColor } from '@/lib/utils';
import LokasiDisplay from './LokasiDisplay';

export interface DokumenDetailModalProps {
  dokumen: DokumenDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onPindah: () => void;
  onUpdateStatus: () => void;
  onRefresh: () => void;
  onPrint?: () => void;
}

export const DokumenDetailModal: React.FC<DokumenDetailModalProps> = ({
  dokumen,
  isOpen,
  onClose,
  onPindah,
  onUpdateStatus,
  onPrint,
}) => {
  const [showAllLogs, setShowAllLogs] = useState(false);

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

  // Penghitungan kapasitas boks
  const kapasitas = dokumen.boks?.kapasitas || 50;
  const terisi = dokumen.boks?.terisi ?? 1;
  const persentase = Math.min(Math.round((terisi / kapasitas) * 100), 100);

  let progressColor = 'bg-green-600';
  if (persentase >= 90) {
    progressColor = 'bg-red-600';
  } else if (persentase >= 70) {
    progressColor = 'bg-amber-500';
  }

  const logs = dokumen.log_aktivitas || [];
  const displayedLogs = showAllLogs ? logs : logs.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Gelap */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card di Tengah */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-modal-in font-sans">
        {/* Header Modal (Sticky, Tidak Ikut Scroll) */}
        <div className="px-6 py-4 border-b border-border-color bg-white flex justify-between items-start shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
              Detail Arsip Pertanahan
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h3 className="text-2xl font-black font-mono text-primary tracking-tight">
                {dokumen.nomor_gu}
              </h3>
              <Badge variant={dokumen.status_fisik} size="sm" />
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Informasi Objek Tanah */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              Informasi Objek Tanah
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-border-color">
                <span className="text-xs text-gray-500 block mb-1">NIB</span>
                <span className="font-mono text-sm font-semibold text-gray-900 block">{dokumen.nib}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-border-color">
                <span className="text-xs text-gray-500 block mb-1">Tahun</span>
                <span className="text-sm font-semibold text-gray-900 block">{dokumen.tahun}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-border-color">
                <span className="text-xs text-gray-500 block mb-1">Jenis Dokumen</span>
                <span className="text-sm font-semibold text-gray-900 block">{dokumen.jenis_dokumen}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-border-color">
                <span className="text-xs text-gray-500 block mb-1">Nama Pemilik</span>
                <span className="text-sm font-semibold text-gray-900 truncate block">{dokumen.nama_pemilik}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-border-color sm:col-span-2">
                <span className="text-xs text-gray-500 block mb-1">Wilayah Desa / Kecamatan</span>
                <span className="text-sm font-semibold text-gray-900 block">
                  Desa {dokumen.desa?.nama || dokumen.desa_nama || '-'}, Kec.{' '}
                  {dokumen.desa?.kecamatan?.nama || dokumen.kecamatan_nama || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Lokasi Fisik & Kapasitas Boks */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              Lokasi Fisik & Kapasitas Boks
            </h4>

            <LokasiDisplay
              lokasi={dokumen.lokasi}
              lokasiLengkap={
                dokumen.lokasi?.lokasi_lengkap ||
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (dokumen as any).lokasi_lengkap
              }
              size="full"
              showPrint={true}
              onPrint={onPrint}
            />

            {/* Kapasitas Boks Arsip */}
            <div className="mt-3.5 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center justify-between text-xs mb-2 font-medium text-text-main">
                <span className="text-gray-600">Kapasitas Boks Terisi:</span>
                <span className="font-bold text-primary-dark">
                  {terisi} dari {kapasitas} dokumen ({persentase}%)
                </span>
              </div>
              <div className="w-full bg-blue-200/60 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${persentase}%` }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Riwayat Aktivitas & Mutasi */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Riwayat Aktivitas & Mutasi ({logs.length})</span>
              </h4>
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-text-secondary italic">Belum ada riwayat tercatat.</p>
            ) : (
              <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-color">
                {displayedLogs.map((log) => {
                  const badgeColor = getAksiColor(log.aksi);

                  return (
                    <div key={log.id} className="relative text-xs">
                      {/* Timeline Dot */}
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-xs" />

                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${badgeColor}`}>
                          {log.aksi}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {formatDate(log.created_at)}
                        </span>
                      </div>

                      <div className="text-text-main font-medium leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-border-color">
                        {log.detail}
                      </div>

                      <div className="mt-1 text-[11px] text-text-secondary">
                        Oleh: <strong className="text-text-main">{log.user?.nama || 'Petugas'}</strong>
                      </div>
                    </div>
                  );
                })}

                {logs.length > 10 && !showAllLogs && (
                  <button
                    type="button"
                    onClick={() => setShowAllLogs(true)}
                    className="w-full text-center py-2 text-xs font-bold text-primary hover:underline"
                  >
                    Tampilkan {logs.length - 10} aktivitas lainnya
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal (Sticky, Tidak Ikut Scroll) */}
        <div className="px-6 py-4 border-t border-border-color bg-white flex flex-wrap sm:flex-nowrap gap-3 justify-end shrink-0">
          <button
            type="button"
            onClick={onPindah}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <MoveRight className="w-4 h-4 text-accent" />
            <span>Pindah Rak</span>
          </button>

          <button
            type="button"
            onClick={onUpdateStatus}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Status</span>
          </button>

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center justify-center gap-1 px-3.5 py-2.5 border border-gray-300 bg-white hover:bg-gray-100 text-text-main text-xs font-bold rounded-xl transition-colors"
              title="Cetak Kartu Label Fisik"
            >
              <Printer className="w-4 h-4 text-primary" />
              <span>Label</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DokumenDetailModal;
