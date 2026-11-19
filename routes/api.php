<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DokumenController;
use App\Http\Controllers\Api\LokasiController;
use App\Http\Controllers\Api\WilayahController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\PublikController;
use App\Http\Controllers\Api\LokasiAdminController;

/*
|--------------------------------------------------------------------------
| API Routes — SIPLOK ATR/BPN Kab. Banyumas
|--------------------------------------------------------------------------
|
| Seluruh endpoint terdaftar dengan prefix otomatis /api
| Format response standar: { "data": ..., "message": "..." }
|
*/

// ================================================================
// 0. LAYANAN PUBLIK (Tanpa Autentikasi — Rate Limited)
// ================================================================
Route::get('/publik/cek', [PublikController::class, 'cekDokumen']);

// ================================================================
// 1. AUTHENTICATION (Publik & Terotentikasi)
// ================================================================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth.jwt')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// ================================================================
// 2. DOKUMEN PERTANAHAN (Middleware: auth.jwt)
// ================================================================
Route::middleware('auth.jwt')->prefix('dokumen')->group(function () {
    Route::get('/', [DokumenController::class, 'index']);
    Route::post('/', [DokumenController::class, 'store']);

    // Pengecekan real-time nomor GU sebelum show/{id}
    Route::get('/check-gu', [DokumenController::class, 'checkGu']);

    Route::get('/{id}', [DokumenController::class, 'show']);
    Route::patch('/{id}/pindah', [DokumenController::class, 'pindah']);
    Route::patch('/{id}/status', [DokumenController::class, 'updateStatus']);
});

// ================================================================
// 3. LOKASI FISIK ARSIP (Middleware: auth.jwt)
// ================================================================
Route::middleware('auth.jwt')->prefix('lokasi')->group(function () {
    Route::get('/ruang', [LokasiController::class, 'ruang']);
    Route::get('/rak', [LokasiController::class, 'rak']);
    Route::get('/shaf', [LokasiController::class, 'shaf']);
    Route::get('/boks', [LokasiController::class, 'boks']);
});

// ================================================================
// 4. WILAYAH ADMINISTRATIF BANYUMAS (Middleware: auth.jwt)
// ================================================================
Route::middleware('auth.jwt')->prefix('wilayah')->group(function () {
    Route::get('/kecamatan', [WilayahController::class, 'kecamatan']);
    Route::get('/desa', [WilayahController::class, 'desa']);
});

// ================================================================
// 5. ADMINISTRATOR SIPLOK (Middleware: auth.jwt + role:ADMIN)
// ================================================================
Route::middleware(['auth.jwt', 'role:ADMIN'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'users']);
    Route::post('/users', [AdminController::class, 'storeUser']);
    Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
    Route::post('/users/{id}/reset-password', [AdminController::class, 'resetPassword']);
    Route::get('/logs', [AdminController::class, 'logs']);

    // CRUD Master Lokasi Fisik
    Route::prefix('lokasi')->group(function () {
        // Ruang
        Route::get('/ruang', [LokasiAdminController::class, 'indexRuang']);
        Route::post('/ruang', [LokasiAdminController::class, 'storeRuang']);
        Route::put('/ruang/{id}', [LokasiAdminController::class, 'updateRuang']);
        Route::delete('/ruang/{id}', [LokasiAdminController::class, 'destroyRuang']);

        // Rak
        Route::get('/rak', [LokasiAdminController::class, 'indexRak']);
        Route::post('/rak', [LokasiAdminController::class, 'storeRak']);
        Route::put('/rak/{id}', [LokasiAdminController::class, 'updateRak']);
        Route::delete('/rak/{id}', [LokasiAdminController::class, 'destroyRak']);

        // Shaf
        Route::get('/shaf', [LokasiAdminController::class, 'indexShaf']);
        Route::post('/shaf', [LokasiAdminController::class, 'storeShaf']);
        Route::put('/shaf/{id}', [LokasiAdminController::class, 'updateShaf']);
        Route::delete('/shaf/{id}', [LokasiAdminController::class, 'destroyShaf']);

        // Boks
        Route::get('/boks', [LokasiAdminController::class, 'indexBoks']);
        Route::post('/boks', [LokasiAdminController::class, 'storeBoks']);
        Route::put('/boks/{id}', [LokasiAdminController::class, 'updateBoks']);
        Route::delete('/boks/{id}', [LokasiAdminController::class, 'destroyBoks']);
    });
});
