// Utility functions for authentication

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check both localStorage and cookies for token
  const localToken = localStorage.getItem('token');
  
  // Also check cookies (in case localStorage was cleared but cookies remain)
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  
  return !!(localToken || cookieToken);
}

/**
 * Get the user's role
 */
export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('role')?.toLowerCase() || null;
}

/**
 * Check if user should be redirected from sign-in page
 */
export function shouldRedirectFromSignIn(): { redirect: boolean; path: string } {
  const authenticated = isAuthenticated();
  if (!authenticated) return { redirect: false, path: '' };
  
  const role = getUserRole();
  if (role === 'admin' || role === 'supervisor') {
    return { redirect: true, path: '/admin' };
  } else if (role === 'perawat' || role === 'dokter' || role === 'staf') {
    return { redirect: true, path: '/pegawai' };
  } else if (role) {
    return { redirect: true, path: '/dashboard' };
  }
  
  return { redirect: false, path: '' };
}

/**
 * Clear auth data when logging out
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  console.log('[AuthUtils] Clearing all authentication data');
  
  // Clear localStorage items
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('nameDepan');
  localStorage.removeItem('nameBelakang');
  
  // For complete cleanup, also clear entire localStorage if needed
  // localStorage.clear();
  
  // Clear cookies with proper configuration
  try {
    // First try with js-cookie
    const Cookies = require('js-cookie');
    Cookies.remove('token', { path: '/' });
    Cookies.remove('role', { path: '/' });
    
    // Then also use the native method for backup
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    
    console.log('[AuthUtils] Auth data cleared successfully');
  } catch (e) {
    console.error('[AuthUtils] Failed to clear cookies:', e);
    
    // Fallback method if js-cookie fails
    try {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (e2) {
      console.error('[AuthUtils] Fallback cookie clearing also failed:', e2);
    }
  }
}
