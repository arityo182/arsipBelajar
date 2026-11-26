'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  SearchX,
  Phone,
  Info,
  MapPin,
  Mail,
  FileText,
  LogIn,
  RotateCcw,
} from 'lucide-react';
import { usePublikCek } from '@/hooks/usePublikCek';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatTanggal, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function CekDokumenPage() {
  const [activeTab, setActiveTab] = useState<'di302' | 'nama'>('di302');
  const [inputValue, setInputValue] = useState('');
  const { hasil, isLoading, error, catatan, sudahDicari, cari, reset } = usePublikCek();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (activeTab === 'di302') {
      cari({ nomor_di302: inputValue.trim() });
    } else {
      cari({ nama_pemohon: inputValue.trim() });
    }
  };

  const handleTabChange = (tab: 'di302' | 'nama') => {
    setActiveTab(tab);
    setInputValue('');
    reset();
  };

  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-sans">
      {/* 1. NAVBAR PUBLIK */}
      <header className="bg-primary-dark text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo ATR/BPN */}
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-extrabold text-[11px] text-white tracking-tighter border border-white/20 shadow-inner">
              ATR
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-wider">
                SIPLOK
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-white/70 font-sans border-l border-white/20 pl-2">
                Kantah Banyumas
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/cek-dokumen"
              className="px-3.5 py-1.5 rounded-lg border border-accent text-accent font-semibold text-xs sm:text-sm transition-colors duration-150 bg-accent/10"
            >
              Cek Dokumen
            </Link>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-dark text-primary-dark font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors duration-150 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk ke Sistem</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#002147] to-[#003580] text-white py-12 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Cek Status Berkas DI-302
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            Layanan resmi pengecekan mandiri permohonan pengukuran & pemetaan bidang tanah Kantor Pertanahan Kabupaten Banyumas
          </p>
        </div>
      </section>

      {/* 3. FORM PENCARIAN PUBLIK */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-border-color p-6 md:p-8">
          {/* Tab Selector */}
          <div className="flex border-b border-border-color mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('di302')}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'di302'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-main'
              }`}
            >
              <FileText className="w-4 h-4" />
              Nomor DI-302 / GU
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('nama')}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'nama'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-main'
              }`}
            >
              <Search className="w-4 h-4" />
              Nama Pemohon
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-main mb-1.5">
                {activeTab === 'di302'
                  ? 'Masukkan Nomor Register DI-302 (Nomor GU)'
                  : 'Masukkan Nama Pemohon'}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    activeTab === 'di302'
                      ? 'Contoh: 1430, 2299, 589 (hanya angka murni)'
                      : 'Contoh: Nachrowi Socheh (minimal 5 huruf)'
                  }
                  className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50/70 border border-border-color rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main placeholder:text-text-secondary/70 font-sans"
                />
                <Search className="w-5 h-5 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
              </div>

              {/* Helper Text Edukatif */}
              <p className="text-[11px] text-text-secondary mt-1.5 flex items-start gap-1">
                <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  {activeTab === 'di302'
                    ? 'Nomor DI-302 adalah nomor register permohonan pengukuran yang tertera pada tanda terima berkas Anda (identik dengan Nomor Gambar Ukur / GU). Masukkan hanya angka murni tanpa tanda strip.'
                    : 'Ketik nama lengkap pemohon permohonan pengukuran sesuai KTP yang didaftarkan ke loket pertanahan.'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="flex-1 py-3 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4" />
                    Mencari Berkas...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Cek Status Sekarang
                  </>
                )}
              </button>

              {sudahDicari && (
                <button
                  type="button"
                  onClick={() => {
                    setInputValue('');
                    reset();
                  }}
                  className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-text-main font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* HASIL PENCARIAN PUBLIK */}
          {sudahDicari && !isLoading && (
            <div className="mt-8 pt-6 border-t border-border-color space-y-4">
              <h2 className="text-sm font-bold text-primary-dark flex items-center justify-between">
                <span>Hasil Pencarian Berkas</span>
                <span className="text-xs font-normal text-text-secondary">
                  Ditemukan {hasil.length} berkas
                </span>
              </h2>

              {hasil.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <SearchX className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="font-bold text-text-main text-sm">Berkas Tidak Ditemukan</p>
                  <p className="text-xs text-text-secondary max-w-md mx-auto">
                    Pastikan nomor register DI-302 atau nama pemohon sudah benar. Jika berkas baru diajukan, beri waktu sistem memproses pencatatan.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hasil.map((item, idx) => {
                    const isSelesai = item.status_berkas === 'TERSEDIA' || item.status_berkas === 'SELESAI';
                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-xl border-2 transition-all ${
                          isSelesai
                            ? 'border-green-300 bg-green-50/40'
                            : 'border-yellow-300 bg-yellow-50/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                              No. Register DI-302 (Gambar Ukur)
                            </span>
                            <span className="text-xl font-black font-mono text-primary">
                              {item.nomor_di302 || item.nomor_gu}
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              item.status_berkas
                            )}`}
                          >
                            {isSelesai ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-yellow-700" />
                            )}
                            {item.status_label || getStatusLabel(item.status_berkas)}
                          </span>
                        </div>

                        {/* Grid Data Publik (Tanpa Lokasi Fisik Demi Privasi) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs border-t border-border-color/60 pt-3">
                          <div>
                            <span className="text-[10px] text-text-secondary block">Nama Pemohon:</span>
                            <span className="font-bold text-text-main tracking-wider">
                              {item.nama_pemohon}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-text-secondary block">Tanggal Permohonan:</span>
                            <span className="font-semibold text-text-main">
                              {formatTanggal(item.tanggal_masuk)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-text-secondary block">Jenis Permohonan:</span>
                            <span className="font-semibold text-text-main">
                              {item.jenis_permohonan || item.jenis_dokumen || '-'}
                            </span>
                          </div>

                          <div className="sm:col-span-2">
                            <span className="text-[10px] text-text-secondary block">Lokasi Bidang Tanah:</span>
                            <span className="font-semibold text-text-main">
                              Desa {item.desa}, Kec. {item.kecamatan}, Kab. Banyumas
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Catatan Bantuan Loket */}
              {catatan && (
                <div className="p-4 bg-gray-50 border border-border-color rounded-xl text-xs text-text-secondary">
                  <p className="font-semibold text-text-main mb-1">Informasi Lebih Lanjut:</p>
                  <p>{catatan}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 4. FOOTER RESMI */}
      <footer className="bg-primary-dark text-white/80 py-8 px-4 text-xs border-t border-accent/30 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-white">Kantor Pertanahan Kabupaten Banyumas</p>
            <p className="text-[11px] text-white/60">Jl. Prof. Dr. Suharso No. 45, Purwokerto, Jawa Tengah</p>
          </div>
          <div className="text-[11px] text-white/60">
            SIPLOK © {new Date().getFullYear()} — Kementerian Agraria dan Tata Ruang / Badan Pertanahan Nasional
          </div>
        </div>
      </footer>
    </div>
  );
}
