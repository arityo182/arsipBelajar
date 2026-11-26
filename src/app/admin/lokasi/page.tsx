'use client';

import React, { useState } from 'react';
import {
  Plus,
  BookOpen,
  Archive,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Layers,
  Building,
  AlignJustify,
} from 'lucide-react';
import { Ruang, Rak, Shaf, Album } from '@/types';
import { useLokasiAdmin } from '@/hooks/useLokasiAdmin';
import SkeletonTable from '@/components/ui/Skeleton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

type TabType = 'ruang' | 'rak' | 'tingkat' | 'album';

export default function MasterLokasiPage() {
  const [activeTab, setActiveTab] = useState<TabType>('album');

  const {
    ruangList,
    rakList,
    shafList,
    albumList,
    isLoading,
    createRuang,
    updateRuang,
    deleteRuang,
    createRak,
    updateRak,
    deleteRak,
    createTingkat,
    updateTingkat,
    deleteTingkat,
    createAlbum,
    updateAlbum,
    deleteAlbum,
  } = useLokasiAdmin();

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<Ruang | Rak | Shaf | Album | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State: Ruang
  const [ruangKode, setRuangKode] = useState<string>('');
  const [ruangNama, setRuangNama] = useState<string>('');
  const [ruangDeskripsi, setRuangDeskripsi] = useState<string>('');

  // Form State: Rak
  const [rakKode, setRakKode] = useState<string>('');
  const [rakRuangId, setRakRuangId] = useState<number | null>(null);

  // Form State: Tingkat (Shaf)
  const [tingkatKode, setTingkatKode] = useState<string>('');
  const [tingkatRakId, setTingkatRakId] = useState<number | null>(null);

  // Form State: Album
  const [albumRakId, setAlbumRakId] = useState<number | null>(null);
  const [albumNomor, setAlbumNomor] = useState<string>('');
  const [albumTingkat, setAlbumTingkat] = useState<string>('1');
  const [albumPosisi, setAlbumPosisi] = useState<string>('');
  const [albumKapasitas, setAlbumKapasitas] = useState<number>(30);

  // Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    type: TabType;
    id: number;
    title: string;
  }>({
    show: false,
    type: 'album',
    id: 0,
    title: '',
  });

  const resetForm = () => {
    setEditingItem(null);
    setRuangKode('');
    setRuangNama('');
    setRuangDeskripsi('');
    setRakKode('');
    setRakRuangId(ruangList[0]?.id || null);
    setTingkatKode('');
    setTingkatRakId(rakList[0]?.id || null);
    setAlbumRakId(rakList[0]?.id || null);
    setAlbumNomor('');
    setAlbumTingkat('1');
    setAlbumPosisi('');
    setAlbumKapasitas(30);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalMode('add');
    if (activeTab === 'rak' && ruangList.length > 0) {
      setRakRuangId(ruangList[0].id);
    } else if (activeTab === 'tingkat' && rakList.length > 0) {
      setTingkatRakId(rakList[0].id);
    } else if (activeTab === 'album' && rakList.length > 0) {
      setAlbumRakId(rakList[0].id);
    }
    setShowModal(true);
  };

  const handleOpenEdit = (item: Ruang | Rak | Shaf | Album) => {
    resetForm();
    setModalMode('edit');
    setEditingItem(item);

    if (activeTab === 'ruang') {
      const r = item as Ruang;
      setRuangKode(r.kode);
      setRuangNama(r.nama);
      setRuangDeskripsi(r.deskripsi || '');
    } else if (activeTab === 'rak') {
      const rak = item as Rak;
      setRakKode(rak.kode);
      setRakRuangId(rak.ruang_id || null);
    } else if (activeTab === 'tingkat') {
      const t = item as Shaf;
      setTingkatKode(t.kode);
      setTingkatRakId(t.rak_id);
    } else {
      const alb = item as Album;
      setAlbumRakId(alb.rak_id);
      setAlbumNomor(String(alb.nomor_album));
      setAlbumTingkat(alb.tingkat || '1');
      setAlbumPosisi(alb.posisi || '');
      setAlbumKapasitas(alb.kapasitas || 30);
    }

    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'ruang') {
        if (!ruangKode.trim() || !ruangNama.trim()) {
          toast.error('Kode dan Nama ruang wajib diisi');
          setIsSubmitting(false);
          return;
        }
        if (modalMode === 'add') {
          await createRuang({ kode: ruangKode.trim(), nama: ruangNama.trim(), deskripsi: ruangDeskripsi.trim() });
          toast.success('Ruangan berhasil ditambahkan!');
        } else if (editingItem) {
          await updateRuang(editingItem.id, { kode: ruangKode.trim(), nama: ruangNama.trim(), deskripsi: ruangDeskripsi.trim() });
          toast.success('Ruangan berhasil diperbarui!');
        }
      } else if (activeTab === 'rak') {
        if (!rakKode.trim() || !rakRuangId) {
          toast.error('Kode rak dan Ruangan induk wajib diisi');
          setIsSubmitting(false);
          return;
        }
        if (modalMode === 'add') {
          await createRak({ kode: rakKode.trim(), ruang_id: rakRuangId });
          toast.success('Rak berhasil ditambahkan!');
        } else if (editingItem) {
          await updateRak(editingItem.id, { kode: rakKode.trim(), ruang_id: rakRuangId });
          toast.success('Rak berhasil diperbarui!');
        }
      } else if (activeTab === 'tingkat') {
        if (!tingkatKode.trim() || !tingkatRakId) {
          toast.error('Nomor/Nama tingkat dan Rak induk wajib diisi');
          setIsSubmitting(false);
          return;
        }
        if (modalMode === 'add') {
          await createTingkat({ kode: tingkatKode.trim(), rak_id: tingkatRakId });
          toast.success('Tingkatan rak berhasil ditambahkan!');
        } else if (editingItem) {
          await updateTingkat(editingItem.id, { kode: tingkatKode.trim(), rak_id: tingkatRakId });
          toast.success('Tingkatan rak berhasil diperbarui!');
        }
      } else {
        // Tab Album
        const numAlbum = parseInt(albumNomor, 10);
        if (isNaN(numAlbum) || numAlbum <= 0) {
          toast.error('Nomor album harus berupa angka bulat positif');
          setIsSubmitting(false);
          return;
        }
        if (!albumRakId) {
          toast.error('Pilih rak penyimpanan terlebih dahulu');
          setIsSubmitting(false);
          return;
        }
        const payload = {
          rak_id: albumRakId,
          nomor_album: numAlbum,
          tingkat: albumTingkat.trim() || null,
          posisi: albumPosisi.trim() || null,
          kapasitas: albumKapasitas,
        };

        if (modalMode === 'add') {
          await createAlbum(payload);
          toast.success('Album berhasil ditambahkan!');
        } else if (editingItem) {
          await updateAlbum(editingItem.id, payload);
          toast.success('Album berhasil diperbarui!');
        }
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menyimpan data';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      if (deleteConfirm.type === 'ruang') {
        await deleteRuang(deleteConfirm.id);
        toast.success('Ruangan berhasil dihapus!');
      } else if (deleteConfirm.type === 'rak') {
        await deleteRak(deleteConfirm.id);
        toast.success('Rak berhasil dihapus!');
      } else if (deleteConfirm.type === 'tingkat') {
        await deleteTingkat(deleteConfirm.id);
        toast.success('Tingkatan berhasil dihapus!');
      } else {
        await deleteAlbum(deleteConfirm.id);
        toast.success('Album berhasil dihapus!');
      }
      setDeleteConfirm({ show: false, type: 'album', id: 0, title: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menghapus data';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case 'ruang':
        return 'Ruangan';
      case 'rak':
        return 'Rak';
      case 'tingkat':
        return 'Tingkatan';
      case 'album':
        return 'Album';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-color">
        <div>
          <h1 className="text-xl font-bold text-primary-dark flex items-center gap-2">
            <Archive className="w-5 h-5 text-primary" />
            Master Lokasi Fisik Arsip DI-302
          </h1>
          <p className="text-xs text-text-secondary">
            Kelola hirarki 4 tingkat: Ruangan &rarr; Rak &rarr; Tingkatan &rarr; Album Arsip
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah {getTabTitle(activeTab)}</span>
        </button>
      </div>

      {/* Tab Navigasi 4 Tingkat */}
      <div className="flex border-b border-border-color overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ruang')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'ruang'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-main'
          }`}
        >
          <Building className="w-4 h-4" />
          1. Ruangan ({ruangList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rak')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'rak'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-main'
          }`}
        >
          <Layers className="w-4 h-4" />
          2. Rak Lemari ({rakList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tingkat')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'tingkat'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-main'
          }`}
        >
          <AlignJustify className="w-4 h-4" />
          3. Tingkatan Rak ({shafList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('album')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'album'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-main'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          4. Album Arsip ({albumList.length})
        </button>
      </div>

      {/* Konten Tab */}
      {isLoading.global ? (
        <SkeletonTable rows={6} />
      ) : activeTab === 'ruang' ? (
        /* TAB 1 — RUANGAN */
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-dark text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-[10%]">No.</th>
                  <th className="py-3 px-4 w-[25%]">Kode Ruang</th>
                  <th className="py-3 px-4 w-[35%]">Nama Ruang</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-center w-[15%]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {ruangList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-secondary">
                      Belum ada ruangan arsip yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  ruangList.map((ruang, idx) => (
                    <tr key={ruang.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-text-secondary font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-primary font-mono">{ruang.kode}</td>
                      <td className="py-3 px-4 font-medium text-text-main">{ruang.nama}</td>
                      <td className="py-3 px-4 text-text-secondary">{ruang.deskripsi || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ruang)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                            title="Edit Ruang"
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
                                title: `Ruang ${ruang.nama} (${ruang.kode})`,
                              })
                            }
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Ruang"
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
        </div>
      ) : activeTab === 'rak' ? (
        /* TAB 2 — RAK */
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-dark text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-[10%]">No.</th>
                  <th className="py-3 px-4 w-[30%]">Kode Rak</th>
                  <th className="py-3 px-4 w-[40%]">Ruangan Induk</th>
                  <th className="py-3 px-4 text-center w-[20%]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {rakList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-secondary">
                      Belum ada rak yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  rakList.map((rak, idx) => (
                    <tr key={rak.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-text-secondary font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-primary font-mono">{rak.kode}</td>
                      <td className="py-3 px-4 font-medium text-text-main">
                        {rak.ruang ? `${rak.ruang.nama} (${rak.ruang.kode})` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rak)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                            title="Edit Rak"
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
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Rak"
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
        </div>
      ) : activeTab === 'tingkat' ? (
        /* TAB 3 — TINGKATAN RAK */
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-dark text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-[10%]">No.</th>
                  <th className="py-3 px-4 w-[25%]">Nama / Nomor Tingkat</th>
                  <th className="py-3 px-4 w-[30%]">Rak Lemari</th>
                  <th className="py-3 px-4 w-[20%]">Ruangan</th>
                  <th className="py-3 px-4 text-center w-[15%]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {shafList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-secondary">
                      Belum ada tingkatan rak yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  shafList.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-text-secondary font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-primary">Tingkat {t.kode}</td>
                      <td className="py-3 px-4 font-medium text-text-main">
                        Rak {t.rak?.kode || '-'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {t.rak?.ruang?.nama || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                            title="Edit Tingkat"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                show: true,
                                type: 'tingkat',
                                id: t.id,
                                title: `Tingkat ${t.kode} pada Rak ${t.rak?.kode || '-'}`,
                              })
                            }
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Tingkat"
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
        </div>
      ) : (
        /* TAB 4 — ALBUM ARSIP */
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-dark text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">No. Album</th>
                  <th className="py-3 px-3 text-center">Rak</th>
                  <th className="py-3 px-3 text-center">Tingkat</th>
                  <th className="py-3 px-3 text-center">Posisi</th>
                  <th className="py-3 px-3 text-center">Kapasitas</th>
                  <th className="py-3 px-3 text-center">Terisi</th>
                  <th className="py-3 px-3 text-center">Sisa</th>
                  <th className="py-3 px-4 text-center w-[12%]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {albumList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-text-secondary">
                      Belum ada album arsip yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  albumList.map((alb) => (
                    <tr key={alb.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-text-main flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Album {alb.nomor_album}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">
                        {alb.rak_kode || 'E'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-text-secondary">
                        {alb.tingkat ? `Tingkat ${alb.tingkat}` : 'Tingkat 1'}
                      </td>
                      <td className="py-3 px-3 text-center text-text-secondary">
                        {alb.posisi || '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-text-main">
                        {alb.kapasitas} berkas
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {alb.terisi}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`font-bold ${
                            alb.sisa === 0
                              ? 'text-danger'
                              : alb.sisa <= 5
                              ? 'text-amber-600'
                              : 'text-text-secondary'
                          }`}
                        >
                          {alb.sisa}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(alb)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                            title="Edit Album"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                show: true,
                                type: 'album',
                                id: alb.id,
                                title: `Album ${alb.nomor_album}`,
                              })
                            }
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Album"
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
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-border-color overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-color bg-slate-50">
              <h3 className="font-bold text-sm text-primary-dark">
                {modalMode === 'add' ? 'Tambah' : 'Edit'} {getTabTitle(activeTab)}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-text-secondary hover:text-text-main p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {activeTab === 'ruang' && (
                <>
                  <div>
                    <label className="block font-bold text-text-main mb-1">
                      Kode Ruang <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={ruangKode}
                      onChange={(e) => setRuangKode(e.target.value.toUpperCase())}
                      placeholder="Contoh: RA-DI302"
                      className="w-full px-3 py-2 border border-border-color rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-text-main mb-1">
                      Nama Ruangan <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={ruangNama}
                      onChange={(e) => setRuangNama(e.target.value)}
                      placeholder="Contoh: Ruang Arsip DI-302"
                      className="w-full px-3 py-2 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-text-main mb-1">Deskripsi Ruangan</label>
                    <textarea
                      rows={2}
                      value={ruangDeskripsi}
                      onChange={(e) => setRuangDeskripsi(e.target.value)}
                      placeholder="Deskripsi atau catatan ruangan..."
                      className="w-full px-3 py-2 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </>
              )}

              {activeTab === 'rak' && (
                <>
                  <div>
                    <label className="block font-bold text-text-main mb-1">
                      Ruangan Induk <span className="text-danger">*</span>
                    </label>
                    <select
                      value={rakRuangId || ''}
                      onChange={(e) => setRakRuangId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      <option value="">Pilih Ruangan...</option>
                      {ruangList.map((ruang) => (
                        <option key={ruang.id} value={ruang.id}>
                          {ruang.nama} ({ruang.kode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-text-main mb-1">
                      Kode / Nama Rak <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={rakKode}
                      onChange={(e) => setRakKode(e.target.value.toUpperCase())}
                      placeholder="Contoh: E, KIRI, RAK-01"
                      className="w-full px-3 py-2 border border-border-color rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === 'tingkat' && (
                <>
                  <div>
                    <label className="block font-bold text-text-main mb-1">
                      Rak Induk <span className="text-danger">*</span>
                    </label>
                    <select
                      value={tingkatRakId || ''}
                      onChange={(e) => setTingkatRakId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      <option value="">Pilih Rak...</option>
                      {rakList.map((rak) => (
                        <option key={rak.id} value={rak.id}>
                          Rak {rak.kode} {rak.ruang ? `(${rak.ruang.nama})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-text-main mb-1">
                      Nama / Nomor Tingkat <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={tingkatKode}
                      onChange={(e) => setTingkatKode(e.target.value)}
                      placeholder="Contoh: 1, 2, 3, 4"
                      className="w-full px-3 py-2 border border-border-color rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                    <p className="text-[11px] text-text-secondary mt-1">
                      Contoh: Masukkan &quot;1&quot; untuk Tingkat 1, &quot;2&quot; untuk Tingkat 2.
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'album' && (
                <>
                  <div>
                    <label className="block font-bold text-text-main mb-1">
                      Rak Penyimpanan <span className="text-danger">*</span>
                    </label>
                    <select
                      value={albumRakId || ''}
                      onChange={(e) => setAlbumRakId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      <option value="">Pilih Rak...</option>
                      {rakList.map((rak) => (
                        <option key={rak.id} value={rak.id}>
                          Rak {rak.kode} {rak.ruang ? `(${rak.ruang.nama})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-text-main mb-1">
                        Nomor Album <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={albumNomor}
                        onChange={(e) => setAlbumNomor(e.target.value)}
                        placeholder="Contoh: 1, 2..."
                        className="w-full px-3 py-2 border border-border-color rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-text-main mb-1">Tingkatan Rak</label>
                      <input
                        type="text"
                        value={albumTingkat}
                        onChange={(e) => setAlbumTingkat(e.target.value)}
                        placeholder="Contoh: 1, 2, 3, 4"
                        className="w-full px-3 py-2 border border-border-color rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-text-main mb-1">Posisi di Rak (Opsional)</label>
                      <input
                        type="text"
                        value={albumPosisi}
                        onChange={(e) => setAlbumPosisi(e.target.value)}
                        placeholder="Contoh: Kiri, Kanan..."
                        className="w-full px-3 py-2 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-text-main mb-1">
                        Kapasitas Berkas <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={albumKapasitas}
                        onChange={(e) => setAlbumKapasitas(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-border-color text-text-secondary hover:text-text-main hover:bg-slate-50 font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting && <LoadingSpinner size="sm" />}
                  <span>{modalMode === 'add' ? 'Simpan' : 'Perbarui'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-border-color p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-danger">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-primary-dark mb-2">Konfirmasi Hapus</h3>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{deleteConfirm.title}</strong>? Aksi ini
              tidak dapat dibatalkan jika masih ada relasi data di bawahnya.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ show: false, type: 'album', id: 0, title: '' })}
                className="px-4 py-2 rounded-xl border border-border-color text-text-secondary hover:text-text-main font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-danger hover:bg-red-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <LoadingSpinner size="sm" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
