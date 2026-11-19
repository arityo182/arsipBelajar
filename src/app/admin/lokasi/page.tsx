'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Layers,
  Archive,
  Box,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Ruang, Rak, Shaf, Boks } from '@/types';
import { useLokasiAdmin } from '@/hooks/useLokasiAdmin';
import SkeletonTable from '@/components/ui/Skeleton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MasterLokasiPage() {
  const [activeTab, setActiveTab] = useState<'ruang' | 'rak' | 'shaf' | 'boks'>('ruang');

  const {
    ruangList,
    rakList,
    shafList,
    boksList,
    isLoading,
    fetchAll,
    createRuang,
    updateRuang,
    deleteRuang,
    createRak,
    updateRak,
    deleteRak,
    createShaf,
    updateShaf,
    deleteShaf,
    createBoks,
    updateBoks,
    deleteBoks,
  } = useLokasiAdmin();

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<Ruang | Rak | Shaf | Boks | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    type: 'ruang' | 'rak' | 'shaf' | 'boks';
    id: number;
    title: string;
  }>({
    show: false,
    type: 'ruang',
    id: 0,
    title: '',
  });

  // Form State
  // 1. Ruang Form
  const [ruangNama, setRuangNama] = useState<string>('');
  const [ruangKode, setRuangKode] = useState<string>('');
  const [ruangDeskripsi, setRuangDeskripsi] = useState<string>('');

  // 2. Rak Form
  const [rakRuangId, setRakRuangId] = useState<number | null>(null);
  const [rakKode, setRakKode] = useState<string>('');
  const [rakNama, setRakNama] = useState<string>('');

  // 3. Shaf Form (Cascading: Ruang -> Rak)
  const [shafRuangId, setShafRuangId] = useState<number | null>(null);
  const [shafRakId, setShafRakId] = useState<number | null>(null);
  const [shafKode, setShafKode] = useState<string>('');
  const [shafNama, setShafNama] = useState<string>('');

  // 4. Boks Form (Cascading: Ruang -> Rak -> Shaf)
  const [boksRuangId, setBoksRuangId] = useState<number | null>(null);
  const [boksRakId, setBoksRakId] = useState<number | null>(null);
  const [boksShafId, setBoksShafId] = useState<number | null>(null);
  const [boksNomor, setBoksNomor] = useState<string>('');
  const [boksKapasitas, setBoksKapasitas] = useState<number>(50);

  // Cascading Helpers
  const filteredRaksForShaf = rakList.filter((r) => !shafRuangId || r.ruang_id === shafRuangId);
  const filteredRaksForBoks = rakList.filter((r) => !boksRuangId || r.ruang_id === boksRuangId);
  const filteredShafsForBoks = shafList.filter((s) => !boksRakId || s.rak_id === boksRakId);

  // Reset Form
  const resetForm = () => {
    setEditingItem(null);
    setFieldErrors({});
    setRuangNama('');
    setRuangKode('');
    setRuangDeskripsi('');

    setRakRuangId(null);
    setRakKode('');
    setRakNama('');

    setShafRuangId(null);
    setShafRakId(null);
    setShafKode('');
    setShafNama('');

    setBoksRuangId(null);
    setBoksRakId(null);
    setBoksShafId(null);
    setBoksNomor('');
    setBoksKapasitas(50);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const handleOpenEdit = (item: Ruang | Rak | Shaf | Boks) => {
    resetForm();
    setEditingItem(item);
    setModalMode('edit');

    if (activeTab === 'ruang') {
      const r = item as Ruang;
      setRuangNama(r.nama);
      setRuangKode(r.kode);
      setRuangDeskripsi(r.deskripsi || '');
    } else if (activeTab === 'rak') {
      const r = item as Rak;
      setRakRuangId(r.ruang_id);
      setRakKode(r.kode);
      setRakNama(`Rak ${r.kode}`);
    } else if (activeTab === 'shaf') {
      const s = item as Shaf;
      const parentRak = rakList.find((r) => r.id === s.rak_id);
      setShafRuangId(parentRak?.ruang_id || null);
      setShafRakId(s.rak_id);
      setShafKode(s.kode);
      setShafNama(`Shaf ${s.kode}`);
    } else if (activeTab === 'boks') {
      const b = item as Boks;
      const parentShaf = shafList.find((s) => s.id === b.shaf_id);
      const parentRak = rakList.find((r) => r.id === parentShaf?.rak_id);
      setBoksRuangId(parentRak?.ruang_id || null);
      setBoksRakId(parentShaf?.rak_id || null);
      setBoksShafId(b.shaf_id);
      setBoksNomor(b.nomor);
      setBoksKapasitas(b.kapasitas || 50);
    }

    setShowModal(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      if (activeTab === 'ruang') {
        if (!ruangNama.trim() || !ruangKode.trim()) {
          setFieldErrors({
            nama: !ruangNama.trim() ? 'Nama ruang wajib diisi' : '',
            kode: !ruangKode.trim() ? 'Kode ruang wajib diisi' : '',
          });
          setIsSubmitting(false);
          return;
        }

        if (modalMode === 'add') {
          await createRuang({
            nama: ruangNama.trim(),
            kode: ruangKode.trim().toUpperCase(),
            deskripsi: ruangDeskripsi.trim() || undefined,
          });
        } else if (editingItem) {
          await updateRuang(editingItem.id, {
            nama: ruangNama.trim(),
            kode: ruangKode.trim().toUpperCase(),
            deskripsi: ruangDeskripsi.trim() || undefined,
          });
        }
      } else if (activeTab === 'rak') {
        if (!rakRuangId || !rakKode.trim()) {
          setFieldErrors({
            ruang_id: !rakRuangId ? 'Pilih ruang induk terlebih dahulu' : '',
            kode: !rakKode.trim() ? 'Kode rak wajib diisi' : '',
          });
          setIsSubmitting(false);
          return;
        }

        if (modalMode === 'add') {
          await createRak({
            ruang_id: rakRuangId,
            kode: rakKode.trim().toUpperCase(),
            nama: rakNama.trim() || undefined,
          });
        } else if (editingItem) {
          await updateRak(editingItem.id, {
            ruang_id: rakRuangId,
            kode: rakKode.trim().toUpperCase(),
            nama: rakNama.trim() || undefined,
          });
        }
      } else if (activeTab === 'shaf') {
        if (!shafRakId || !shafKode.trim()) {
          setFieldErrors({
            rak_id: !shafRakId ? 'Pilih rak induk terlebih dahulu' : '',
            kode: !shafKode.trim() ? 'Kode shaf wajib diisi' : '',
          });
          setIsSubmitting(false);
          return;
        }

        if (modalMode === 'add') {
          await createShaf({
            rak_id: shafRakId,
            kode: shafKode.trim().toUpperCase(),
            nama: shafNama.trim() || undefined,
          });
        } else if (editingItem) {
          await updateShaf(editingItem.id, {
            rak_id: shafRakId,
            kode: shafKode.trim().toUpperCase(),
            nama: shafNama.trim() || undefined,
          });
        }
      } else if (activeTab === 'boks') {
        if (!boksShafId || !boksNomor.trim() || !boksKapasitas) {
          setFieldErrors({
            shaf_id: !boksShafId ? 'Pilih shaf induk terlebih dahulu' : '',
            nomor: !boksNomor.trim() ? 'Nomor boks wajib diisi' : '',
            kapasitas: !boksKapasitas ? 'Kapasitas maksimal wajib diisi' : '',
          });
          setIsSubmitting(false);
          return;
        }

        if (modalMode === 'add') {
          await createBoks({
            shaf_id: boksShafId,
            nomor: boksNomor.trim(),
            kapasitas: Number(boksKapasitas),
          });
        } else if (editingItem) {
          await updateBoks(editingItem.id, {
            shaf_id: boksShafId,
            nomor: boksNomor.trim(),
            kapasitas: Number(boksKapasitas),
          });
        }
      }

      setShowModal(false);
      resetForm();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errors' in err) {
        const serverErrors = (err as { errors: Record<string, string[]> }).errors;
        const mappedErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(serverErrors)) {
          mappedErrors[key] = msgs[0] || 'Validasi gagal';
        }
        setFieldErrors(mappedErrors);
      } else {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Terjadi kesalahan saat menyimpan data.';
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      if (deleteConfirm.type === 'ruang') {
        await deleteRuang(deleteConfirm.id);
      } else if (deleteConfirm.type === 'rak') {
        await deleteRak(deleteConfirm.id);
      } else if (deleteConfirm.type === 'shaf') {
        await deleteShaf(deleteConfirm.id);
      } else if (deleteConfirm.type === 'boks') {
        await deleteBoks(deleteConfirm.id);
      }
      setDeleteConfirm({ show: false, type: 'ruang', id: 0, title: '' });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Gagal menghapus entitas lokasi.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-color">
        <div>
          <h2 className="text-xl font-black text-primary-dark tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Master Data Lokasi Fisik Arsip</span>
          </h2>
          <p className="text-xs text-text-secondary">
            Konfigurasi tata letak berjenjang: Ruang Penyimpanan → Rak → Shaf → Boks Arsip
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>Tambah {activeTab.toUpperCase()} Baru</span>
        </button>
      </div>

      {/* Tab Navigasi Level Lokasi */}
      <div className="flex items-center gap-2 border-b border-border-color overflow-x-auto">
        {[
          { key: 'ruang', label: '1. Ruang Arsip', icon: Building2, count: ruangList.length },
          { key: 'rak', label: '2. Rak Lemari', icon: Layers, count: rakList.length },
          { key: 'shaf', label: '3. Shaf / Ambalan', icon: Archive, count: shafList.length },
          { key: 'boks', label: '4. Boks Arsip', icon: Box, count: boksList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as 'ruang' | 'rak' | 'shaf' | 'boks')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold font-sans border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-text-secondary hover:text-text-main'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Konten Tab */}
      {isLoading.global ? (
        <SkeletonTable rows={6} />
      ) : (
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
          {/* TAB 1: RUANG */}
          {activeTab === 'ruang' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-dark text-white font-bold uppercase">
                    <th className="py-3 px-4 w-[8%] text-center">ID</th>
                    <th className="py-3 px-4 w-[16%]">Kode Ruang</th>
                    <th className="py-3 px-4 w-[28%]">Nama Ruangan</th>
                    <th className="py-3 px-4 w-[28%]">Deskripsi</th>
                    <th className="py-3 px-4 w-[10%] text-center">Jumlah Rak</th>
                    <th className="py-3 px-4 w-[10%] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {ruangList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-secondary italic">
                        Belum ada data ruang arsip.
                      </td>
                    </tr>
                  ) : (
                    ruangList.map((ruang) => (
                      <tr key={ruang.id} className="hover:bg-primary/5">
                        <td className="py-3 px-4 font-mono text-center text-text-secondary">{ruang.id}</td>
                        <td className="py-3 px-4 font-mono font-bold text-primary">{ruang.kode}</td>
                        <td className="py-3 px-4 font-semibold text-text-main">{ruang.nama}</td>
                        <td className="py-3 px-4 text-text-secondary">{ruang.deskripsi || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                            {ruang.raks_count ?? '-'} Rak
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(ruang)}
                              title="Edit Ruang"
                              className="p-1.5 rounded-lg border border-border-color hover:bg-gray-100 text-text-secondary transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  show: true,
                                  type: 'ruang',
                                  id: ruang.id,
                                  title: `Ruang ${ruang.kode} (${ruang.nama})`,
                                })
                              }
                              title="Hapus Ruang"
                              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: RAK */}
          {activeTab === 'rak' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-dark text-white font-bold uppercase">
                    <th className="py-3 px-4 w-[8%] text-center">ID</th>
                    <th className="py-3 px-4 w-[20%]">Kode Rak</th>
                    <th className="py-3 px-4 w-[35%]">Ruang Induk</th>
                    <th className="py-3 px-4 w-[17%] text-center">Jumlah Shaf</th>
                    <th className="py-3 px-4 w-[20%] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {rakList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-secondary italic">
                        Belum ada data rak lemari.
                      </td>
                    </tr>
                  ) : (
                    rakList.map((rak) => (
                      <tr key={rak.id} className="hover:bg-primary/5">
                        <td className="py-3 px-4 font-mono text-center text-text-secondary">{rak.id}</td>
                        <td className="py-3 px-4 font-mono font-bold text-primary">{rak.kode}</td>
                        <td className="py-3 px-4 font-semibold text-text-main">
                          {rak.ruang ? `${rak.ruang.kode} — ${rak.ruang.nama}` : `Ruang ID ${rak.ruang_id}`}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                            {rak.shafs_count ?? '-'} Shaf
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(rak)}
                              title="Edit Rak"
                              className="p-1.5 rounded-lg border border-border-color hover:bg-gray-100 text-text-secondary transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  show: true,
                                  type: 'rak',
                                  id: rak.id,
                                  title: `Rak ${rak.kode}`,
                                })
                              }
                              title="Hapus Rak"
                              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: SHAF */}
          {activeTab === 'shaf' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-dark text-white font-bold uppercase">
                    <th className="py-3 px-4 w-[8%] text-center">ID</th>
                    <th className="py-3 px-4 w-[20%]">Kode Shaf</th>
                    <th className="py-3 px-4 w-[22%]">Rak Induk</th>
                    <th className="py-3 px-4 w-[25%]">Ruang</th>
                    <th className="py-3 px-4 w-[10%] text-center">Jumlah Boks</th>
                    <th className="py-3 px-4 w-[15%] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {shafList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-secondary italic">
                        Belum ada data shaf / ambalan.
                      </td>
                    </tr>
                  ) : (
                    shafList.map((shaf) => (
                      <tr key={shaf.id} className="hover:bg-primary/5">
                        <td className="py-3 px-4 font-mono text-center text-text-secondary">{shaf.id}</td>
                        <td className="py-3 px-4 font-mono font-bold text-primary">{shaf.kode}</td>
                        <td className="py-3 px-4 font-semibold text-text-main">
                          {shaf.rak ? `Rak ${shaf.rak.kode}` : `Rak ID ${shaf.rak_id}`}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {shaf.rak?.ruang ? `${shaf.rak.ruang.nama}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                            {shaf.boks_count ?? '-'} Boks
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(shaf)}
                              title="Edit Shaf"
                              className="p-1.5 rounded-lg border border-border-color hover:bg-gray-100 text-text-secondary transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  show: true,
                                  type: 'shaf',
                                  id: shaf.id,
                                  title: `Shaf ${shaf.kode}`,
                                })
                              }
                              title="Hapus Shaf"
                              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: BOKS */}
          {activeTab === 'boks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-dark text-white font-bold uppercase">
                    <th className="py-3 px-4 w-[6%] text-center">ID</th>
                    <th className="py-3 px-4 w-[14%]">Nomor Boks</th>
                    <th className="py-3 px-4 w-[16%]">Shaf Induk</th>
                    <th className="py-3 px-4 w-[14%]">Rak</th>
                    <th className="py-3 px-4 w-[16%]">Ruang</th>
                    <th className="py-3 px-4 w-[12%]">Kapasitas</th>
                    <th className="py-3 px-4 w-[12%]">Status Keterisian</th>
                    <th className="py-3 px-4 w-[10%] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {boksList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-text-secondary italic">
                        Belum ada data boks arsip.
                      </td>
                    </tr>
                  ) : (
                    boksList.map((boks) => {
                      const kapasitas = boks.kapasitas || 50;
                      const terisi = boks.terisi || 0;
                      const persentase = Math.min(Math.round((terisi / kapasitas) * 100), 100);

                      let barColor = 'bg-green-600';
                      let badgeStyle = 'bg-green-100 text-green-800';

                      if (persentase >= 90) {
                        barColor = 'bg-red-600';
                        badgeStyle = 'bg-red-100 text-red-800';
                      } else if (persentase >= 70) {
                        barColor = 'bg-amber-500';
                        badgeStyle = 'bg-amber-100 text-amber-800';
                      }

                      return (
                        <tr key={boks.id} className="hover:bg-primary/5">
                          <td className="py-3 px-4 font-mono text-center text-text-secondary">{boks.id}</td>
                          <td className="py-3 px-4 font-mono font-black text-primary">
                            Boks {boks.nomor}
                          </td>
                          <td className="py-3 px-4 font-semibold text-text-main">
                            {boks.shaf ? `Shaf ${boks.shaf.kode}` : `Shaf ID ${boks.shaf_id}`}
                          </td>
                          <td className="py-3 px-4 text-text-secondary">
                            {boks.shaf?.rak ? `Rak ${boks.shaf.rak.kode}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-text-secondary">
                            {boks.shaf?.rak?.ruang ? boks.shaf.rak.ruang.nama : '-'}
                          </td>
                          <td className="py-3 px-4 font-bold text-text-main">
                            {kapasitas} Dokumen
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${badgeStyle}`}
                              >
                                {terisi}/{kapasitas} Terisi
                              </span>
                              <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${barColor} transition-all duration-300`}
                                  style={{ width: `${persentase}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(boks)}
                                title="Edit Boks"
                                className="p-1.5 rounded-lg border border-border-color hover:bg-gray-100 text-text-secondary transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirm({
                                    show: true,
                                    type: 'boks',
                                    id: boks.id,
                                    title: `Boks ${boks.nomor}`,
                                  })
                                }
                                title="Hapus Boks"
                                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL FORM TAMBAH / EDIT DENGAN PIIHAN INDUK BERURUTAN       */}
      {/* ============================================================ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
          <div
            className="fixed inset-0"
            onClick={isSubmitting ? undefined : () => setShowModal(false)}
            aria-hidden="true"
          />

          <div
            className={`relative w-full ${
              activeTab === 'boks' ? 'max-w-lg' : 'max-w-md'
            } bg-white rounded-2xl shadow-2xl border border-border-color p-6 z-10 max-h-[90vh] overflow-y-auto animate-modal-in`}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-border-color mb-4">
              <h3 className="text-base font-bold text-primary-dark">
                {modalMode === 'add' ? 'Tambah' : 'Edit'}{' '}
                {activeTab === 'ruang'
                  ? 'Ruang Arsip'
                  : activeTab === 'rak'
                  ? 'Rak Lemari'
                  : activeTab === 'shaf'
                  ? 'Shaf / Ambalan'
                  : 'Boks Arsip'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="p-1.5 rounded-full text-text-secondary hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* ============================================================ */}
              {/* FORM TAB 1: RUANG                                            */}
              {/* ============================================================ */}
              {activeTab === 'ruang' && (
                <>
                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      Nama Ruang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ruangNama}
                      onChange={(e) => {
                        setRuangNama(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, nama: '' }));
                      }}
                      placeholder="Contoh: Ruang Arsip A"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-border-color focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                    {fieldErrors.nama && (
                      <p className="text-red-500 text-[11px] mt-1">{fieldErrors.nama}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      Kode Ruang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ruangKode}
                      onChange={(e) => {
                        setRuangKode(e.target.value.toUpperCase());
                        setFieldErrors((prev) => ({ ...prev, kode: '' }));
                      }}
                      placeholder="Contoh: RA-A"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-border-color font-mono focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                    <p className="text-[10px] text-text-secondary mt-1">
                      Kode unik untuk identifikasi ruang (otomatis huruf kapital).
                    </p>
                    {fieldErrors.kode && (
                      <p className="text-red-500 text-[11px] mt-1">{fieldErrors.kode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      Deskripsi (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      value={ruangDeskripsi}
                      onChange={(e) => setRuangDeskripsi(e.target.value)}
                      placeholder="Contoh: Ruang penyimpanan dokumen tahun 2020-2024"
                      className="w-full px-3 py-2 rounded-xl border border-border-color focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              {/* ============================================================ */}
              {/* FORM TAB 2: RAK (WAJIB PILIH RUANG INDUK)                    */}
              {/* ============================================================ */}
              {activeTab === 'rak' && (
                <>
                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      Pilih Ruang Induk <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rakRuangId || ''}
                      onChange={(e) => {
                        setRakRuangId(e.target.value ? Number(e.target.value) : null);
                        setFieldErrors((prev) => ({ ...prev, ruang_id: '' }));
                      }}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-border-color bg-white focus:ring-2 focus:ring-primary focus:outline-hidden"
                    >
                      <option value="">-- Pilih Ruang --</option>
                      {ruangList.map((ruang) => (
                        <option key={ruang.id} value={ruang.id}>
                          {ruang.kode} — {ruang.nama}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-text-secondary mt-1">Rak ini berada di ruang mana?</p>
                    {fieldErrors.ruang_id && (
                      <p className="text-red-500 text-[11px] mt-1">{fieldErrors.ruang_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      Kode Rak <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rakKode}
                      onChange={(e) => {
                        setRakKode(e.target.value.toUpperCase());
                        setFieldErrors((prev) => ({ ...prev, kode: '' }));
                      }}
                      placeholder="Contoh: RA-A-01"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-border-color font-mono focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                    <p className="text-[10px] text-text-secondary mt-1">
                      Kode unik rak dalam ruang ini (contoh: RA-A-01).
                    </p>
                    {fieldErrors.kode && (
                      <p className="text-red-500 text-[11px] mt-1">{fieldErrors.kode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      Nama / Label (Opsional)
                    </label>
                    <input
                      type="text"
                      value={rakNama}
                      onChange={(e) => setRakNama(e.target.value)}
                      placeholder="Contoh: Rak Lemari 1"
                      className="w-full px-3 py-2 rounded-xl border border-border-color focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              {/* ============================================================ */}
              {/* FORM TAB 3: SHAF (CASCADING: RUANG -> RAK)                   */}
              {/* ============================================================ */}
              {activeTab === 'shaf' && (
                <>
                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      1. Pilih Ruang Induk <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={shafRuangId || ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setShafRuangId(val);
                        setShafRakId(null); // Reset rak pilihan saat ruang berganti
                      }}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-border-color bg-white focus:ring-2 focus:ring-primary focus:outline-hidden"
                    >
                      <option value="">-- Pilih Ruang dulu --</option>
                      {ruangList.map((ruang) => (
                        <option key={ruang.id} value={ruang.id}>
                          {ruang.kode} — {ruang.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      2. Pilih Rak Induk <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={shafRakId || ''}
                      onChange={(e) => {
                        setShafRakId(e.target.value ? Number(e.target.value) : null);
                        setFieldErrors((prev) => ({ ...prev, rak_id: '' }));
                      }}
                      disabled={!shafRuangId}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-border-color bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary focus:outline-hidden"
                    >
                      <option value="">
                        {!shafRuangId ? '-- Pilih Ruang terlebih dahulu --' : '-- Pilih Rak --'}
                      </option>
                      {filteredRaksForShaf.map((rak) => (
                        <option key={rak.id} value={rak.id}>
                          {rak.kode}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-text-secondary mt-1">Shaf ini berada di rak mana?</p>
                    {fieldErrors.rak_id && (
                      <p className="text-red-500 text-[11px] mt-1">{fieldErrors.rak_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      3. Kode Shaf <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shafKode}
                      onChange={(e) => {
                        setShafKode(e.target.value.toUpperCase());
                        setFieldErrors((prev) => ({ ...prev, kode: '' }));
                      }}
                      placeholder="Contoh: SH-01"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-border-color font-mono focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                    {fieldErrors.kode && (
                      <p className="text-red-500 text-[11px] mt-1">{fieldErrors.kode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-text-main uppercase mb-1">
                      Nama / Label (Opsional)
                    </label>
                    <input
                      type="text"
                      value={shafNama}
                      onChange={(e) => setShafNama(e.target.value)}
                      placeholder="Contoh: Shaf Tingkat 1"
                      className="w-full px-3 py-2 rounded-xl border border-border-color focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              {/* ============================================================ */}
              {/* FORM TAB 4: BOKS (CASCADING 3 LEVEL: RUANG -> RAK -> SHAF)   */}
              {/* ============================================================ */}
              {activeTab === 'boks' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-text-main uppercase mb-1">
                        1. Ruang Induk <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={boksRuangId || ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : null;
                          setBoksRuangId(val);
                          setBoksRakId(null);
                          setBoksShafId(null);
                        }}
                        required
                        className="w-full px-2.5 py-2 rounded-xl border border-border-color bg-white focus:ring-2 focus:ring-primary focus:outline-hidden"
                      >
                        <option value="">-- Ruang --</option>
                        {ruangList.map((ruang) => (
                          <option key={ruang.id} value={ruang.id}>
                            {ruang.kode}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-text-main uppercase mb-1">
                        2. Rak Induk <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={boksRakId || ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : null;
                          setBoksRakId(val);
                          setBoksShafId(null);
                        }}
                        disabled={!boksRuangId}
                        required
                        className="w-full px-2.5 py-2 rounded-xl border border-border-color bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary focus:outline-hidden"
                      >
                        <option value="">-- Rak --</option>
                        {filteredRaksForBoks.map((rak) => (
                          <option key={rak.id} value={rak.id}>
                            {rak.kode}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-text-main uppercase mb-1">
                        3. Shaf Induk <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={boksShafId || ''}
                        onChange={(e) => {
                          setBoksShafId(e.target.value ? Number(e.target.value) : null);
                          setFieldErrors((prev) => ({ ...prev, shaf_id: '' }));
                        }}
                        disabled={!boksRakId}
                        required
                        className="w-full px-2.5 py-2 rounded-xl border border-border-color bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary focus:outline-hidden"
                      >
                        <option value="">-- Shaf --</option>
                        {filteredShafsForBoks.map((shaf) => (
                          <option key={shaf.id} value={shaf.id}>
                            {shaf.kode}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {fieldErrors.shaf_id && (
                    <p className="text-red-500 text-[11px]">{fieldErrors.shaf_id}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-text-main uppercase mb-1">
                        Nomor Boks <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={boksNomor}
                        onChange={(e) => {
                          setBoksNomor(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, nomor: '' }));
                        }}
                        placeholder="Contoh: 001"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-border-color font-mono focus:ring-2 focus:ring-primary focus:outline-hidden"
                      />
                      <p className="text-[10px] text-text-secondary mt-1">
                        Nomor urut boks dalam shaf ini.
                      </p>
                      {fieldErrors.nomor && (
                        <p className="text-red-500 text-[11px] mt-1">{fieldErrors.nomor}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-text-main uppercase mb-1">
                        Kapasitas Maksimal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={boksKapasitas}
                        onChange={(e) => {
                          setBoksKapasitas(Number(e.target.value));
                          setFieldErrors((prev) => ({ ...prev, kapasitas: '' }));
                        }}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-border-color font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-hidden"
                      />
                      <p className="text-[10px] text-text-secondary mt-1">
                        Rentang isi: 1 – 500 dokumen fisik.
                      </p>
                      {fieldErrors.kapasitas && (
                        <p className="text-red-500 text-[11px] mt-1">{fieldErrors.kapasitas}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Kapasitas boks yang sudah terisi dokumen tidak dapat dikurangi di bawah jumlah berkas yang sedang tersimpan.
                    </span>
                  </div>
                </>
              )}

              {/* Footer Tombol Modal */}
              <div className="pt-4 border-t border-border-color flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border rounded-xl font-semibold text-text-secondary hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'add' ? 'Simpan' : 'Perbarui'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL KONFIRMASI HAPUS                                       */}
      {/* ============================================================ */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-border-color p-6 z-10 animate-modal-in text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-primary-dark mb-1">
              Hapus {deleteConfirm.title}?
            </h3>
            <p className="text-xs text-text-secondary mb-5">
              Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada berkas atau entitas turunan di dalamnya.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ show: false, type: 'ruang', id: 0, title: '' })}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-border-color text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
