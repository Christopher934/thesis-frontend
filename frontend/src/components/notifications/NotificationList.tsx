'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Info, 
  Users, 
  Calendar,
  Settings,
  Trash2,
  Check,
  Eye,
  Filter,
  Search
} from 'lucide-react';

interface Notification {
  id: number;
  userId: number;
  judul: string;  // Menggunakan struktur dari model Notifikasi yang sudah ada
  pesan: string;  // Menggunakan struktur dari model Notifikasi yang sudah ada
  jenis: 'REMINDER_SHIFT' | 'KONFIRMASI_TUKAR_SHIFT' | 'PERSETUJUAN_CUTI' | 'KEGIATAN_HARIAN' | 'ABSENSI_TERLAMBAT' | 'SHIFT_BARU_DITAMBAHKAN' | 'SISTEM_INFO' | 'PENGUMUMAN' | 'INFORMASI_EVENT';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  data?: any;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    namaDepan: string;
    namaBelakang: string;
    role: string;
  };
}

interface NotificationListProps {
  userId: number;
  role: 'ADMIN' | 'SUPERVISOR' | 'PERAWAT' | 'DOKTER';
  className?: string;
}

// Icon mapping berdasarkan jenis notifikasi
const getNotificationIcon = (jenis: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'PERSETUJUAN_CUTI': <CheckCircle className="w-5 h-5 text-green-500" />,
    'REMINDER_SHIFT': <Clock className="w-5 h-5 text-blue-500" />,
    'KONFIRMASI_TUKAR_SHIFT': <Clock className="w-5 h-5 text-blue-500" />,
    'SHIFT_BARU_DITAMBAHKAN': <Clock className="w-5 h-5 text-blue-500" />,
    'ABSENSI_TERLAMBAT': <Users className="w-5 h-5 text-purple-500" />,
    'KEGIATAN_HARIAN': <Calendar className="w-5 h-5 text-orange-500" />,
    'INFORMASI_EVENT': <Calendar className="w-5 h-5 text-orange-500" />,
    'SISTEM_INFO': <Settings className="w-5 h-5 text-gray-500" />,
    'PENGUMUMAN': <Settings className="w-5 h-5 text-gray-500" />,
  };
  
  return iconMap[jenis] || <Info className="w-5 h-5 text-gray-500" />;
};

// Color mapping berdasarkan jenis notifikasi
const getNotificationColor = (jenis: string, isRead: boolean) => {
  const baseColors = {
    'PERSETUJUAN_CUTI': isRead ? 'bg-green-50 border-green-100' : 'bg-green-100 border-green-200',
    'REMINDER_SHIFT': isRead ? 'bg-blue-50 border-blue-100' : 'bg-blue-100 border-blue-200',
    'KONFIRMASI_TUKAR_SHIFT': isRead ? 'bg-blue-50 border-blue-100' : 'bg-blue-100 border-blue-200',
    'SHIFT_BARU_DITAMBAHKAN': isRead ? 'bg-blue-50 border-blue-100' : 'bg-blue-100 border-blue-200',
    'ABSENSI_TERLAMBAT': isRead ? 'bg-purple-50 border-purple-100' : 'bg-purple-100 border-purple-200',
    'KEGIATAN_HARIAN': isRead ? 'bg-orange-50 border-orange-100' : 'bg-orange-100 border-orange-200',
    'INFORMASI_EVENT': isRead ? 'bg-orange-50 border-orange-100' : 'bg-orange-100 border-orange-200',
    'SISTEM_INFO': isRead ? 'bg-gray-50 border-gray-100' : 'bg-gray-100 border-gray-200',
    'PENGUMUMAN': isRead ? 'bg-gray-50 border-gray-100' : 'bg-gray-100 border-gray-200',
  };
  
  return baseColors[jenis as keyof typeof baseColors] || 'bg-gray-50 border-gray-100';
};

// Format waktu relatif
const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const notificationDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  
  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays === 1) return 'Kemarin';
  if (diffInDays < 7) return `${diffInDays} hari lalu`;
  
  return notificationDate.toLocaleDateString('id-ID');
};

export function NotificationList({ userId, role, className = '' }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'approval' | 'shift' | 'absensi' | 'event' | 'system'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Base API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'; // Updated to correct backend port

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch notifications
  const fetchNotifications = async () => {
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
  };

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
            n.id === notificationId ? { ...n, status: 'READ' } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark multiple notifications as read
  const markMultipleAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifikasi/mark-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedNotifications }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            selectedNotifications.includes(n.id) ? { ...n, status: 'READ' } : n
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

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.pesan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
                       (filterType === 'read' && notification.status === 'READ') ||
                       (filterType === 'unread' && notification.status === 'UNREAD');
    
    let matchesCategory = true;
    if (filterCategory !== 'all') {
      // Map jenis to categories
      const categoryMap: Record<string, string> = {
        'PERSETUJUAN_CUTI': 'approval',
        'REMINDER_SHIFT': 'shift',
        'KONFIRMASI_TUKAR_SHIFT': 'shift',
        'SHIFT_BARU_DITAMBAHKAN': 'shift',
        'ABSENSI_TERLAMBAT': 'absensi',
        'KEGIATAN_HARIAN': 'event',
        'INFORMASI_EVENT': 'event',
        'SISTEM_INFO': 'system',
        'PENGUMUMAN': 'system'
      };
      
      const notificationCategory = categoryMap[notification.jenis] || 'system';
      matchesCategory = notificationCategory === filterCategory;
    }
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Handle select notification
  const handleSelectNotification = (notificationId: number) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    const allIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(
      selectedNotifications.length === allIds.length ? [] : allIds
    );
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
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
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 && `${unreadCount} unread • `}
                Total {notifications.length} notifications
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
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
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {role === 'ADMIN' && (
                <>
                  <option value="approval">Approval</option>
                  <option value="shift">Shift</option>
                  <option value="absensi">Absensi</option>
                  <option value="event">Event</option>
                  <option value="system">System</option>
                </>
              )}
              {role === 'SUPERVISOR' && (
                <>
                  <option value="approval">Approval</option>
                  <option value="shift">Shift</option>
                  <option value="event">Event</option>
                  <option value="system">System</option>
                </>
              )}
              {(role === 'PERAWAT' || role === 'DOKTER') && (
                <>
                  <option value="shift">Shift</option>
                  <option value="absensi">Absensi</option>
                  <option value="event">Event</option>
                  <option value="system">System</option>
                </>
              )}
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} selected:
              </span>
              <button
                onClick={markMultipleAsRead}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Mark as Read
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
                ? 'No notifications match your filters'
                : 'No notifications found'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Select All */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Select all ({filteredNotifications.length} notifications)
                </span>
              </label>
            </div>

            {/* Notification Items */}
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  bg-white rounded-lg border transition-all duration-200 hover:shadow-md
                  ${getNotificationColor(notification.jenis, notification.status === 'READ')}
                  ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.jenis)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${notification.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.judul}
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {notification.jenis}
                            </span>
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">{notification.pesan}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.user && role === 'ADMIN' && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {notification.user.namaDepan} {notification.user.namaBelakang}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {notification.status === 'UNREAD' && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Delete notification"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
