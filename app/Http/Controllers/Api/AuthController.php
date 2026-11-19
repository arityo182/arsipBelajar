<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Otentikasi pengguna dan terbitkan token JWT.
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $credentials = $request->only('username', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'message' => 'Username atau password salah',
                ], 401);
            }

            /** @var \App\Models\User $user */
            $user = auth()->user();

            if (!$user->aktif) {
                JWTAuth::invalidate($token);
                return response()->json([
                    'message' => 'Akun dinonaktifkan, hubungi administrator',
                ], 401);
            }

            return response()->json([
                'data' => [
                    'token' => $token,
                    'user'  => [
                        'id'   => $user->id,
                        'nama' => $user->nama,
                        'role' => $user->role,
                    ],
                ],
                'message' => 'Login berhasil',
            ], 200);

        } catch (JWTException $e) {
            return response()->json([
                'message' => 'Tidak dapat membuat token autentikasi',
            ], 500);
        }
    }

    /**
     * Cabut (invalidate) token JWT aktif.
     * POST /api/auth/logout
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json([
                'message' => 'Logout berhasil',
            ], 200);
        } catch (JWTException $e) {
            return response()->json([
                'message' => 'Gagal melakukan logout, token tidak valid',
            ], 500);
        }
    }

    /**
     * Dapatkan data profil lengkap pengguna yang sedang login.
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id'         => $user->id,
                'nama'       => $user->nama,
                'username'   => $user->username,
                'role'       => $user->role,
                'aktif'      => (bool) $user->aktif,
                'created_at' => $user->created_at?->toISOString(),
                'updated_at' => $user->updated_at?->toISOString(),
            ],
            'message' => 'Data user berhasil diambil',
        ], 200);
    }
}
