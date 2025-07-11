/**
 * Context untuk mengelola state notifikasi global
 * Menyediakan WebSocket connection dan state management
 */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: number;
  userId: number;
  judul: string;
  pesan: string;
  jenis: string;
  status: 'UNREAD' | 'READ';
  data?: any;
  sentVia: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: number) => Promise<void>;
  markMultipleAsRead: (notificationIds: number[]) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  connect: () => void;
  disconnect: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Base API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; // Updated to correct backend port

  // Get auth token
  const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }, []);

  // Get user role
  const getUserRole = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role')?.toUpperCase() || '';
    }
    return '';
  }, []);

  // Map notification types to categories
  const getNotificationCategory = useCallback((jenis: string): string => {
    const categoryMap: Record<string, string> = {
      'REMINDER_SHIFT': 'shift',
      'KONFIRMASI_TUKAR_SHIFT': 'shift', 
      'PERSETUJUAN_CUTI': 'approval',
      'KEGIATAN_HARIAN': 'event',
      'PERINGATAN_TERLAMBAT': 'absensi',
      'SHIFT_BARU': 'shift',
      'SISTEM_INFO': 'system',
      'PENGUMUMAN': 'system'
    };
    
    return categoryMap[jenis] || 'system';
  }, []);

  // Role-based notification filtering
  const filterNotificationsByRole = useCallback((notifications: Notification[]) => {
    const userRole = getUserRole();
    if (!userRole) return notifications;

    return notifications.filter(notification => {
      // Convert notification type to our category system
      const category = getNotificationCategory(notification.jenis);
      
      // Admin can see all notifications
      if (userRole === 'ADMIN') {
        return true;
      }
      
      // Supervisor can see their role notifications + approval requests
      if (userRole === 'SUPERVISOR') {
        return ['approval', 'event', 'system'].includes(category) ||
               ['REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'SHIFT_BARU', 'KEGIATAN_HARIAN', 'SISTEM_INFO', 'PENGUMUMAN'].includes(notification.jenis);
      }
      
      // Regular users (PERAWAT, DOKTER, STAF) can see specific categories
      if (['PERAWAT', 'DOKTER', 'STAF'].includes(userRole)) {
        return ['event', 'absensi', 'shift', 'system'].includes(category) ||
               ['REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'KEGIATAN_HARIAN', 'PERINGATAN_TERLAMBAT', 'SHIFT_BARU', 'SISTEM_INFO'].includes(notification.jenis);
      }
      
      return false;
    });
  }, [getUserRole, getNotificationCategory]);

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifikasi`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Fetched notifications from API:', data.length);
        
        // Apply role-based filtering
        const filteredData = filterNotificationsByRole(data);
        console.log('🔽 Notifications after role filtering:', filteredData.length, 'User role:', getUserRole());
        setNotifications(filteredData);
        
        // Update unread count based on filtered data
        const unread = filteredData.filter((n: Notification) => n.status === 'UNREAD').length;
        setUnreadCount(unread);
        console.log('🔔 Unread notifications:', unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [API_BASE_URL, getAuthToken, filterNotificationsByRole, getUserRole]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
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
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, status: 'READ' as const } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(async (notificationIds: number[]) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifikasi/mark-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: notificationIds }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n.id) ? { ...n, status: 'READ' as const } : n
          )
        );
        
        // Recalculate unread count
        const newUnreadCount = notifications.filter(n => 
          !notificationIds.includes(n.id) && n.status === 'UNREAD'
        ).length;
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
    }
  }, [API_BASE_URL, getAuthToken, notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifikasi/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        if (deletedNotification?.status === 'UNREAD') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [API_BASE_URL, getAuthToken, notifications]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    const token = getAuthToken();
    if (!token || socket) return;

    const newSocket = io(`${API_BASE_URL}/notifications`, {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Notification WebSocket connected');
      setIsConnected(true);
      
      // Join notification room
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        newSocket.emit('joinNotificationRoom', { userId: user.id });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Notification WebSocket disconnected');
      setIsConnected(false);
    });

    // Listen for new notifications
    newSocket.on('newNotification', (notification: Notification) => {
      console.log('New notification received:', notification);
      
      // Apply role-based filtering to new notification
      const filteredNotifications = filterNotificationsByRole([notification]);
      
      if (filteredNotifications.length > 0) {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.judul, {
            body: notification.pesan,
            icon: '/favicon.ico'
          });
        }
      }
    });

    // Listen for unread count updates
    newSocket.on('unreadCount', (count: number) => {
      console.log('Unread count updated:', count);
      setUnreadCount(count);
    });

    newSocket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);
  }, [API_BASE_URL, getAuthToken, socket, filterNotificationsByRole]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Initialize connection and fetch data
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchNotifications();
      connect();

      // Request notification permission
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }

    return () => {
      disconnect();
    };
  }, [getAuthToken, fetchNotifications, connect, disconnect]);

  // Re-fetch notifications when user role changes
  useEffect(() => {
    const userRole = getUserRole();
    if (userRole) {
      fetchNotifications();
    }
  }, [getUserRole, fetchNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markMultipleAsRead,
    deleteNotification,
    fetchNotifications,
    connect,
    disconnect,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
