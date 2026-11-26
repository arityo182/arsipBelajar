'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { PaginatedResponse } from '@/types';
import { get } from '@/lib/api';
import { formatDate, getAksiColor } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import Pagination from '@/components/ui/Pagination';
import SkeletonTable from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

interface LogItem {
  id: number;
  aksi: string;
  detail: string;
  created_at: string;
  user: {
    id: number;
    nama: string;
    username: string;
    role: string;
  } | null;
  dokumen: {
    id: number;
    nomor_di302?: string;
    nama_pemohon?: string;
    nomor_album?: number;
    nomor_urut?: number;
    nomor_gu?: string;
    nib?: string;
    nama_pemilik?: string;
  } | null;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [aksiFilter, setAksiFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchLogs = useCallback(
    async (currentPage: number, currentSearch: string) => {
      setIsLoading(true);
      try {
        const res = await get<PaginatedResponse<LogItem>>('/admin/logs', {
          page: currentPage,
          search: currentSearch,
          per_page: 20,
        });

        // Filter aksi secara lokal jika dipilih spesifik
        let filteredData = res.data;
        if (aksiFilter !== 'ALL') {
          filteredData = filteredData.filter((item) => item.aksi.includes(aksiFilter));
        }

        setLogs(filteredData);
        setMeta(res.meta);
      } catch {
        toast.error('Gagal memuat log aktivitas sistem.');
      } finally {
        setIsLoading(false);
      }
    },
    [aksiFilter]
  );

  useEffect(() => {
    fetchLogs(page, debouncedSearch);
  }, [page, debouncedSearch, fetchLogs]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Halaman */}
      <div className="pb-3 border-b border-border-color">
        <h2 className="text-xl font-black text-primary-dark tracking-tight flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <span>Audit Trail & Log Aktivitas Sistem</span>
        </h2>
        <p className="text-xs text-text-secondary">
          Rekaman jejak mutasi arsip, penambahan dokumen, dan aktivitas pengguna di Kantor Pertanahan Banyumas
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border-color shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Input Cari */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari Nomor DI-302, Nama Pemohon, atau Petugas..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-border-color focus:border-primary focus:outline-none"
          />
        </div>

        {/* Tab Filter Aksi */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-text-secondary mr-1 hidden sm:block" />
          {[
            { label: 'Semua Aksi', val: 'ALL' },
            { label: 'Tambah Berkas', val: 'TAMBAH' },
            { label: 'Pindah Album', val: 'PINDAH' },
            { label: 'Update Status', val: 'STATUS' },
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              onClick={() => {
                setAksiFilter(tab.val);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                aksiFilter === tab.val
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Log Aktivitas */}
      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="Tidak Ada Rekaman Log"
          description="Belum ada riwayat aktivitas yang sesuai dengan filter pencarian Anda."
        />
      ) : (
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-primary-dark text-white font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-[18%]">Waktu Kejadian</th>
                  <th className="py-3.5 px-4 w-[15%]">Petugas</th>
                  <th className="py-3.5 px-4 w-[15%]">Nomor DI-302</th>
                  <th className="py-3.5 px-3 w-[14%]">Aksi</th>
                  <th className="py-3.5 px-4 w-[38%]">Rincian Perubahan</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-color text-text-main">
                {logs.map((item) => {
                  const badgeColor = getAksiColor(item.aksi);
                  const isExpanded = expandedRowId === item.id;
                  const detailText = item.detail || '-';
                  const needsTruncate = detailText.length > 70;

                  return (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-text-secondary whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>

                      <td className="py-3 px-4 font-semibold text-text-main">
                        {item.user?.nama || 'Sistem'}
                        <div className="text-[10px] text-text-secondary font-mono">
                          @{item.user?.username || 'system'}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {item.dokumen?.nomor_di302 || item.dokumen?.nomor_gu || '-'}
                        {item.dokumen?.nama_pemohon && (
                          <div className="text-[10px] font-sans font-normal text-text-secondary truncate max-w-[140px]">
                            {item.dokumen.nama_pemohon}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${badgeColor}`}>
                          {item.aksi}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-text-main leading-relaxed">
                          {isExpanded || !needsTruncate
                            ? detailText
                            : `${detailText.slice(0, 70)}...`}

                          {needsTruncate && (
                            <button
                              type="button"
                              onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                              className="ml-2 font-bold text-primary hover:underline inline-flex items-center text-[10px]"
                            >
                              {isExpanded ? (
                                <>
                                  <span>Ringkas</span>
                                  <ChevronUp className="w-3 h-3 ml-0.5" />
                                </>
                              ) : (
                                <>
                                  <span>Selengkapnya</span>
                                  <ChevronDown className="w-3 h-3 ml-0.5" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={(p) => setPage(p)}
              isLoading={isLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}
