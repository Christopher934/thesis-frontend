// Utility functions for authentication

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    console.log('[AuthUtils] isAuthenticated: Window is undefined (SSR)');
    return false;
  }
  
  // Check both localStorage and cookies for token
  const localToken = localStorage.getItem('token');
  
  // Also check cookies (in case localStorage was cleared but cookies remain)
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  
  const isAuth = !!(localToken || cookieToken);
  console.log('[AuthUtils] isAuthenticated result:', {
    localToken: !!localToken,
    cookieToken: !!cookieToken,
    isAuthenticated: isAuth
  });
  
  return isAuth;
}

/**
 * Get the user's role
 */
export function getUserRole(): string | null {
  if (typeof window === 'undefined') {
    console.log('[AuthUtils] getUserRole: Window is undefined (SSR)');
    return null;
  }
  
  const role = localStorage.getItem('role')?.toLowerCase() || null;
  console.log('[AuthUtils] getUserRole result:', role);
  return role;
}

/**
 * Check if user should be redirected from sign-in page
 */
export function shouldRedirectFromSignIn(): { redirect: boolean; path: string } {
  console.log('[AuthUtils] shouldRedirectFromSignIn: Starting check...');
  
  const authenticated = isAuthenticated();
  if (!authenticated) {
    console.log('[AuthUtils] shouldRedirectFromSignIn: User not authenticated, no redirect');
    return { redirect: false, path: '' };
  }
  
  const role = getUserRole();
  console.log('[AuthUtils] shouldRedirectFromSignIn: User authenticated with role:', role);
  
  if (role === 'admin' || role === 'supervisor') {
    console.log('[AuthUtils] shouldRedirectFromSignIn: Redirecting admin/supervisor to /dashboard/admin');
    return { redirect: true, path: '/dashboard/admin' };
  } else if (role === 'perawat' || role === 'dokter' || role === 'staf') {
    console.log('[AuthUtils] shouldRedirectFromSignIn: Redirecting staff to /dashboard/pegawai');
    return { redirect: true, path: '/dashboard/pegawai' };
  } else if (role) {
    console.log('[AuthUtils] shouldRedirectFromSignIn: Redirecting unknown role to /dashboard');
    return { redirect: true, path: '/dashboard' };
  }
  
  console.log('[AuthUtils] shouldRedirectFromSignIn: No valid role, no redirect');
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
  localStorage.removeItem('user');
  localStorage.removeItem('userid');
  localStorage.removeItem('idpegawai');
  localStorage.removeItem('nameDepan');
  localStorage.removeItem('nameBelakang');
  
  // Trigger role change event for Menu component
  window.dispatchEvent(new CustomEvent('roleChanged', { 
    detail: { role: null } 
  }));

  // Clear cookies with proper configuration
  try {
    // First try with js-cookie
    const Cookies = require('js-cookie');
    Cookies.remove('token', { path: '/' });
    Cookies.remove('role', { path: '/' });
    // Remove other cookies if needed
    // Then also use the native method for backup
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    document.cookie = 'userid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    document.cookie = 'idpegawai=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    document.cookie = 'nameDepan=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    document.cookie = 'nameBelakang=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    
    console.log('[AuthUtils] Auth data cleared successfully');
  } catch (e) {
    console.error('[AuthUtils] Failed to clear cookies:', e);
    // Fallback method if js-cookie fails
    try {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'idpegawai=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'nameDepan=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'nameBelakang=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (e2) {
      console.error('[AuthUtils] Fallback cookie clearing also failed:', e2);
    }
  }
}
