'use client';

import React from 'react';
import { DokumenDetail } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export interface PrintLabelProps {
  dokumen: DokumenDetail | null;
}

export const PrintLabel: React.FC<PrintLabelProps> = ({ dokumen }) => {
  const { user } = useAuthStore();
  if (!dokumen) return null;

  const ruangNama = dokumen.boks?.shaf?.rak?.ruang?.nama || 'Ruang Arsip A';
  const rakKode = dokumen.boks?.shaf?.rak?.kode || 'RA-A-01';
  const shafKode = dokumen.boks?.shaf?.kode || 'SH-01';
  const boksNomor = dokumen.boks?.nomor || '001';

  return (
    <div className="hidden print:block font-sans text-black p-4 bg-white">
      <div className="border-2 border-black p-6 rounded-lg max-w-xl mx-auto">
        {/* Header Label */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider m-0">
            Kementerian Agraria dan Tata Ruang / BPN
          </h2>
          <h1 className="text-base font-black uppercase tracking-tight m-0">
            Kantor Pertanahan Kabupaten Banyumas
          </h1>
          <p className="text-[10px] text-gray-700 m-0 mt-0.5">
            SIPLOK — Sistem Pelacakan Lokasi Dokumen Fisik Pertanahan
          </p>
        </div>

        {/* Kotak Lokasi Utama (Besar & Tebal) */}
        <div className="border-4 border-black p-4 mb-5 text-center bg-gray-50">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
            Penempatan Lokasi Fisik Arsip
          </div>
          <div className="grid grid-cols-4 gap-2 text-center py-1">
            <div className="border-r border-black">
              <span className="text-[10px] block font-bold text-gray-600">RUANG</span>
              <span className="text-sm font-black">{ruangNama}</span>
            </div>
            <div className="border-r border-black">
              <span className="text-[10px] block font-bold text-gray-600">RAK</span>
              <span className="text-lg font-black">{rakKode}</span>
            </div>
            <div className="border-r border-black">
              <span className="text-[10px] block font-bold text-gray-600">SHAF</span>
              <span className="text-lg font-black">{shafKode}</span>
            </div>
            <div>
              <span className="text-[10px] block font-bold text-gray-600">BOKS</span>
              <span className="text-xl font-black">{boksNomor}</span>
            </div>
          </div>
        </div>

        {/* Informasi Detail Dokumen */}
        <div className="flex gap-4 items-center">
          {/* QR Code Placeholder */}
          <div className="w-20 h-20 border-2 border-black flex flex-col items-center justify-center flex-shrink-0 text-[10px] font-bold text-center p-1">
            <div className="w-12 h-12 bg-gray-200 border border-black flex items-center justify-center font-mono">
              QR
            </div>
            <span className="mt-1 font-mono">{dokumen.nomor_gu}</span>
          </div>

          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="font-bold py-0.5 w-[32%]">Nomor GU</td>
                <td className="w-[3%]">:</td>
                <td className="font-mono font-bold">{dokumen.nomor_gu} (Tahun {dokumen.tahun})</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5">NIB</td>
                <td>:</td>
                <td className="font-mono">{dokumen.nib}</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5">Jenis Dokumen</td>
                <td>:</td>
                <td>{dokumen.jenis_dokumen}</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5">Nama Pemilik</td>
                <td>:</td>
                <td className="font-semibold">{dokumen.nama_pemilik}</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5">Desa / Kec.</td>
                <td>:</td>
                <td>
                  {dokumen.desa?.nama || dokumen.desa_nama || '-'} /{' '}
                  {dokumen.desa?.kecamatan?.nama || dokumen.kecamatan_nama || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Cetak */}
        <div className="mt-5 pt-2 border-t border-gray-400 flex justify-between items-center text-[9px] text-gray-600">
          <span>Dicetak oleh: {user?.nama || 'Petugas Arsip'}</span>
          <span>Waktu: {formatDate(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
};

export default PrintLabel;
