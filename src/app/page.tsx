'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Database,
  MapPin,
  Shield,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Landmark,
  CheckCircle,
  ExternalLink,
  FileText,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-sans">
      {/* 1. NAVBAR */}
      <nav className="h-16 bg-primary-dark text-white px-4 sm:px-8 flex items-center justify-between border-b border-accent/30 shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Logo Brand ATR/BPN */}
          <div className="w-10 h-10 rounded-full bg-primary border-2 border-accent flex items-center justify-center shadow-md">
            <span className="text-[10px] font-black tracking-tight text-white font-sans">
              ATR<span className="text-accent">|</span>BPN
            </span>
          </div>

          <div>
            <div className="text-base font-extrabold tracking-wider font-sans leading-tight">
              SIPLOK
            </div>
            <div className="text-[10px] text-gray-300 font-medium">Kantah Kab. Banyumas</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/cek-dokumen"
            className="px-3.5 py-2 rounded-lg border border-accent/60 text-accent hover:border-accent hover:bg-accent/10 font-bold text-xs shadow-sm transition-all"
          >
            Cek Dokumen
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-dark text-primary-dark font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#002147] via-[#002c5f] to-[#003580] text-white py-16 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          {/* Lambang Garuda Pancasila */}
          <div className="w-20 h-20 mb-6 flex items-center justify-center p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            {/* Fallback Icon Simbol Garuda / Kenegaraan */}
            <Landmark className="w-12 h-12 text-accent" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-sans tracking-tight mb-3">
            SIPLOK
          </h1>

          <p className="text-lg sm:text-xl text-white/90 font-medium max-w-2xl mb-2">
            Sistem Informasi Pelacakan Lokasi Dokumen Fisik Pertanahan
          </p>

          <div className="text-xs sm:text-sm text-accent font-bold tracking-wide uppercase font-sans mb-8">
            Kantor Pertanahan Kabupaten Banyumas • Kementerian ATR/BPN
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-accent hover:bg-accent-dark text-primary-dark font-extrabold text-sm sm:text-base shadow-xl hover:scale-105 transition-all duration-200"
          >
            <span>Masuk ke Sistem SIPLOK</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Ornamen Latar Belakang */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-accent/5 filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary-light/20 filter blur-3xl pointer-events-none" />
      </section>

      {/* SECTION: CEK DOKUMEN CEPAT (LAYANAN PUBLIK) */}
      <section className="bg-[#F0F4F8] py-16 px-4 sm:px-8 border-b border-border-color">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* KOLOM KIRI: Keterangan & CTA */}
          <div className="space-y-6">
            <div className="inline-block bg-accent/20 text-primary-dark px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              Layanan Publik
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-dark leading-tight font-sans">
              Cek Status Dokumen<br />Pertanahan Anda
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Masyarakat dapat mengecek status dokumen pertanahan secara mandiri tanpa perlu datang ke kantor.
            </p>

            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-medium">Cepat — hasil dalam hitungan detik</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-medium">Cukup masukkan Nomor GU atau NIB</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-medium">Tersedia 24 jam, tidak perlu login</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-medium">Tanpa registrasi, langsung bisa digunakan</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/cek-dokumen')}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <span>Cek Dokumen Saya</span>
                <ExternalLink className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: Ilustrasi Dokumen Pertanahan Resmi */}
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-xl opacity-60 pointer-events-none" />

            <div className="relative bg-white shadow-xl rounded-2xl p-6 sm:p-7 border border-border-color space-y-5">
              {/* Header Kartu Ilustrasi */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-text-main">
                      Arsip Warkah & Dokumen
                    </h3>
                    <p className="text-[11px] text-text-secondary">
                      Kantah Kabupaten Banyumas
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-600" /> Resmi BPN
                </span>
              </div>

              {/* Grafis Ilustrasi Lembar Dokumen Pertanahan */}
              <div className="bg-gradient-to-br from-amber-50/40 via-white to-slate-50 rounded-xl p-5 border border-amber-200/60 shadow-inner relative overflow-hidden space-y-3.5">
                {/* Watermark Logo */}
                <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-primary/5 rounded-full flex items-center justify-center pointer-events-none">
                  <Landmark className="w-16 h-16 text-primary/10" />
                </div>

                {/* Header Dokumen Simbolik */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    BPN
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="h-2 w-32 bg-gray-300 rounded-full" />
                    <div className="h-1.5 w-20 bg-gray-200 rounded-full" />
                  </div>
                </div>

                {/* Garis-garis Simbol Dokumen (Bukan Data Nyata) */}
                <div className="space-y-2 py-1">
                  <div className="h-2 w-full bg-gray-200/80 rounded-full" />
                  <div className="h-2 w-4/5 bg-gray-200/70 rounded-full" />
                  <div className="h-2 w-2/3 bg-gray-200/60 rounded-full" />
                </div>

                {/* Kategori Dokumen yang Dikelola */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-gray-100 flex items-center gap-1.5 text-gray-700">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span>Gambar Ukur (GU)</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-gray-100 flex items-center gap-1.5 text-gray-700">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span>Surat Ukur (SU)</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-gray-100 flex items-center gap-1.5 text-gray-700">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span>Warkah Tanah</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-gray-100 flex items-center gap-1.5 text-gray-700">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span>Sertipikat Hak</span>
                  </div>
                </div>
              </div>

              {/* Panduan Ramah untuk Pengguna Awam */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Masukkan nomor <strong>GU</strong> atau <strong>NIB</strong> pada formulir pencarian untuk mengetahui ketersediaan fisik dokumen Anda di kantor pertanahan secara real-time.
                </p>
              </div>

              {/* Tombol Akses Pencarian */}
              <button
                type="button"
                onClick={() => router.push('/cek-dokumen')}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Buka Formulir Pencarian Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FITUR UTAMA SECTION */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-primary border-border-color hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-base font-bold text-text-main font-sans mb-2">Digitalisasi Arsip</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Kelola puluhan ribu dokumen pertanahan (GU, NIB, Sertipikat, Warkah) secara digital dan terstruktur tanpa tercecer.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-primary border-border-color hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-base font-bold text-text-main font-sans mb-2">Lacak Lokasi Fisik</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Temukan posisi fisik arsip secara presisi hingga tingkat Ruang, Rak, Shaf, dan Nomor Boks dalam hitungan detik.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-primary border-border-color hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-base font-bold text-text-main font-sans mb-2">Aman & Teraudit</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Dilengkapi log aktivitas mutasi real-time, pencatatan peminjaman, serta otorisasi berjenjang berbasis peran pengguna.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INFORMASI KANTOR PERTANAHAN BANYUMAS */}
      <section className="bg-primary-dark text-white py-12 px-4 sm:px-8 mt-auto border-t border-accent/20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm">
          {/* Kolom Kiri: Kontak & Alamat */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-accent font-sans uppercase tracking-wider mb-2">
              Kantor Pertanahan Kabupaten Banyumas
            </h4>
            <p className="text-white/80 leading-relaxed flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Jl. Jend. Soedirman No.467, Purwokerto, Kabupaten Banyumas, Jawa Tengah 53116</span>
            </p>
            <p className="text-white/80 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-accent flex-shrink-0" />
              <span>(0281) 635151 / Fax: (0281) 635152</span>
            </p>
            <p className="text-white/80 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-accent flex-shrink-0" />
              <span>kantah.banyumas@atrbpn.go.id</span>
            </p>
          </div>

          {/* Kolom Kanan: Jam Pelayanan Dinas */}
          <div className="space-y-3 md:pl-8 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0">
            <h4 className="text-base font-bold text-accent font-sans uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span>Jam Layanan Kantor</span>
            </h4>
            <div className="space-y-1.5 text-white/80">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Senin – Kamis :</span>
                <span className="font-semibold text-white">07.30 – 16.00 WIB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Jumat :</span>
                <span className="font-semibold text-white">07.30 – 16.30 WIB</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Sabtu – Minggu :</span>
                <span className="text-red-400 font-semibold">Tutup (Libur Akhir Pekan)</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-white/60 italic font-sans">
              Motto: &ldquo;Melayani, Profesional, Terpercaya&rdquo;
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER RESMI */}
      <footer className="bg-[#001a35] text-white/60 py-4 px-4 text-center text-xs border-t border-white/5 font-sans">
        <p className="m-0">
          © 2024 Kantor Pertanahan Kabupaten Banyumas — Kementerian Agraria dan Tata Ruang / Badan Pertanahan Nasional.
        </p>
        <p className="m-0 mt-1 text-[11px] text-white/40">
          SIPLOK Versi 1.0.0 • Sistem Khusus Operasional Internal
        </p>
      </footer>
    </div>
  );
}
