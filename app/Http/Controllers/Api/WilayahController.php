<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kecamatan;
use App\Models\Desa;
use Illuminate\Http\Request;

class WilayahController extends Controller
{
    /**
     * Dapatkan daftar seluruh kecamatan di Kabupaten Banyumas.
     * GET /api/wilayah/kecamatan
     */
    public function kecamatan()
    {
        $kecamatan = Kecamatan::select('id', 'nama')
            ->orderBy('nama', 'asc')
            ->get();

        return response()->json([
            'data'    => $kecamatan,
            'message' => 'Daftar kecamatan berhasil diambil',
        ], 200);
    }

    /**
     * Dapatkan daftar desa berdasarkan kecamatan_id.
     * GET /api/wilayah/desa?kecamatan_id=1
     */
    public function desa(Request $request)
    {
        $query = Desa::select('id', 'nama', 'kecamatan_id');

        if ($request->filled('kecamatan_id')) {
            $query->where('kecamatan_id', $request->query('kecamatan_id'));
        }

        $desa = $query->orderBy('nama', 'asc')->get();

        return response()->json([
            'data'    => $desa,
            'message' => 'Daftar desa berhasil diambil',
        ], 200);
    }
}
