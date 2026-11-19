'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/dashboard';

  const { login, isAuthenticated, isLoading: storeLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectParam);
    }
  }, [isAuthenticated, router, redirectParam]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Login berhasil! Mengalihkan ke dashboard...');
      router.push(redirectParam);
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
        const msg = apiErr?.message || 'Username atau password salah.';
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002147] via-[#002b5c] to-[#003580] flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-border-color p-8 animate-fade-in relative overflow-hidden">
        {/* Ornamen Garis Emas di Atas Card */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-accent via-accent-dark to-accent" />

        {/* Header Login */}
        <div className="text-center pt-2 pb-6">
          {/* Logo ATR/BPN */}
          <div className="w-16 h-16 mx-auto rounded-full bg-primary border-3 border-accent flex items-center justify-center shadow-lg mb-3">
            <span className="text-xs font-black tracking-tight text-white font-sans">
              ATR<span className="text-accent">|</span>BPN
            </span>
          </div>

          <h2 className="text-2xl font-black text-primary-dark tracking-tight font-sans">
            SIPLOK
          </h2>

          <p className="text-xs text-text-secondary mt-1">
            Sistem Informasi Pelacakan Lokasi Dokumen Fisik
          </p>

          <div className="text-[11px] font-bold text-primary mt-0.5 uppercase tracking-wide">
            Kantor Pertanahan Kabupaten Banyumas
          </div>

          <div className="w-16 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
        </div>

        {/* Formulir Login */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Input Username */}
          <div>
            <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                {...register('username')}
                placeholder="Masukkan username Anda"
                disabled={isSubmitting || storeLoading}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium text-text-main bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                  errors.username ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Masukkan kata sandi"
                disabled={isSubmitting || storeLoading}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-medium text-text-main bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                  errors.password ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-main"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Tombol Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || storeLoading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs tracking-wider uppercase font-sans shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isSubmitting || storeLoading) && (
                <LoadingSpinner size="sm" color="text-white" />
              )}
              <span>Masuk ke SIPLOK</span>
            </button>
          </div>
        </form>

        {/* Footer Card */}
        <div className="mt-8 pt-4 border-t border-border-color text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-text-secondary text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span>Kementerian ATR/BPN — Akses Internal Dinas</span>
          </div>
          <div className="text-[10px] text-gray-400">
            Gunakan akun resmi Kantor Pertanahan Banyumas untuk masuk
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-page flex items-center justify-center">
        <LoadingSpinner size="lg" color="text-primary" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
