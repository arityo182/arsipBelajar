// ================================================================
// src/lib/utils.ts
// SIPLOK — Utility Functions & Print Engine
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StatusBerkas, StatusFisik, DokumenDetail } from '@/types';

/**
 * Menggabungkan nama kelas CSS Tailwind secara aman
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format tanggal Indonesia lengkap dengan jam
 * Contoh: "12 Januari 2024, 09:30 WIB"
 */
export function formatDate(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';

    const formatted = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    }).format(date);

    return `${formatted.replace(/\./g, ':')} WIB`;
  } catch {
    return isoString;
  }
}

/**
 * Format tanggal Indonesia singkat
 * Contoh: "12 Jan 2024"
 */
export function formatDateShort(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Format tanggal standar DI-302 (Contoh: "2 Januari 2024")
 * Menerima format "02/01/2024" atau ISO "2024-01-02"
 */
export function formatTanggal(dateString: string): string {
  if (!dateString) return '-';
  try {
    let date: Date;
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format representasi hirarki lokasi fisik dokumen
 */
export function formatLokasi(dokumen: { rak_kode?: string; nomor_album?: number; nomor_urut?: number; tingkat?: string | null; lokasi_lengkap?: string }): string {
  if (dokumen.lokasi_lengkap) return dokumen.lokasi_lengkap;
  const rak = dokumen.rak_kode || 'E';
  const album = dokumen.nomor_album || '-';
  const tkt = dokumen.tingkat ? ` Tkt.${dokumen.tingkat}` : '';
  const urut = dokumen.nomor_urut ? ` (Urut #${dokumen.nomor_urut})` : '';
  return `Rak ${rak}${tkt} → Album ${album}${urut}`;
}

/**
 * Kelas warna CSS Tailwind badge untuk status berkas dokumen
 * SELESAI -> hijau, PROSES -> kuning
 */
export function getStatusColor(status: StatusBerkas | StatusFisik | string): string {
  switch (status) {
    case 'TERSEDIA':
    case 'SELESAI':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'HILANG':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'DIPINJAM':
    case 'PROSES':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'RUSAK':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

/**
 * Label status berkas yang ramah dibaca dalam bahasa Indonesia
 */
export function getStatusLabel(status: StatusBerkas | StatusFisik | string): string {
  switch (status) {
    case 'TERSEDIA':
      return 'Tersedia di Album';
    case 'HILANG':
      return 'Belum Ditemukan';
    case 'DIPINJAM':
      return 'Sedang Dipinjam';
    case 'RUSAK':
      return 'Dalam Perbaikan';
    case 'SELESAI':
      return 'Tersedia di Album';
    case 'PROSES':
      return 'Belum Ditemukan';
    default:
      return status || '-';
  }
}

/**
 * Kelas warna CSS Tailwind badge untuk aksi log audit aktivitas
 */
export function getAksiColor(aksi: string): string {
  switch (aksi) {
    case 'TAMBAH_BERKAS':
    case 'TAMBAH_DOKUMEN':
      return 'bg-green-100 text-green-800';
    case 'PINDAH_ALBUM':
    case 'PINDAH_RAK':
      return 'bg-blue-100 text-blue-800';
    case 'UPDATE_STATUS':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Menghasilkan markup HTML siap cetak untuk label identifikasi fisik dokumen DI-302
 */
export function generatePrintHTML(dokumen: DokumenDetail, petugasNama?: string): string {
  const nomorDi302 = dokumen.nomor_di302 || dokumen.nomor_gu || '-';
  const namaPemohon = dokumen.nama_pemohon || dokumen.nama_pemilik || '-';
  const jenisPermohonan = dokumen.jenis_permohonan || dokumen.jenis_dokumen || '-';
  const tanggalMasukStr = formatTanggal(dokumen.tanggal_masuk);
  const lokasiStr = dokumen.lokasi_lengkap || `Rak ${dokumen.rak_kode || 'E'} → Album ${dokumen.nomor_album || '-'}`;
  const desaKec = `${dokumen.desa_nama || dokumen.desa?.nama || '-'}, ${dokumen.kecamatan_nama || dokumen.kecamatan?.nama || 'Banyumas'}`;
  const rawStatus = (dokumen as any).status_fisik || dokumen.status_berkas || 'TERSEDIA';
  const statusStr = getStatusLabel(rawStatus).toUpperCase();
  const tanggalCetak = formatDate(new Date().toISOString());

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Label Berkas DI-302 — No. ${nomorDi302}</title>
  <style>
    @page {
      size: A6 landscape;
      margin: 8mm;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
      line-height: 1.35;
    }
    .card {
      border: 2px solid #000;
      padding: 10px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .header h2 {
      margin: 0;
      font-size: 13pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header h3 {
      margin: 2px 0 0;
      font-size: 10pt;
      font-weight: normal;
    }
    .box-lokasi {
      border: 2px dashed #000;
      padding: 8px;
      margin: 8px 0;
      background-color: #fafafa;
      text-align: center;
    }
    .box-lokasi .title {
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .box-lokasi .lokasi-text {
      font-size: 14pt;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    table.data-table td {
      padding: 3px 2px;
      font-size: 9.5pt;
      vertical-align: top;
    }
    table.data-table td.label {
      width: 34%;
      font-weight: bold;
    }
    table.data-table td.colon {
      width: 3%;
    }
    .footer {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      border-top: 1px solid #ccc;
      padding-top: 4px;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>ATR / BPN — KANTAH KAB. BANYUMAS</h2>
      <h3>ARSIP DAFTAR ISIAN 302 (DI-302)</h3>
    </div>

    <div class="box-lokasi">
      <div class="title">📍 Lokasi Penyimpanan Fisik:</div>
      <div class="lokasi-text">${lokasiStr}</div>
    </div>

    <table class="data-table">
      <tr>
        <td class="label">No. Register DI-302</td>
        <td class="colon">:</td>
        <td><strong>${nomorDi302}</strong> (Tahun ${dokumen.tahun || 2024})</td>
      </tr>
      <tr>
        <td class="label">Nama Pemohon</td>
        <td class="colon">:</td>
        <td><strong>${namaPemohon}</strong></td>
      </tr>
      <tr>
        <td class="label">Jenis Permohonan</td>
        <td class="colon">:</td>
        <td>${jenisPermohonan}</td>
      </tr>
      <tr>
        <td class="label">Tanggal Masuk</td>
        <td class="colon">:</td>
        <td>${tanggalMasukStr}</td>
      </tr>
      <tr>
        <td class="label">Desa / Kecamatan</td>
        <td class="colon">:</td>
        <td>${desaKec}</td>
      </tr>
      <tr>
        <td class="label">Status Berkas</td>
        <td class="colon">:</td>
        <td><strong>${statusStr}</strong></td>
      </tr>
      ${dokumen.keterangan ? `
      <tr>
        <td class="label">Keterangan</td>
        <td class="colon">:</td>
        <td>${dokumen.keterangan}</td>
      </tr>` : ''}
    </table>

    <div class="footer">
      <span>Dicetak: ${tanggalCetak}</span>
      <span>Petugas: ${petugasNama || 'SIPLOK Operator'}</span>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `.trim();
}
