'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to manage user role with proper hydration handling
 */
export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait a tick to ensure we're on the client
    const timer = setTimeout(() => {
      try {
        const storedRole = localStorage.getItem('role')?.toLowerCase() || null;
        setRole(storedRole);
        setIsLoading(false);
        
        console.log('[useUserRole] Role initialized:', storedRole);
      } catch (error) {
        console.error('[useUserRole] Error reading role:', error);
        setRole(null);
        setIsLoading(false);
      }
    }, 50); // Small delay to ensure hydration

    return () => clearTimeout(timer);
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'role') {
        const newRole = e.newValue?.toLowerCase() || null;
        console.log('[useUserRole] Role changed via storage:', newRole);
        setRole(newRole);
      }
    };

    // Also listen for custom role change events
    const handleRoleChange = (e: CustomEvent) => {
      const newRole = e.detail?.role?.toLowerCase() || null;
      console.log('[useUserRole] Role changed via event:', newRole);
      setRole(newRole);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('roleChanged' as any, handleRoleChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roleChanged' as any, handleRoleChange);
    };
  }, []);

  return { role, isLoading };
}

/**
 * Helper function to trigger role update across components
 */
export function updateUserRole(newRole: string | null) {
  if (typeof window !== 'undefined') {
    if (newRole) {
      localStorage.setItem('role', newRole);
    } else {
      localStorage.removeItem('role');
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('roleChanged', { 
      detail: { role: newRole } 
    }));
  }
}
