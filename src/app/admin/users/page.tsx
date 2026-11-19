'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, KeyRound, ShieldAlert, Check, X, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AdminUser, PaginatedResponse, ApiResponse } from '@/types';
import { get, post, patch } from '@/lib/api';
import { storeUserSchema, StoreUserFormData } from '@/lib/validations';
import { formatDateShort } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import SkeletonTable from '@/components/ui/Skeleton';
import ConfirmModal from '@/components/ui/ConfirmModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState<boolean>(false);

  // Confirm Toggle Status Modal
  const [targetToggleUser, setTargetToggleUser] = useState<AdminUser | null>(null);
  const [showConfirmToggle, setShowConfirmToggle] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  // Reset Password Modal
  const [newPasswordResult, setNewPasswordResult] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreUserFormData>({
    resolver: zodResolver(storeUserSchema),
    defaultValues: {
      nama: '',
      username: '',
      password: '',
      role: 'USER',
    },
  });

  const fetchUsers = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const res = await get<PaginatedResponse<AdminUser>>('/admin/users', { page: currentPage, per_page: 10 });
      setUsers(res.data);
      setMeta(res.meta);
    } catch {
      toast.error('Gagal memuat daftar pengguna.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  // Handle Tambah User
  const onAddSubmit = async (data: StoreUserFormData) => {
    setIsSubmittingAdd(true);
    try {
      await post('/admin/users', data);
      toast.success(`Pengguna ${data.nama} berhasil ditambahkan!`);
      reset();
      setShowAddModal(false);
      fetchUsers(1);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiErr = err as any;
      toast.error(apiErr?.message || 'Gagal menambahkan pengguna baru.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Toggle Aktif
  const handleConfirmToggle = async () => {
    if (!targetToggleUser) return;
    setIsToggling(true);
    try {
      await patch(`/admin/users/${targetToggleUser.id}`, {
        aktif: !targetToggleUser.aktif,
      });
      toast.success(
        `Status ${targetToggleUser.nama} berhasil diubah menjadi ${!targetToggleUser.aktif ? 'Aktif' : 'Nonaktif'}`
      );
      setShowConfirmToggle(false);
      setTargetToggleUser(null);
      fetchUsers(page);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiErr = err as any;
      toast.error(apiErr?.message || 'Gagal mengubah status pengguna.');
    } finally {
      setIsToggling(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (user: AdminUser) => {
    try {
      const res = await post<ApiResponse<{ password_baru: string }>>(
        `/admin/users/${user.id}/reset-password`
      );
      setNewPasswordResult(res.data.password_baru);
    } catch {
      toast.error('Gagal mereset kata sandi pengguna.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-color">
        <div>
          <h2 className="text-xl font-black text-primary-dark font-sans tracking-tight">
            Kelola Pengguna Sistem
          </h2>
          <p className="text-xs text-text-secondary">
            Manajemen akun staf Kantor Pertanahan Kabupaten Banyumas
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-accent" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Tabel Pengguna */}
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : (
        <div className="w-full bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-primary-dark text-white font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-[5%]">No</th>
                  <th className="py-3 px-4 w-[25%]">Nama Lengkap</th>
                  <th className="py-3 px-4 w-[18%]">Username</th>
                  <th className="py-3 px-3 w-[15%]">Peran (Role)</th>
                  <th className="py-3 px-3 w-[12%]">Status</th>
                  <th className="py-3 px-3 w-[12%]">Terdaftar</th>
                  <th className="py-3 px-4 text-center w-[13%]">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-color text-text-main">
                {users.map((item, idx) => {
                  const isSelf = currentUser?.id === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-3 text-center text-text-secondary font-medium">
                        {(page - 1) * 10 + idx + 1}
                      </td>

                      <td className="py-3 px-4 font-bold text-text-main">
                        {item.nama}
                        {isSelf && (
                          <span className="ml-2 text-[10px] bg-accent/40 text-primary-dark font-bold px-1.5 py-0.5 rounded">
                            Anda
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-text-secondary">
                        @{item.username}
                      </td>

                      <td className="py-3 px-3">
                        <Badge variant={item.role} size="sm" />
                      </td>

                      <td className="py-3 px-3">
                        {item.aktif ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                            <Check className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                            <X className="w-3 h-3" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-text-secondary">
                        {formatDateShort(item.created_at)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Toggle Status Aktif */}
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => {
                              setTargetToggleUser(item);
                              setShowConfirmToggle(true);
                            }}
                            title={
                              isSelf
                                ? 'Anda tidak dapat menonaktifkan akun sendiri'
                                : item.aktif
                                ? 'Nonaktifkan Akun'
                                : 'Aktifkan Akun'
                            }
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              item.aktif
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-green-200 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleResetPassword(item)}
                            title="Reset Kata Sandi"
                            className="p-1.5 rounded-lg border border-border-color text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <KeyRound className="w-4 h-4 text-primary" />
                          </button>
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

      {/* Modal Tambah Pengguna */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border-color p-6 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border-color mb-4">
              <h3 className="text-base font-bold text-primary-dark flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <span>Tambah Pengguna SIPLOK</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-text-secondary hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-text-main uppercase mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  {...register('nama')}
                  placeholder="Contoh: Hendra Kusuma, S.T."
                  className="w-full px-3 py-2 rounded-lg border border-border-color focus:border-primary focus:outline-none"
                />
                {errors.nama && <p className="text-red-500 mt-1">{errors.nama.message}</p>}
              </div>

              <div>
                <label className="block font-bold text-text-main uppercase mb-1">Username *</label>
                <input
                  type="text"
                  {...register('username')}
                  placeholder="hendra_bpn"
                  className="w-full px-3 py-2 rounded-lg border border-border-color focus:border-primary focus:outline-none font-mono"
                />
                {errors.username && <p className="text-red-500 mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block font-bold text-text-main uppercase mb-1">Kata Sandi Awal *</label>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="Minimal 8 karakter"
                  className="w-full px-3 py-2 rounded-lg border border-border-color focus:border-primary focus:outline-none"
                />
                {errors.password && <p className="text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block font-bold text-text-main uppercase mb-1">Peran (Role) *</label>
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 rounded-lg border border-border-color focus:border-primary focus:outline-none bg-white font-semibold"
                >
                  <option value="USER">PETUGAS ARSIP (USER)</option>
                  <option value="ADMIN">ADMINISTRATOR (ADMIN)</option>
                </select>
                {errors.role && <p className="text-red-500 mt-1">{errors.role.message}</p>}
              </div>

              <div className="pt-3 border-t border-border-color flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 border border-border-color rounded-lg font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-lg flex items-center gap-2"
                >
                  {isSubmittingAdd && <LoadingSpinner size="sm" color="text-white" />}
                  <span>Simpan Pengguna</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Toggle Status */}
      <ConfirmModal
        isOpen={showConfirmToggle}
        title={targetToggleUser?.aktif ? 'Nonaktifkan Akun Pengguna?' : 'Aktifkan Akun Pengguna?'}
        message={`Apakah Anda yakin ingin ${targetToggleUser?.aktif ? 'menonaktifkan' : 'mengaktifkan'} akses untuk ${targetToggleUser?.nama}?`}
        variant={targetToggleUser?.aktif ? 'danger' : 'info'}
        isLoading={isToggling}
        onConfirm={handleConfirmToggle}
        onCancel={() => {
          setShowConfirmToggle(false);
          setTargetToggleUser(null);
        }}
      />

      {/* Modal Tampilan Hasil Reset Password */}
      {newPasswordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-border-color p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-text-main mb-1">
              Kata Sandi Berhasil Direset!
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Salin dan berikan kata sandi acak berikut kepada pengguna yang bersangkutan:
            </p>

            <div className="p-3 bg-gray-100 rounded-xl font-mono text-base font-black tracking-widest text-primary-dark select-all mb-4 border border-border-color">
              {newPasswordResult}
            </div>

            <button
              type="button"
              onClick={() => setNewPasswordResult(null)}
              className="w-full py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg"
            >
              Tutup dan Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
