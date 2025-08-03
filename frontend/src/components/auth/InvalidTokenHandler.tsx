'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

/**
 * InvalidTokenHandler - Detects and handles invalid JWT tokens
 * This component helps handle cases where:
 * 1. Database was reset but user didn't logout
 * 2. JWT token is invalid or expired
 * 3. User no longer exists in database
 */
export default function InvalidTokenHandler() {
  const router = useRouter();

  useEffect(() => {
    // Function to clear all auth data and redirect to login
    const clearAuthAndRedirect = () => {
      console.log('[InvalidTokenHandler] Clearing invalid auth data and redirecting to login');
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      
      // Clear cookies
      Cookies.remove('token');
      Cookies.remove('role');
      Cookies.remove('userRole');
      
      // Redirect to login
      router.push('/sign-in');
    };

    // Function to validate current token with backend
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return; // No token, nothing to validate
      }

      try {
        // Try to make a simple authenticated request to validate token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifikasi/unread-count`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // If token is invalid, backend will return 401/403
        if (response.status === 401 || response.status === 403) {
          console.log('[InvalidTokenHandler] Token validation failed - clearing auth data');
          clearAuthAndRedirect();
        }
      } catch (error) {
        console.error('[InvalidTokenHandler] Error validating token:', error);
        // Don't clear on network errors, only on auth errors
      }
    };

    // Set up a global error handler for fetch responses
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      // Safely check for Authorization header
      let hasAuthHeader = false;
      if (args[1] && args[1].headers) {
        const headers = args[1].headers;
        if (typeof headers === 'object' && headers !== null) {
          hasAuthHeader = 'Authorization' in headers || 'authorization' in headers;
        }
      }
      if ((response.status === 401 || response.status === 403) && hasAuthHeader) {
        console.log('[InvalidTokenHandler] Detected auth failure - auto-logout triggered');
        clearAuthAndRedirect();
      }
      return response;
    };

    // Validate token on component mount
    validateToken();

    // Set up periodic token validation (every 5 minutes)
    const interval = setInterval(validateToken, 5 * 60 * 1000);

    // Listen for storage changes (if user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed in another tab
        clearAuthAndRedirect();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.fetch = originalFetch; // Restore original fetch
    };
  }, [router]);

  // This component doesn't render anything
  return null;
}
