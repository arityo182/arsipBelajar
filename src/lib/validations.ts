// ================================================================
// src/lib/validations.ts
// SIPLOK — Zod Validation Schemas
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

import { z } from 'zod';

/**
 * Skema validasi formulir login
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Minimal 3 karakter')
    .max(50, 'Maksimal 50 karakter'),
  password: z
    .string()
    .min(6, 'Minimal 6 karakter'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Skema validasi penambahan dan pengeditan berkas DI-302
 */
export const dokumenSchema = z.object({
  nomor_di302: z
    .string()
    .min(1, 'Nomor DI-302 wajib diisi')
    .max(20, 'Maksimal 20 digit')
    .regex(/^[1-9][0-9]*$/, 'Nomor DI-302 harus angka positif tanpa huruf, simbol, atau nol di depan'),
  nomor_album: z.coerce
    .number({ invalid_type_error: 'Pilih album penyimpanan' })
    .positive('Pilih album yang valid'),
  nomor_urut: z.coerce
    .number({ invalid_type_error: 'Nomor urut harus berupa angka' })
    .min(1, 'Nomor urut minimal 1')
    .max(30, 'Nomor urut maksimal 30'),
  tanggal_masuk: z
    .string()
    .min(1, 'Tanggal masuk wajib diisi'),
  tahun: z.coerce
    .number()
    .optional(),
  nama_pemohon: z
    .string()
    .min(3, 'Nama pemohon minimal 3 karakter')
    .max(100, 'Nama pemohon maksimal 100 karakter'),
  jenis_permohonan: z.enum([
    'Pengukuran Dan Pemetaan',
    'Pengukuran Ulang Dan Pemetaan',
    'Pemecahan Bidang',
    'Pendaftaran Tanah Pertama Kali'
  ], {
    required_error: 'Pilih jenis permohonan',
  }),
  desa_id: z.coerce
    .number({ required_error: 'Pilih desa' })
    .positive('Pilih desa yang valid'),
  kecamatan_id: z.coerce
    .number()
    .optional(),
  rak_id: z.coerce
    .number({ required_error: 'Pilih rak penyimpanan' })
    .positive('Pilih rak yang valid'),
  tingkat: z.string().max(10).optional().nullable(),
  posisi: z.string().max(10).optional().nullable(),
  keterangan: z.string().optional().nullable(),
  catatan: z.string().optional().nullable(),
  status_berkas: z.string().default('TERSEDIA'),
  status_fisik: z.string().optional().default('TERSEDIA'),

  // Fallback field lama agar kompatibel
  nomor_gu: z.string().optional(),
  nama_pemilik: z.string().optional(),
  jenis_dokumen: z.string().optional(),
  boks_id: z.coerce.number().optional(),
  nib: z.string().optional(),
});

export type DokumenFormData = z.infer<typeof dokumenSchema>;

/**
 * Skema validasi mutasi pemindahan dokumen ke album baru
 */
export const pindahAlbumSchema = z.object({
  nomor_album_baru: z.coerce
    .number({ required_error: 'Pilih album tujuan' })
    .positive('Pilih album tujuan yang valid'),
  rak_id_baru: z.coerce
    .number()
    .optional(),
  nomor_urut_baru: z.coerce
    .number()
    .optional(),
  tingkat_baru: z.string().max(10).optional().nullable(),
  posisi_baru: z.string().max(10).optional().nullable(),
  alasan: z
    .string()
    .min(5, 'Alasan minimal 5 karakter')
    .max(255, 'Alasan maksimal 255 karakter'),
});

export type PindahAlbumFormData = z.infer<typeof pindahAlbumSchema>;
export const pindahRakSchema = pindahAlbumSchema; // alias

/**
 * Skema validasi pembaruan status berkas dokumen pertanahan
 */
export const updateStatusSchema = z.object({
  status_berkas: z.enum(['TERSEDIA', 'HILANG', 'DIPINJAM', 'RUSAK', 'SELESAI', 'PROSES'], {
    required_error: 'Pilih status berkas',
  }),
  keterangan: z
    .string()
    .max(255, 'Keterangan maksimal 255 karakter')
    .optional(),
  status_fisik: z.string().optional(),
});

export type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

/**
 * Skema validasi penambahan pengguna oleh Administrator
 */
export const storeUserSchema = z.object({
  nama: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-z0-9_]+$/, 'Hanya huruf kecil, angka, underscore'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter'),
  role: z.enum(['ADMIN', 'USER'], {
    required_error: 'Pilih role pengguna',
  }),
});

export type StoreUserFormData = z.infer<typeof storeUserSchema>;
