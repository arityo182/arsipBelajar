// ================================================================
// src/types/publik.ts
// Tipe data untuk Layanan Pencarian Dokumen Publik SIPLOK
// ================================================================

export interface PublikDokumen {
  nomor_gu: string;
  nib: string;
  jenis_dokumen: string;
  tahun: number;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  status_fisik: 'TERSEDIA' | 'DIPINJAM' | 'RUSAK' | 'HILANG';
  status_label: string;
}

export interface PublikCekResponse {
  data: PublikDokumen[];
  message: string;
  catatan: string;
}
