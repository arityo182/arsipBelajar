<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublikController extends Controller
{
    /**
     * Layanan pencarian publik dokumen DI-302.
     * GET /api/publik/cek?nomor_di302=&nama_pemohon=
     */
    public function cekDokumen(Request $request)
    {
        $nomorDi302  = trim((string) $request->query('nomor_di302', $request->query('nomor_gu', '')));
        $namaPemohon = trim((string) $request->query('nama_pemohon', ''));

        // Validasi: minimal satu parameter wajib diisi
        if (empty($nomorDi302) && empty($namaPemohon)) {
            return response()->json([
                'message' => 'Masukkan Nomor DI-302 atau Nama Pemohon untuk melakukan pencarian.',
            ], 422);
        }

        // Validasi format nomor DI-302 jika diisi
        if (!empty($nomorDi302) && !preg_match('/^[1-9][0-9]*$/', $nomorDi302)) {
            return response()->json([
                'message' => 'Nomor DI-302 harus berupa angka positif tanpa huruf atau simbol.',
            ], 422);
        }

        // Validasi minimal 5 karakter untuk nama pemohon guna mencegah enumerasi data
        if (!empty($namaPemohon) && mb_strlen($namaPemohon, 'UTF-8') < 5) {
            return response()->json([
                'message' => 'Nama Pemohon minimal 5 karakter untuk menjaga kerahasiaan data.',
            ], 422);
        }

        // Query dokumen (hanya dokumen aktif)
        $query = Dokumen::with(['desa.kecamatan'])
            ->whereNull('deleted_at');

        if (!empty($nomorDi302)) {
            $query->where('nomor_di302', $nomorDi302);
        }

        if (!empty($namaPemohon)) {
            $escapedNama = addcslashes($namaPemohon, '%_\\');
            $query->where('nama_pemohon', 'ILIKE', '%' . $escapedNama . '%');
        }

        $dokumen = $query->limit(5)->get();

        if ($dokumen->isEmpty()) {
            return response()->json([
                'data'    => [],
                'message' => 'Dokumen tidak ditemukan.',
                'catatan' => 'Pastikan Nomor DI-302 atau Nama Pemohon yang Anda masukkan sudah benar. Jika masih tidak ditemukan, silakan hubungi loket Kantor Pertanahan Kabupaten Banyumas.',
            ]);
        }

        $hasil = $dokumen->map(function ($dok) {
            // Masking nama pemohon untuk privasi (5 huruf pertama + ****) dengan multibyte safe
            $namaAsli = trim((string) $dok->nama_pemohon);
            $len = mb_strlen($namaAsli, 'UTF-8');
            $maskedNama = $len > 5
                ? mb_substr($namaAsli, 0, 5, 'UTF-8') . '****'
                : mb_substr($namaAsli, 0, 2, 'UTF-8') . '****';

            $statusFisik = $dok->status_fisik ?: $dok->status_berkas;
            $statusLabel = match ($statusFisik) {
                'TERSEDIA', 'SELESAI' => 'Berkas Tersedia di Ruang Arsip',
                'DIPINJAM'            => 'Berkas Sedang Dipinjam Petugas',
                'RUSAK'               => 'Berkas Dalam Perbaikan Fisik',
                'HILANG'              => 'Fisik Berkas Dalam Penelusuran Petugas',
                default               => 'Fisik Berkas Dalam Penelusuran Petugas',
            };

            return [
                'nomor_di302'      => $dok->nomor_di302,
                'tanggal_masuk'    => $dok->tanggal_masuk ? (is_string($dok->tanggal_masuk) ? $dok->tanggal_masuk : $dok->tanggal_masuk->format('d/m/Y')) : null,
                'jenis_permohonan' => $dok->jenis_permohonan,
                'nama_pemohon'     => $maskedNama,
                'desa'             => $dok->desa?->nama,
                'kecamatan'        => $dok->desa?->kecamatan?->nama ?: $dok->kecamatan?->nama,
                'kabupaten'        => 'Banyumas',
                'status_fisik'     => $statusFisik,
                'status_berkas'    => $statusFisik,
                'status_label'     => $statusLabel,
            ];
            // CATATAN PRIVASI: Lokasi album, rak, dan nomor urut SENGAJA TIDAK DITAMPILKAN ke publik
        });

        return response()->json([
            'data'    => $hasil,
            'message' => 'Dokumen ditemukan.',
            'catatan' => 'Untuk informasi lebih lanjut atau pengambilan dokumen fisik, silakan kunjungi loket pelayanan Kantor Pertanahan Kabupaten Banyumas. Telp: (0281) 635151',
        ]);
    }
}
