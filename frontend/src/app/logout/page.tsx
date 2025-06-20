'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/component/ConfirmationModal';
import { clearAuthData } from '@/lib/authUtils';

export default function LogoutPage() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(true);

  useEffect(() => {
    // If user is not authenticated, redirect to sign-in
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/sign-in');
    }
  }, [router]);

  const handleConfirmLogout = () => {
    clearAuthData();
    router.replace('/sign-in');
  };

  const handleCancelLogout = () => {
    // Get user role to redirect to appropriate dashboard
    const role = localStorage.getItem('role')?.toLowerCase();
    if (role === 'admin' || role === 'supervisor') {
      router.replace('/admin');
    } else if (role === 'perawat' || role === 'dokter' || role === 'staf') {
      router.replace('/pegawai');
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari aplikasi? Anda perlu login ulang untuk mengakses sistem."
        confirmText="Ya, Logout"
        cancelText="Batal"
        type="warning"
      />
      
      {/* Loading state while modal is deciding */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">RSUD ANUGERAH</h2>
        <p className="text-gray-600">Memproses logout...</p>
      </div>
    </div>
  );
}
