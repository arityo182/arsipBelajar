<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], 401);
            }

            if (!$user->aktif) {
                return response()->json([
                    'message' => 'Akun Anda dinonaktifkan. Silakan hubungi Administrator.',
                ], 401);
            }

            // Injeksi user ke dalam request
            $request->setUserResolver(fn () => $user);

        } catch (TokenExpiredException $e) {
            return response()->json([
                'message' => 'Token telah kedaluwarsa, silakan login kembali',
            ], 401);
        } catch (TokenInvalidException $e) {
            return response()->json([
                'message' => 'Token tidak valid',
            ], 401);
        } catch (JWTException $e) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        return $next($request);
    }
}
