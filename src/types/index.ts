// ================================================================
// src/types/index.ts
// SIPLOK — TypeScript Interfaces & Type Contracts
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

export interface User {
  id: number;
  nama: string;
  username: string;
  role: 'ADMIN' | 'USER';
  aktif: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Lokasi {
  ruang_id: number;
  ruang_nama: string;
  ruang_kode: string;
  rak_id: number;
  rak_kode: string;
  shaf_id: number;
  shaf_kode: string;
  boks_id: number;
  boks_nomor: string;
  lokasi_lengkap: string;
}

export type StatusFisik = 'TERSEDIA' | 'DIPINJAM' | 'RUSAK' | 'HILANG';

export type JenisDokumen =
  | 'Sertipikat'
  | 'GU'
  | 'SU'
  | 'Warkah'
  | 'IPT'
  | 'Lainnya';

export interface Dokumen {
  id: number;
  nomor_gu: string;
  tahun: number;
  nib: string;
  jenis_dokumen: string;
  nama_pemilik: string;
  desa_id: number;
  desa_nama: string;
  kecamatan_nama: string;
  status_fisik: StatusFisik;
  lokasi: Lokasi;
  created_at: string;
  updated_at: string;
}

export interface LogAktivitas {
  id: number;
  dokumen_id: number;
  user: { id: number; nama: string };
  aksi: string;
  detail: string;
  created_at: string;
}

export interface DokumenDetail extends Dokumen {
  desa: {
    id: number;
    nama: string;
    kecamatan: { id: number; nama: string };
  };
  boks: {
    id: number;
    nomor: string;
    kapasitas: number;
    terisi: number;
    sisa: number;
    shaf: {
      kode: string;
      rak: {
        kode: string;
        ruang: { nama: string; kode: string };
      };
    };
  };
  log_aktivitas: LogAktivitas[];
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface Ruang {
  id: number;
  nama: string;
  kode: string;
  deskripsi?: string | null;
  raks_count?: number;
}

export interface Rak {
  id: number;
  kode: string;
  ruang_id: number;
  ruang?: Ruang;
  shafs_count?: number;
}

export interface Shaf {
  id: number;
  kode: string;
  rak_id: number;
  rak?: Rak & { ruang?: Ruang };
  boks_count?: number;
}

export interface Boks {
  id: number;
  nomor: string;
  shaf_id: number;
  kapasitas: number;
  terisi: number;
  sisa: number;
  shaf?: Shaf & { rak?: Rak & { ruang?: Ruang } };
}

export interface Kecamatan {
  id: number;
  nama: string;
}

export interface Desa {
  id: number;
  nama: string;
  kecamatan_id: number;
}

export interface SearchParams {
  search: string;
  page: number;
  per_page: number;
}

export interface StoreDokumenPayload {
  nomor_gu: string;
  tahun: number;
  nib: string;
  jenis_dokumen: JenisDokumen;
  nama_pemilik: string;
  desa_id: number;
  boks_id: number;
}

export interface PindahRakPayload {
  boks_id_baru: number;
  alasan: string;
}

export interface UpdateStatusPayload {
  status_fisik: StatusFisik;
  keterangan?: string;
}

export interface StoreUserPayload {
  nama: string;
  username: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export interface AdminUser extends User {
  created_at: string;
}
