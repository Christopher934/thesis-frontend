'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { shouldRedirectFromSignIn } from '@/lib/authUtils';

export default function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('[RedirectIfLoggedIn] Checking authentication...');
        const { redirect, path } = shouldRedirectFromSignIn();
        
        console.log('[RedirectIfLoggedIn] Auth check result:', { redirect, path });
        setDebugInfo(`Redirect: ${redirect}, Path: ${path}`);
        
        if (redirect && path) {
          console.log('[RedirectIfLoggedIn] Redirecting to:', path);
          setIsChecking(false); // Stop checking immediately
          router.replace(path);
          return true; // Indicate redirect happened
        } else {
          console.log('[RedirectIfLoggedIn] No redirect needed, user not authenticated');
          setIsChecking(false);
          return false; // No redirect needed
        }
      } catch (error) {
        console.error('[RedirectIfLoggedIn] Error during auth check:', error);
        setIsChecking(false);
        return false;
      }
    };

    // Run immediately
    const redirected = checkAuth();

    // Don't set up interval at all - single check is enough
    console.log('[RedirectIfLoggedIn] Initial check completed, redirected:', redirected);
    
    // Cleanup function
    return () => {
      console.log('[RedirectIfLoggedIn] Component cleanup');
    };
  }, [router]);

  // Show debug info in development
  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Checking authentication...</div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-2">{debugInfo}</div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
