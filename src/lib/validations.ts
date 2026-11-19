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

/**
 * Skema validasi penambahan dan pengeditan dokumen pertanahan
 */
export const dokumenSchema = z.object({
  nomor_gu: z
    .string()
    .min(1, 'Nomor GU wajib diisi')
    .max(30, 'Maksimal 30 karakter')
    .regex(/^[A-Z0-9\-/]+$/i, 'Hanya huruf, angka, strip, dan garis miring'),
  tahun: z.coerce
    .number({ invalid_type_error: 'Tahun harus berupa angka' })
    .min(1945, 'Tahun minimal 1945')
    .max(new Date().getFullYear(), 'Tahun tidak boleh lebih dari tahun ini'),
  nib: z
    .string()
    .min(1, 'NIB wajib diisi')
    .max(20, 'Maksimal 20 karakter')
    .regex(/^\d+$/, 'NIB hanya boleh berisi angka'),
  jenis_dokumen: z.enum(['Sertipikat', 'GU', 'SU', 'Warkah', 'IPT', 'Lainnya'], {
    required_error: 'Pilih jenis dokumen',
  }),
  nama_pemilik: z
    .string()
    .min(3, 'Minimal 3 karakter')
    .max(100, 'Maksimal 100 karakter')
    .regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh huruf dan spasi'),
  desa_id: z.coerce
    .number({ required_error: 'Pilih desa' })
    .positive('Pilih desa yang valid'),
  boks_id: z.coerce
    .number({ required_error: 'Pilih lokasi boks' })
    .positive('Pilih lokasi boks yang valid'),
});

/**
 * Skema validasi mutasi pemindahan dokumen ke boks baru
 */
export const pindahRakSchema = z.object({
  boks_id_baru: z.coerce
    .number({ required_error: 'Pilih boks tujuan' })
    .positive('Pilih boks tujuan yang valid'),
  alasan: z
    .string()
    .min(10, 'Alasan minimal 10 karakter')
    .max(255, 'Alasan maksimal 255 karakter'),
});

/**
 * Skema validasi pembaruan status fisik dokumen pertanahan
 */
export const updateStatusSchema = z.object({
  status_fisik: z.enum(['TERSEDIA', 'DIPINJAM', 'RUSAK', 'HILANG'], {
    required_error: 'Pilih status fisik dokumen',
  }),
  keterangan: z
    .string()
    .max(255, 'Keterangan maksimal 255 karakter')
    .optional(),
});

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

// Type Inferences
export type LoginFormData = z.infer<typeof loginSchema>;
export type DokumenFormData = z.infer<typeof dokumenSchema>;
export type PindahRakFormData = z.infer<typeof pindahRakSchema>;
export type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;
export type StoreUserFormData = z.infer<typeof storeUserSchema>;
