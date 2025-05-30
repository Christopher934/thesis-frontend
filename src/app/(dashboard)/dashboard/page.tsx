'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (role === 'admin') {
      router.replace('/admin');
    } else if (['DOKTER', 'PERAWAT', 'STAF'].includes(role || '')) {
      router.replace('/pegawai');
    } else {
      router.replace('/sign-in'); // fallback jika tidak valid
    }
  }, []);

  return null;
};

export default DashboardPage;
