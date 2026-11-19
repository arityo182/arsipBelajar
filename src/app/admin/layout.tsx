'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    // Validasi otorisasi peran ADMIN
    if (!isLoading && isAuthenticated && user && user.role !== 'ADMIN') {
      router.replace('/dashboard?error=forbidden');
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center p-4">
        <LoadingSpinner size="lg" color="text-primary" />
        <p className="mt-4 text-sm font-semibold text-text-secondary font-sans">
          Memverifikasi hak akses administrator...
        </p>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-page flex">
      {/* Sidebar Navigasi */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Kontainer Utama Konten Admin */}
      <div className="flex-1 flex flex-col md:pl-[260px] min-w-0 transition-all">
        {/* Header Atas */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle="Panel Administrasi SIPLOK"
        />

        {/* Konten Halaman Admin */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
