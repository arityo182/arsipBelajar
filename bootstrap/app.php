<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Illuminate\Auth\AuthenticationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Percayai header X-Forwarded-* dari reverse proxy (Nginx/VPS) untuk deteksi IP akurat
        $middleware->trustProxies(at: '*');

        // Daftarkan alias middleware untuk keamanan otentikasi & hak akses role
        $middleware->alias([
            'auth.jwt' => \App\Http\Middleware\JwtMiddleware::class,
            'role'     => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->booted(function () {
        // Rate limiting login (brute-force protection: maks 5 percobaan per menit per username+IP)
        RateLimiter::for('login', function (Request $request) {
            $username = strtolower(trim((string) $request->input('username', '')));
            return Limit::perMinute(5)->by($username.'|'.$request->ip());
        });

        // Rate limiting endpoint cek publik (anti-scraping: maks 15 permintaan per menit per IP)
        RateLimiter::for('publik', function (Request $request) {
            return Limit::perMinute(15)->by($request->ip());
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Tangani Model Not Found atau 404 Route
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return response()->json([
                    'message' => 'Data atau rute yang Anda cari tidak ditemukan',
                ], 404);
            }
        });

        // Tangani Method Not Allowed
        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return response()->json([
                    'message' => 'Metode HTTP tidak diizinkan untuk endpoint ini',
                ], 405);
            }
        });

        // Tangani Rate Limit Exceeded (429)
        $exceptions->render(function (TooManyRequestsHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return response()->json([
                    'message' => 'Terlalu banyak permintaan. Silakan tunggu 1 menit sebelum mencoba lagi.',
                ], 429);
            }
        });

        // Tangani Unauthenticated default
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], 401);
            }
        });

        // Sembunyikan detail QueryException SQL pada mode non-debug
        $exceptions->render(function (QueryException $e, Request $request) {
            if (($request->is('api/*') || $request->wantsJson()) && !config('app.debug')) {
                return response()->json([
                    'message' => 'Terjadi kesalahan pemrosesan data di server.',
                ], 500);
            }
        });
    })->create();
