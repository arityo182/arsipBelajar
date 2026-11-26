<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DokumenController;
use App\Http\Controllers\Api\LokasiController;
use App\Http\Controllers\Api\WilayahController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\PublikController;
use App\Http\Controllers\Api\LokasiAdminController;
use App\Http\Controllers\Api\StatistikController;

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
Route::get('/publik/cek', [PublikController::class, 'cekDokumen'])->middleware('throttle:publik');

// ================================================================
// 1. AUTHENTICATION (Publik & Terotentikasi)
// ================================================================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::middleware('auth.jwt')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// ================================================================
// 2. DOKUMEN PERTANAHAN DI-302 (Middleware: auth.jwt)
// ================================================================
Route::middleware('auth.jwt')->prefix('dokumen')->group(function () {
    Route::get('/', [DokumenController::class, 'index']);
    Route::post('/', [DokumenController::class, 'store']);

    // Pengecekan real-time nomor DI-302 & alias check-gu
    Route::get('/check-di302', [DokumenController::class, 'checkDI302']);
    Route::get('/check-gu', [DokumenController::class, 'checkGu']);

    Route::get('/{id}', [DokumenController::class, 'show']);
    Route::put('/{id}', [DokumenController::class, 'update']);
    Route::delete('/{id}', [DokumenController::class, 'destroy'])->middleware('role:ADMIN');
    Route::patch('/{id}/pindah-album', [DokumenController::class, 'pindahAlbum']);
    Route::patch('/{id}/pindah', [DokumenController::class, 'pindah']); // alias
    Route::patch('/{id}/status', [DokumenController::class, 'updateStatus']);
});

// ================================================================
// 3. STATISTIK & REKAPITULASI DI-302 (Middleware: auth.jwt)
// ================================================================
Route::middleware('auth.jwt')->prefix('statistik')->group(function () {
    Route::get('/ringkasan', [StatistikController::class, 'ringkasan']);
    Route::get('/album', [StatistikController::class, 'perAlbum']);
    Route::get('/jenis-permohonan', [StatistikController::class, 'perJenisPermohonan']);
    Route::get('/kecamatan', [StatistikController::class, 'perKecamatan']);
});

// ================================================================
// 4. LOKASI FISIK ARSIP (Middleware: auth.jwt)
// ================================================================
Route::middleware('auth.jwt')->prefix('lokasi')->group(function () {
    Route::get('/ruang', [LokasiController::class, 'ruang']);
    Route::get('/rak', [LokasiController::class, 'rak']);
    Route::get('/tingkat', [LokasiController::class, 'tingkat']);
    Route::get('/album', [LokasiController::class, 'album']);
    Route::get('/shaf', [LokasiController::class, 'shaf']);
    Route::get('/boks', [LokasiController::class, 'boks']);
});

// ================================================================
// 5. WILAYAH ADMINISTRATIF BANYUMAS (Middleware: auth.jwt)
// ================================================================
Route::middleware('auth.jwt')->prefix('wilayah')->group(function () {
    Route::get('/kecamatan', [WilayahController::class, 'kecamatan']);
    Route::get('/desa', [WilayahController::class, 'desa']);
});

// ================================================================
// 6. ADMINISTRATOR SIPLOK (Middleware: auth.jwt + role:ADMIN)
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

        // Tingkat / Shaf
        Route::get('/tingkat', [LokasiAdminController::class, 'indexShaf']);
        Route::post('/tingkat', [LokasiAdminController::class, 'storeShaf']);
        Route::put('/tingkat/{id}', [LokasiAdminController::class, 'updateShaf']);
        Route::delete('/tingkat/{id}', [LokasiAdminController::class, 'destroyShaf']);

        // Shaf (alias)
        Route::get('/shaf', [LokasiAdminController::class, 'indexShaf']);
        Route::post('/shaf', [LokasiAdminController::class, 'storeShaf']);
        Route::put('/shaf/{id}', [LokasiAdminController::class, 'updateShaf']);
        Route::delete('/shaf/{id}', [LokasiAdminController::class, 'destroyShaf']);

        // Boks
        Route::get('/boks', [LokasiAdminController::class, 'indexBoks']);
        Route::post('/boks', [LokasiAdminController::class, 'storeBoks']);
        Route::put('/boks/{id}', [LokasiAdminController::class, 'updateBoks']);
        Route::delete('/boks/{id}', [LokasiAdminController::class, 'destroyBoks']);

        // Album (DI-302)
        Route::get('/album', [LokasiAdminController::class, 'indexAlbum']);
        Route::post('/album', [LokasiAdminController::class, 'storeAlbum']);
        Route::put('/album/{id}', [LokasiAdminController::class, 'updateAlbum']);
        Route::delete('/album/{id}', [LokasiAdminController::class, 'destroyAlbum']);
    });
});
