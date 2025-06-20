'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { hasRoutePermission, getRedirectPathForRole } from '@/lib/permissions';
import { getUserRole, isAuthenticated } from '@/lib/authUtils';

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Route Guard component that protects routes based on user permissions
 * This provides client-side protection as an additional security layer
 */
export default function RouteGuard({ children, fallback }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      // Skip auth check for sign-in page
      if (pathname === '/sign-in') {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      const authenticated = isAuthenticated();
      if (!authenticated) {
        router.push('/sign-in');
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Check role-based permissions
      const userRole = getUserRole();
      const hasPermission = hasRoutePermission(pathname || '', userRole || '');

      if (!hasPermission) {
        // Redirect to appropriate dashboard
        const redirectPath = getRedirectPathForRole(userRole || '');
        router.push(redirectPath);
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuthorization();
  }, [pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
            <p className="text-gray-600 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            <button
              onClick={() => {
                const userRole = getUserRole();
                const redirectPath = getRedirectPathForRole(userRole);
                router.push(redirectPath);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )
    );
  }

  // Show authorized content
  return <>{children}</>;
}
