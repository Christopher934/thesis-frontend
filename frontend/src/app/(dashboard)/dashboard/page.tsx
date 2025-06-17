'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role')?.toLowerCase();

    if (role === 'admin' || role === 'supervisor') {
      router.replace('/admin');
    } else if (['perawat', 'dokter', 'staf'].includes(role || '')) {
      router.replace('/pegawai');
    } else {
      router.replace('/sign-in'); // fallback
    }
  }, []);

  return null;
}
