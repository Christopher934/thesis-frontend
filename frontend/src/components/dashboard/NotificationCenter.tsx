'use client';

import React from 'react';
import { AlertCircle, Info, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  urgent?: boolean;
}

interface NotificationCenterProps {
  userRole?: string;
  isAdmin?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userRole, isAdmin = false }) => {
  // Mock notifications - replace with real API calls
  const adminNotifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Shift Kekurangan Staff',
      message: 'Unit IGD membutuhkan 2 perawat tambahan untuk shift malam',
      type: 'warning',
      timestamp: '2 menit lalu',
      read: false,
      urgent: true
    },
    {
      id: '2',
      title: 'Permohonan Tukar Shift',
      message: '5 permintaan tukar shift memerlukan persetujuan supervisor',
      type: 'info',
      timestamp: '15 menit lalu',
      read: false
    },
    {
      id: '3',
      title: 'Laporan Harian Selesai',
      message: 'Laporan absensi harian telah berhasil diproses',
      type: 'success',
      timestamp: '1 jam lalu',
      read: true
    },
    {
      id: '4',
      title: 'Sistem Maintenance',
      message: 'Jadwal maintenance sistem pada Minggu, 00:00-06:00',
      type: 'info',
      timestamp: '3 jam lalu',
      read: true
    }
  ];

  const employeeNotifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Shift Besok Disetujui',
      message: 'Permintaan tukar shift Anda untuk besok telah disetujui',
      type: 'success',
      timestamp: '5 menit lalu',
      read: false
    },
    {
      id: '2',
      title: 'Reminder Absen',
      message: 'Jangan lupa absen masuk untuk shift pagi hari ini',
      type: 'warning',
      timestamp: '30 menit lalu',
      read: false
    },
    {
      id: '3',
      title: 'Jadwal Baru Ditambahkan',
      message: 'Shift tambahan untuk Sabtu telah ditambahkan ke jadwal Anda',
      type: 'info',
      timestamp: '2 jam lalu',
      read: true
    },
    {
      id: '4',
      title: 'Evaluasi Kinerja',
      message: 'Evaluasi kinerja bulanan Anda telah selesai. Skor: Excellent',
      type: 'success',
      timestamp: '1 hari lalu',
      read: true
    }
  ];

  const notifications = isAdmin ? adminNotifications : employeeNotifications;

  const getIcon = (type: NotificationItem['type']) => {
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

  const getBgColor = (type: NotificationItem['type'], read: boolean) => {
    if (read) return 'bg-gray-50';
    
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
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
          <button className="text-sm text-hospitalBlue hover:text-hospitalBlue/80">
            Lihat Semua
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              p-4 rounded-lg border transition-all duration-200 hover:shadow-sm
              ${getBgColor(notification.type, notification.read)}
              ${notification.urgent ? 'border-l-4 border-l-red-500' : 'border-gray-200'}
              ${!notification.read ? 'border-l-4 border-l-hospitalBlue' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h3>
                  {notification.urgent && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{notification.timestamp}</span>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-hospitalBlue rounded-full ml-auto"></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Tidak ada notifikasi</p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
