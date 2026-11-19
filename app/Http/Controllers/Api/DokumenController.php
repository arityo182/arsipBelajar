<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use App\Models\LogAktivitas;
use App\Http\Requests\StoreDokumenRequest;
use App\Http\Requests\PindahRakRequest;
use App\Http\Requests\UpdateStatusRequest;
use App\Http\Resources\DokumenResource;
use App\Http\Resources\DokumenDetailResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DokumenController extends Controller
{
    /**
     * Dapatkan daftar dokumen dengan paginasi, pencarian, dan eager loading lokasi lengkap.
     * GET /api/dokumen
     */
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $search  = trim((string) $request->query('search', ''));

        $query = Dokumen::with([
            'desa.kecamatan',
            'boks.shaf.rak.ruang',
            'createdBy',
        ]);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_gu', 'ILIKE', "%{$search}%")
                  ->orWhere('nib', 'ILIKE', "%{$search}%")
                  ->orWhere('nama_pemilik', 'ILIKE', "%{$search}%");
            });
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data'    => DokumenResource::collection($paginated->items()),
            'meta'    => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
            'message' => 'Daftar dokumen berhasil diambil',
        ], 200);
    }

    /**
     * Simpan dokumen baru ke database dan catat log aktivitas.
     * POST /api/dokumen
     */
    public function store(StoreDokumenRequest $request)
    {
        $dokumen = DB::transaction(function () use ($request) {
            $data = $request->validated();
            $data['created_by'] = $request->user()->id;
            $data['status_fisik'] = 'TERSEDIA';

            $newDokumen = Dokumen::create($data);
            $newDokumen->load(['desa.kecamatan', 'boks.shaf.rak.ruang', 'createdBy']);

            LogAktivitas::create([
                'dokumen_id' => $newDokumen->id,
                'user_id'    => $request->user()->id,
                'aksi'       => 'TAMBAH_DOKUMEN',
                'detail'     => "Dokumen {$newDokumen->nomor_gu} atas nama {$newDokumen->nama_pemilik} ditambahkan ke {$newDokumen->lokasi_lengkap}",
                'created_at' => now(),
            ]);

            return $newDokumen;
        });

        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => 'Dokumen berhasil disimpan',
        ], 201);
    }

    /**
     * Dapatkan detail lengkap dokumen beserta relasi lokasi dan riwayat log.
     * GET /api/dokumen/{id}
     */
    public function show($id)
    {
        $dokumen = Dokumen::with([
            'desa.kecamatan',
            'boks.shaf.rak.ruang',
            'createdBy',
            'logAktivitas.user',
        ])->findOrFail($id);

        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => 'Detail dokumen berhasil diambil',
        ], 200);
    }

    /**
     * Pengecekan ketersediaan/duplikasi nomor GU secara real-time.
     * GET /api/dokumen/check-gu?nomor_gu={value}
     */
    public function checkGu(Request $request)
    {
        $nomorGu = trim((string) $request->query('nomor_gu', ''));

        if (empty($nomorGu)) {
            return response()->json([
                'data'    => ['exists' => false],
                'message' => 'Parameter nomor_gu kosong',
            ], 200);
        }

        $exists = Dokumen::where('nomor_gu', $nomorGu)->exists();

        return response()->json([
            'data'    => ['exists' => $exists],
            'message' => 'Pengecekan nomor GU berhasil',
        ], 200);
    }

    /**
     * Pindahkan dokumen ke boks lain dan catat jejak audit perpindahan.
     * PATCH /api/dokumen/{id}/pindah
     */
    public function pindah(PindahRakRequest $request, $id)
    {
        $dokumen = DB::transaction(function () use ($request, $id) {
            $doc = Dokumen::with(['boks.shaf.rak.ruang'])->findOrFail($id);
            $lokasiLama = $doc->lokasi_lengkap;

            $doc->boks_id = $request->boks_id_baru;
            $doc->save();

            // Refresh relasi lokasi baru
            $doc->load(['desa.kecamatan', 'boks.shaf.rak.ruang', 'createdBy', 'logAktivitas.user']);
            $lokasiBaru = $doc->lokasi_lengkap;

            LogAktivitas::create([
                'dokumen_id' => $doc->id,
                'user_id'    => $request->user()->id,
                'aksi'       => 'PINDAH_RAK',
                'detail'     => "Dipindah dari {$lokasiLama} ke {$lokasiBaru}. Alasan: {$request->alasan}",
                'created_at' => now(),
            ]);

            return $doc;
        });

        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => 'Dokumen berhasil dipindah',
        ], 200);
    }

    /**
     * Perbarui status fisik dokumen (TERSEDIA, DIPINJAM, RUSAK, HILANG).
     * PATCH /api/dokumen/{id}/status
     */
    public function updateStatus(UpdateStatusRequest $request, $id)
    {
        $dokumen = DB::transaction(function () use ($request, $id) {
            $doc = Dokumen::findOrFail($id);
            $statusLama = $doc->status_fisik;

            $doc->status_fisik = $request->status_fisik;
            $doc->save();

            $keteranganTambahan = $request->filled('keterangan')
                ? " Keterangan: {$request->keterangan}"
                : "";

            LogAktivitas::create([
                'dokumen_id' => $doc->id,
                'user_id'    => $request->user()->id,
                'aksi'       => 'UPDATE_STATUS',
                'detail'     => "Status diubah dari {$statusLama} ke {$request->status_fisik}.{$keteranganTambahan}",
                'created_at' => now(),
            ]);

            $doc->load(['desa.kecamatan', 'boks.shaf.rak.ruang', 'createdBy', 'logAktivitas.user']);
            return $doc;
        });

        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => 'Status berhasil diperbarui',
        ], 200);
    }
}
