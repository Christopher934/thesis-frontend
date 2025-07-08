/**
 * NotificationDropdown - Dropdown list untuk menampilkan notifikasi
 * Dengan fitur mark as read, delete, dan real-time updates
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Calendar,
  Users,
  Bell,
  Settings,
  Trash2,
  Check,
  CheckCheck
} from 'lucide-react';
import { useNotifications } from './NotificationContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Icon mapping untuk jenis notifikasi
const getNotificationIcon = (jenis: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'REMINDER_SHIFT': <Clock className="w-4 h-4 text-blue-500" />,
    'KONFIRMASI_TUKAR_SHIFT': <Users className="w-4 h-4 text-purple-500" />,
    'PERSETUJUAN_CUTI': <CheckCircle className="w-4 h-4 text-green-500" />,
    'KEGIATAN_HARIAN': <Calendar className="w-4 h-4 text-orange-500" />,
    'PERINGATAN_TERLAMBAT': <AlertTriangle className="w-4 h-4 text-red-500" />,
    'SHIFT_BARU': <Bell className="w-4 h-4 text-indigo-500" />,
    'SISTEM_INFO': <Info className="w-4 h-4 text-gray-500" />,
    'PENGUMUMAN': <Settings className="w-4 h-4 text-cyan-500" />,
  };
  
  return iconMap[jenis] || <Info className="w-4 h-4 text-gray-500" />;
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

export function NotificationDropdown({ 
  isOpen, 
  onClose, 
  className = '' 
}: NotificationDropdownProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markMultipleAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Filter notifications
  const filteredNotifications = showOnlyUnread 
    ? notifications.filter(n => n.status === 'UNREAD')
    : notifications;

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

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead(notificationId);
  };

  // Handle bulk mark as read
  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await markMultipleAsRead(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  // Handle delete
  const handleDelete = async (notificationId: number) => {
    await deleteNotification(notificationId);
    setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={`absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Notifikasi
            {unreadCount > 0 && (
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                {unreadCount} baru
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Pilih semua</span>
            </label>
            
            <button
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              className={`text-sm px-2 py-1 rounded ${
                showOnlyUnread 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {showOnlyUnread ? 'Semua' : 'Belum dibaca'}
            </button>
          </div>

          {selectedNotifications.length > 0 && (
            <button
              onClick={handleBulkMarkAsRead}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <CheckCheck size={16} />
              <span>Tandai dibaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-2 text-gray-300" />
            <p>{showOnlyUnread ? 'Tidak ada notifikasi baru' : 'Tidak ada notifikasi'}</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                notification.status === 'UNREAD' ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Selection checkbox */}
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        notification.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.judul}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.pesan}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-2">
                      {notification.status === 'UNREAD' && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Tandai dibaca"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              // TODO: Navigate to full notification page
              console.log('Navigate to all notifications');
            }}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Lihat semua notifikasi
          </button>
        </div>
      )}
    </div>
  );
}
