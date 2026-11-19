'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, FileText, CheckCircle, Clock, Building } from 'lucide-react';
import { Dokumen, DokumenDetail, ApiResponse } from '@/types';
import { useDokumen } from '@/hooks/useDokumen';
import { useDebounce } from '@/hooks/useDebounce';
import { get } from '@/lib/api';
import DokumenTable from '@/components/dokumen/DokumenTable';
import Pagination from '@/components/ui/Pagination';
import DokumenDetailModal from '@/components/dokumen/DokumenDetailModal';
import PindahRakModal from '@/components/dokumen/PindahRakModal';
import UpdateStatusModal from '@/components/dokumen/UpdateStatusModal';
import PrintLabel from '@/components/dokumen/PrintLabel';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Hook data fetching dengan AbortController
  const { dokumen, meta, isLoading, refetch } = useDokumen({
    search: debouncedSearch,
    page,
    per_page: 15,
  });

  // Modal States
  const [selectedDokumen, setSelectedDokumen] = useState<Dokumen | null>(null);
  const [detailData, setDetailData] = useState<DokumenDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showPindahModal, setShowPindahModal] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  // Fetch Dokumen Detail saat modal detail dibuka
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
    if (selectedDokumen) {
      try {
        const res = await get<ApiResponse<DokumenDetail>>(`/dokumen/${selectedDokumen.id}`);
        setDetailData(res.data);
      } catch {
        // Abaikan
      }
    }
  };

  const handleStatusSuccess = async () => {
    await refetch();
    const docId = selectedDokumen?.id || detailData?.id;
    if (docId) {
      try {
        const res = await get<ApiResponse<DokumenDetail>>(`/dokumen/${docId}`);
        setDetailData(res.data);
      } catch {
        // Abaikan
      }
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Statistik mini dihitung dari data aktif
  const totalCount = meta?.total || dokumen.length;
  const tersediaCount = dokumen.filter((d) => d.status_fisik === 'TERSEDIA').length;
  const dipinjamCount = dokumen.filter((d) => d.status_fisik === 'DIPINJAM').length;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. KOTAK PENCARIAN UTAMA */}
      <div id="search" className="bg-white p-6 rounded-2xl border border-border-color shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-primary-dark font-sans flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <span>Cari Dokumen Pertanahan</span>
          </h2>
          <span className="text-xs text-text-secondary">Kantah Kab. Banyumas</span>
        </div>

        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
            <Search className="w-5 h-5 text-primary" />
          </div>

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ketik Nomor GU (misal: GU-0101/2021), NIB (3302...), atau Nama Pemilik tanah..."
            autoFocus
            className="w-full pl-12 pr-12 h-[52px] text-base rounded-xl border-2 border-border-color focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
          />

          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-text-main"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-text-secondary mt-2 px-1">
          <span>Pencarian otomatis berjalan secara real-time saat Anda mengetik.</span>
          <span className="hidden sm:inline font-mono">Tip: Cari NIB dengan 11 digit angka</span>
        </div>
      </div>

      {/* 2. STATISTIK MINI REAL-TIME */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-border-color shadow-2xs flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-blue-50 text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-text-main font-sans">{totalCount}</div>
              <div className="text-xs text-text-secondary">Total Dokumen</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border-color shadow-2xs flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-700">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-green-700 font-sans">{tersediaCount}</div>
              <div className="text-xs text-text-secondary">Status Tersedia</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border-color shadow-2xs flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-amber-700 font-sans">{dipinjamCount}</div>
              <div className="text-xs text-text-secondary">Sedang Dipinjam</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border-color shadow-2xs flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-purple-700 font-sans">2 Ruang</div>
              <div className="text-xs text-text-secondary">Ruang Arsip Aktif</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TABEL DAFTAR DOKUMEN ARSIP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-primary-dark font-sans">
              {debouncedSearch ? 'Hasil Pencarian' : 'Daftar Dokumen Terbaru'}
            </h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {totalCount} dokumen
            </span>
          </div>
        </div>

        <DokumenTable
          dokumen={dokumen}
          isLoading={isLoading}
          onDetail={handleOpenDetail}
          onPindah={handleOpenPindah}
          onUpdateStatus={handleOpenStatus}
        />

        {/* Paginasi Navigasi */}
        {meta && meta.last_page > 1 && (
          <div className="bg-white rounded-xl border border-border-color shadow-2xs">
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={(p) => setPage(p)}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* 4. MODALS INTERAKTIF */}
      <DokumenDetailModal
        dokumen={detailData}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailData(null);
        }}
        onPindah={() => {
          setShowDetailModal(false);
          if (selectedDokumen) setShowPindahModal(true);
        }}
        onUpdateStatus={() => {
          if (detailData || selectedDokumen) {
            setShowStatusModal(true);
          }
        }}
        onRefresh={refetch}
        onPrint={handlePrint}
      />

      <PindahRakModal
        dokumen={selectedDokumen}
        isOpen={showPindahModal}
        onClose={() => setShowPindahModal(false)}
        onSuccess={handlePindahSuccess}
      />

      <UpdateStatusModal
        dokumen={detailData || selectedDokumen}
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSuccess={handleStatusSuccess}
      />

      {/* Komponen Khusus Print Thermal/A4 */}
      <PrintLabel dokumen={detailData} />
    </div>
  );
}
