'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { shouldRedirectFromSignIn } from '@/lib/authUtils';

export default function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const { redirect, path } = shouldRedirectFromSignIn();
      
      if (redirect && path) {
        router.replace(path);
      } else {
        setIsChecking(false);
      }
    };

    // Run immediately
    checkAuth();

    // Set up interval to check continuously (prevent manual navigation back)
    const interval = setInterval(checkAuth, 1000);
    
    return () => clearInterval(interval);
  }, [router]);

  // Only render children when we've confirmed the user is not logged in
  return isChecking ? <div className="flex justify-center items-center h-screen">Checking authentication...</div> : <>{children}</>;
}
