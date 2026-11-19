'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  SearchX,
  XCircle,
  Phone,
  Info,
  MapPin,
  Mail,
  FileText,
  LogIn,
} from 'lucide-react';
import { usePublikCek } from '@/hooks/usePublikCek';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CekDokumenPage() {
  const [activeTab, setActiveTab] = useState<'gu' | 'nib'>('gu');
  const [inputValue, setInputValue] = useState('');
  const { hasil, isLoading, error, catatan, sudahDicari, cari, reset } = usePublikCek();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (activeTab === 'gu') {
      cari({ nomor_gu: inputValue.trim() });
    } else {
      cari({ nib: inputValue.trim() });
    }
  };

  const handleTabChange = (tab: 'gu' | 'nib') => {
    setActiveTab(tab);
    setInputValue('');
    reset();
  };

  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-body">
      {/* 1. NAVBAR PUBLIK */}
      <header className="bg-primary-dark text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo ATR/BPN */}
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-heading font-extrabold text-[11px] text-white tracking-tighter border border-white/20 shadow-inner">
              ATR
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-white tracking-wider">
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
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Garuda_Pancasila%2C_Coat_Arms_of_Indonesia.svg/80px-Garuda_Pancasila%2C_Coat_Arms_of_Indonesia.svg.png"
            alt="Lambang Garuda Pancasila"
            width={50}
            height={50}
            className="mb-4 drop-shadow-md"
          />
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            Cek Status Dokumen Pertanahan
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            Layanan resmi pengecekan mandiri arsip dokumen Kantor Pertanahan Kabupaten Banyumas
          </p>
        </div>
      </section>

      {/* 3. FORM PENCARIAN & KONTEN */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pb-16">
        {/* Card Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-border-color p-6 sm:p-8 -mt-6 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-lg sm:text-xl text-text-main">
              Pencarian Dokumen Pertanahan
            </h2>
          </div>

          {/* Tab Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('gu')}
              className={`py-2.5 px-4 rounded-lg font-heading font-semibold text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'gu'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cari via Nomor GU
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('nib')}
              className={`py-2.5 px-4 rounded-lg font-heading font-semibold text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'nib'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cari via NIB
            </button>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                {activeTab === 'gu' ? 'Nomor Gambar Ukur (GU)' : 'Nomor Identifikasi Bidang (NIB)'}
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  activeTab === 'gu'
                    ? 'Contoh: GU-0101/2021'
                    : 'Contoh: 33020101001'
                }
                className="w-full h-14 px-4 text-base sm:text-lg rounded-xl border border-border-color focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 font-mono"
              />
              <p className="mt-2 text-xs text-text-secondary">
                {activeTab === 'gu'
                  ? 'Nomor GU tertera pada berkas dokumen permohonan Anda'
                  : 'NIB terdiri dari 11-14 digit angka wilayah pertanahan'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-full h-13 py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-light text-white font-heading font-semibold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" />
                  <span>Mencari Dokumen...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Cari Dokumen</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 4. HASIL PENCARIAN */}
        <div className="mt-8">
          {/* State Loading: 3 Skeleton Cards */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl border border-border-color p-5 shadow-sm space-y-3 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-40 bg-gray-200 rounded" />
                    <div className="h-6 w-24 bg-gray-200 rounded-full" />
                  </div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded" />
                  </div>
                  <div className="h-14 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* State DITEMUKAN */}
          {!isLoading && sudahDicari && hasil.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary font-heading font-bold text-base sm:text-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>{hasil.length} Dokumen Ditemukan</span>
              </div>

              {hasil.map((dok, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-border-color border-l-4 border-l-primary rounded-xl p-5 sm:p-6 shadow-md space-y-4"
                >
                  {/* Row Atas */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-mono text-lg sm:text-xl font-bold text-primary">
                        {dok.nomor_gu}
                      </span>
                    </div>

                    {/* Badge Status */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        dok.status_fisik === 'TERSEDIA'
                          ? 'bg-green-100 text-green-800'
                          : dok.status_fisik === 'DIPINJAM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : dok.status_fisik === 'RUSAK'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {dok.status_label}
                    </span>
                  </div>

                  <hr className="border-border-color" />

                  {/* Grid 2 Kolom Informasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-text-secondary">NIB:</span>{' '}
                      <span className="font-mono font-semibold text-text-main">
                        {dok.nib}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Jenis Dokumen:</span>{' '}
                      <span className="font-semibold text-text-main">
                        {dok.jenis_dokumen}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Tahun:</span>{' '}
                      <span className="font-semibold text-text-main">
                        {dok.tahun}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Wilayah:</span>{' '}
                      <span className="font-semibold text-text-main">
                        Desa {dok.desa}, Kec. {dok.kecamatan}, Kab. {dok.kabupaten}
                      </span>
                    </div>
                  </div>

                  {/* STATUS BOX TEMATIK */}
                  <div className="mt-3">
                    {dok.status_fisik === 'TERSEDIA' && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-heading font-bold text-sm text-green-900">
                            Tersedia di Kantor
                          </h4>
                          <p className="text-xs text-green-700 mt-0.5">
                            Dokumen fisik tersimpan aman di ruang arsip dan dapat diproses petugas loket.
                          </p>
                        </div>
                      </div>
                    )}

                    {dok.status_fisik === 'DIPINJAM' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                        <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-heading font-bold text-sm text-yellow-900">
                            Sedang Dalam Proses
                          </h4>
                          <p className="text-xs text-yellow-700 mt-0.5">
                            Dokumen sedang dalam proses pelayanan teknis/survei. Hubungi petugas untuk informasi lebih lanjut.
                          </p>
                        </div>
                      </div>
                    )}

                    {dok.status_fisik === 'RUSAK' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-heading font-bold text-sm text-orange-900">
                            Dalam Perbaikan
                          </h4>
                          <p className="text-xs text-orange-700 mt-0.5">
                            Dokumen fisik sedang dalam proses konservasi atau restorasi arsip pertanahan.
                          </p>
                        </div>
                      </div>
                    )}

                    {dok.status_fisik === 'HILANG' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-heading font-bold text-sm text-red-900">
                            Hubungi Petugas
                          </h4>
                          <p className="text-xs text-red-700 mt-0.5">
                            Segera hubungi petugas loket informasi Kantor Pertanahan Banyumas untuk penanganan lanjutan.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* State TIDAK DITEMUKAN */}
          {!isLoading && sudahDicari && hasil.length === 0 && (
            <div className="bg-white rounded-2xl border border-border-color p-8 text-center shadow-md space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <SearchX className="w-9 h-9" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-main">
                Dokumen Tidak Ditemukan
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
                Dokumen dengan Nomor GU atau NIB yang Anda masukkan tidak terdaftar dalam sistem arsip kami.
              </p>

              <div className="bg-gray-50 border border-border-color rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs text-text-secondary">
                <p className="font-semibold text-text-main">Kemungkinan penyebab:</p>
                <div className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Nomor GU atau NIB yang dimasukkan belum tepat formatnya</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Dokumen masih dalam tahap pendaftaran warkah baru</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Dokumen terdaftar dengan penomoran buku tanah lainnya</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="tel:0281635151"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-heading font-semibold text-xs sm:text-sm shadow-md transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Hubungi Petugas: (0281) 635151</span>
                </a>
              </div>
            </div>
          )}

          {/* BOX CATATAN PENTING */}
          {sudahDicari && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-bold font-heading text-blue-950">
                <Info className="w-4 h-4 text-blue-700 flex-shrink-0" />
                <span>Informasi Penting:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-blue-800 text-xs">
                <li>Layanan ini hanya menampilkan status operasional dokumen, bukan posisi letak fisik arsip di ruang simpan.</li>
                <li>Untuk pengambilan dokumen sertipikat/warkah, pemohon wajib hadir langsung dengan menunjukkan kartu identitas asli.</li>
                <li>Layanan konsultasi loket dibuka Senin–Jumat pada jam kerja dinas.</li>
              </ul>
              {catatan && (
                <p className="mt-2 pt-2 border-t border-blue-200 text-xs font-medium text-blue-900">
                  {catatan}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 5. INFO KANTOR SECTION */}
      <section className="bg-primary-dark text-white py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm">
          {/* Kolom 1 — Alamat & Kontak */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-base sm:text-lg text-accent tracking-wide uppercase">
              Kantor Pertanahan Kabupaten Banyumas
            </h3>
            <div className="flex items-start gap-2.5 text-white/80">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>Jl. Jend. Soedirman No. 467, Purwokerto, Kabupaten Banyumas, Jawa Tengah 53116</span>
            </div>
            <div className="flex items-center gap-2.5 text-white/80">
              <Phone className="w-4 h-4 text-accent flex-shrink-0" />
              <span>(0281) 635151</span>
            </div>
            <div className="flex items-center gap-2.5 text-white/80">
              <Mail className="w-4 h-4 text-accent flex-shrink-0" />
              <span>kantah.banyumas@atrbpn.go.id</span>
            </div>
          </div>

          {/* Kolom 2 — Jam Layanan */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-base sm:text-lg text-accent tracking-wide uppercase">
              Jam Layanan Pelanggan
            </h3>
            <div className="flex items-start gap-2.5 text-white/80">
              <Clock className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div><strong className="text-white">Senin – Kamis:</strong> 07.30 – 16.00 WIB</div>
                <div><strong className="text-white">Jumat:</strong> 07.30 – 16.30 WIB</div>
                <div className="text-white/60"><strong className="text-white/80">Sabtu – Minggu:</strong> Tutup (Hari Libur)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-[#001a35] text-white/70 py-6 px-4 text-center text-xs border-t border-white/5 space-y-1">
        <p>© 2024 Kantor Pertanahan Kabupaten Banyumas — Kementerian Agraria dan Tata Ruang / Badan Pertanahan Nasional</p>
        <p className="text-white/40">Layanan Pengecekan Lokasi & Status Dokumen Fisik Pertanahan (SIPLOK)</p>
      </footer>
    </div>
  );
}
