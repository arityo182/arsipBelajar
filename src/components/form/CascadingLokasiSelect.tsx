'use client';

import React from 'react';
import { useCascadingLokasi } from '@/hooks/useCascadingLokasi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Boks } from '@/types';

export interface CascadingLokasiSelectProps {
  onBoksSelect?: (boksId: number | null, boksObj?: Boks) => void;
  selectedBoksId?: number | null;
  errorMessage?: string;
  className?: string;
}

export const CascadingLokasiSelect: React.FC<CascadingLokasiSelectProps> = ({
  onBoksSelect,
  selectedBoksId,
  errorMessage,
  className = '',
}) => {
  const { lists, selected, handlers, loading } = useCascadingLokasi();

  const handleBoksChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : null;
    handlers.onBoksChange(val);

    if (onBoksSelect) {
      const boksObj = lists.boksList.find((b) => b.id === val);
      onBoksSelect(val, boksObj);
    }
  };

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 1. Pilih Ruang */}
        <div>
          <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
            Ruang Arsip *
          </label>
          <div className="relative">
            <select
              value={selected.selectedRuang || ''}
              onChange={(e) => handlers.onRuangChange(e.target.value ? Number(e.target.value) : null)}
              disabled={loading.ruang}
              className="w-full text-xs font-semibold rounded-lg border border-border-color bg-white px-3 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed shadow-2xs"
            >
              <option value="">-- Pilih Ruang --</option>
              {lists.ruangList.map((ruang) => (
                <option key={ruang.id} value={ruang.id}>
                  {ruang.nama} ({ruang.kode})
                </option>
              ))}
            </select>
            {loading.ruang && (
              <div className="absolute right-3 top-2.5">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* 2. Pilih Rak */}
        <div>
          <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
            Rak Penyimpanan *
          </label>
          <div className="relative">
            <select
              value={selected.selectedRak || ''}
              onChange={(e) => handlers.onRakChange(e.target.value ? Number(e.target.value) : null)}
              disabled={!selected.selectedRuang || loading.rak}
              className="w-full text-xs font-semibold rounded-lg border border-border-color bg-white px-3 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed shadow-2xs"
            >
              <option value="">-- Pilih Rak --</option>
              {lists.rakList.map((rak) => (
                <option key={rak.id} value={rak.id}>
                  Rak {rak.kode}
                </option>
              ))}
            </select>
            {loading.rak && (
              <div className="absolute right-3 top-2.5">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* 3. Pilih Shaf */}
        <div>
          <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
            Shaf / Ambalan *
          </label>
          <div className="relative">
            <select
              value={selected.selectedShaf || ''}
              onChange={(e) => handlers.onShafChange(e.target.value ? Number(e.target.value) : null)}
              disabled={!selected.selectedRak || loading.shaf}
              className="w-full text-xs font-semibold rounded-lg border border-border-color bg-white px-3 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed shadow-2xs"
            >
              <option value="">-- Pilih Shaf --</option>
              {lists.shafList.map((shaf) => (
                <option key={shaf.id} value={shaf.id}>
                  Shaf {shaf.kode}
                </option>
              ))}
            </select>
            {loading.shaf && (
              <div className="absolute right-3 top-2.5">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* 4. Pilih Boks */}
        <div>
          <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
            Boks Arsip *
          </label>
          <div className="relative">
            <select
              value={selectedBoksId !== undefined ? selectedBoksId || '' : selected.selectedBoks || ''}
              onChange={handleBoksChange}
              disabled={!selected.selectedShaf || loading.boks}
              className={`w-full text-xs font-semibold rounded-lg border bg-white px-3 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed shadow-2xs ${
                errorMessage ? 'border-red-500' : 'border-border-color'
              }`}
            >
              <option value="">-- Pilih Boks --</option>
              {lists.boksList.map((boks) => {
                const sisa = boks.sisa !== undefined ? boks.sisa : boks.kapasitas - boks.terisi;
                const isFull = sisa <= 0;
                const isAlmostFull = sisa > 0 && sisa < 5;

                let optionText = `Boks ${boks.nomor} (${boks.terisi}/${boks.kapasitas} terisi)`;
                if (isFull) {
                  optionText = `Boks ${boks.nomor} (${boks.kapasitas}/${boks.kapasitas} — PENUH)`;
                } else if (isAlmostFull) {
                  optionText = `Boks ${boks.nomor} (${boks.terisi}/${boks.kapasitas} — Hampir Penuh)`;
                }

                return (
                  <option
                    key={boks.id}
                    value={boks.id}
                    disabled={isFull}
                    className={isFull ? 'text-red-600 font-bold' : isAlmostFull ? 'text-amber-600 font-medium' : ''}
                  >
                    {optionText}
                  </option>
                );
              })}
            </select>
            {loading.boks && (
              <div className="absolute right-3 top-2.5">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {errorMessage && <p className="text-xs text-red-500 font-medium">{errorMessage}</p>}
    </div>
  );
};

export default CascadingLokasiSelect;
