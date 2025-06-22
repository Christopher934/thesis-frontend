'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PREFETCH_ROUTES = [
  '/admin',
  '/pegawai', 
  '/list/pegawai',
  '/list/jadwalsaya',
  '/list/ajukantukarshift',
  '/list/absensi',
  '/list/managemenjadwal'
];

export default function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch commonly used routes for instant navigation
    const prefetchRoutes = async () => {
      for (const route of PREFETCH_ROUTES) {
        try {
          router.prefetch(route);
        } catch (error) {
          // Silently ignore prefetch errors
        }
      }
    };

    // Delay prefetching to not impact initial load
    const timer = setTimeout(prefetchRoutes, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
