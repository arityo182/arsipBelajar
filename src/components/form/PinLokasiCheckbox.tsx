'use client';

import React from 'react';
import { Pin } from 'lucide-react';

export interface PinLokasiCheckboxProps {
  isPinned: boolean;
  onToggle: (pinned: boolean) => void;
  className?: string;
}

export const PinLokasiCheckbox: React.FC<PinLokasiCheckboxProps> = ({
  isPinned,
  onToggle,
  className = '',
}) => {
  const handleToggle = () => {
    const nextState = !isPinned;
    onToggle(nextState);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('siplok_pin_lokasi', String(nextState));
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`cursor-pointer rounded-xl border p-3.5 transition-all select-none flex items-start gap-3.5 ${
        isPinned
          ? 'bg-[#FFF8E1] border-accent shadow-xs'
          : 'bg-gray-50 border-border-color hover:bg-gray-100/70'
      } ${className}`}
    >
      <div
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors ${
          isPinned ? 'bg-primary border-primary text-accent' : 'bg-white border-gray-400'
        }`}
      >
        <Pin className={`w-3.5 h-3.5 transform -rotate-45 ${isPinned ? 'text-accent fill-accent' : 'text-gray-400'}`} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-main font-sans">
            Kunci lokasi ini untuk input berikutnya
          </span>
          {isPinned && (
            <span className="bg-accent/40 text-primary-dark text-[10px] font-extrabold px-1.5 py-0.2 rounded font-sans uppercase">
              Aktif
            </span>
          )}
        </div>
        <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
          Ruang, Rak, Shaf, dan Boks tidak akan ter-reset setelah dokumen berhasil disimpan (mempercepat input batch warkah).
        </p>
      </div>
    </div>
  );
};

export default PinLokasiCheckbox;
