'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminRedirectPage: React.FC = () => {
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!hasRedirected) {
      setHasRedirected(true);
      // Use router.replace instead of window.location.href to prevent history issues
      router.replace('/dashboard/admin');
    }
  }, [router, hasRedirected]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg">Redirecting to Admin Dashboard...</div>
        <div className="text-sm text-gray-500 mt-2">Mengalihkan ke /dashboard/admin</div>
      </div>
    </div>
  );
};

export default AdminRedirectPage;
