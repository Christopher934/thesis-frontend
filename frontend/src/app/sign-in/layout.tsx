'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserRole } from '@/lib/authUtils';

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication on mount and redirect if needed
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === 'admin' || role === 'supervisor') {
        router.replace('/admin');
      } else {
        router.replace('/pegawai');
      }
    }
  }, [router]);

  return (
    <div className="bg-gradient-to-br from-blue-100 via-white to-blue-50 min-h-screen relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-500 to-blue-400 transform -skew-y-6 -translate-y-24 opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-l from-blue-500 to-blue-400 transform skew-y-6 translate-y-24 opacity-20"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-10"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-400 rounded-full opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
