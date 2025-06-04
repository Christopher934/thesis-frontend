// File: app/components/StorageCleaner.tsx
'use client';

import { useEffect } from 'react';

export default function StorageCleaner() {
  useEffect(() => {
    // Handler untuk clear data ketika tab/window ditutup
    const handleUnload = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      // Hapus item lain jika perlu: localStorage.removeItem('…');
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  return null; // komponen ini tidak merender apa-apa
}
