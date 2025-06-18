// Route permissions configuration
type UserRole = 'admin' | 'perawat' | 'staf' | 'dokter' | 'supervisor';

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  // Dashboard routes
  '/': ['admin', 'perawat', 'staf', 'dokter', 'supervisor'],
  '/admin': ['admin', 'supervisor'],
  '/pegawai': ['perawat', 'staf', 'dokter'],
  '/dashboard': ['admin', 'perawat', 'staf', 'dokter', 'supervisor'],
  
  // List routes
  '/list/pegawai': ['admin'],
  '/list/managemenjadwal': ['admin'],
  '/list/jadwalsaya': ['perawat', 'staf', 'dokter'],
  '/list/ajukantukarshift': ['admin', 'perawat', 'staf', 'dokter', 'supervisor'],
  '/list/absensi': ['admin', 'perawat', 'staf', 'dokter'],
  '/list/events': ['admin', 'perawat', 'staf', 'dokter'],
  '/list/messages': ['admin', 'perawat', 'staf', 'dokter'],
  '/list/laporan': ['admin'],
  
  // Profile routes
  '/profile': ['admin', 'perawat', 'staf', 'dokter', 'supervisor'],
};

/**
 * Check if a user role has permission to access a specific route
 */
export function hasRoutePermission(route: string, userRole: string | null): boolean {
  if (!userRole) return false;
  
  // Normalize role to lowercase
  const normalizedRole = userRole.toLowerCase();
  
  // Check if normalized role is valid
  if (!['admin', 'perawat', 'staf', 'dokter', 'supervisor'].includes(normalizedRole)) {
    return false;
  }
  
  // Check exact route match first
  if (ROUTE_PERMISSIONS[route]) {
    return ROUTE_PERMISSIONS[route].includes(normalizedRole as UserRole);
  }
  
  // Check for partial matches (for dynamic routes)
  for (const [routePattern, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route.startsWith(routePattern)) {
      return allowedRoles.includes(normalizedRole as UserRole);
    }
  }
  
  // Default: deny access if route not found in permissions
  return false;
}

/**
 * Get the appropriate redirect path based on user role
 */
export function getRedirectPathForRole(role: string | null): string {
  if (!role) return '/sign-in';
  
  const normalizedRole = role.toLowerCase();
  
  switch (normalizedRole) {
    case 'admin':
    case 'supervisor':
      return '/admin';
    case 'perawat':
    case 'staf':
    case 'dokter':
      return '/pegawai';
    default:
      return '/dashboard';
  }
}

/**
 * Check if user is accessing an authorized route
 */
export function isAuthorizedRoute(pathname: string, userRole: string | null): boolean {
  // Allow access to sign-in and public routes
  if (pathname === '/sign-in' || pathname === '/logout') {
    return true;
  }
  
  // Check route permissions
  return hasRoutePermission(pathname, userRole);
}
