'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Set the token in localStorage
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1MjUzNDk2MSwiZXhwIjoxNzUzMTM5NzYxfQ.rSqfsqpRCQlcqyrRJKa-CXa2o72hl3T6j_ff2nYTIsI";
    
    localStorage.setItem('token', token);
    localStorage.setItem('role', 'ADMIN');
    localStorage.setItem('nameDepan', 'Admin');
    localStorage.setItem('namaBelakang', 'System');
    localStorage.setItem('idpegawai', 'admin');
    localStorage.setItem('userId', '1');
    
    console.log('Token set in localStorage:', token);
    
    // Redirect to laporan page
    setTimeout(() => {
      router.push('/dashboard/list/laporan');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Auto Login</h1>
        <p className="text-gray-600 mb-4">Setting up authentication...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}
