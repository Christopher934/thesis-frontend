'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Cache for auth checks to avoid repeated localStorage access
const authCache = new Map<string, { authorized: boolean; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache

function withAuth<P extends {}>(Component: React.ComponentType<P>, allowedRoles: string[]) {
  const normalized = allowedRoles.map((r) => r.toLowerCase());

  return function AuthWrapper(props: P) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Create cache key
      const cacheKey = `auth-${normalized.join('-')}`;
      const cached = authCache.get(cacheKey);
      
      // Use cached result if available and fresh
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setAuthorized(cached.authorized);
        setLoading(false);
        if (!cached.authorized) {
          router.replace('/sign-in');
        }
        return;
      }

      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role')?.toLowerCase() || '';

      let isAuthorized = false;

      if (!token) {
        router.replace('/sign-in');
      } else if (normalized.includes(role)) {
        isAuthorized = true;
      } else if (role === 'supervisor' && normalized.includes('admin')) {
        // Special handling for SUPERVISOR role (can access admin pages)
        isAuthorized = true;
      } else {
        router.replace('/sign-in');
      }

      // Cache the result
      authCache.set(cacheKey, {
        authorized: isAuthorized,
        timestamp: Date.now()
      });

      setAuthorized(isAuthorized);
      setLoading(false);
    }, [router]);

    // Show loading state briefly to prevent flash
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!authorized) return null;

    return <Component {...props} />;
  };
}

export default withAuth;
