'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, FileText, CheckCircle, Clock, BookOpen, RotateCcw, BarChart3 } from 'lucide-react';
import { Dokumen, DokumenDetail, ApiResponse, StatAlbum, StatJenisPermohonan } from '@/types';
import { useDokumen } from '@/hooks/useDokumen';
import { useDebounce } from '@/hooks/useDebounce';
import { get } from '@/lib/api';
import DokumenTable from '@/components/dokumen/DokumenTable';
import Pagination from '@/components/ui/Pagination';
import DokumenDetailModal from '@/components/dokumen/DokumenDetailModal';
import PindahAlbumModal from '@/components/dokumen/PindahAlbumModal';
import UpdateStatusModal from '@/components/dokumen/UpdateStatusModal';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [albumFilter, setAlbumFilter] = useState<string>('');
  const [jenisFilter, setJenisFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Hook data fetching dengan filter lengkap
  const { dokumen, meta, isLoading, refetch } = useDokumen({
    search: debouncedSearch,
    status_berkas: statusFilter || undefined,
    nomor_album: albumFilter ? parseInt(albumFilter) : undefined,
    jenis_permohonan: jenisFilter || undefined,
    page,
    per_page: 15,
  });

  // Modal States
  const [selectedDokumen, setSelectedDokumen] = useState<Dokumen | null>(null);
  const [detailData, setDetailData] = useState<DokumenDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showPindahModal, setShowPindahModal] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  // Statistik Real-time dari backend
  const [statsAlbum, setStatsAlbum] = useState<StatAlbum[]>([]);
  const [statsJenis, setStatsJenis] = useState<StatJenisPermohonan[]>([]);

  const [ringkasan, setRingkasan] = useState({
    total: 120,
    tersedia: 93,
    hilang: 27,
    dipinjam: 0,
    rusak: 0,
  });

  const fetchStatistik = async () => {
    try {
      const [resAlbum, resJenis, resRingkasan] = await Promise.all([
        get<ApiResponse<StatAlbum[]>>('/statistik/album'),
        get<ApiResponse<StatJenisPermohonan[]>>('/statistik/jenis-permohonan'),
        get<ApiResponse<any>>('/statistik/ringkasan').catch(() => ({ data: null })),
      ]);
      setStatsAlbum(resAlbum.data || []);
      setStatsJenis(resJenis.data || []);
      if (resRingkasan?.data) {
        setRingkasan(resRingkasan.data);
      }
    } catch {
      // Background statistics failure handled silently
    }
  };

  useEffect(() => {
    fetchStatistik();
  }, []);

  const handleOpenDetail = async (doc: Dokumen) => {
    setSelectedDokumen(doc);
    setShowDetailModal(true);
    try {
      const res = await get<ApiResponse<DokumenDetail>>(`/dokumen/${doc.id}`);
      setDetailData(res.data);
    } catch {
      toast.error('Gagal mengambil data detail dokumen');
    }
  };

  const handleOpenPindah = (doc: Dokumen) => {
    setSelectedDokumen(doc);
    setShowPindahModal(true);
  };

  const handleOpenStatus = (doc: Dokumen) => {
    setSelectedDokumen(doc);
    setShowStatusModal(true);
  };

  const handlePindahSuccess = async () => {
    await refetch();
    await fetchStatistik();
    if (selectedDokumen) {
      try {
        const res = await get<ApiResponse<DokumenDetail>>(`/dokumen/${selectedDokumen.id}`);
        setDetailData(res.data);
      } catch {
        // Ignored
      }
    }
  };

  const handleStatusSuccess = async () => {
    await refetch();
    await fetchStatistik();
    const docId = selectedDokumen?.id || detailData?.id;
    if (docId) {
      try {
        const res = await get<ApiResponse<DokumenDetail>>(`/dokumen/${docId}`);
        setDetailData(res.data);
      } catch {
        // Ignored
      }
    }
  };

  const handleResetFilter = () => {
    setSearchInput('');
    setStatusFilter('');
    setAlbumFilter('');
    setJenisFilter('');
    setPage(1);
  };

  // Ringkasan global kalkulasi dari statsAlbum
  const totalBerkasAll = statsAlbum.reduce((acc, curr) => acc + curr.total, 0);
  const totalSelesaiAll = statsAlbum.reduce((acc, curr) => acc + curr.selesai, 0);
  const totalProsesAll = statsAlbum.reduce((acc, curr) => acc + curr.proses, 0);
  const totalAlbumAll = statsAlbum.length || 4;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. KOTAK PENCARIAN & FILTER MULTI-LEVEL */}
      <div id="search" className="bg-white p-6 rounded-2xl border border-border-color shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-primary-dark font-sans flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Pencarian & Filter Berkas DI-302
          </h2>
          <span className="text-xs text-text-secondary">
            Nomor DI-302 identik dengan Nomor GU (Buku Register Pengukuran)
          </span>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari No. DI-302, Nama Pemohon, atau Nomor Berkas..."
            className="w-full pl-11 pr-10 py-3 text-sm bg-gray-50/70 border border-border-color rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main placeholder:text-text-secondary/70 font-sans"
          />
          <Search className="w-5 h-5 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3.5 top-3.5 text-text-secondary hover:text-text-main p-0.5 rounded-full hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Filter Status */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">Status Fisik</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-white border border-border-color rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
            >
              <option value="">Semua Status</option>
              <option value="TERSEDIA">Tersedia di Album</option>
              <option value="HILANG">Belum Ada / Hilang</option>
              <option value="DIPINJAM">Sedang Dipinjam</option>
              <option value="RUSAK">Dalam Perbaikan</option>
            </select>
          </div>

          {/* Filter Album */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">Album Penyimpanan</label>
            <select
              value={albumFilter}
              onChange={(e) => {
                setAlbumFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-white border border-border-color rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
            >
              <option value="">Semua Album</option>
              <option value="1">Album 1 (Rak E)</option>
              <option value="2">Album 2 (Rak E)</option>
              <option value="3">Album 3 (Rak E)</option>
              <option value="4">Album 4 (Rak E)</option>
            </select>
          </div>

          {/* Filter Jenis Permohonan */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">Jenis Permohonan</label>
            <select
              value={jenisFilter}
              onChange={(e) => {
                setJenisFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-white border border-border-color rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main truncate"
            >
              <option value="">Semua Jenis</option>
              <option value="Pengukuran Dan Pemetaan">Pengukuran Dan Pemetaan</option>
              <option value="Pengukuran Ulang Dan Pemetaan">Pengukuran Ulang Dan Pemetaan</option>
              <option value="Pemecahan Bidang">Pemecahan Bidang</option>
              <option value="Pendaftaran Tanah Pertama Kali">Pendaftaran Tanah Pertama Kali</option>
            </select>
          </div>

          {/* Tombol Reset */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilter}
              className="w-full py-2 px-3 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-main border border-border-color rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATISTIK CARDS (4 KARTU STATUS FISIK) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Berkas */}
        <div className="bg-white p-4 rounded-xl border border-border-color shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
              Total Berkas
            </span>
            <span className="text-xl font-bold text-primary-dark">
              {ringkasan.total || meta?.total || dokumen.length}
            </span>
          </div>
        </div>

        {/* Fisik Tersedia */}
        <div className="bg-white p-4 rounded-xl border border-border-color shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
              Fisik Tersedia
            </span>
            <span className="text-xl font-bold text-emerald-700">
              {ringkasan.tersedia}
            </span>
          </div>
        </div>

        {/* Belum Ada / Hilang */}
        <div className="bg-white p-4 rounded-xl border border-border-color shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
              Belum Ditemukan
            </span>
            <span className="text-xl font-bold text-rose-700">
              {ringkasan.hilang}
            </span>
          </div>
        </div>

        {/* Dipinjam / Rusak */}
        <div className="bg-white p-4 rounded-xl border border-border-color shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
              Dipinjam / Rusak
            </span>
            <span className="text-xl font-bold text-amber-700">
              {ringkasan.dipinjam + ringkasan.rusak}
            </span>
          </div>
        </div>
      </div>

      {/* 3. TABEL DATA HASIL FILTER */}
      <DokumenTable
        dokumen={dokumen}
        isLoading={isLoading}
        onDetail={handleOpenDetail}
        onPindah={handleOpenPindah}
        onUpdateStatus={handleOpenStatus}
      />

      {/* 4. PAGINASI */}
      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={page}
          lastPage={meta.last_page}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      {/* 5. GRAFIK & TABEL REKAPITULASI RESMI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Rekapitulasi per Album */}
        <div className="bg-white p-5 rounded-2xl border border-border-color shadow-sm">
          <h3 className="text-sm font-bold text-primary-dark mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Rekapitulasi Berkas per Album Fisik (Rak E)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-text-main font-bold border-b border-border-color">
                  <th className="py-2 px-3">Album</th>
                  <th className="py-2 px-2 text-center">Rak</th>
                  <th className="py-2 px-2 text-center">Total</th>
                  <th className="py-2 px-2 text-center text-green-700">Selesai</th>
                  <th className="py-2 px-2 text-center text-yellow-700">Proses</th>
                  <th className="py-2 px-3 text-right">% Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {statsAlbum.map((alb) => (
                  <tr key={alb.nomor_album} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3 font-semibold text-primary">Album {alb.nomor_album}</td>
                    <td className="py-2.5 px-2 text-center">{alb.rak_kode}</td>
                    <td className="py-2.5 px-2 text-center font-bold">{alb.total}</td>
                    <td className="py-2.5 px-2 text-center text-green-700 font-semibold">{alb.selesai}</td>
                    <td className="py-2.5 px-2 text-center text-yellow-700 font-semibold">{alb.proses}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold">
                        {alb.persentase_selesai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rekapitulasi per Jenis Permohonan */}
        <div className="bg-white p-5 rounded-2xl border border-border-color shadow-sm">
          <h3 className="text-sm font-bold text-primary-dark mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Rekapitulasi per Jenis Permohonan Pengukuran
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-text-main font-bold border-b border-border-color">
                  <th className="py-2 px-3">Jenis Permohonan</th>
                  <th className="py-2 px-3 text-center">Jumlah</th>
                  <th className="py-2 px-3 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {statsJenis.map((item) => (
                  <tr key={item.jenis_permohonan} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3 font-medium text-text-main">{item.jenis_permohonan}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.jumlah} berkas</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                        {item.persentase}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: Detail Berkas DI-302 */}
      <DokumenDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        dokumen={detailData || (selectedDokumen as any)}
        onPindah={() => {
          setShowDetailModal(false);
          setShowPindahModal(true);
        }}
        onUpdateStatus={() => {
          setShowDetailModal(false);
          setShowStatusModal(true);
        }}
      />

      {/* MODAL 2: Pindah Lokasi Album */}
      <PindahAlbumModal
        isOpen={showPindahModal}
        onClose={() => setShowPindahModal(false)}
        dokumen={detailData || selectedDokumen}
        onSuccess={handlePindahSuccess}
      />

      {/* MODAL 3: Update Status Berkas */}
      <UpdateStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        dokumen={detailData || selectedDokumen}
        onSuccess={handleStatusSuccess}
      />
    </div>
  );
}
