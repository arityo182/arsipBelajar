<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ruang;
use App\Models\Rak;
use App\Models\Shaf;
use App\Models\Boks;
use App\Models\Dokumen;
use App\Models\Album;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LokasiAdminController extends Controller
{
    // ================================================================
    // 1. RUANG ARSIP
    // ================================================================

    public function indexRuang()
    {
        $ruang = Ruang::withCount('raks')
            ->orderBy('kode', 'asc')
            ->get();

        return response()->json([
            'data'    => $ruang,
            'message' => 'Daftar ruang berhasil diambil',
        ]);
    }

    public function storeRuang(Request $request)
    {
        $validated = $request->validate([
            'nama'      => 'required|string|max:100',
            'kode'      => 'required|string|max:20|unique:ruang,kode',
            'deskripsi' => 'nullable|string',
        ], [
            'nama.required' => 'Nama ruang wajib diisi.',
            'kode.required' => 'Kode ruang wajib diisi.',
            'kode.unique'   => 'Kode ruang sudah digunakan.',
        ]);

        $validated['kode'] = strtoupper(trim($validated['kode']));
        $ruang = Ruang::create($validated);
        $ruang->loadCount('raks');

        return response()->json([
            'data'    => $ruang,
            'message' => 'Ruang berhasil ditambahkan',
        ], 201);
    }

    public function updateRuang(Request $request, $id)
    {
        $ruang = Ruang::findOrFail($id);

        $validated = $request->validate([
            'nama'      => 'required|string|max:100',
            'kode'      => ['required', 'string', 'max:20', Rule::unique('ruang', 'kode')->ignore($ruang->id)],
            'deskripsi' => 'nullable|string',
        ], [
            'nama.required' => 'Nama ruang wajib diisi.',
            'kode.required' => 'Kode ruang wajib diisi.',
            'kode.unique'   => 'Kode ruang sudah digunakan.',
        ]);

        $validated['kode'] = strtoupper(trim($validated['kode']));
        $ruang->update($validated);
        $ruang->loadCount('raks');

        return response()->json([
            'data'    => $ruang,
            'message' => 'Ruang berhasil diperbarui',
        ]);
    }

    public function destroyRuang($id)
    {
        $ruang = Ruang::findOrFail($id);

        // Cek apakah masih ada dokumen (termasuk soft-deleted) di ruang ini
        $docCount = Dokumen::withTrashed()->whereHas('rak', function ($q) use ($id) {
            $q->where('ruang_id', $id);
        })->count();

        if ($docCount > 0) {
            return response()->json([
                'message' => "Tidak dapat menghapus ruang yang masih berisi berkas DI-302 ({$docCount} dokumen). Pindahkan berkas terlebih dahulu.",
            ], 422);
        }

        // Cek apakah masih ada rak di dalam ruang ini agar tidak terhapus cascade diam-diam
        $rakCount = Rak::where('ruang_id', $id)->count();
        if ($rakCount > 0) {
            return response()->json([
                'message' => "Tidak dapat menghapus ruang yang masih memiliki {$rakCount} rak. Hapus rak terlebih dahulu.",
            ], 422);
        }

        $ruang->delete();

        return response()->json([
            'message' => 'Ruang berhasil dihapus',
        ]);
    }

    // ================================================================
    // 2. RAK LEMARI
    // ================================================================

    public function indexRak(Request $request)
    {
        $query = Rak::with(['ruang'])->withCount('shafs');

        if ($request->filled('ruang_id')) {
            $query->where('ruang_id', $request->query('ruang_id'));
        }

        $rak = $query->orderBy('kode', 'asc')->get();

        return response()->json([
            'data'    => $rak,
            'message' => 'Daftar rak berhasil diambil',
        ]);
    }

    public function storeRak(Request $request)
    {
        $validated = $request->validate([
            'ruang_id' => 'required|exists:ruang,id',
            'kode'     => 'required|string|max:20|unique:rak,kode',
            'nama'     => 'nullable|string|max:100',
        ], [
            'ruang_id.required' => 'Pilih ruang induk terlebih dahulu.',
            'ruang_id.exists'   => 'Ruang yang dipilih tidak valid.',
            'kode.required'     => 'Kode rak wajib diisi.',
            'kode.unique'       => 'Kode rak sudah digunakan.',
        ]);

        $validated['kode'] = strtoupper(trim($validated['kode']));
        $rak = Rak::create([
            'ruang_id' => $validated['ruang_id'],
            'kode'     => $validated['kode'],
        ]);

        $rak->load(['ruang']);
        $rak->loadCount('shafs');

        return response()->json([
            'data'    => $rak,
            'message' => 'Rak berhasil ditambahkan',
        ], 201);
    }

    public function updateRak(Request $request, $id)
    {
        $rak = Rak::findOrFail($id);

        $validated = $request->validate([
            'ruang_id' => 'required|exists:ruang,id',
            'kode'     => ['required', 'string', 'max:20', Rule::unique('rak', 'kode')->ignore($rak->id)],
            'nama'     => 'nullable|string|max:100',
        ], [
            'ruang_id.required' => 'Pilih ruang induk terlebih dahulu.',
            'ruang_id.exists'   => 'Ruang yang dipilih tidak valid.',
            'kode.required'     => 'Kode rak wajib diisi.',
            'kode.unique'       => 'Kode rak sudah digunakan.',
        ]);

        $validated['kode'] = strtoupper(trim($validated['kode']));
        $rak->update([
            'ruang_id' => $validated['ruang_id'],
            'kode'     => $validated['kode'],
        ]);

        $rak->load(['ruang']);
        $rak->loadCount('shafs');

        return response()->json([
            'data'    => $rak,
            'message' => 'Rak berhasil diperbarui',
        ]);
    }

    public function destroyRak($id)
    {
        $rak = Rak::findOrFail($id);

        // Cek dokumen (termasuk soft-deleted) di dalam rak ini agar tidak bentrok FK
        $docCount = Dokumen::withTrashed()->where('rak_id', $id)->count();

        if ($docCount > 0) {
            return response()->json([
                'message' => "Tidak dapat menghapus rak yang masih berisi berkas DI-302 ({$docCount} dokumen). Pindahkan berkas terlebih dahulu.",
            ], 422);
        }

        // Cek album di dalam rak ini
        $albumCount = Album::where('rak_id', $id)->count();
        if ($albumCount > 0) {
            return response()->json([
                'message' => "Tidak dapat menghapus rak yang masih memuat {$albumCount} album arsip. Hapus atau pindahkan album terlebih dahulu.",
            ], 422);
        }

        // Hapus tingkatan (shafs) yang terdaftar di rak ini sebelum rak dihapus
        $rak->shafs()->delete();
        $rak->delete();

        return response()->json([
            'message' => 'Rak berhasil dihapus',
        ]);
    }

    // ================================================================
    // 3. SHAF / AMBALAN
    // ================================================================

    public function indexShaf(Request $request)
    {
        $query = Shaf::with(['rak.ruang'])->withCount('boks');

        if ($request->filled('rak_id')) {
            $query->where('rak_id', $request->query('rak_id'));
        }

        $shaf = $query->orderBy('kode', 'asc')->get();

        return response()->json([
            'data'    => $shaf,
            'message' => 'Daftar shaf berhasil diambil',
        ]);
    }

    public function storeShaf(Request $request)
    {
        $validated = $request->validate([
            'rak_id' => 'required|exists:rak,id',
            'kode'   => [
                'required',
                'string',
                'max:20',
                Rule::unique('shaf', 'kode')->where(fn ($query) => $query->where('rak_id', $request->rak_id)),
            ],
            'nama'   => 'nullable|string|max:100',
        ], [
            'rak_id.required' => 'Pilih rak induk terlebih dahulu.',
            'rak_id.exists'   => 'Rak yang dipilih tidak valid.',
            'kode.required'   => 'Kode shaf wajib diisi.',
            'kode.unique'     => 'Kode shaf sudah digunakan pada rak ini.',
        ]);

        $validated['kode'] = strtoupper(trim($validated['kode']));
        $shaf = Shaf::create([
            'rak_id' => $validated['rak_id'],
            'kode'   => $validated['kode'],
        ]);

        $shaf->load(['rak.ruang']);
        $shaf->loadCount('boks');

        return response()->json([
            'data'    => $shaf,
            'message' => 'Shaf berhasil ditambahkan',
        ], 201);
    }

    public function updateShaf(Request $request, $id)
    {
        $shaf = Shaf::findOrFail($id);

        $validated = $request->validate([
            'rak_id' => 'required|exists:rak,id',
            'kode'   => [
                'required',
                'string',
                'max:20',
                Rule::unique('shaf', 'kode')->where(fn ($query) => $query->where('rak_id', $request->rak_id))->ignore($shaf->id),
            ],
            'nama'   => 'nullable|string|max:100',
        ], [
            'rak_id.required' => 'Pilih rak induk terlebih dahulu.',
            'rak_id.exists'   => 'Rak yang dipilih tidak valid.',
            'kode.required'   => 'Kode shaf wajib diisi.',
            'kode.unique'     => 'Kode shaf sudah digunakan pada rak ini.',
        ]);

        $validated['kode'] = strtoupper(trim($validated['kode']));
        $shaf->update([
            'rak_id' => $validated['rak_id'],
            'kode'   => $validated['kode'],
        ]);

        $shaf->load(['rak.ruang']);
        $shaf->loadCount('boks');

        return response()->json([
            'data'    => $shaf,
            'message' => 'Shaf berhasil diperbarui',
        ]);
    }

    public function destroyShaf($id)
    {
        $shaf = Shaf::findOrFail($id);

        $docCount = Dokumen::where('rak_id', $shaf->rak_id)
            ->where('tingkat', $shaf->kode)
            ->whereNull('deleted_at')
            ->count();

        if ($docCount > 0) {
            return response()->json([
                'message' => "Tidak dapat menghapus tingkatan yang masih berisi berkas DI-302 ({$docCount} dokumen). Pindahkan berkas terlebih dahulu.",
            ], 422);
        }

        $shaf->delete();

        return response()->json([
            'message' => 'Tingkatan berhasil dihapus',
        ]);
    }

    // ================================================================
    // 4. BOKS ARSIP
    // ================================================================

    public function indexBoks(Request $request)
    {
        $query = Boks::with(['shaf.rak.ruang'])
            ->withCount(['dokumens' => function ($q) {
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
                'shaf'      => $item->shaf,
            ];
        });

        return response()->json([
            'data'    => $data,
            'message' => 'Daftar boks berhasil diambil',
        ]);
    }

    public function storeBoks(Request $request)
    {
        $validated = $request->validate([
            'shaf_id'   => 'required|exists:shaf,id',
            'nomor'     => [
                'required',
                'string',
                'max:10',
                Rule::unique('boks', 'nomor')->where(fn ($query) => $query->where('shaf_id', $request->shaf_id)),
            ],
            'kapasitas' => 'required|integer|min:1|max:500',
        ], [
            'shaf_id.required'   => 'Pilih shaf induk terlebih dahulu.',
            'shaf_id.exists'     => 'Shaf yang dipilih tidak valid.',
            'nomor.required'     => 'Nomor boks wajib diisi.',
            'nomor.unique'       => 'Nomor boks sudah digunakan pada shaf ini.',
            'kapasitas.required' => 'Kapasitas maksimal boks wajib diisi.',
            'kapasitas.integer'  => 'Kapasitas harus berupa angka bulat.',
            'kapasitas.min'      => 'Kapasitas minimal 1 dokumen.',
            'kapasitas.max'      => 'Kapasitas maksimal 500 dokumen.',
        ]);

        $validated['nomor'] = trim($validated['nomor']);
        $boks = Boks::create($validated);
        $boks->load(['shaf.rak.ruang']);

        return response()->json([
            'data'    => [
                'id'        => $boks->id,
                'nomor'     => $boks->nomor,
                'shaf_id'   => $boks->shaf_id,
                'kapasitas' => $boks->kapasitas,
                'terisi'    => $boks->terisi,
                'sisa'      => $boks->sisa,
                'shaf'      => $boks->shaf,
            ],
            'message' => 'Boks berhasil ditambahkan',
        ], 201);
    }

    public function updateBoks(Request $request, $id)
    {
        $boks = Boks::findOrFail($id);
        $minKapasitas = max(1, $boks->terisi);

        $validated = $request->validate([
            'shaf_id'   => 'required|exists:shaf,id',
            'nomor'     => [
                'required',
                'string',
                'max:10',
                Rule::unique('boks', 'nomor')->where(fn ($query) => $query->where('shaf_id', $request->shaf_id))->ignore($boks->id),
            ],
            'kapasitas' => [
                'required',
                'integer',
                "min:{$minKapasitas}",
                'max:500',
            ],
        ], [
            'shaf_id.required'   => 'Pilih shaf induk terlebih dahulu.',
            'shaf_id.exists'     => 'Shaf yang dipilih tidak valid.',
            'nomor.required'     => 'Nomor boks wajib diisi.',
            'nomor.unique'       => 'Nomor boks sudah digunakan pada shaf ini.',
            'kapasitas.required' => 'Kapasitas maksimal boks wajib diisi.',
            'kapasitas.integer'  => 'Kapasitas harus berupa angka bulat.',
            'kapasitas.min'      => "Kapasitas minimal {$minKapasitas} (sesuai jumlah dokumen saat ini).",
            'kapasitas.max'      => 'Kapasitas maksimal 500 dokumen.',
        ]);

        $validated['nomor'] = trim($validated['nomor']);
        $boks->update($validated);
        $boks->load(['shaf.rak.ruang']);

        return response()->json([
            'data'    => [
                'id'        => $boks->id,
                'nomor'     => $boks->nomor,
                'shaf_id'   => $boks->shaf_id,
                'kapasitas' => $boks->kapasitas,
                'terisi'    => $boks->terisi,
                'sisa'      => $boks->sisa,
                'shaf'      => $boks->shaf,
            ],
            'message' => 'Boks berhasil diperbarui',
        ]);
    }

    public function destroyBoks($id)
    {
        $boks = Boks::findOrFail($id);

        if ($boks->dokumens()->whereNull('deleted_at')->count() > 0) {
            return response()->json([
                'message' => 'Tidak dapat menghapus boks yang masih berisi dokumen. Pindahkan dokumen terlebih dahulu.',
            ], 422);
        }

        $boks->delete();

        return response()->json([
            'message' => 'Boks berhasil dihapus',
        ]);
    }

    // ================================================================
    // 5. ALBUM ARSIP DI-302
    // ================================================================

    public function indexAlbum(Request $request)
    {
        $query = \App\Models\Album::with('rak')
            ->withCount(['dokumens' => function ($q) {
                $q->whereNull('deleted_at');
            }]);

        if ($request->filled('rak_id')) {
            $query->where('rak_id', $request->query('rak_id'));
        }

        $albums = $query->orderBy('nomor_album', 'asc')->get();

        $data = $albums->map(function ($item) {
            return [
                'id'          => $item->id,
                'nomor_album' => $item->nomor_album,
                'rak_id'      => $item->rak_id,
                'rak_kode'    => $item->rak?->kode ?: 'E',
                'tingkat'     => $item->tingkat,
                'posisi'      => $item->posisi,
                'kapasitas'   => $item->kapasitas ?: 30,
                'terisi'      => $item->terisi,
                'sisa'        => $item->sisa,
            ];
        });

        return response()->json([
            'data'    => $data,
            'message' => 'Daftar album berhasil diambil',
        ]);
    }

    public function storeAlbum(Request $request)
    {
        $validated = $request->validate([
            'rak_id'      => 'required|exists:rak,id',
            'nomor_album' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('album', 'nomor_album')->where(fn ($query) => $query->where('rak_id', $request->rak_id)),
            ],
            'tingkat'     => 'nullable|string|max:10',
            'posisi'      => 'nullable|string|max:10',
            'kapasitas'   => 'required|integer|min:1|max:100',
        ], [
            'rak_id.required'      => 'Pilih rak penyimpanan terlebih dahulu.',
            'rak_id.exists'        => 'Rak yang dipilih tidak valid.',
            'nomor_album.required' => 'Nomor album wajib diisi.',
            'nomor_album.unique'   => 'Nomor album sudah terdaftar di rak ini.',
            'kapasitas.required'   => 'Kapasitas album wajib diisi.',
        ]);

        $album = \App\Models\Album::create($validated);
        $album->load('rak');

        return response()->json([
            'data'    => [
                'id'          => $album->id,
                'nomor_album' => $album->nomor_album,
                'rak_id'      => $album->rak_id,
                'rak_kode'    => $album->rak?->kode ?: 'E',
                'tingkat'     => $album->tingkat,
                'posisi'      => $album->posisi,
                'kapasitas'   => $album->kapasitas,
                'terisi'      => $album->terisi,
                'sisa'        => $album->sisa,
            ],
            'message' => 'Album berhasil ditambahkan',
        ], 201);
    }

    public function updateAlbum(Request $request, $id)
    {
        $album = \App\Models\Album::findOrFail($id);

        $validated = $request->validate([
            'rak_id'      => 'required|exists:rak,id',
            'nomor_album' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('album', 'nomor_album')->where(fn ($query) => $query->where('rak_id', $request->rak_id))->ignore($album->id),
            ],
            'tingkat'     => 'nullable|string|max:10',
            'posisi'      => 'nullable|string|max:10',
            'kapasitas'   => 'required|integer|min:1|max:100',
        ]);

        $album->update($validated);
        $album->load('rak');

        return response()->json([
            'data'    => [
                'id'          => $album->id,
                'nomor_album' => $album->nomor_album,
                'rak_id'      => $album->rak_id,
                'rak_kode'    => $album->rak?->kode ?: 'E',
                'tingkat'     => $album->tingkat,
                'posisi'      => $album->posisi,
                'kapasitas'   => $album->kapasitas,
                'terisi'      => $album->terisi,
                'sisa'        => $album->sisa,
            ],
            'message' => 'Album berhasil diperbarui',
        ]);
    }

    public function destroyAlbum($id)
    {
        $album = \App\Models\Album::findOrFail($id);

        if ($album->dokumens()->whereNull('deleted_at')->count() > 0) {
            return response()->json([
                'message' => 'Tidak dapat menghapus album yang masih berisi berkas DI-302. Pindahkan berkas terlebih dahulu.',
            ], 422);
        }

        $album->delete();

        return response()->json([
            'message' => 'Album berhasil dihapus',
        ]);
    }
}
