'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  FilePlus,
  Users,
  ClipboardList,
  Building2,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

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

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      label: 'Pencarian Dokumen',
      href: '/dashboard#search',
      icon: Search,
      adminOnly: false,
    },
    {
      label: 'Tambah Dokumen',
      href: '/dashboard/dokumen/tambah',
      icon: FilePlus,
      adminOnly: false,
    },
    {
      label: 'Kelola Pengguna',
      href: '/admin/users',
      icon: Users,
      adminOnly: true,
    },
    {
      label: 'Log Aktivitas',
      href: '/admin/logs',
      icon: ClipboardList,
      adminOnly: true,
    },
    {
      label: 'Master Lokasi',
      href: '/admin/lokasi',
      icon: Building2,
      adminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly) {
      return user?.role === 'ADMIN';
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-primary-dark text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl border-r border-primary-dark/80`}
      >
        {/* Header Sidebar */}
        <div className="p-5 flex items-center justify-between border-b border-accent/40 bg-[#001b3a]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {/* Logo ATR/BPN */}
            <div className="w-10 h-10 rounded-full bg-primary border-2 border-accent flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-[10px] font-black tracking-tight text-white font-sans">
                ATR<span className="text-accent">|</span>BPN
              </span>
            </div>

            <div>
              <div className="text-base font-extrabold tracking-wider font-sans text-white group-hover:text-accent transition-colors">
                SIPLOK
              </div>
              <div className="text-[11px] text-gray-300 font-medium">Kantah Kab. Banyumas</div>
            </div>
          </Link>

          {/* Close button on Mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-300 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase font-sans">
            Menu Utama
          </div>

          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                  isActive
                    ? 'bg-primary-light text-white border-l-4 border-accent shadow-sm'
                    : 'text-gray-300 hover:bg-primary-light/30 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-gray-300'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Sidebar (Profil User & Logout) */}
        <div className="p-3.5 border-t border-white/10 bg-[#001b3a]">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primary-dark/60 border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-light border-2 border-white flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow">
                {getInitials(user?.nama)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate font-sans">
                  {user?.nama || 'Petugas Arsip'}
                </div>
                <div className="mt-0.5">
                  <Badge variant={user?.role || 'USER'} size="sm" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari sistem"
              className="p-1.5 rounded-md text-red-300 hover:text-red-100 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
