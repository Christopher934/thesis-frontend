/**
 * Enhanced User-Based Notification Context
 * Supports personal notifications, interactive responses, and advanced filtering
 */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface EnhancedNotification {
  id: number;
  userId: number;
  judul: string;
  pesan: string;
  jenis: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  data?: any;
  sentVia: string;
  createdAt: string;
  updatedAt: string;
  requiresInteraction?: boolean;
  isPersonal?: boolean;
  category?: string;
}

interface EnhancedNotificationContextType {
  notifications: EnhancedNotification[];
  personalNotifications: EnhancedNotification[];
  interactiveNotifications: EnhancedNotification[];
  unreadCount: number;
  personalUnreadCount: number;
  interactiveUnreadCount: number;
  isConnected: boolean;
  
  // Basic notification actions
  markAsRead: (notificationId: number) => Promise<void>;
  markMultipleAsRead: (notificationIds: number[]) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  
  // Enhanced user-based actions
  fetchPersonalNotifications: () => Promise<void>;
  fetchInteractiveNotifications: () => Promise<void>;
  handleInteractiveResponse: (
    notificationId: number,
    responseType: 'INTERESTED' | 'CONFIRMED' | 'DECLINED' | 'FEEDBACK',
    message?: string,
    additionalData?: any
  ) => Promise<void>;
  
  // Filtering and categorization
  getNotificationsByCategory: (category: string) => EnhancedNotification[];
  getNotificationsByType: (types: string[]) => EnhancedNotification[];
  filterNotifications: (filters: {
    types?: string[];
    status?: string;
    isPersonal?: boolean;
    requiresInteraction?: boolean;
  }) => EnhancedNotification[];
  
  // User-specific notification sending (for admin/supervisor roles)
  sendPersonalAttendanceReminder: (data: {
    userId: number;
    shiftTime: string;
    location: string;
    reminderMinutes?: number;
  }) => Promise<void>;
  
  sendPersonalTaskAssignment: (data: {
    userId: number;
    taskId: number;
    taskTitle: string;
    description: string;
    dueDate: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    assignedBy: string;
  }) => Promise<void>;
  
  sendInteractiveAnnouncement: (data: {
    title: string;
    content: string;
    targetRoles: string[];
    interactionType: 'INTEREST' | 'CONFIRMATION' | 'FEEDBACK';
    deadline?: string;
    maxParticipants?: number;
  }) => Promise<void>;
  
  connect: () => void;
  disconnect: () => void;
}

const EnhancedNotificationContext = createContext<EnhancedNotificationContextType | undefined>(undefined);

interface EnhancedNotificationProviderProps {
  children: React.ReactNode;
}

export function EnhancedNotificationProvider({ children }: EnhancedNotificationProviderProps) {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [personalNotifications, setPersonalNotifications] = useState<EnhancedNotification[]>([]);
  const [interactiveNotifications, setInteractiveNotifications] = useState<EnhancedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [personalUnreadCount, setPersonalUnreadCount] = useState(0);
  const [interactiveUnreadCount, setInteractiveUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Base API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      return localStorage.getItem('userRole');
    }
    return null;
  }, []);

  // Enhanced notification categorization
  const categorizeNotification = useCallback((notification: EnhancedNotification) => {
    const personalTypes = [
      'PERSONAL_REMINDER_ABSENSI',
      'TUGAS_PERSONAL',
      'HASIL_EVALUASI_PERSONAL',
      'KONFIRMASI_SHIFT_SWAP_PERSONAL',
      'NOTIFIKASI_DIREKTUR',
      'REMINDER_MEETING_PERSONAL',
      'PERINGATAN_PERSONAL'
    ];

    const interactiveTypes = [
      'PENGUMUMAN_INTERAKTIF',
      'KONFIRMASI_SHIFT_SWAP_PERSONAL'
    ];

    return {
      ...notification,
      isPersonal: personalTypes.includes(notification.jenis),
      requiresInteraction: interactiveTypes.includes(notification.jenis) || 
                          Boolean(notification.data?.requiresInteraction),
      category: getNotificationCategory(notification)
    };
  }, []);

  const getNotificationCategory = useCallback((notification: EnhancedNotification) => {
    const categoryMap: { [key: string]: string } = {
      'REMINDER_SHIFT': 'shift',
      'PERSONAL_REMINDER_ABSENSI': 'personal',
      'KONFIRMASI_TUKAR_SHIFT': 'shift',
      'KONFIRMASI_SHIFT_SWAP_PERSONAL': 'personal',
      'PERSETUJUAN_CUTI': 'approval',
      'KEGIATAN_HARIAN': 'event',
      'ABSENSI_TERLAMBAT': 'attendance',
      'SHIFT_BARU_DITAMBAHKAN': 'shift',
      'SISTEM_INFO': 'system',
      'PENGUMUMAN': 'announcement',
      'PENGUMUMAN_INTERAKTIF': 'interactive',
      'TUGAS_PERSONAL': 'personal',
      'HASIL_EVALUASI_PERSONAL': 'personal',
      'NOTIFIKASI_DIREKTUR': 'director',
      'REMINDER_MEETING_PERSONAL': 'personal',
      'PERINGATAN_PERSONAL': 'warning'
    };
    return categoryMap[notification.jenis] || 'other';
  }, []);

  // Fetch all notifications
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
        const categorizedData = data.map(categorizeNotification);
        setNotifications(categorizedData);
        
        const unread = categorizedData.filter((n: EnhancedNotification) => n.status === 'UNREAD').length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [API_BASE_URL, getAuthToken, categorizeNotification]);

  // Fetch personal notifications
  const fetchPersonalNotifications = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/user-notifications/personal`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const categorizedData = data.map(categorizeNotification);
        setPersonalNotifications(categorizedData);
        
        const unread = categorizedData.filter((n: EnhancedNotification) => n.status === 'UNREAD').length;
        setPersonalUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching personal notifications:', error);
    }
  }, [API_BASE_URL, getAuthToken, categorizeNotification]);

  // Fetch interactive notifications
  const fetchInteractiveNotifications = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/user-notifications/interactive`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const categorizedData = data.map(categorizeNotification);
        setInteractiveNotifications(categorizedData);
        
        const unread = categorizedData.filter((n: EnhancedNotification) => n.status === 'UNREAD').length;
        setInteractiveUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching interactive notifications:', error);
    }
  }, [API_BASE_URL, getAuthToken, categorizeNotification]);

  // Handle interactive response
  const handleInteractiveResponse = useCallback(async (
    notificationId: number,
    responseType: 'INTERESTED' | 'CONFIRMED' | 'DECLINED' | 'FEEDBACK',
    message?: string,
    additionalData?: any
  ) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/user-notifications/interactive-response/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseType,
          message,
          additionalData
        }),
      });

      if (response.ok) {
        // Refresh notifications after response
        await fetchNotifications();
        await fetchInteractiveNotifications();
      }
    } catch (error) {
      console.error('Error handling interactive response:', error);
    }
  }, [API_BASE_URL, getAuthToken, fetchNotifications, fetchInteractiveNotifications]);

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
          prev.map(n => n.id === notificationId ? { ...n, status: 'READ' as const } : n)
        );
        setPersonalNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, status: 'read' as const } : n)
        );
        setInteractiveNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, status: 'read' as const } : n)
        );
        
        // Update counts
        setUnreadCount(prev => Math.max(0, prev - 1));
        setPersonalUnreadCount(prev => Math.max(0, prev - 1));
        setInteractiveUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(async (notificationIds: number[]) => {
    try {
      const promises = notificationIds.map(id => markAsRead(id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
    }
  }, [markAsRead]);

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
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setPersonalNotifications(prev => prev.filter(n => n.id !== notificationId));
        setInteractiveNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        // Update counts
        setUnreadCount(prev => Math.max(0, prev - 1));
        setPersonalUnreadCount(prev => Math.max(0, prev - 1));
        setInteractiveUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Filtering functions
  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  const getNotificationsByType = useCallback((types: string[]) => {
    return notifications.filter(n => types.includes(n.jenis));
  }, [notifications]);

  const filterNotifications = useCallback((filters: {
    types?: string[];
    status?: string;
    isPersonal?: boolean;
    requiresInteraction?: boolean;
  }) => {
    return notifications.filter(n => {
      if (filters.types && !filters.types.includes(n.jenis)) return false;
      if (filters.status && n.status !== filters.status) return false;
      if (filters.isPersonal !== undefined && n.isPersonal !== filters.isPersonal) return false;
      if (filters.requiresInteraction !== undefined && n.requiresInteraction !== filters.requiresInteraction) return false;
      return true;
    });
  }, [notifications]);

  // Send personal attendance reminder (admin/supervisor only)
  const sendPersonalAttendanceReminder = useCallback(async (data: {
    userId: number;
    shiftTime: string;
    location: string;
    reminderMinutes?: number;
  }) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/user-notifications/personal-attendance-reminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error sending personal attendance reminder:', error);
    }
  }, [API_BASE_URL, getAuthToken, fetchNotifications]);

  // Send personal task assignment (admin/supervisor only)
  const sendPersonalTaskAssignment = useCallback(async (data: {
    userId: number;
    taskId: number;
    taskTitle: string;
    description: string;
    dueDate: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    assignedBy: string;
  }) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/user-notifications/personal-task-assignment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error sending personal task assignment:', error);
    }
  }, [API_BASE_URL, getAuthToken, fetchNotifications]);

  // Send interactive announcement (admin/supervisor only)
  const sendInteractiveAnnouncement = useCallback(async (data: {
    title: string;
    content: string;
    targetRoles: string[];
    interactionType: 'INTEREST' | 'CONFIRMATION' | 'FEEDBACK';
    deadline?: string;
    maxParticipants?: number;
  }) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/user-notifications/interactive-announcement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchNotifications();
        await fetchInteractiveNotifications();
      }
    } catch (error) {
      console.error('Error sending interactive announcement:', error);
    }
  }, [API_BASE_URL, getAuthToken, fetchNotifications, fetchInteractiveNotifications]);

  // WebSocket connection placeholders
  const connect = useCallback(() => {
    // Implement WebSocket connection if needed
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    // Implement WebSocket disconnection if needed
    setIsConnected(false);
  }, []);

  // Initial data fetch
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchNotifications();
      fetchPersonalNotifications();
      fetchInteractiveNotifications();
    }
  }, [fetchNotifications, fetchPersonalNotifications, fetchInteractiveNotifications, getAuthToken]);

  const value: EnhancedNotificationContextType = {
    notifications,
    personalNotifications,
    interactiveNotifications,
    unreadCount,
    personalUnreadCount,
    interactiveUnreadCount,
    isConnected,
    markAsRead,
    markMultipleAsRead,
    deleteNotification,
    fetchNotifications,
    fetchPersonalNotifications,
    fetchInteractiveNotifications,
    handleInteractiveResponse,
    getNotificationsByCategory,
    getNotificationsByType,
    filterNotifications,
    sendPersonalAttendanceReminder,
    sendPersonalTaskAssignment,
    sendInteractiveAnnouncement,
    connect,
    disconnect,
  };

  return (
    <EnhancedNotificationContext.Provider value={value}>
      {children}
    </EnhancedNotificationContext.Provider>
  );
}

export function useEnhancedNotifications() {
  const context = useContext(EnhancedNotificationContext);
  if (context === undefined) {
    throw new Error('useEnhancedNotifications must be used within an EnhancedNotificationProvider');
  }
  return context;
}

export default EnhancedNotificationContext;
