'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import roleConfig, { canAccessPage } from './roleConfig';

function withAuth<P extends {}>(Component: React.ComponentType<P>, allowedRoles: string[]) {
  // 1️⃣ ubah semua allowedRoles jadi lowercase
  const normalized = allowedRoles.map((r) => r.toLowerCase());

  return function AuthWrapper(props: P) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem('token');
      // 2️⃣ baca role juga di-lowercase
      const role = localStorage.getItem('role')?.toLowerCase() || '';

      // 3️⃣ cek token & cek role di array yang sudah lowercase
      if (!token) {
        router.replace('/sign-in');
      } else if (!normalized.includes(role)) {
        // Check if this role inherits from any allowed role
        // Special handling for SUPERVISOR role (can access admin pages)
        if (role === 'supervisor' && normalized.includes('admin')) {
          setAuthorized(true);
        } else {
          router.replace('/sign-in');
        }
      } else {
        setAuthorized(true);
      }
    }, [router]);

    // 4️⃣ jangan render komponen sampai authorized==true
    if (!authorized) return null;

    return <Component {...props} />;
  };
}

export default withAuth;
