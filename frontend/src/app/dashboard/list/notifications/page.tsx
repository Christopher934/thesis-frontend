'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, Clock, Info, AlertCircle, XCircle, Filter, Search, Trash2 } from 'lucide-react';

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'event' | 'shift' | 'absensi' | 'system' | 'approval'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string>('');

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

  // Get user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    setUserRole(role);
    fetchNotifications();
  }, [fetchNotifications]);

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

  // Mark multiple notifications as read
  const markMultipleAsRead = async (notificationIds: number[]) => {
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
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n.id) ? { ...n, status: 'READ' as const } : n
          )
        );
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
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
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Apply role-based filtering to notifications
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
        return <AlertCircle className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getBgColor = (jenis: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    
    const type = getNotificationType(jenis);
    switch (type) {
      case 'info':
        return 'bg-blue-50';
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-white';
    }
  };

  // Apply all filters to notifications
  const filteredNotifications = getFilteredNotifications().filter(notification => {
    const matchesSearch = notification.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.pesan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
                       (filterType === 'read' && notification.status === 'READ') ||
                       (filterType === 'unread' && notification.status === 'UNREAD');
    
    let matchesCategory = true;
    if (filterCategory !== 'all') {
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
      matchesCategory = getNotificationCategory(notification.jenis) === filterCategory;
    }
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(notificationId);
  };

  const handleMarkAsUnread = (notificationId: number) => {
    // Note: Backend might not support marking as unread
    // This would require a separate API endpoint
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'UNREAD' as const }
          : notification
      )
    );
  };

  const handleDelete = (notificationId: number) => {
    deleteNotification(notificationId);
  };

  const handleBulkAction = (action: 'read' | 'unread' | 'delete') => {
    if (selectedNotifications.length === 0) return;

    switch (action) {
      case 'read':
        markMultipleAsRead(selectedNotifications);
        break;
      case 'unread':
        // Note: Backend might not support bulk unread
        setNotifications(prev => 
          prev.map(notification => 
            selectedNotifications.includes(notification.id)
              ? { ...notification, status: 'UNREAD' as const }
              : notification
          )
        );
        setSelectedNotifications([]);
        break;
      case 'delete':
        // Note: Would need bulk delete API endpoint
        selectedNotifications.forEach(id => deleteNotification(id));
        break;
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Notifications</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Semua Notifikasi</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 && `${unreadCount} notifikasi belum dibaca • `}
                  Total {notifications.length} notifikasi
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari notifikasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="unread">Belum Dibaca</option>
                <option value="read">Sudah Dibaca</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="event">Event</option>
                <option value="shift">Shift</option>
                <option value="absensi">Absensi</option>
                <option value="system">Sistem</option>
                {userRole?.toUpperCase() === 'SUPERVISOR' && (
                  <option value="approval">Persetujuan</option>
                )}
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} item dipilih:
                </span>
                <button
                  onClick={() => handleBulkAction('read')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Tandai Dibaca
                </button>
                <button
                  onClick={() => handleBulkAction('unread')}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Tandai Belum Dibaca
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? 'Tidak ada notifikasi yang sesuai dengan filter'
                  : 'Tidak ada notifikasi'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  bg-white rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer
                  ${getBgColor(notification.jenis, notification.status === 'READ')}
                  ${isUrgent(notification.jenis) ? 'border-l-4 border-l-red-500' : ''}
                  ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications(prev => [...prev, notification.id]);
                        } else {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                        }
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.jenis)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${notification.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.judul}
                            {isUrgent(notification.jenis) && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Urgent
                              </span>
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">{notification.pesan}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">
                              {(() => {
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
                                return categoryMap[notification.jenis] || 'system';
                              })()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {notification.status === 'UNREAD' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Tandai sudah dibaca"
                            >
                              <CheckCircle className="w-4 h-4 text-gray-400" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsUnread(notification.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Tandai belum dibaca"
                            >
                              <Bell className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Hapus notifikasi"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                          {notification.status === 'UNREAD' && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700">
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
