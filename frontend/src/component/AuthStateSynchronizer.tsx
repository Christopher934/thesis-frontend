'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';

/**
 * This component synchronizes authentication state between localStorage and cookies
 * to ensure consistent behavior for both client-side and server-side auth checks
 */
export default function AuthStateSynchronizer() {
  useEffect(() => {
    try {
      // Check for auth in localStorage
      const localStorageToken = localStorage.getItem('token');
      const localStorageRole = localStorage.getItem('role');
      
      // Check for auth in cookies
      const cookieToken = Cookies.get('token');
      const cookieRole = Cookies.get('role');
      
      // Synchronize from localStorage to cookies if needed
      if (localStorageToken && !cookieToken) {
        console.log('[AuthSync] Synchronizing token from localStorage to cookies');
        Cookies.set('token', localStorageToken, { 
          expires: 1, // 1 day
          path: '/',
          sameSite: 'strict'
        });
        
        if (localStorageRole) {
          Cookies.set('role', localStorageRole, {
            expires: 1,
            path: '/',
            sameSite: 'strict'
          });
        }
      }
      
      // Synchronize from cookies to localStorage if needed
      if (cookieToken && !localStorageToken) {
        console.log('[AuthSync] Synchronizing token from cookies to localStorage');
        localStorage.setItem('token', cookieToken);
        
        if (cookieRole) {
          localStorage.setItem('role', cookieRole);
        }
      }
    } catch (err) {
      console.error('[AuthSync] Error synchronizing auth state:', err);
    }
  }, []);
  
  // This component doesn't render anything
  return null;
}
