'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleRedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [shouldShowChildren, setShouldShowChildren] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        setDebugInfo('Checking localStorage...');
        
        // Simple check for authentication
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role')?.toLowerCase();
        
        setDebugInfo(`Token: ${!!token}, Role: ${role || 'none'}`);
        
        // If token exists but no role, clear auth data
        if (token && !role) {
          console.log('[SimpleRedirect] Token exists but no role, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          setDebugInfo('Cleared corrupt auth data');
          setShouldShowChildren(true);
          return;
        }
        
        if (token && role) {
          setDebugInfo('User authenticated, redirecting...');
          
          // Determine redirect path
          let redirectPath = '/dashboard';
          if (role === 'admin' || role === 'supervisor') {
            redirectPath = '/dashboard/admin';
          } else if (role === 'perawat' || role === 'dokter' || role === 'staf') {
            redirectPath = '/dashboard/pegawai';
          }
          
          console.log('[SimpleRedirect] Redirecting authenticated user to:', redirectPath);
          
          // Use window.location for immediate redirect
          window.location.replace(redirectPath);
          return;
        }
        
        // User not authenticated, show login page
        setDebugInfo('User not authenticated, showing login');
        setShouldShowChildren(true);
        
      } catch (error) {
        console.error('[SimpleRedirect] Error during auth check:', error);
        setDebugInfo('Error occurred, showing login');
        setShouldShowChildren(true);
      }
    };

    // Add small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkAndRedirect, 100);
    
    return () => clearTimeout(timeoutId);
  }, [router]);

  if (!shouldShowChildren) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-700">Checking authentication...</div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-2">{debugInfo}</div>
          )}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                document.cookie.split(";").forEach(c => {
                  const eqPos = c.indexOf("=");
                  const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                });
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Clear All Auth Data (Debug)
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
