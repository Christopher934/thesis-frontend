'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AlertCircle, Info, CheckCircle, XCircle, Clock, Bell, RefreshCw } from 'lucide-react';

interface NotificationItem {
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

interface NotificationCenterProps {
  userRole?: string;
  userId?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userRole, userId }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Base API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifikasi`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch notifications: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
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
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Apply role-based filtering
  const getFilteredNotifications = (): NotificationItem[] => {
    const normalizedRole = userRole?.toUpperCase();
    
    if (!normalizedRole) return notifications;

    return notifications.filter(notification => {
      // Convert notification type to our category system
      const getNotificationCategory = (jenis: string): string => {
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
      };

      const category = getNotificationCategory(notification.jenis);
      
      // Admin can see all notifications
      if (normalizedRole === 'ADMIN') {
        return true;
      }
      
      // Supervisor can see their role notifications + approval requests
      if (normalizedRole === 'SUPERVISOR') {
        return ['approval', 'event', 'system'].includes(category) ||
               ['REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'SHIFT_BARU', 'KEGIATAN_HARIAN', 'SISTEM_INFO', 'PENGUMUMAN'].includes(notification.jenis);
      }
      
      // Regular users (PERAWAT, DOKTER, STAF) can see specific categories
      if (['PERAWAT', 'DOKTER', 'STAF'].includes(normalizedRole)) {
        return ['event', 'absensi', 'shift', 'system'].includes(category) ||
               ['REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'KEGIATAN_HARIAN', 'PERINGATAN_TERLAMBAT', 'SHIFT_BARU', 'SISTEM_INFO'].includes(notification.jenis);
      }
      
      return false;
    });
  };

  const filteredNotifications = getFilteredNotifications();

  // Get notification type and color based on jenis
  const getNotificationType = (jenis: string): 'info' | 'success' | 'warning' | 'error' => {
    const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
      'REMINDER_SHIFT': 'warning',
      'KONFIRMASI_TUKAR_SHIFT': 'info',
      'PERSETUJUAN_CUTI': 'warning',
      'KEGIATAN_HARIAN': 'info',
      'PERINGATAN_TERLAMBAT': 'error',
      'SHIFT_BARU': 'success',
      'SISTEM_INFO': 'info',
      'PENGUMUMAN': 'info'
    };
    
    return typeMap[jenis] || 'info';
  };

  // Check if notification is urgent
  const isUrgent = (jenis: string): boolean => {
    const urgentTypes = ['PERINGATAN_TERLAMBAT', 'PERSETUJUAN_CUTI'];
    return urgentTypes.includes(jenis);
  };

  // Format timestamp to relative time
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  };

  const getIcon = (jenis: string) => {
    const type = getNotificationType(jenis);
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'info':
        return <Info className={`${iconClass} text-blue-500`} />;
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <AlertCircle className={`${iconClass} text-orange-500`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getBgColor = (jenis: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    
    const type = getNotificationType(jenis);
    switch (type) {
      case 'info':
        return 'bg-blue-50';
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-orange-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Notifikasi</h2>
        <div className="flex items-center gap-2">
          {filteredNotifications.filter(n => n.status === 'UNREAD').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {filteredNotifications.filter(n => n.status === 'UNREAD').length}
            </span>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link 
            href="/dashboard/list/notifications"
            className="text-sm text-hospitalBlue hover:text-hospitalBlue/80 transition-colors"
          >
            Lihat Semua
          </Link>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-500 text-sm">Memuat notifikasi...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-8">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchNotifications}
            className="text-sm text-hospitalBlue hover:text-hospitalBlue/80 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Notifications list */}
      {!loading && !error && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                p-4 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer
                ${getBgColor(notification.jenis, notification.status === 'READ')}
                ${isUrgent(notification.jenis) ? 'border-l-4 border-l-red-500' : 'border-gray-200'}
                ${notification.status === 'UNREAD' ? 'border-l-4 border-l-hospitalBlue' : ''}
              `}
              onClick={() => notification.status === 'UNREAD' && markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.jenis)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-medium ${notification.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.judul}
                    </h3>
                    {isUrgent(notification.jenis) && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                    {notification.pesan}
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
                    {notification.status === 'UNREAD' && (
                      <span className="w-2 h-2 bg-hospitalBlue rounded-full ml-auto"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredNotifications.length === 0 && (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Tidak ada notifikasi</p>
          <p className="text-gray-400 text-xs mt-1">
            {userRole && `Notifikasi untuk ${userRole.toLowerCase()} akan muncul di sini`}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
