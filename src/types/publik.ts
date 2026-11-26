// ================================================================
// src/types/publik.ts
// Tipe data untuk Layanan Pencarian Dokumen Publik SIPLOK
// ================================================================

export interface PublikDokumen {
  nomor_di302: string;
  tanggal_masuk: string;
  jenis_permohonan: string;
  nama_pemohon: string; // Misal: "NACHR****"
  desa: string;
  kecamatan: string;
  kabupaten: string;
  status_berkas: 'TERSEDIA' | 'HILANG' | 'DIPINJAM' | 'RUSAK' | 'SELESAI' | 'PROSES';
  status_label: string;

  // Properti kompatibilitas
  nomor_gu?: string;
  nib?: string;
  jenis_dokumen?: string;
  tahun?: number;
  status_fisik?: string;
}

export interface PublikCekResponse {
  data: PublikDokumen[];
  message: string;
  catatan: string;
}
