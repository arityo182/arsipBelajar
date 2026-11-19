<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LogAktivitas;
use App\Http\Requests\StoreUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Dapatkan daftar seluruh pengguna (paginasi).
     * GET /api/admin/users?page=1
     */
    public function users(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $paginated = User::select('id', 'nama', 'username', 'role', 'aktif', 'created_at', 'updated_at')
            ->orderBy('id', 'asc')
            ->paginate($perPage);

        return response()->json([
            'data'    => $paginated->items(),
            'meta'    => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
            'message' => 'Daftar pengguna berhasil diambil',
        ], 200);
    }

    /**
     * Tambah pengguna baru ke sistem SIPLOK.
     * POST /api/admin/users
     */
    public function storeUser(StoreUserRequest $request)
    {
        $user = User::create([
            'nama'     => $request->nama,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'aktif'    => true,
        ]);

        return response()->json([
            'data'    => [
                'id'         => $user->id,
                'nama'       => $user->nama,
                'username'   => $user->username,
                'role'       => $user->role,
                'aktif'      => (bool) $user->aktif,
                'created_at' => $user->created_at?->toISOString(),
            ],
            'message' => 'User berhasil ditambahkan',
        ], 201);
    }

    /**
     * Perbarui status aktif atau role pengguna (dengan proteksi self-deactivation).
     * PATCH /api/admin/users/{id}
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        // Validasi: tidak boleh menonaktifkan akun sendiri
        if ((int) $user->id === (int) $currentUser->id && $request->has('aktif') && $request->boolean('aktif') === false) {
            return response()->json([
                'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri',
                'errors'  => [
                    'aktif' => ['Akun administrator yang sedang aktif tidak dapat dinonaktifkan oleh diri sendiri.'],
                ],
            ], 422);
        }

        if ($request->has('role')) {
            $request->validate([
                'role' => 'required|string|in:ADMIN,USER',
            ]);
            $user->role = $request->role;
        }

        if ($request->has('aktif')) {
            $user->aktif = $request->boolean('aktif');
        }

        if ($request->has('nama')) {
            $request->validate([
                'nama' => 'required|string|max:100',
            ]);
            $user->nama = $request->nama;
        }

        $user->save();

        return response()->json([
            'data'    => [
                'id'         => $user->id,
                'nama'       => $user->nama,
                'username'   => $user->username,
                'role'       => $user->role,
                'aktif'      => (bool) $user->aktif,
                'updated_at' => $user->updated_at?->toISOString(),
            ],
            'message' => 'User berhasil diperbarui',
        ], 200);
    }

    /**
     * Reset password pengguna secara acak dan tampilkan password plaintext sekali saja.
     * POST /api/admin/users/{id}/reset-password
     */
    public function resetPassword($id)
    {
        $user = User::findOrFail($id);

        // Generate password baru acak 8 karakter (kombinasi huruf & angka)
        $newPlainPassword = Str::password(8, letters: true, numbers: true, symbols: false, spaces: false);

        $user->password = Hash::make($newPlainPassword);
        $user->save();

        return response()->json([
            'data'    => [
                'password_baru' => $newPlainPassword,
            ],
            'message' => 'Password berhasil direset',
        ], 200);
    }

    /**
     * Dapatkan daftar log aktivitas mutasi seluruh dokumen pertanahan.
     * GET /api/admin/logs?page=1&search=
     */
    public function logs(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $search  = trim((string) $request->query('search', ''));

        $query = LogAktivitas::with(['user:id,nama,username,role', 'dokumen:id,nomor_gu,nama_pemilik,nib']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('dokumen', function ($docQ) use ($search) {
                    $docQ->where('nomor_gu', 'ILIKE', "%{$search}%");
                })->orWhereHas('user', function ($userQ) use ($search) {
                    $userQ->where('nama', 'ILIKE', "%{$search}%")
                          ->orWhere('username', 'ILIKE', "%{$search}%");
                })->orWhere('aksi', 'ILIKE', "%{$search}%")
                  ->orWhere('detail', 'ILIKE', "%{$search}%");
            });
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $items = collect($paginated->items())->map(function ($log) {
            return [
                'id'         => $log->id,
                'aksi'       => $log->aksi,
                'detail'     => $log->detail,
                'created_at' => $log->created_at?->toISOString(),
                'user'       => $log->user ? [
                    'id'       => $log->user->id,
                    'nama'     => $log->user->nama,
                    'username' => $log->user->username,
                    'role'     => $log->user->role,
                ] : null,
                'dokumen'    => $log->dokumen ? [
                    'id'           => $log->dokumen->id,
                    'nomor_gu'     => $log->dokumen->nomor_gu,
                    'nib'          => $log->dokumen->nib,
                    'nama_pemilik' => $log->dokumen->nama_pemilik,
                ] : null,
            ];
        });

        return response()->json([
            'data'    => $items,
            'meta'    => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
            'message' => 'Daftar log aktivitas berhasil diambil',
        ], 200);
    }
}
