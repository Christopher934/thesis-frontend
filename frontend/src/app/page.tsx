'use client'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role')?.toLowerCase();

    if (token && role) {
      // If logged in, redirect to appropriate dashboard
      if (role === 'admin' || role === 'supervisor') {
        router.replace('/admin');
      } else if (['perawat', 'dokter', 'staf'].includes(role)) {
        router.replace('/pegawai');
      } else {
        router.replace('/dashboard');
      }
    } else {
      // If not logged in, redirect to sign-in
      router.replace('/sign-in');
    }
  }, [router]);

  // Add a simple loading state
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">RSUD ANUGERAH</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
