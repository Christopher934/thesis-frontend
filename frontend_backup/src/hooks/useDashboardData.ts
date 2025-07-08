'use client';

import { useState, useEffect, useCallback } from 'react';

interface DashboardData {
  notifications: any[];
  schedule: any[];
  activities: any[];
  stats: any;
  loading: boolean;
  error: string | null;
}

// Custom hook untuk mengoptimalkan data loading dashboard
export const useDashboardData = (userId?: string, userRole?: string) => {
  const [data, setData] = useState<DashboardData>({
    notifications: [],
    schedule: [],
    activities: [],
    stats: null,
    loading: true,
    error: null,
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch semua data dashboard dalam satu batch untuk mengurangi API calls
  const fetchAllDashboardData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const token = getAuthToken();
      if (!token) {
        setData(prev => ({ ...prev, error: 'No authentication token found', loading: false }));
        return;
      }

      // Batch semua API calls menggunakan Promise.allSettled untuk performa optimal
      const [notificationsRes, scheduleRes, activitiesRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/notifikasi`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/shifts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/activities`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      // Process results
      const notifications = notificationsRes.status === 'fulfilled' && notificationsRes.value.ok 
        ? await notificationsRes.value.json() 
        : [];

      const schedule = scheduleRes.status === 'fulfilled' && scheduleRes.value.ok 
        ? await scheduleRes.value.json() 
        : [];

      const activities = activitiesRes.status === 'fulfilled' && activitiesRes.value.ok 
        ? await activitiesRes.value.json() 
        : [];

      setData({
        notifications,
        schedule,
        activities,
        stats: null, // TODO: Add stats if needed
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({ 
        ...prev, 
        error: 'Failed to load dashboard data', 
        loading: false 
      }));
    }
  }, [API_BASE_URL, userId, userRole]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: number) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifikasi/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setData(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => 
            n.id === notificationId ? { ...n, status: 'READ' } : n
          )
        }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [API_BASE_URL]);

  // Refresh dashboard data
  const refreshData = useCallback(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  return {
    ...data,
    markNotificationAsRead,
    refreshData,
  };
};
