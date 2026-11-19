'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-bg-page flex">
      {/* Sidebar Navigasi */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Kontainer Utama */}
      <div className="flex-1 flex flex-col md:pl-[260px] min-w-0 transition-all">
        {/* Header Tetap */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Isi Konten Halaman */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
