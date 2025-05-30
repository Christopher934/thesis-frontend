'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      // Redirect sesuai role
      if (role.toLowerCase() === 'admin') {
        router.push('/admin');
      } else {
        router.push('/pegawai');
      }
    }
  }, []);

  return <>{children}</>;
}
