/**
 * Enhanced Personal Notifications Component
 * Displays user-specific notifications with interaction capabilities
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useEnhancedNotifications } from './EnhancedNotificationContext';

interface PersonalNotificationsProps {
  className?: string;
}

export function PersonalNotifications({ className = '' }: PersonalNotificationsProps) {
  const {
    personalNotifications,
    personalUnreadCount,
    markAsRead,
    deleteNotification,
    fetchPersonalNotifications,
  } = useEnhancedNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'personal' | 'warnings'>('all');
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPersonalNotifications();
  }, [fetchPersonalNotifications]);

  const filteredNotifications = personalNotifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return notification.status === 'UNREAD';
      case 'personal':
        return ['TUGAS_PERSONAL', 'PERSONAL_REMINDER_ABSENSI', 'REMINDER_MEETING_PERSONAL'].includes(notification.jenis);
      case 'warnings':
        return notification.jenis === 'PERINGATAN_PERSONAL';
      default:
        return true;
    }
  });

  const toggleExpanded = (notificationId: number) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: number) => {
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (jenis: string) => {
    const iconMap: { [key: string]: string } = {
      'PERSONAL_REMINDER_ABSENSI': '⏰',
      'TUGAS_PERSONAL': '📋',
      'HASIL_EVALUASI_PERSONAL': '📊',
      'KONFIRMASI_SHIFT_SWAP_PERSONAL': '🔄',
      'NOTIFIKASI_DIREKTUR': '👔',
      'REMINDER_MEETING_PERSONAL': '📅',
      'PERINGATAN_PERSONAL': '⚠️'
    };
    return iconMap[jenis] || '📢';
  };

  const getPriorityColor = (notification: any) => {
    if (notification.jenis === 'PERINGATAN_PERSONAL') return 'border-red-500 bg-red-50';
    if (notification.jenis === 'NOTIFIKASI_DIREKTUR') return 'border-purple-500 bg-purple-50';
    if (notification.data?.priority === 'HIGH' || notification.data?.priority === 'URGENT') return 'border-orange-500 bg-orange-50';
    return 'border-blue-500 bg-blue-50';
  };

  return (
    <div className={`personal-notifications ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Personal Notifications
          {personalUnreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-sm rounded-full px-2 py-1">
              {personalUnreadCount}
            </span>
          )}
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded ${filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('personal')}
            className={`px-3 py-1 rounded ${filter === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Tasks
          </button>
          <button
            onClick={() => setFilter('warnings')}
            className={`px-3 py-1 rounded ${filter === 'warnings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Warnings
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No personal notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 rounded-lg p-4 ${getPriorityColor(notification)} ${
                notification.status === 'UNREAD' ? 'shadow-md' : 'opacity-75'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getNotificationIcon(notification.jenis)}</span>
                    <h3 className="font-semibold text-gray-800">{notification.judul}</h3>
                    {notification.status === 'UNREAD' && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-2">{notification.pesan}</p>
                  
                  {expandedNotifications.has(notification.id) && notification.data && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <h4 className="font-medium mb-2">Details:</h4>
                      {notification.jenis === 'TUGAS_PERSONAL' && (
                        <div className="space-y-1 text-sm">
                          <p><strong>Priority:</strong> {notification.data.priority}</p>
                          <p><strong>Due Date:</strong> {notification.data.dueDate}</p>
                          <p><strong>Assigned By:</strong> {notification.data.assignedBy}</p>
                          <p><strong>Description:</strong> {notification.data.description}</p>
                        </div>
                      )}
                      {notification.jenis === 'HASIL_EVALUASI_PERSONAL' && (
                        <div className="space-y-1 text-sm">
                          <p><strong>Score:</strong> {notification.data.score}/100</p>
                          <p><strong>Evaluation Type:</strong> {notification.data.evaluationType}</p>
                          <p><strong>Evaluated By:</strong> {notification.data.evaluatedBy}</p>
                          <p><strong>Feedback:</strong> {notification.data.feedback}</p>
                        </div>
                      )}
                      {notification.jenis === 'PERINGATAN_PERSONAL' && (
                        <div className="space-y-1 text-sm">
                          <p><strong>Warning Type:</strong> {notification.data.warningType}</p>
                          <p><strong>Severity:</strong> {notification.data.severity}</p>
                          <p><strong>Reason:</strong> {notification.data.reason}</p>
                          <p><strong>Issued By:</strong> {notification.data.issuedBy}</p>
                          {notification.data.actionRequired && (
                            <p><strong>Action Required:</strong> {notification.data.actionRequired}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleExpanded(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {expandedNotifications.has(notification.id) ? 'Less' : 'More'}
                      </button>
                      
                      {notification.status === 'UNREAD' && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          Mark Read
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
