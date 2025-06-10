// This file contains role configuration for the application
// It defines which roles have access to specific features/pages

type RoleConfig = {
  [key: string]: {
    // Pages that this role can access
    accessiblePages: string[];
    // Features that this role can use
    permissions: string[];
    // If true, this role inherits permissions from another role
    inheritsFrom?: string;
  }
}

const roleConfig: RoleConfig = {
  "ADMIN": {
    accessiblePages: [
      '/admin',
      '/list/absensi',
      '/list/managemenjadwal',
      '/list/pegawai',
      '/list/laporan',
    ],
    permissions: [
      'create_jadwal',
      'update_jadwal',
      'delete_jadwal',
      'manage_users',
      'view_all_reports',
      'approve_tukarshift',
      'view_all_absensi',
    ],
  },
  "SUPERVISOR": {
    accessiblePages: [
      '/admin',
      '/list/absensi', 
      '/list/managemenjadwal',
    ],
    permissions: [
      'create_jadwal',
      'update_jadwal',
      'delete_jadwal',
      'approve_tukarshift',
      'view_all_absensi',
    ],
    inheritsFrom: 'STAF',
  },
  "DOKTER": {
    accessiblePages: [
      '/pegawai',
      '/list/jadwalsaya',
      '/list/ajukantukarshift',
    ],
    permissions: [
      'view_own_jadwal',
      'request_tukarshift',
      'view_own_absensi',
    ],
  },
  "PERAWAT": {
    accessiblePages: [
      '/pegawai',
      '/list/jadwalsaya',
      '/list/ajukantukarshift',
    ],
    permissions: [
      'view_own_jadwal',
      'request_tukarshift',
      'view_own_absensi',
    ],
  },
  "STAF": {
    accessiblePages: [
      '/pegawai',
      '/list/jadwalsaya',
      '/list/ajukantukarshift',
    ],
    permissions: [
      'view_own_jadwal',
      'request_tukarshift',
      'view_own_absensi',
    ],
  },
};

/**
 * Check if a role has permission for a specific action
 */
export function hasPermission(role: string, permission: string): boolean {
  const roleData = roleConfig[role.toUpperCase()];
  if (!roleData) return false;

  // Check direct permissions
  if (roleData.permissions.includes(permission)) return true;

  // Check inherited permissions
  if (roleData.inheritsFrom && roleConfig[roleData.inheritsFrom]) {
    return hasPermission(roleData.inheritsFrom, permission);
  }

  return false;
}

/**
 * Check if a role can access a specific page
 */
export function canAccessPage(role: string, page: string): boolean {
  const roleData = roleConfig[role.toUpperCase()];
  if (!roleData) return false;

  // Check direct access
  if (roleData.accessiblePages.some(p => page.startsWith(p))) return true;
  
  // Check inherited access
  if (roleData.inheritsFrom && roleConfig[roleData.inheritsFrom]) {
    return canAccessPage(roleData.inheritsFrom, page);
  }

  return false;
}

/**
 * Get all permissions for a role
 */
export function getAllPermissions(role: string): string[] {
  const roleData = roleConfig[role.toUpperCase()];
  if (!roleData) return [];

  let permissions = [...roleData.permissions];

  // Add inherited permissions
  if (roleData.inheritsFrom && roleConfig[roleData.inheritsFrom]) {
    permissions = [
      ...permissions,
      ...getAllPermissions(roleData.inheritsFrom)
    ];
  }

  return [...new Set(permissions)]; // Remove duplicates
}

export default roleConfig;
