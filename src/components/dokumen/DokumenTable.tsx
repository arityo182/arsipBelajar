'use client';

import React from 'react';
import { Eye, MoveRight, RefreshCw, BookOpen, MapPin } from 'lucide-react';
import { Dokumen } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatTanggal, getStatusColor, getStatusLabel } from '@/lib/utils';

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
        title="Tidak Ada Berkas DI-302"
        description="Belum ada data arsip fisik yang cocok dengan filter atau kata kunci pencarian Anda."
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
              <th className="py-3.5 px-4 w-[16%]">No. DI-302</th>
              <th className="py-3.5 px-3 w-[11%]">Album</th>
              <th className="py-3.5 px-4 w-[16%]">Nama Pemohon</th>
              <th className="py-3.5 px-4 w-[16%]">Jenis Permohonan</th>
              <th className="py-3.5 px-4 w-[14%]">Desa / Kec</th>
              <th className="py-3.5 px-3 text-center w-[10%]">Status</th>
              <th className="py-3.5 px-4 w-[15%]">Lokasi</th>
              <th className="py-3.5 px-3 text-center w-[8%]">Aksi</th>
            </tr>
          </thead>

          {/* Isi Baris Data */}
          <tbody className="divide-y divide-border-color text-xs text-text-main">
            {dokumen.map((item, idx) => {
              const isEven = idx % 2 === 1;

              // Nomor DI-302 & tanggal
              const noDi302 = item.nomor_di302 || item.nomor_gu || '-';
              const tglStr = formatTanggal(item.tanggal_masuk);
              const desaNama = item.desa_nama || (item as any).desa?.nama || '-';
              const kecNama = item.kecamatan_nama || (item as any).kecamatan?.nama || (item as any).desa?.kecamatan?.nama || '-';

              // Lokasi display
              const rakKode = item.rak_kode || (item as any).rak?.kode || 'E';
              const tktStr = item.tingkat ? ` Tkt.${item.tingkat}` : '';
              const lokasiDisplay = `Rak ${rakKode}${tktStr} → Album ${item.nomor_album || '-'}`;

              // Jenis permohonan text & tooltip
              const jenis = item.jenis_permohonan || (item as any).jenis_dokumen || '-';
              const jenisShort = jenis.length > 25 ? jenis.substring(0, 23) + '...' : jenis;

              const status = item.status_berkas || (item as any).status_fisik || 'PROSES';

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

                  {/* Kolom No. DI-302 */}
                  <td className="py-3 px-4 font-mono font-bold text-primary">
                    <span title="Nomor DI-302 identik dengan Nomor GU">{noDi302}</span>
                    <div className="text-[10px] text-text-secondary font-sans font-normal">
                      Urut #{item.nomor_urut || '-'} • {tglStr}
                    </div>
                  </td>

                  {/* Kolom Album */}
                  <td className="py-3 px-3 font-semibold text-text-main">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" />
                      <span>Album {item.nomor_album}</span>
                    </div>
                    <div className="text-[10px] text-text-secondary">
                      Rak {rakKode}
                    </div>
                  </td>

                  {/* Kolom Nama Pemohon */}
                  <td className="py-3 px-4 font-semibold text-text-main truncate max-w-[160px]" title={item.nama_pemohon}>
                    {item.nama_pemohon || (item as any).nama_pemilik || '-'}
                  </td>

                  {/* Kolom Jenis Permohonan */}
                  <td className="py-3 px-4 text-text-main" title={jenis}>
                    <span className="font-medium text-xs">{jenisShort}</span>
                  </td>

                  {/* Kolom Desa/Kecamatan */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-text-main truncate max-w-[130px]" title={desaNama}>
                      {desaNama}
                    </div>
                    <div className="text-[10px] text-text-secondary truncate max-w-[130px]" title={kecNama}>
                      {kecNama}
                    </div>
                  </td>

                  {/* Kolom Status Berkas */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(
                        status
                      )}`}
                    >
                      {getStatusLabel(status)}
                    </span>
                  </td>

                  {/* Kolom Lokasi Fisik */}
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1 bg-[#FFF8E1] border border-accent/60 rounded px-2 py-0.5 text-[11px] font-semibold text-primary-dark" title={item.lokasi_lengkap || lokasiDisplay}>
                      <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{lokasiDisplay}</span>
                    </div>
                  </td>

                  {/* Kolom Aksi */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDetail(item)}
                        className="p-1.5 rounded-md text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Lihat Detail Berkas"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onPindah(item)}
                        className="p-1.5 rounded-md text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
                        title="Pindah Lokasi Album"
                      >
                        <MoveRight className="w-3.5 h-3.5" />
                      </button>

                      {onUpdateStatus && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item)}
                          className="p-1.5 rounded-md text-text-secondary hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Perbarui Status Berkas"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
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
