'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { dokumenSchema, DokumenFormData } from '@/lib/validations';
import { get, post } from '@/lib/api';
import { Kecamatan, Desa, Boks, ApiResponse } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import CascadingLokasiSelect from '@/components/form/CascadingLokasiSelect';
import PinLokasiCheckbox from '@/components/form/PinLokasiCheckbox';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TambahDokumenPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  // Wilayah State
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<number | null>(null);
  const [loadingKecamatan, setLoadingKecamatan] = useState<boolean>(false);
  const [loadingDesa, setLoadingDesa] = useState<boolean>(false);

  // Lokasi & Boks State
  const [selectedBoks, setSelectedBoks] = useState<Boks | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check GU Real-Time
  const [guInput, setGuInput] = useState<string>('');
  const debouncedGu = useDebounce(guInput, 500);
  const [guStatus, setGuStatus] = useState<{ checked: boolean; exists: boolean; message: string }>({
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
      nomor_gu: '',
      tahun: currentYear,
      nib: '',
      jenis_dokumen: 'Sertipikat',
      nama_pemilik: '',
      desa_id: undefined,
      boks_id: undefined,
    },
  });

  const watchedBoksId = watch('boks_id');

  // Load Pin Lokasi dari sessionStorage saat mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pinSaved = sessionStorage.getItem('siplok_pin_lokasi') === 'true';
      setIsPinned(pinSaved);
    }
  }, []);

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

  // 3. Real-time Check Nomor GU
  useEffect(() => {
    if (!debouncedGu || debouncedGu.trim().length < 3) {
      setGuStatus({ checked: false, exists: false, message: '' });
      return;
    }

    get<ApiResponse<{ exists: boolean }>>('/dokumen/check-gu', { nomor_gu: debouncedGu.trim() })
      .then((res) => {
        if (res.data.exists) {
          setGuStatus({
            checked: true,
            exists: true,
            message: 'Nomor GU ini sudah terdaftar di sistem!',
          });
        } else {
          setGuStatus({
            checked: true,
            exists: false,
            message: '✓ Nomor GU tersedia dan dapat digunakan',
          });
        }
      })
      .catch(() => {
        setGuStatus({ checked: false, exists: false, message: '' });
      });
  }, [debouncedGu]);

  // Handle Form Submission
  const onSubmit = async (data: DokumenFormData) => {
    if (guStatus.exists) {
      setError('nomor_gu', {
        type: 'manual',
        message: 'Nomor GU sudah terdaftar di sistem. Gunakan nomor GU yang lain.',
      });
      toast.error('Nomor GU sudah terdaftar!');
      return;
    }

    setIsSubmitting(true);
    try {
      await post('/dokumen', data);
      toast.success(`Dokumen ${data.nomor_gu} berhasil disimpan!`);

      if (isPinned) {
        // Jika dipin, hanya reset data dokumen, pertahankan boks_id
        reset({
          nomor_gu: '',
          tahun: currentYear,
          nib: '',
          jenis_dokumen: 'Sertipikat',
          nama_pemilik: '',
          desa_id: data.desa_id,
          boks_id: data.boks_id,
        });
        setGuInput('');
        setGuStatus({ checked: false, exists: false, message: '' });
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiErr = err as any;
      if (apiErr?.errors) {
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setError(field as any, {
            type: 'server',
            message: Array.isArray(msgs) ? msgs[0] : String(msgs),
          });
        });
      } else {
        toast.error(apiErr?.message || 'Gagal menyimpan dokumen baru');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Halaman */}
      <div className="pb-2 border-b border-border-color">
        <h2 className="text-xl font-black text-primary-dark tracking-tight">
          Tambah Lokasi Dokumen Baru
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Input identitas warkah/sertipikat dan tentukan koordinat lokasi fisik penyimpanan
        </p>
      </div>

      {/* Formulir 2 Kolom */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ============================================================ */}
          {/* KOLOM KIRI: Informasi Dokumen (7 Kolom) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-border-color shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border-color">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-primary-dark font-sans uppercase tracking-wider">
                Informasi Dokumen Pertanahan
              </h3>
            </div>

            {/* Field Nomor GU */}
            <div>
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
                Nomor GU (Gambar Ukur) *
              </label>
              <input
                type="text"
                {...register('nomor_gu')}
                value={guInput}
                onChange={(e) => {
                  setGuInput(e.target.value);
                  setValue('nomor_gu', e.target.value);
                }}
                placeholder="Contoh: GU-0124/2024"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-mono font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs ${
                  errors.nomor_gu || guStatus.exists ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                }`}
              />
              {guStatus.checked && (
                <div
                  className={`flex items-center gap-1.5 mt-1 text-[11px] font-semibold ${
                    guStatus.exists ? 'text-red-500' : 'text-green-600'
                  }`}
                >
                  {guStatus.exists ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  <span>{guStatus.message}</span>
                </div>
              )}
              {errors.nomor_gu && !guStatus.message && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">
                  {errors.nomor_gu.message}
                </p>
              )}
            </div>

            {/* Grid 2 Kolom: Tahun & NIB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
                  Tahun Terbit *
                </label>
                <input
                  type="number"
                  {...register('tahun')}
                  min={1945}
                  max={currentYear}
                  placeholder={String(currentYear)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-semibold text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs ${
                    errors.tahun ? 'border-red-500' : 'border-border-color'
                  }`}
                />
                {errors.tahun && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">
                    {errors.tahun.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
                  NIB (Nomor Induk Bidang) *
                </label>
                <input
                  type="text"
                  {...register('nib')}
                  placeholder="Contoh: 33020101001"
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) e.preventDefault();
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-mono font-semibold text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs ${
                    errors.nib ? 'border-red-500' : 'border-border-color'
                  }`}
                />
                {errors.nib && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.nib.message}</p>
                )}
              </div>
            </div>

            {/* Grid 2 Kolom: Jenis Dokumen & Nama Pemilik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
                  Jenis Dokumen *
                </label>
                <select
                  {...register('jenis_dokumen')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-color text-xs font-semibold text-text-main bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs"
                >
                  <option value="Sertipikat">Sertipikat</option>
                  <option value="GU">GU (Gambar Ukur)</option>
                  <option value="SU">SU (Surat Ukur)</option>
                  <option value="Warkah">Warkah</option>
                  <option value="IPT">IPT</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
                  Nama Pemilik Hak *
                </label>
                <input
                  type="text"
                  {...register('nama_pemilik')}
                  placeholder="Nama sesuai berkas tanah"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-semibold text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs ${
                    errors.nama_pemilik ? 'border-red-500' : 'border-border-color'
                  }`}
                />
                {errors.nama_pemilik && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">
                    {errors.nama_pemilik.message}
                  </p>
                )}
              </div>
            </div>

            {/* Grid Wilayah: Kecamatan & Desa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
                  Kecamatan *
                </label>
                <select
                  value={selectedKecamatanId || ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : null;
                    setSelectedKecamatanId(id);
                    setValue('desa_id', 0 as unknown as number);
                  }}
                  disabled={loadingKecamatan}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-color text-xs font-semibold text-text-main bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs disabled:bg-gray-100"
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
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
                  Desa / Kelurahan *
                </label>
                <select
                  {...register('desa_id')}
                  disabled={!selectedKecamatanId || loadingDesa}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-semibold text-text-main bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs disabled:bg-gray-100 ${
                    errors.desa_id ? 'border-red-500' : 'border-border-color'
                  }`}
                >
                  <option value="">-- Pilih Desa --</option>
                  {desaList.map((desa) => (
                    <option key={desa.id} value={desa.id}>
                      {desa.nama}
                    </option>
                  ))}
                </select>
                {errors.desa_id && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">
                    {errors.desa_id.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* KOLOM KANAN: Lokasi Fisik & Pin Lokasi (5 Kolom) */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border-2 border-accent shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-accent/40">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-primary-dark font-sans uppercase tracking-wider">
                    Lokasi Fisik Dokumen
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Tentukan koordinat penyimpanan boks fisik
                  </p>
                </div>
              </div>

              {/* Komponen Dropdown Bertingkat */}
              <CascadingLokasiSelect
                selectedBoksId={watchedBoksId}
                onBoksSelect={(id, boksObj) => {
                  setValue('boks_id', (id || 0) as number, { shouldValidate: true });
                  setSelectedBoks(boksObj || null);
                }}
                errorMessage={errors.boks_id?.message}
              />

              {/* Status Kapasitas Boks yang Dipilih */}
              {selectedBoks && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-text-main space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>Boks No. {selectedBoks.nomor}</span>
                    <span className="text-primary">
                      {selectedBoks.terisi} / {selectedBoks.kapasitas} terisi
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{
                        width: `${Math.min(
                          Math.round((selectedBoks.terisi / selectedBoks.kapasitas) * 100),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-text-secondary flex justify-between">
                    <span>Sisa Slot Dokumen:</span>
                    <strong className="text-primary font-bold">
                      {selectedBoks.sisa || selectedBoks.kapasitas - selectedBoks.terisi} tempat
                    </strong>
                  </div>
                </div>
              )}

              {/* Komponen Pin Lokasi */}
              <PinLokasiCheckbox isPinned={isPinned} onToggle={setIsPinned} />
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="pt-4 border-t border-border-color space-y-2">
              <button
                type="submit"
                disabled={isSubmitting || guStatus.exists}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <LoadingSpinner size="sm" color="text-white" />}
                <span>Simpan Dokumen ke Lokasi</span>
              </button>

              <Link
                href="/dashboard"
                className="w-full py-2.5 px-4 rounded-xl border border-border-color bg-white text-text-main font-semibold text-xs text-center block hover:bg-gray-50 transition-colors"
              >
                Batal dan Kembali
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
