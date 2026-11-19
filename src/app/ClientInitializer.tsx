'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function ClientInitializer() {
  const initFromStorage = useAuthStore((state) => state.initFromStorage);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    initFromStorage();
    checkAuth();
  }, [initFromStorage, checkAuth]);

  return null;
}
