// ================================================================
// src/lib/utils.ts
// SIPLOK — Utility Functions & Print Engine
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Lokasi, StatusFisik, DokumenDetail } from '@/types';

/**
 * Menggabungkan nama kelas CSS Tailwind secara aman
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format tanggal lengkap Indonesia (WIB)
 * Contoh: "12 November 2024, 09:30 WIB"
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
 * Format tanggal pendek Indonesia
 * Contoh: "12 Nov 2024"
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
 * Format representasi hirarki lokasi fisik dokumen
 * Contoh: "Ruang Ruang Arsip A → Rak RA-A-01 → Shaf SH-01 → Boks 001"
 */
export function formatLokasi(lokasi: Lokasi): string {
  if (!lokasi) return 'Lokasi belum ditentukan';
  const ruangNama = lokasi.ruang_nama
    ? (lokasi.ruang_nama.startsWith('Ruang') ? lokasi.ruang_nama : `Ruang ${lokasi.ruang_nama}`)
    : '-';
  return `${ruangNama} → Rak ${lokasi.rak_kode || '-'} → Shaf ${lokasi.shaf_kode || '-'} → Boks ${lokasi.boks_nomor || '-'}`;
}

/**
 * Kelas warna CSS Tailwind badge untuk status fisik dokumen
 */
export function getStatusColor(status: StatusFisik): string {
  switch (status) {
    case 'TERSEDIA':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'DIPINJAM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'RUSAK':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'HILANG':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

/**
 * Label status fisik yang ramah dibaca dalam bahasa Indonesia
 */
export function getStatusLabel(status: StatusFisik): string {
  switch (status) {
    case 'TERSEDIA':
      return 'Tersedia';
    case 'DIPINJAM':
      return 'Dipinjam';
    case 'RUSAK':
      return 'Rusak';
    case 'HILANG':
      return 'Hilang';
    default:
      return status;
  }
}

/**
 * Kelas warna CSS Tailwind badge untuk aksi log audit aktivitas
 */
export function getAksiColor(aksi: string): string {
  switch (aksi) {
    case 'TAMBAH_DOKUMEN':
      return 'bg-green-100 text-green-800';
    case 'PINDAH_RAK':
      return 'bg-blue-100 text-blue-800';
    case 'UPDATE_STATUS':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Menghasilkan markup HTML siap cetak untuk label identifikasi fisik dokumen pertanahan
 */
export function generatePrintHTML(dokumen: DokumenDetail, petugasNama?: string): string {
  const ruangRaw = dokumen.boks?.shaf?.rak?.ruang?.nama;
  const ruangFormatted = ruangRaw
    ? (ruangRaw.startsWith('Ruang') ? ruangRaw : `Ruang ${ruangRaw}`)
    : '-';
  const lokasiStr =
    dokumen.lokasi?.lokasi_lengkap ||
    `${ruangFormatted} → Rak ${dokumen.boks?.shaf?.rak?.kode || '-'} → Shaf ${dokumen.boks?.shaf?.kode || '-'} → Boks ${dokumen.boks?.nomor || '-'}`;

  const tanggalCetak = formatDate(new Date().toISOString());

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kartu Kendali Fisik Dokumen — ${dokumen.nomor_gu}</title>
  <style>
    @page {
      size: A5 landscape;
      margin: 12mm;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
      line-height: 1.4;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .header h2 {
      margin: 0;
      font-size: 16pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header h3 {
      margin: 3px 0 0;
      font-size: 13pt;
      font-weight: normal;
    }
    .header p {
      margin: 2px 0 0;
      font-size: 9pt;
      color: #333;
    }
    .box-lokasi {
      border: 3px dashed #000;
      padding: 12px;
      margin: 15px 0;
      background-color: #fafafa;
      text-align: center;
    }
    .box-lokasi .title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .box-lokasi .lokasi-text {
      font-size: 18pt;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    table.data-table td {
      padding: 6px 4px;
      font-size: 11pt;
      vertical-align: top;
    }
    table.data-table td.label {
      width: 32%;
      font-weight: bold;
    }
    table.data-table td.colon {
      width: 3%;
    }
    .footer {
      margin-top: 25px;
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      border-top: 1px solid #ccc;
      padding-top: 8px;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Kementerian Agraria dan Tata Ruang / BPN</h2>
    <h3>Kantor Pertanahan Kabupaten Banyumas</h3>
    <p>SIPLOK — Sistem Informasi Pelacakan Lokasi Dokumen Fisik Pertanahan</p>
  </div>

  <div class="box-lokasi">
    <div class="title">Lokasi Fisik Penyimpanan Arsip:</div>
    <div class="lokasi-text">${lokasiStr}</div>
  </div>

  <table class="data-table">
    <tr>
      <td class="label">Nomor GU</td>
      <td class="colon">:</td>
      <td><strong>${dokumen.nomor_gu}</strong> (Tahun ${dokumen.tahun})</td>
    </tr>
    <tr>
      <td class="label">NIB</td>
      <td class="colon">:</td>
      <td>${dokumen.nib}</td>
    </tr>
    <tr>
      <td class="label">Jenis Dokumen</td>
      <td class="colon">:</td>
      <td>${dokumen.jenis_dokumen}</td>
    </tr>
    <tr>
      <td class="label">Nama Pemilik</td>
      <td class="colon">:</td>
      <td>${dokumen.nama_pemilik}</td>
    </tr>
    <tr>
      <td class="label">Wilayah Administrasi</td>
      <td class="colon">:</td>
      <td>Desa ${dokumen.desa?.nama || dokumen.desa_nama || '-'}, Kec. ${dokumen.desa?.kecamatan?.nama || dokumen.kecamatan_nama || '-'}</td>
    </tr>
    <tr>
      <td class="label">Status Fisik</td>
      <td class="colon">:</td>
      <td><strong>${getStatusLabel(dokumen.status_fisik)}</strong></td>
    </tr>
  </table>

  <div class="footer">
    <div>Dicetak Pada: ${tanggalCetak}</div>
    <div>Petugas Pelaksana: ${petugasNama || 'Petugas Arsip Kantor Pertanahan Banyumas'}</div>
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
