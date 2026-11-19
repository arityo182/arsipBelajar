// ================================================================
// src/hooks/useDebounce.ts
// SIPLOK — Generic Value Debouncing Hook
// Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
// ================================================================

import { useState, useEffect } from 'react';

/**
 * Custom hook untuk mendebounce nilai yang sering berubah (misal: input search)
 * @param value Nilai yang akan didebounce
 * @param delay Jeda waktu dalam milidetik (default: 300ms)
 * @returns Nilai yang telah terdebounce
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
