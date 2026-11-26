<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use App\Models\Album;
use App\Models\Kecamatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatistikController extends Controller
{
    /**
     * Ringkasan status dokumen fisik untuk cards dashboard.
     * GET /api/statistik/ringkasan
     */
    public function ringkasan()
    {
        $total = Dokumen::whereNull('deleted_at')->count();
        $tersedia = Dokumen::whereNull('deleted_at')->where('status_fisik', 'TERSEDIA')->count();
        $hilang = Dokumen::whereNull('deleted_at')->where('status_fisik', 'HILANG')->count();
        $dipinjam = Dokumen::whereNull('deleted_at')->where('status_fisik', 'DIPINJAM')->count();
        $rusak = Dokumen::whereNull('deleted_at')->where('status_fisik', 'RUSAK')->count();

        return response()->json([
            'data' => [
                'total'             => $total,
                'tersedia'          => $tersedia,
                'hilang'            => $hilang,
                'dipinjam'          => $dipinjam,
                'rusak'             => $rusak,
                'selesai'           => $tersedia,
                'proses'            => $hilang + $dipinjam + $rusak,
                'total_dokumen'     => $total,
                'dokumen_tersedia'  => $tersedia,
                'dokumen_dipinjam'  => $dipinjam,
                'dokumen_hilang'    => $hilang,
            ],
            'message' => 'Ringkasan statistik berhasil diambil',
        ], 200);
    }

    /**
     * Rekapitulasi per Album: total, tersedia, hilang, dipinjam, rusak.
     * GET /api/statistik/album
     */
    public function perAlbum()
    {
        $albums = Album::with('rak')->orderBy('nomor_album', 'asc')->get();

        $stats = Dokumen::select(
            'nomor_album',
            DB::raw('COUNT(*) as total'),
            DB::raw("COUNT(CASE WHEN status_fisik = 'TERSEDIA' THEN 1 END) as tersedia"),
            DB::raw("COUNT(CASE WHEN status_fisik = 'HILANG' THEN 1 END) as hilang"),
            DB::raw("COUNT(CASE WHEN status_fisik = 'DIPINJAM' THEN 1 END) as dipinjam"),
            DB::raw("COUNT(CASE WHEN status_fisik = 'RUSAK' THEN 1 END) as rusak")
        )
        ->whereNull('deleted_at')
        ->groupBy('nomor_album')
        ->get()
        ->keyBy('nomor_album');

        $data = $albums->map(function ($album) use ($stats) {
            $st = $stats->get($album->nomor_album);
            $total = $st ? (int) $st->total : 0;
            $tersedia = $st ? (int) $st->tersedia : 0;
            $hilang = $st ? (int) $st->hilang : 0;
            $dipinjam = $st ? (int) $st->dipinjam : 0;
            $rusak = $st ? (int) $st->rusak : 0;
            $persentase = $total > 0 ? round(($tersedia / $total) * 100, 1) : 0.0;

            return [
                'nomor_album'         => $album->nomor_album,
                'rak_id'              => $album->rak_id,
                'rak_kode'            => $album->rak?->kode ?: 'E',
                'tingkat'             => $album->tingkat ?: '1',
                'posisi'              => $album->posisi,
                'kapasitas'           => $album->kapasitas ?: 30,
                'total'               => $total,
                'tersedia'            => $tersedia,
                'hilang'              => $hilang,
                'dipinjam'            => $dipinjam,
                'rusak'               => $rusak,
                'selesai'             => $tersedia,
                'proses'              => $hilang,
                'persentase_tersedia' => "{$persentase}%",
                'persentase_selesai'  => "{$persentase}%",
                'persentase_num'      => $persentase,
            ];
        });

        return response()->json([
            'data'    => $data,
            'message' => 'Statistik per album berhasil diambil',
        ], 200);
    }

    /**
     * Rekapitulasi per Jenis Permohonan: jumlah & persentase.
     * GET /api/statistik/jenis-permohonan
     */
    public function perJenisPermohonan()
    {
        $totalAll = Dokumen::whereNull('deleted_at')->count();

        $stats = Dokumen::select(
            'jenis_permohonan',
            DB::raw('COUNT(*) as jumlah'),
            DB::raw("COUNT(CASE WHEN status_fisik = 'TERSEDIA' THEN 1 END) as tersedia"),
            DB::raw("COUNT(CASE WHEN status_fisik = 'HILANG' THEN 1 END) as hilang"),
            DB::raw("COUNT(CASE WHEN status_fisik = 'DIPINJAM' THEN 1 END) as dipinjam"),
            DB::raw("COUNT(CASE WHEN status_fisik = 'RUSAK' THEN 1 END) as rusak")
        )
        ->whereNull('deleted_at')
        ->groupBy('jenis_permohonan')
        ->orderByDesc('jumlah')
        ->get();

        $data = $stats->map(function ($item) use ($totalAll) {
            $jumlah = (int) $item->jumlah;
            $tersedia = (int) $item->tersedia;
            $hilang = (int) $item->hilang;
            $dipinjam = (int) $item->dipinjam;
            $rusak = (int) $item->rusak;
            $pct = $totalAll > 0 ? round(($jumlah / $totalAll) * 100, 1) : 0.0;

            return [
                'jenis_permohonan' => $item->jenis_permohonan,
                'jumlah'           => $jumlah,
                'tersedia'         => $tersedia,
                'hilang'           => $hilang,
                'dipinjam'         => $dipinjam,
                'rusak'            => $rusak,
                'selesai'          => $tersedia,
                'proses'           => $hilang + $dipinjam + $rusak,
                'persentase'       => "{$pct}%",
                'persentase_num'   => $pct,
            ];
        });

        return response()->json([
            'data'    => $data,
            'message' => 'Statistik per jenis permohonan berhasil diambil',
        ], 200);
    }

    /**
     * Rekapitulasi per Kecamatan.
     * GET /api/statistik/kecamatan
     */
    public function perKecamatan()
    {
        $stats = Dokumen::join('kecamatan', 'dokumen.kecamatan_id', '=', 'kecamatan.id')
            ->select(
                'kecamatan.id as kecamatan_id',
                'kecamatan.nama as kecamatan_nama',
                DB::raw('COUNT(*) as total'),
                DB::raw("COUNT(CASE WHEN dokumen.status_fisik = 'TERSEDIA' THEN 1 END) as tersedia"),
                DB::raw("COUNT(CASE WHEN dokumen.status_fisik = 'HILANG' THEN 1 END) as hilang"),
                DB::raw("COUNT(CASE WHEN dokumen.status_fisik = 'DIPINJAM' THEN 1 END) as dipinjam"),
                DB::raw("COUNT(CASE WHEN dokumen.status_fisik = 'RUSAK' THEN 1 END) as rusak"),
                DB::raw("COUNT(CASE WHEN dokumen.status_fisik = 'TERSEDIA' THEN 1 END) as selesai"),
                DB::raw("COUNT(CASE WHEN dokumen.status_fisik != 'TERSEDIA' THEN 1 END) as proses")
            )
            ->whereNull('dokumen.deleted_at')
            ->groupBy('kecamatan.id', 'kecamatan.nama')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'data'    => $stats,
            'message' => 'Statistik per kecamatan berhasil diambil',
        ], 200);
    }
}
