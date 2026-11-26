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

export type StatusBerkas = 'SELESAI' | 'PROSES';

// Alias untuk kompatibilitas
export type StatusFisik = StatusBerkas | 'TERSEDIA' | 'DIPINJAM' | 'RUSAK' | 'HILANG';

export type JenisPermohonan =
  | 'Pengukuran Dan Pemetaan'
  | 'Pengukuran Ulang Dan Pemetaan'
  | 'Pemecahan Bidang'
  | 'Pendaftaran Tanah Pertama Kali';

export type JenisDokumen = JenisPermohonan | string;

export interface Album {
  id: number;
  nomor_album: number;
  rak_id: number;
  rak_kode?: string;
  tingkat?: string | null;
  posisi?: string | null;
  kapasitas: number;
  terisi: number;
  sisa: number;
}

export interface Lokasi {
  ruang_id?: number;
  ruang_nama?: string;
  ruang_kode?: string;
  rak_id: number;
  rak_kode: string;
  shaf_id?: number;
  shaf_kode?: string;
  boks_id?: number;
  boks_nomor?: string;
  nomor_album?: number;
  lokasi_lengkap: string;
}

export interface Dokumen {
  id: number;
  nomor_di302: string;
  nomor_album: number;
  nomor_urut: number;
  tanggal_masuk: string;
  tahun: number;
  nama_pemohon: string;
  jenis_permohonan: JenisPermohonan;
  desa_id: number;
  desa_nama: string;
  kecamatan_id?: number;
  kecamatan_nama?: string;
  rak_id: number;
  rak_kode: string;
  tingkat: string | null;
  posisi: string | null;
  lokasi_lengkap: string;
  status_berkas: StatusBerkas;
  status_label?: string;
  keterangan: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;

  // Properti kompatibilitas
  nomor_gu?: string;
  nama_pemilik?: string;
  jenis_dokumen?: string;
  status_fisik?: StatusFisik;
  nib?: string;
  lokasi?: Lokasi;
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
    kecamatan?: { id: number; nama: string };
  };
  kecamatan: {
    id: number;
    nama: string;
  };
  rak: {
    id: number;
    kode: string;
  };
  album: Album;
  log_aktivitas: LogAktivitas[];
  boks?: any;
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
  ruang_id?: number;
  ruang?: Ruang;
  shafs_count?: number;
  albums_count?: number;
  dokumens_count?: number;
}

export interface Shaf {
  id: number;
  kode: string;
  rak_id: number;
  rak?: Rak & { ruang?: Ruang };
  boks_count?: number;
}

export type Tingkat = Shaf;

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
  status_berkas?: string;
  nomor_album?: number;
  jenis_permohonan?: string;
  rak_id?: number;
}

export interface StoreDokumenPayload {
  nomor_di302: string;
  nomor_album: number;
  nomor_urut: number;
  tanggal_masuk: string;
  nama_pemohon: string;
  jenis_permohonan: JenisPermohonan;
  desa_id: number;
  kecamatan_id?: number;
  rak_id: number;
  tingkat?: string | null;
  posisi?: string | null;
  keterangan?: string | null;
  catatan?: string | null;
  status_berkas?: StatusBerkas;

  // Kompatibilitas form lama
  nomor_gu?: string;
  nama_pemilik?: string;
  jenis_dokumen?: string;
  boks_id?: number;
  tahun?: number;
  nib?: string;
}

export interface PindahAlbumPayload {
  nomor_album_baru: number;
  rak_id_baru?: number;
  nomor_urut_baru?: number;
  tingkat_baru?: string | null;
  posisi_baru?: string | null;
  alasan: string;
}

export interface PindahRakPayload extends PindahAlbumPayload {
  boks_id_baru?: number;
}

export interface UpdateStatusPayload {
  status_berkas: StatusBerkas;
  keterangan?: string;
  status_fisik?: string;
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

export interface StatAlbum {
  nomor_album: number;
  rak_id: number;
  rak_kode: string;
  tingkat: string | null;
  posisi: string | null;
  kapasitas: number;
  total: number;
  selesai: number;
  proses: number;
  persentase_selesai: string;
  persentase_num: number;
}

export interface StatJenisPermohonan {
  jenis_permohonan: string;
  jumlah: number;
  selesai: number;
  proses: number;
  persentase: string;
  persentase_num: number;
}
