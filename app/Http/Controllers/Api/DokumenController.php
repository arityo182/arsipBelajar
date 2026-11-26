<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use App\Models\Album;
use App\Models\LogAktivitas;
use App\Http\Requests\StoreDokumenRequest;
use App\Http\Requests\PindahAlbumRequest;
use App\Http\Requests\UpdateStatusRequest;
use App\Http\Resources\DokumenResource;
use App\Http\Resources\DokumenDetailResource;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DokumenController extends Controller
{
    /**
     * Dapatkan daftar dokumen dengan paginasi, pencarian multi-field, dan filter spesifik DI-302.
     * GET /api/dokumen
     */
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $search  = trim((string) $request->query('search', ''));

        $query = Dokumen::with([
            'desa.kecamatan',
            'rak',
            'album.rak',
            'createdBy',
        ])->whereNull('deleted_at');

        // Pencarian serbaguna: No. DI-302, Nama Pemohon, Keterangan, Catatan
        if (!empty($search)) {
            $escapedSearch = addcslashes($search, '%_\\');
            $query->where(function ($q) use ($escapedSearch) {
                $q->where('nomor_di302', 'ILIKE', "%{$escapedSearch}%")
                  ->orWhere('nama_pemohon', 'ILIKE', "%{$escapedSearch}%")
                  ->orWhere('keterangan', 'ILIKE', "%{$escapedSearch}%")
                  ->orWhere('catatan', 'ILIKE', "%{$escapedSearch}%");
            });
        }

        // Filter status berkas / fisik (TERSEDIA / HILANG / DIPINJAM / RUSAK)
        if ($request->filled('status_fisik')) {
            $status = strtoupper($request->query('status_fisik'));
            $query->where(function ($q) use ($status) {
                $q->where('status_fisik', $status)
                  ->orWhere('status_berkas', $status);
            });
        } elseif ($request->filled('status_berkas')) {
            $status = strtoupper($request->query('status_berkas'));
            $query->where(function ($q) use ($status) {
                $q->where('status_fisik', $status)
                  ->orWhere('status_berkas', $status);
            });
        }

        // Filter nomor album
        if ($request->filled('nomor_album')) {
            $query->where('nomor_album', (int) $request->query('nomor_album'));
        }

        // Filter jenis permohonan
        if ($request->filled('jenis_permohonan')) {
            $query->where('jenis_permohonan', $request->query('jenis_permohonan'));
        }

        // Filter rak
        if ($request->filled('rak_id')) {
            $query->where('rak_id', (int) $request->query('rak_id'));
        }

        // Filter tahun
        if ($request->filled('tahun')) {
            $query->where('tahun', (int) $request->query('tahun'));
        }

        // Filter kecamatan
        if ($request->filled('kecamatan_id')) {
            $query->where('kecamatan_id', (int) $request->query('kecamatan_id'));
        }

        // Filter desa
        if ($request->filled('desa_id')) {
            $query->where('desa_id', (int) $request->query('desa_id'));
        }

        $paginated = $query->orderBy('nomor_album', 'asc')
            ->orderBy('nomor_urut', 'asc')
            ->paginate($perPage);

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
     * Simpan dokumen DI-302 baru ke database dan catat log aktivitas.
     * POST /api/dokumen
     */
    public function store(StoreDokumenRequest $request)
    {
        $dokumen = DB::transaction(function () use ($request) {
            $data = $request->validated();

            // Kunci album tujuan untuk mencegah race condition kapasitas & nomor urut
            $album = Album::where('nomor_album', $data['nomor_album'])
                ->where('rak_id', $data['rak_id'])
                ->lockForUpdate()
                ->first();

            if (!$album) {
                throw new HttpResponseException(response()->json([
                    'message' => 'Album tidak ditemukan pada rak yang dipilih.',
                    'errors'  => ['nomor_album' => ['Album tidak terdaftar pada rak tersebut.']],
                ], 422));
            }

            $kapasitas = (int) ($album->kapasitas ?: 30);
            $terisi = Dokumen::where('nomor_album', $album->nomor_album)
                ->whereNull('deleted_at')
                ->count();

            if ($terisi >= $kapasitas) {
                throw new HttpResponseException(response()->json([
                    'message' => "Album {$album->nomor_album} sudah penuh ({$terisi}/{$kapasitas} berkas).",
                    'errors'  => ['nomor_album' => ['Album tujuan sudah penuh, silakan pilih album lain.']],
                ], 422));
            }

            if ((int) $data['nomor_urut'] > $kapasitas) {
                throw new HttpResponseException(response()->json([
                    'message' => "Nomor urut melebihi kapasitas maksimal Album {$album->nomor_album} ({$kapasitas}).",
                    'errors'  => ['nomor_urut' => ["Nomor urut maksimal adalah {$kapasitas}."]],
                ], 422));
            }

            $slotTerpakai = Dokumen::withTrashed()
                ->where('nomor_album', $album->nomor_album)
                ->where('nomor_urut', (int) $data['nomor_urut'])
                ->exists();

            if ($slotTerpakai) {
                throw new HttpResponseException(response()->json([
                    'message' => "Slot Album {$album->nomor_album} Urut #{$data['nomor_urut']} sudah terisi.",
                    'errors'  => ['nomor_urut' => ["Nomor urut #{$data['nomor_urut']} di Album {$album->nomor_album} sudah digunakan."]],
                ], 422));
            }

            // Extract tahun dari tanggal_masuk jika belum terisi
            $data['tahun'] = !empty($data['tanggal_masuk'])
                ? (int) date('Y', strtotime($data['tanggal_masuk']))
                : (int) date('Y');

            if (empty($data['tingkat']) && $album->tingkat) {
                $data['tingkat'] = $album->tingkat;
            }
            if (empty($data['posisi']) && $album->posisi) {
                $data['posisi'] = $album->posisi;
            }

            // Default status fisik & berkas TERSEDIA jika kosong
            $status = $data['status_fisik'] ?? $data['status_berkas'] ?? 'TERSEDIA';
            $data['status_fisik'] = $status;
            $data['status_berkas'] = $status;

            $newDokumen = new Dokumen($data);
            $newDokumen->created_by = $request->user()->id;
            $newDokumen->save();
            $newDokumen->load(['desa.kecamatan', 'rak', 'album.rak', 'createdBy']);

            LogAktivitas::create([
                'dokumen_id' => $newDokumen->id,
                'user_id'    => $request->user()->id,
                'aksi'       => 'TAMBAH_BERKAS',
                'detail'     => "TAMBAH_BERKAS: DI-302 No.{$newDokumen->nomor_di302} atas nama {$newDokumen->nama_pemohon} di Album {$newDokumen->nomor_album} (Urut #{$newDokumen->nomor_urut})",
                'created_at' => now(),
            ]);

            return $newDokumen;
        });

        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => 'Dokumen DI-302 berhasil disimpan',
        ], 201);
    }

    /**
     * Perbarui metadata berkas DI-302 yang sudah ada.
     * PUT /api/dokumen/{id}
     */
    public function update(Request $request, $id)
    {
        $dokumen = Dokumen::findOrFail($id);

        $validated = $request->validate([
            'nomor_di302'      => ['sometimes', 'required', 'string', 'regex:/^[1-9][0-9]*$/', 'max:20', Rule::unique('dokumen', 'nomor_di302')->ignore($dokumen->id)],
            'tanggal_masuk'    => ['sometimes', 'required', 'date'],
            'nama_pemohon'     => ['sometimes', 'required', 'string', 'min:3', 'max:100'],
            'jenis_permohonan' => [
                'sometimes',
                'required',
                'string',
                'in:Pengukuran Dan Pemetaan,Pengukuran Ulang Dan Pemetaan,Pemecahan Bidang,Pendaftaran Tanah Pertama Kali',
            ],
            'desa_id'          => ['sometimes', 'required', 'integer', 'exists:desa,id'],
            'kecamatan_id'     => ['nullable', 'integer', 'exists:kecamatan,id'],
            'keterangan'       => ['nullable', 'string', 'max:500'],
            'catatan'          => ['nullable', 'string', 'max:500'],
        ]);

        foreach (['nama_pemohon', 'keterangan', 'catatan'] as $textField) {
            if (array_key_exists($textField, $validated) && $validated[$textField] !== null) {
                $validated[$textField] = trim(strip_tags((string) $validated[$textField]));
            }
        }

        if (!empty($validated['tanggal_masuk'])) {
            $validated['tahun'] = (int) date('Y', strtotime($validated['tanggal_masuk']));
        }

        DB::transaction(function () use ($dokumen, $validated, $request) {
            $dokumen->update($validated);

            LogAktivitas::create([
                'dokumen_id' => $dokumen->id,
                'user_id'    => $request->user()->id,
                'aksi'       => 'EDIT_BERKAS',
                'detail'     => "EDIT_BERKAS: DI-302 No.{$dokumen->nomor_di302} diperbarui oleh {$request->user()->nama}",
                'created_at' => now(),
            ]);
        });

        $dokumen->load(['desa.kecamatan', 'rak', 'album.rak', 'createdBy']);

        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => 'Data berkas DI-302 berhasil diperbarui',
        ], 200);
    }

    /**
     * Soft delete berkas DI-302 (khusus ADMIN).
     * DELETE /api/dokumen/{id}
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()?->role !== 'ADMIN') {
            return response()->json([
                'message' => 'Forbidden: Hanya Administrator yang berhak menghapus berkas.',
            ], 403);
        }

        $dokumen = Dokumen::findOrFail($id);

        DB::transaction(function () use ($dokumen, $request) {
            LogAktivitas::create([
                'dokumen_id' => $dokumen->id,
                'user_id'    => $request->user()->id,
                'aksi'       => 'HAPUS_BERKAS',
                'detail'     => "HAPUS_BERKAS: DI-302 No.{$dokumen->nomor_di302} ({$dokumen->nama_pemohon}) dihapus sementara (soft delete)",
                'created_at' => now(),
            ]);

            $dokumen->delete();
        });

        return response()->json([
            'message' => 'Berkas DI-302 berhasil dihapus sementara (soft delete)',
        ], 200);
    }

    /**
     * Dapatkan detail lengkap dokumen beserta relasi lokasi dan riwayat log.
     * GET /api/dokumen/{id}
     */
    public function show($id)
    {
        $dokumen = Dokumen::with([
            'desa.kecamatan',
            'rak',
            'album.rak',
            'createdBy',
            'logAktivitas.user',
        ])->findOrFail($id);

        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => 'Detail dokumen berhasil diambil',
        ], 200);
    }

    /**
     * Pengecekan ketersediaan/duplikasi nomor DI-302 secara real-time.
     * GET /api/dokumen/check-di302?nomor_di302={value}
     * Juga melayani query alias nomor_gu untuk backwards compatibility
     */
    public function checkDI302(Request $request)
    {
        $nomor = trim((string) $request->query('nomor_di302', $request->query('nomor_gu', '')));

        if (empty($nomor)) {
            return response()->json([
                'data'    => ['exists' => false],
                'message' => 'Parameter nomor_di302 kosong',
            ], 200);
        }

        $exists = Dokumen::withTrashed()->where('nomor_di302', $nomor)->exists();

        return response()->json([
            'data'    => ['exists' => $exists],
            'message' => $exists ? 'Nomor DI-302 ini sudah terdaftar' : 'Nomor DI-302 tersedia',
        ], 200);
    }

    /**
     * Alias check-gu untuk kompatibilitas.
     */
    public function checkGu(Request $request)
    {
        return $this->checkDI302($request);
    }

    /**
     * Pindahkan dokumen ke Album baru (disertai pencatatan riwayat).
     * PATCH /api/dokumen/{id}/pindah-album
     */
    public function pindahAlbum(PindahAlbumRequest $request, $id)
    {
        $dokumen = Dokumen::with(['album.rak', 'rak'])->findOrFail($id);

        $rakKodeLama = $dokumen->rak?->kode ?: '-';
        $albumLama   = $dokumen->nomor_album;
        $urutLama    = $dokumen->nomor_urut;
        $albumBaru   = (int) $request->validated('nomor_album_baru');
        $rakIdReq    = $request->validated('rak_id_baru');
        $alasan      = trim(strip_tags((string) $request->validated('alasan')));

        DB::transaction(function () use ($dokumen, $rakKodeLama, $albumLama, $urutLama, $albumBaru, $rakIdReq, $alasan, $request) {
            $albumQuery = Album::with('rak')->where('nomor_album', $albumBaru);
            if ($rakIdReq) {
                $albumQuery->where('rak_id', $rakIdReq);
            }
            $targetAlbum = $albumQuery->lockForUpdate()->first();

            if (!$targetAlbum) {
                throw new HttpResponseException(response()->json([
                    'message' => 'Album tujuan tidak ditemukan pada rak yang dipilih.',
                    'errors'  => ['nomor_album_baru' => ['Album tujuan tidak ditemukan.']],
                ], 422));
            }

            $kapasitas = (int) ($targetAlbum->kapasitas ?: 30);
            $terisi = Dokumen::where('nomor_album', $albumBaru)
                ->whereNull('deleted_at')
                ->where('id', '!=', $dokumen->id)
                ->count();

            if ($terisi >= $kapasitas) {
                throw new HttpResponseException(response()->json([
                    'message' => "Album tujuan {$albumBaru} sudah penuh ({$terisi}/{$kapasitas}).",
                    'errors'  => ['nomor_album_baru' => ['Album tujuan sudah penuh.']],
                ], 422));
            }

            $usedSlots = Dokumen::withTrashed()
                ->where('nomor_album', $albumBaru)
                ->where('id', '!=', $dokumen->id)
                ->pluck('nomor_urut')
                ->map(fn ($v) => (int) $v)
                ->all();

            $urutBaru = $request->filled('nomor_urut_baru')
                ? (int) $request->input('nomor_urut_baru')
                : null;

            if ($urutBaru === null) {
                for ($slot = 1; $slot <= $kapasitas; $slot++) {
                    if (!in_array($slot, $usedSlots, true)) {
                        $urutBaru = $slot;
                        break;
                    }
                }
                if ($urutBaru === null) {
                    throw new HttpResponseException(response()->json([
                        'message' => "Tidak ada slot nomor urut kosong pada Album {$albumBaru}.",
                        'errors'  => ['nomor_album_baru' => ['Slot nomor urut pada album tujuan sudah habis.']],
                    ], 422));
                }
            } else {
                if ($urutBaru > $kapasitas) {
                    throw new HttpResponseException(response()->json([
                        'message' => "Nomor urut baru melebihi kapasitas Album {$albumBaru} ({$kapasitas}).",
                        'errors'  => ['nomor_urut_baru' => ["Nomor urut maksimal adalah {$kapasitas}."]],
                    ], 422));
                }
                if (in_array($urutBaru, $usedSlots, true)) {
                    throw new HttpResponseException(response()->json([
                        'message' => "Nomor urut #{$urutBaru} di Album {$albumBaru} sudah terpakai.",
                        'errors'  => ['nomor_urut_baru' => ["Slot nomor urut #{$urutBaru} sudah diisi berkas lain."]],
                    ], 422));
                }
            }

            $dokumen->nomor_album = $albumBaru;
            $dokumen->rak_id      = $targetAlbum->rak_id;
            $dokumen->nomor_urut  = $urutBaru;
            $dokumen->tingkat     = $request->filled('tingkat_baru') ? $request->input('tingkat_baru') : $targetAlbum->tingkat;
            if ($request->filled('posisi_baru')) {
                $dokumen->posisi = $request->input('posisi_baru');
            }
            $dokumen->save();

            $rakKodeBaru = $targetAlbum->rak?->kode ?: '-';

            LogAktivitas::create([
                'dokumen_id' => $dokumen->id,
                'user_id'    => $request->user()->id,
                'aksi'       => 'PINDAH_ALBUM',
                'detail'     => "PINDAH_ALBUM: dari Rak {$rakKodeLama} Album {$albumLama} (Urut #{$urutLama}) ke Rak {$rakKodeBaru} Album {$albumBaru} (Urut #{$urutBaru}). Alasan: {$alasan}",
                'created_at' => now(),
            ]);
        });

        $dokumen->load(['desa.kecamatan', 'rak', 'album.rak', 'createdBy']);

        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => "Dokumen berhasil dipindahkan dari Album {$albumLama} ke Album {$albumBaru}",
        ], 200);
    }

    /**
     * Alias pindah lama ke pindahAlbum.
     */
    public function pindah(Request $request, $id)
    {
        if ($request->has('nomor_album_baru')) {
            $req = app(PindahAlbumRequest::class);
            return $this->pindahAlbum($req, $id);
        }

        // Fallback jika masih mengirim boks_id_baru
        $dokumen = Dokumen::findOrFail($id);
        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => 'Silakan gunakan endpoint /pindah-album dengan nomor_album_baru',
        ], 200);
    }

    /**
     * Perbarui status fisik / berkas dokumen (TERSEDIA, DIPINJAM, RUSAK, HILANG).
     * PATCH /api/dokumen/{id}/status
     */
    public function updateStatus(UpdateStatusRequest $request, $id)
    {
        $dokumen = Dokumen::findOrFail($id);
        $statusLama = $dokumen->status_fisik ?: $dokumen->status_berkas;
        $inputStatus = $request->validated('status_fisik') ?: $request->validated('status_berkas');

        if (!$inputStatus) {
            return response()->json(['message' => 'Status fisik/berkas wajib diisi.'], 422);
        }

        $statusBaru = strtoupper($inputStatus);
        if ($statusBaru === 'SELESAI') $statusBaru = 'TERSEDIA';
        if ($statusBaru === 'PROSES') $statusBaru = 'HILANG';

        DB::transaction(function () use ($dokumen, $statusLama, $statusBaru, $request) {
            $dokumen->status_fisik = $statusBaru;
            $dokumen->status_berkas = $statusBaru;
            if ($request->filled('keterangan')) {
                $dokumen->keterangan = $request->input('keterangan');
            }
            $dokumen->save();

            LogAktivitas::create([
                'dokumen_id' => $dokumen->id,
                'user_id'    => $request->user()->id,
                'aksi'       => 'UPDATE_STATUS',
                'detail'     => "UPDATE_STATUS: dari {$statusLama} ke {$statusBaru}" . ($request->filled('keterangan') ? " ({$request->input('keterangan')})" : ''),
                'created_at' => now(),
            ]);
        });

        $dokumen->load(['desa.kecamatan', 'rak', 'album.rak', 'createdBy']);

        return response()->json([
            'data'    => new DokumenDetailResource($dokumen),
            'message' => "Status dokumen berhasil diperbarui menjadi {$statusBaru}",
        ], 200);
    }
}
