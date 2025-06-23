'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInRedirectIfLoggedIn() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role')?.toLowerCase();

    if (token && role) {
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (['perawat', 'dokter', 'staf'].includes(role)) {
        router.push('/dashboard/pegawai');
      } else {
        router.push('/dashboard/dashboard');
      }
    }
  }, [router]);

  return null;
}
