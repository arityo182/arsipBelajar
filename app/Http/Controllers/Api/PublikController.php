<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublikController extends Controller
{
    public function cekDokumen(Request $request)
    {
        // Rate limiting: 10 request per menit per IP
        $ip = $request->ip();
        $key = "publik_cek_{$ip}";
        $hits = Cache::get($key, 0);

        if ($hits >= 10) {
            return response()->json([
                'message' => 'Terlalu banyak permintaan. Silakan coba lagi dalam 1 menit.',
            ], 429);
        }

        Cache::put($key, $hits + 1, now()->addMinute());

        // Validasi: minimal satu parameter wajib diisi
        if (!$request->nomor_gu && !$request->nib) {
            return response()->json([
                'message' => 'Masukkan Nomor GU atau NIB untuk melakukan pencarian.',
            ], 422);
        }

        // Query dokumen
        $query = Dokumen::with(['desa.kecamatan'])
            ->whereNull('deleted_at');

        if ($request->nomor_gu) {
            $query->where('nomor_gu', 'ILIKE', '%' . $request->nomor_gu . '%');
        }

        if ($request->nib) {
            $query->where('nib', $request->nib);
        }

        $dokumen = $query->limit(5)->get();

        if ($dokumen->isEmpty()) {
            return response()->json([
                'data'    => [],
                'message' => 'Dokumen tidak ditemukan.',
                'catatan' => 'Pastikan Nomor GU atau NIB yang Anda masukkan sudah benar. Jika masih tidak ditemukan, hubungi petugas Kantor Pertanahan Banyumas.',
            ]);
        }

        $statusLabel = [
            'TERSEDIA' => 'Tersedia di Kantor',
            'DIPINJAM' => 'Sedang Dalam Proses',
            'RUSAK'    => 'Dalam Perbaikan',
            'HILANG'   => 'Hubungi Petugas',
        ];

        $hasil = $dokumen->map(function ($dok) use ($statusLabel) {
            return [
                'nomor_gu'      => $dok->nomor_gu,
                'nib'           => $dok->nib,
                'jenis_dokumen' => $dok->jenis_dokumen,
                'tahun'         => $dok->tahun,
                'desa'          => $dok->desa->nama,
                'kecamatan'     => $dok->desa->kecamatan->nama,
                'kabupaten'     => 'Banyumas',
                'status_fisik'  => $dok->status_fisik,
                'status_label'  => $statusLabel[$dok->status_fisik] ?? $dok->status_fisik,
            ];
            // CATATAN: nama_pemilik dan lokasi rak SENGAJA tidak disertakan untuk privasi
        });

        return response()->json([
            'data'    => $hasil,
            'message' => 'Dokumen ditemukan.',
            'catatan' => 'Untuk informasi lebih lanjut atau pengambilan dokumen, hubungi petugas Kantor Pertanahan Banyumas. Telp: (0281) 635151',
        ]);
    }
}
