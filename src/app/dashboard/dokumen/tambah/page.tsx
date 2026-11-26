'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, BookOpen, CheckCircle, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { dokumenSchema, DokumenFormData } from '@/lib/validations';
import { get, post } from '@/lib/api';
import { Kecamatan, Desa, Rak, Album, ApiResponse } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TambahDokumenPage() {
  const router = useRouter();

  // Wilayah State
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<number | null>(null);
  const [loadingKecamatan, setLoadingKecamatan] = useState<boolean>(false);
  const [loadingDesa, setLoadingDesa] = useState<boolean>(false);

  // Lokasi Fisik State (Rak & Album)
  const [rakList, setRakList] = useState<Rak[]>([]);
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [selectedRakId, setSelectedRakId] = useState<number | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [loadingRak, setLoadingRak] = useState<boolean>(false);
  const [loadingAlbum, setLoadingAlbum] = useState<boolean>(false);

  // Pin Lokasi & Submit State
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Real-Time DI-302 Duplicate Check
  const [di302Input, setDi302Input] = useState<string>('');
  const debouncedDi302 = useDebounce(di302Input, 400);
  const [di302Status, setDi302Status] = useState<{ checked: boolean; exists: boolean; message: string }>({
    checked: false,
    exists: false,
    message: '',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<DokumenFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(dokumenSchema) as any,
    defaultValues: {
      nomor_di302: '',
      tanggal_masuk: new Date().toISOString().split('T')[0],
      tahun: new Date().getFullYear(),
      nama_pemohon: '',
      jenis_permohonan: 'Pengukuran Dan Pemetaan',
      status_berkas: 'TERSEDIA',
      nomor_album: undefined,
      nomor_urut: 1,
      tingkat: '',
      posisi: '',
      keterangan: '',
      catatan: '',
    },
  });

  const watchedTanggalMasuk = watch('tanggal_masuk');
  const watchedNomorAlbum = watch('nomor_album');

  // Load Pin Lokasi dari sessionStorage saat mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pinSaved = sessionStorage.getItem('siplok_pin_lokasi') === 'true';
      setIsPinned(pinSaved);
      if (pinSaved) {
        const savedRakId = sessionStorage.getItem('siplok_pinned_rak_id');
        const savedAlbum = sessionStorage.getItem('siplok_pinned_album');
        const savedTingkat = sessionStorage.getItem('siplok_pinned_tingkat');
        const savedPosisi = sessionStorage.getItem('siplok_pinned_posisi');

        if (savedRakId) {
          const rId = parseInt(savedRakId);
          setSelectedRakId(rId);
          setValue('rak_id', rId);
        }
        if (savedAlbum) {
          const aNo = parseInt(savedAlbum);
          setValue('nomor_album', aNo);
        }
        if (savedTingkat) setValue('tingkat', savedTingkat);
        if (savedPosisi) setValue('posisi', savedPosisi);
      }
    }
  }, [setValue]);

  // Update tahun otomatis saat tanggal masuk berubah
  useEffect(() => {
    if (watchedTanggalMasuk) {
      const year = new Date(watchedTanggalMasuk).getFullYear();
      if (!isNaN(year)) {
        setValue('tahun', year);
      }
    }
  }, [watchedTanggalMasuk, setValue]);

  // 1. Fetch Kecamatan Banyumas
  useEffect(() => {
    setLoadingKecamatan(true);
    get<ApiResponse<Kecamatan[]>>('/wilayah/kecamatan')
      .then((res) => {
        setKecamatanList(res.data);
      })
      .catch(() => {
        toast.error('Gagal memuat data kecamatan');
      })
      .finally(() => {
        setLoadingKecamatan(false);
      });
  }, []);

  // 2. Fetch Desa saat Kecamatan berubah
  useEffect(() => {
    if (selectedKecamatanId) {
      setLoadingDesa(true);
      get<ApiResponse<Desa[]>>('/wilayah/desa', { kecamatan_id: selectedKecamatanId })
        .then((res) => {
          setDesaList(res.data);
        })
        .catch(() => {
          toast.error('Gagal memuat data desa');
        })
        .finally(() => {
          setLoadingDesa(false);
        });
    } else {
      setDesaList([]);
    }
  }, [selectedKecamatanId]);

  // 3. Fetch Rak Penyimpanan
  useEffect(() => {
    setLoadingRak(true);
    get<ApiResponse<Rak[]>>('/lokasi/rak')
      .then((res) => {
        setRakList(res.data);
        // Default rak E jika ada
        const rakE = res.data.find((r) => r.kode === 'E');
        if (rakE && !selectedRakId) {
          setSelectedRakId(rakE.id);
          setValue('rak_id', rakE.id);
        }
      })
      .catch(() => {
        toast.error('Gagal memuat data rak');
      })
      .finally(() => {
        setLoadingRak(false);
      });
  }, [selectedRakId, setValue]);

  // 4. Fetch Album saat Rak berubah
  useEffect(() => {
    if (selectedRakId) {
      setLoadingAlbum(true);
      get<ApiResponse<Album[]>>('/lokasi/album', { rak_id: selectedRakId })
        .then((res) => {
          setAlbumList(res.data);
        })
        .catch(() => {
          toast.error('Gagal memuat data album');
        })
        .finally(() => {
          setLoadingAlbum(false);
        });
    } else {
      setAlbumList([]);
    }
  }, [selectedRakId]);

  // Update selected album info saat nomor_album berubah
  useEffect(() => {
    if (watchedNomorAlbum && albumList.length > 0) {
      const alb = albumList.find((a) => a.nomor_album === Number(watchedNomorAlbum));
      setSelectedAlbum(alb || null);
    }
  }, [watchedNomorAlbum, albumList]);

  // 5. Cek Real-Time Nomor DI-302
  useEffect(() => {
    if (!debouncedDi302) {
      setDi302Status({ checked: false, exists: false, message: '' });
      return;
    }

    // Hanya jika berupa digit
    if (!/^\d+$/.test(debouncedDi302)) {
      setDi302Status({
        checked: true,
        exists: true,
        message: 'Nomor DI-302 hanya boleh angka murni',
      });
      return;
    }

    get<ApiResponse<{ exists: boolean }>>('/dokumen/check-di302', { nomor_di302: debouncedDi302 })
      .then((res) => {
        if (res.data.exists) {
          setDi302Status({
            checked: true,
            exists: true,
            message: 'Nomor DI-302 ini sudah terdaftar di sistem',
          });
          setError('nomor_di302', { message: 'Nomor DI-302 sudah digunakan' });
        } else {
          setDi302Status({
            checked: true,
            exists: false,
            message: '✓ Nomor DI-302 tersedia',
          });
        }
      })
      .catch(() => {
        // Abaikan error jaringan sementara
      });
  }, [debouncedDi302, setError]);

  // Handler Submit Form
  const onSubmit = async (data: DokumenFormData) => {
    if (di302Status.exists) {
      toast.error('Nomor DI-302 sudah terdaftar, gunakan nomor lain');
      return;
    }

    setIsSubmitting(true);
    try {
      await post('/dokumen', data);
      toast.success('Berkas DI-302 berhasil ditambahkan!');

      // Tangani Pin Lokasi
      if (isPinned) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('siplok_pin_lokasi', 'true');
          sessionStorage.setItem('siplok_pinned_rak_id', String(data.rak_id));
          sessionStorage.setItem('siplok_pinned_album', String(data.nomor_album));
          if (data.tingkat) sessionStorage.setItem('siplok_pinned_tingkat', data.tingkat);
          if (data.posisi) sessionStorage.setItem('siplok_pinned_posisi', data.posisi);
        }

        // Reset field berkas kecuali lokasi
        reset({
          nomor_di302: '',
          tanggal_masuk: data.tanggal_masuk,
          tahun: data.tahun,
          nama_pemohon: '',
          jenis_permohonan: data.jenis_permohonan,
          desa_id: data.desa_id,
          kecamatan_id: data.kecamatan_id,
          rak_id: data.rak_id,
          nomor_album: data.nomor_album,
          nomor_urut: (data.nomor_urut || 1) + 1,
          tingkat: data.tingkat,
          posisi: data.posisi,
          keterangan: '',
          catatan: '',
          status_berkas: 'TERSEDIA',
        });
        setDi302Input('');
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('siplok_pin_lokasi');
          sessionStorage.removeItem('siplok_pinned_rak_id');
          sessionStorage.removeItem('siplok_pinned_album');
          sessionStorage.removeItem('siplok_pinned_tingkat');
          sessionStorage.removeItem('siplok_pinned_posisi');
        }
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menyimpan berkas DI-302';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Tombol Kembali & Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-color">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-xl font-bold text-primary-dark">Tambah Berkas DI-302</h1>
          <p className="text-xs text-text-secondary">
            Input data berkas permohonan pengukuran dan pemetaan bidang tanah
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI (7 Kolom): Informasi Berkas DI-302 */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-border-color shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-primary-dark border-b border-border-color pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Informasi Berkas Permohonan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nomor DI-302 */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-text-main mb-1">
                Nomor DI-302 *
                <span className="text-[10px] text-text-secondary font-normal ml-1">
                  (Nomor GU)
                </span>
              </label>
              <input
                type="text"
                {...register('nomor_di302')}
                value={di302Input}
                onChange={(e) => {
                  setDi302Input(e.target.value);
                  setValue('nomor_di302', e.target.value);
                }}
                placeholder="Contoh: 2299"
                className={`w-full py-2.5 px-3 text-xs bg-gray-50/70 border rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono font-bold text-text-main ${
                  errors.nomor_di302 ? 'border-red-500 bg-red-50/30' : 'border-border-color'
                }`}
              />
              {errors.nomor_di302 && (
                <p className="text-[11px] text-red-600 mt-1">{errors.nomor_di302.message}</p>
              )}
              {di302Status.checked && !errors.nomor_di302 && (
                <p
                  className={`text-[11px] mt-1 flex items-center gap-1 ${
                    di302Status.exists ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {di302Status.exists ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  {di302Status.message}
                </p>
              )}
              <span className="text-[10px] text-text-secondary block mt-0.5">
                Hanya angka murni, tanpa prefix GU- atau DI-302-
              </span>
            </div>

            {/* Tanggal Masuk */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-text-main mb-1">
                Tanggal Masuk *
              </label>
              <input
                type="date"
                {...register('tanggal_masuk')}
                className="w-full py-2.5 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
              />
              {errors.tanggal_masuk && (
                <p className="text-[11px] text-red-600 mt-1">{errors.tanggal_masuk.message}</p>
              )}
            </div>
          </div>

          {/* Nama Pemohon */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1">
              Nama Pemohon *
            </label>
            <input
              type="text"
              {...register('nama_pemohon')}
              placeholder="Nama pemohon sesuai berkas permohonan"
              className="w-full py-2.5 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main uppercase"
            />
            {errors.nama_pemohon && (
              <p className="text-[11px] text-red-600 mt-1">{errors.nama_pemohon.message}</p>
            )}
          </div>

          {/* Jenis Permohonan */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1">
              Jenis Permohonan *
            </label>
            <select
              {...register('jenis_permohonan')}
              className="w-full py-2.5 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
            >
              <option value="Pengukuran Dan Pemetaan">Pengukuran Dan Pemetaan</option>
              <option value="Pengukuran Ulang Dan Pemetaan">Pengukuran Ulang Dan Pemetaan</option>
              <option value="Pemecahan Bidang">Pemecahan Bidang</option>
              <option value="Pendaftaran Tanah Pertama Kali">Pendaftaran Tanah Pertama Kali</option>
            </select>
          </div>

          {/* Kecamatan & Desa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Kecamatan *
              </label>
              <select
                value={selectedKecamatanId || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedKecamatanId(val);
                  setValue('kecamatan_id', val || undefined);
                  setValue('desa_id', 0);
                }}
                disabled={loadingKecamatan}
                className="w-full py-2.5 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
              >
                <option value="">-- Pilih Kecamatan --</option>
                {kecamatanList.map((kec) => (
                  <option key={kec.id} value={kec.id}>
                    {kec.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Desa / Kelurahan *
              </label>
              <select
                {...register('desa_id', { valueAsNumber: true })}
                disabled={!selectedKecamatanId || loadingDesa}
                className="w-full py-2.5 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
              >
                <option value="">
                  {loadingDesa ? 'Memuat desa...' : '-- Pilih Desa / Kelurahan --'}
                </option>
                {desaList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
              {errors.desa_id && (
                <p className="text-[11px] text-red-600 mt-1">{errors.desa_id.message}</p>
              )}
            </div>
          </div>

          {/* Keterangan Sistem */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1">
              Keterangan
              <span className="text-[10px] text-text-secondary font-normal ml-1">
                (Nomor berkas sistem & catatan status)
              </span>
            </label>
            <textarea
              {...register('keterangan')}
              rows={2}
              placeholder="Contoh: Berkas No.5477/2024 Selesai"
              className="w-full py-2 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
            />
          </div>

          {/* Catatan Tambahan Bebas */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1">
              Catatan Bebas (Opsional)
            </label>
            <textarea
              {...register('catatan')}
              rows={2}
              placeholder="Catatan tambahan bila ada keperluan khusus"
              className="w-full py-2 px-3 text-xs bg-gray-50/70 border border-border-color rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
            />
          </div>

          {/* Status Fisik Berkas */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-2">
              Status Fisik Warkah / Berkas *
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-text-main cursor-pointer">
                <input
                  type="radio"
                  value="TERSEDIA"
                  {...register('status_berkas')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] border border-emerald-200">
                  Tersedia
                </span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-semibold text-text-main cursor-pointer">
                <input
                  type="radio"
                  value="HILANG"
                  {...register('status_berkas')}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] border border-rose-200">
                  Belum Ada / Hilang
                </span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-semibold text-text-main cursor-pointer">
                <input
                  type="radio"
                  value="DIPINJAM"
                  {...register('status_berkas')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] border border-blue-200">
                  Dipinjam
                </span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-semibold text-text-main cursor-pointer">
                <input
                  type="radio"
                  value="RUSAK"
                  {...register('status_berkas')}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] border border-amber-200">
                  Rusak
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (5 Kolom): Lokasi Album Fisik */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#FFFDF5] p-6 rounded-2xl border-2 border-accent/60 shadow-sm space-y-4">
            <div className="border-b border-accent/30 pb-3">
              <h2 className="text-sm font-bold text-primary-dark flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-gold" />
                Lokasi Album Fisik
              </h2>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Tentukan di album dan rak mana berkas fisik ini disimpan
              </p>
            </div>

            {/* Rak Penyimpanan */}
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Rak Penyimpanan *
              </label>
              <select
                value={selectedRakId || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedRakId(val);
                  setValue('rak_id', val || 0);
                  setValue('nomor_album', 0);
                }}
                disabled={loadingRak}
                className="w-full py-2.5 px-3 text-xs bg-white border border-border-color rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main font-semibold"
              >
                <option value="">-- Pilih Rak --</option>
                {rakList.map((r) => (
                  <option key={r.id} value={r.id}>
                    Rak {r.kode}
                  </option>
                ))}
              </select>
              {errors.rak_id && (
                <p className="text-[11px] text-red-600 mt-1">{errors.rak_id.message}</p>
              )}
            </div>

            {/* Tingkat & Posisi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-main mb-1">
                  Tingkat (Opsional)
                </label>
                <input
                  type="text"
                  {...register('tingkat')}
                  placeholder="Contoh: 1, 2"
                  className="w-full py-2 px-3 text-xs bg-white border border-border-color rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-main mb-1">
                  Posisi (Opsional)
                </label>
                <input
                  type="text"
                  {...register('posisi')}
                  placeholder="Kiri / Kanan"
                  className="w-full py-2 px-3 text-xs bg-white border border-border-color rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
                />
              </div>
            </div>

            {/* Nomor Album */}
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Nomor Album *
              </label>
              <select
                {...register('nomor_album', { valueAsNumber: true })}
                disabled={!selectedRakId || loadingAlbum}
                className="w-full py-2.5 px-3 text-xs bg-white border border-border-color rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main font-bold"
              >
                <option value="">
                  {loadingAlbum ? 'Memuat album...' : '-- Pilih Album --'}
                </option>
                {albumList.map((alb) => {
                  const isFull = alb.sisa <= 0;
                  return (
                    <option
                      key={alb.id}
                      value={alb.nomor_album}
                      disabled={isFull}
                      className={isFull ? 'text-red-500 font-normal' : 'font-semibold'}
                    >
                      Album {alb.nomor_album} ({alb.terisi}/{alb.kapasitas} terisi) {isFull ? '— PENUH' : ''}
                    </option>
                  );
                })}
              </select>
              {errors.nomor_album && (
                <p className="text-[11px] text-red-600 mt-1">{errors.nomor_album.message}</p>
              )}
            </div>

            {/* Nomor Urut dalam Album */}
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Nomor Urut dalam Album (1 s/d 30) *
              </label>
              <input
                type="number"
                min={1}
                max={selectedAlbum?.kapasitas || 30}
                {...register('nomor_urut', { valueAsNumber: true })}
                placeholder="1"
                className="w-full py-2.5 px-3 text-xs bg-white border border-border-color rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-main font-mono font-bold"
              />
              {errors.nomor_urut && (
                <p className="text-[11px] text-red-600 mt-1">{errors.nomor_urut.message}</p>
              )}
            </div>

            {/* Progress Kapasitas Album */}
            {selectedAlbum && (
              <div className="p-3 bg-white border border-accent/40 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-primary-dark">
                  <span>Kapasitas Album {selectedAlbum.nomor_album}</span>
                  <span>{selectedAlbum.terisi} / {selectedAlbum.kapasitas} berkas</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      selectedAlbum.sisa <= 3 ? 'bg-red-500' : 'bg-primary'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((selectedAlbum.terisi / selectedAlbum.kapasitas) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-text-secondary block">
                  Sisa {selectedAlbum.sisa} slot berkas lagi
                </span>
              </div>
            )}

            {/* Checkbox Pin Lokasi */}
            <div className="pt-2 border-t border-accent/30">
              <label className="flex items-center gap-2 text-xs font-medium text-text-main cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent-gold" />
                  Kunci Lokasi untuk input berkas berikutnya
                </span>
              </label>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/dashboard"
              className="py-2.5 px-5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-main rounded-xl transition-colors"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || di302Status.exists}
              className="py-2.5 px-6 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="w-3.5 h-3.5" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Berkas DI-302'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
