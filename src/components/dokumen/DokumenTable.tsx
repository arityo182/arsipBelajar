'use client';

import React from 'react';
import { Eye, MoveRight, RefreshCw } from 'lucide-react';
import { Dokumen } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import LokasiDisplay from './LokasiDisplay';

export interface DokumenTableProps {
  dokumen: Dokumen[];
  isLoading: boolean;
  onDetail: (dokumen: Dokumen) => void;
  onPindah: (dokumen: Dokumen) => void;
  onUpdateStatus?: (dokumen: Dokumen) => void;
}

export const DokumenTable: React.FC<DokumenTableProps> = ({
  dokumen,
  isLoading,
  onDetail,
  onPindah,
  onUpdateStatus,
}) => {
  if (isLoading) {
    return <SkeletonTable rows={8} />;
  }

  if (!dokumen || dokumen.length === 0) {
    return (
      <EmptyState
        title="Tidak Ada Dokumen"
        description="Belum ada data arsip fisik yang cocok dengan kriteria pencarian Anda."
      />
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-border-color shadow-sm overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header Tabel Gaya ATR/BPN */}
          <thead>
            <tr className="bg-primary-dark text-white text-xs font-bold uppercase tracking-wider">
              <th className="py-3.5 px-3 text-center w-[4%]">No</th>
              <th className="py-3.5 px-4 w-[16%]">Nomor GU</th>
              <th className="py-3.5 px-4 w-[13%]">NIB</th>
              <th className="py-3.5 px-4 w-[18%]">Nama Pemilik</th>
              <th className="py-3.5 px-4 w-[15%]">Desa / Kecamatan</th>
              <th className="py-3.5 px-3 w-[11%]">Status Fisik</th>
              <th className="py-3.5 px-4 w-[15%]">Lokasi Fisik</th>
              <th className="py-3.5 px-3 text-center w-[8%]">Aksi</th>
            </tr>
          </thead>

          {/* Isi Baris Data */}
          <tbody className="divide-y divide-border-color text-xs text-text-main">
            {dokumen.map((item, idx) => {
              const isEven = idx % 2 === 1;

              // Format desa dan kecamatan
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const rawItem = item as any;
              const desaNama = item.desa_nama || rawItem.desa?.nama || '-';
              const kecNama = item.kecamatan_nama || rawItem.desa?.kecamatan?.nama || '-';
              const lokasiLengkapStr = item.lokasi?.lokasi_lengkap || rawItem.lokasi_lengkap || '';

              return (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-primary/5 ${
                    isEven ? 'bg-gray-50/60' : 'bg-white'
                  }`}
                >
                  {/* Kolom No */}
                  <td className="py-3 px-3 text-center font-medium text-text-secondary">
                    {idx + 1}
                  </td>

                  {/* Kolom Nomor GU */}
                  <td className="py-3 px-4 font-mono font-bold text-primary">
                    {item.nomor_gu}
                    <div className="text-[10px] text-text-secondary font-sans font-normal">
                      Tahun {item.tahun} • {item.jenis_dokumen}
                    </div>
                  </td>

                  {/* Kolom NIB */}
                  <td className="py-3 px-4 font-mono font-semibold text-text-main">
                    {item.nib}
                  </td>

                  {/* Kolom Nama Pemilik */}
                  <td className="py-3 px-4 font-semibold text-text-main truncate max-w-[180px]">
                    {item.nama_pemilik}
                  </td>

                  {/* Kolom Desa/Kecamatan */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-text-main">{desaNama}</div>
                    <div className="text-[11px] text-text-secondary">Kec. {kecNama}</div>
                  </td>

                  {/* Kolom Status Fisik */}
                  <td className="py-3 px-3">
                    {onUpdateStatus ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(item)}
                        title="Klik untuk perbarui status fisik dokumen"
                        className="transition-transform hover:scale-105 focus:outline-hidden"
                      >
                        <Badge variant={item.status_fisik} size="sm" />
                      </button>
                    ) : (
                      <Badge variant={item.status_fisik} size="sm" />
                    )}
                  </td>

                  {/* Kolom Lokasi Fisik */}
                  <td className="py-3 px-4">
                    <LokasiDisplay
                      lokasi={item.lokasi}
                      lokasiLengkap={lokasiLengkapStr}
                      size="compact"
                    />
                  </td>

                  {/* Kolom Tombol Aksi */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Tombol Detail */}
                      <button
                        type="button"
                        onClick={() => onDetail(item)}
                        title="Lihat Detail Lengkap Dokumen"
                        className="p-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Tombol Update Status */}
                      {onUpdateStatus && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item)}
                          title="Perbarui Status Fisik Dokumen"
                          className="p-1.5 rounded-lg border border-amber-500/30 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                      {/* Tombol Pindah Rak */}
                      <button
                        type="button"
                        onClick={() => onPindah(item)}
                        title="Pindahkan Lokasi Fisik Dokumen"
                        className="p-1.5 rounded-lg border border-accent-dark/40 text-primary-dark hover:bg-accent/40 transition-colors"
                      >
                        <MoveRight className="w-4 h-4 text-accent-dark" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DokumenTable;
