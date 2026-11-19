'use client';

import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown, User as UserIcon, LogOut, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export interface HeaderProps {
  onToggleSidebar: () => void;
  pageTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  pageTitle = 'Sistem Pelacakan Arsip Pertanahan',
}) => {
  const { user, logout } = useAuthStore();
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Live Digital Clock WIB
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
      }).format(now);
      setCurrentDateTime(`${formatted.replace(/\./g, ':')} WIB`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-primary text-white shadow-md flex items-center justify-between px-4 sm:px-6">
      {/* Sisi Kiri: Hamburger + Judul Halaman */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-white hover:bg-primary-light/40 md:hidden focus:outline-none"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm font-semibold font-sans">
          <span className="text-white/70 hidden sm:inline">ATR/BPN Banyumas</span>
          <span className="text-white/40 hidden sm:inline">/</span>
          <span className="text-white text-base font-bold truncate max-w-[200px] sm:max-w-md">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Sisi Kanan: Jam WIB + Profil Dropdown */}
      <div className="flex items-center gap-4">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-white/80 font-mono bg-primary-dark/40 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span>{currentDateTime}</span>
        </div>

        <div className="h-6 w-px bg-white/20 hidden lg:block" />

        {/* User Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-primary-light/40 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-accent text-primary-dark font-black text-xs flex items-center justify-center border-2 border-white shadow-sm">
              {getInitials(user?.nama)}
            </div>

            <span className="text-xs font-semibold text-white hidden md:inline font-sans max-w-[120px] truncate">
              {user?.nama || 'Petugas'}
            </span>

            <ChevronDown className="w-4 h-4 text-white/70" />
          </button>

          {/* Dropdown Content */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowDropdown(false)}
                aria-hidden="true"
              />

              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-border-color py-2 z-40 text-text-main animate-fade-in font-sans">
                <div className="px-4 py-2 border-b border-border-color">
                  <div className="text-xs font-bold text-text-main truncate">
                    {user?.nama || 'Petugas Arsip'}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate font-mono">
                    @{user?.username || 'user'}
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-4 py-2 text-xs text-text-secondary flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Peran: <strong>{user?.role || 'USER'}</strong></span>
                  </div>
                </div>

                <div className="border-t border-border-color pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Sistem</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
