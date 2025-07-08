import { useState, useEffect, useCallback } from 'react';
import { apiCache } from '../../utils/cache/apiCache';

interface User {
  id: number;
  employeeId: string;
  username: string;
  namaDepan: string;
  namaBelakang: string;
  role: string;
}

export function useOptimizedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    // Check cache first
    const cachedUsers = apiCache.get<User[]>('users:all');
    if (cachedUsers) {
      setUsers(cachedUsers);
      return cachedUsers;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const startTime = performance.now();
      
      const response = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const responseTime = performance.now() - startTime;
      console.log(`📊 Users API Response Time: ${responseTime.toFixed(2)}ms`);

      if (!response.ok) throw new Error('Failed to fetch users');

      const userData = await response.json();
      
      // Cache the results
      apiCache.cacheUsers(userData);
      setUsers(userData);
      
      return userData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMsg);
      console.error('Users fetch error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserByEmployeeId = useCallback((employeeId: string): User | undefined => {
    // Try cache first for instant lookup
    const cachedUser = apiCache.getUserByEmployeeId(employeeId);
    if (cachedUser) return cachedUser;

    // Fallback to in-memory search
    return users.find(u => u.employeeId === employeeId || u.username === employeeId);
  }, [users]);

  const getUserById = useCallback((id: number): User | undefined => {
    // Try cache first
    const cachedUser = apiCache.getUserById(id);
    if (cachedUser) return cachedUser;

    // Fallback to in-memory search
    return users.find(u => u.id === id);
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    getUserByEmployeeId,
    getUserById,
  };
}
