// ================================================================
// middleware.ts
// SIPLOK — Next.js Edge Runtime Route Protection Middleware
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Cookie 'siplok_token' dan 'siplok_role' di-set
// dari authStore saat login menggunakan js-cookie.
// Middleware ini membaca cookie tersebut untuk proteksi route.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('siplok_token')?.value;
  const role = request.cookies.get('siplok_role')?.value;

  // 0. Rute Publik Tanpa Autentikasi (Landing Page & Cek Dokumen Publik)
  if (pathname === '/' || pathname === '/cek-dokumen') {
    return NextResponse.next();
  }

  // 1. Rute Halaman Login
  if (pathname === '/login') {
    if (token) {
      // Jika pengguna sudah terotentikasi, alihkan langsung ke dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Rute Terproteksi Pengguna Umum (/dashboard, /dokumen)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/dokumen')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Rute Khusus Administrator (/admin)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'ADMIN') {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
