<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ruang;
use App\Models\Rak;
use App\Models\Shaf;
use App\Models\Boks;
use Illuminate\Http\Request;

class LokasiController extends Controller
{
    /**
     * Dapatkan daftar seluruh ruangan arsip.
     * GET /api/lokasi/ruang
     */
    public function ruang()
    {
        $ruang = Ruang::select('id', 'nama', 'kode')
            ->orderBy('kode', 'asc')
            ->get();

        return response()->json([
            'data'    => $ruang,
            'message' => 'Daftar ruangan berhasil diambil',
        ], 200);
    }

    /**
     * Dapatkan daftar rak berdasarkan ruang_id.
     * GET /api/lokasi/rak?ruang_id=1
     */
    public function rak(Request $request)
    {
        $query = Rak::select('id', 'kode', 'ruang_id');

        if ($request->filled('ruang_id')) {
            $query->where('ruang_id', $request->query('ruang_id'));
        }

        $rak = $query->orderBy('kode', 'asc')->get();

        return response()->json([
            'data'    => $rak,
            'message' => 'Daftar rak berhasil diambil',
        ], 200);
    }

    /**
     * Dapatkan daftar shaf berdasarkan rak_id.
     * GET /api/lokasi/shaf?rak_id=1
     */
    public function shaf(Request $request)
    {
        $query = Shaf::select('id', 'kode', 'rak_id');

        if ($request->filled('rak_id')) {
            $query->where('rak_id', $request->query('rak_id'));
        }

        $shaf = $query->orderBy('kode', 'asc')->get();

        return response()->json([
            'data'    => $shaf,
            'message' => 'Daftar shaf berhasil diambil',
        ], 200);
    }

    /**
     * Dapatkan daftar boks beserta jumlah terisi dan sisa slot kapasitas.
     * GET /api/lokasi/boks?shaf_id=1
     */
    public function boks(Request $request)
    {
        $query = Boks::withCount(['dokumens' => function ($q) {
            $q->whereNull('deleted_at');
        }]);

        if ($request->filled('shaf_id')) {
            $query->where('shaf_id', $request->query('shaf_id'));
        }

        $boks = $query->orderBy('nomor', 'asc')->get();

        $data = $boks->map(function ($item) {
            return [
                'id'        => $item->id,
                'nomor'     => $item->nomor,
                'shaf_id'   => $item->shaf_id,
                'kapasitas' => $item->kapasitas,
                'terisi'    => $item->terisi,
                'sisa'      => $item->sisa,
            ];
        });

        return response()->json([
            'data'    => $data,
            'message' => 'Daftar boks berhasil diambil',
        ], 200);
    }
}
