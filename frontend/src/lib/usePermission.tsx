'use client';

import { useState, useEffect } from 'react';
import { hasPermission, getAllPermissions } from './roleConfig';

/**
 * A React hook to check if the current user has a specific permission
 */
export function usePermission(permission: string): boolean {
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const role = localStorage.getItem('role')?.toUpperCase() || '';
    setHasAccess(hasPermission(role, permission));
  }, [permission]);
  
  return hasAccess;
}

/**
 * A React hook to get all permissions for the current user
 */
export function useUserPermissions(): string[] {
  const [permissions, setPermissions] = useState<string[]>([]);
  
  useEffect(() => {
    const role = localStorage.getItem('role')?.toUpperCase() || '';
    setPermissions(getAllPermissions(role));
  }, []);
  
  return permissions;
}

/**
 * A React hook to check if the current user has the SUPERVISOR role
 */
export function useIsSupervisor(): boolean {
  const [isSupervisor, setIsSupervisor] = useState(false);
  
  useEffect(() => {
    const role = localStorage.getItem('role')?.toUpperCase() || '';
    setIsSupervisor(role === 'SUPERVISOR');
  }, []);
  
  return isSupervisor;
}

/**
 * A React hook to check if the current user has admin level access
 * (either ADMIN or SUPERVISOR role)
 */
export function useHasAdminAccess(): boolean {
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  
  useEffect(() => {
    const role = localStorage.getItem('role')?.toUpperCase() || '';
    setHasAdminAccess(role === 'ADMIN' || role === 'SUPERVISOR');
  }, []);
  
  return hasAdminAccess;
}

/**
 * A React hook to get the role of the current user
 */
export function useUserRole(): string | null {
  const [role, setRole] = useState<string | null>(null);
  
  useEffect(() => {
    const userRole = localStorage.getItem('role')?.toUpperCase() || null;
    setRole(userRole);
  }, []);
  
  return role;
}

/**
 * A React component that renders its children only if the user has a specific permission
 */
export function PermissionGate({ 
  permission, 
  children 
}: { 
  permission: string, 
  children: React.ReactNode 
}) {
  const hasAccess = usePermission(permission);
  
  if (!hasAccess) return null;
  
  return <>{children}</>;
}
