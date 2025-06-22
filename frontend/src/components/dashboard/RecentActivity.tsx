'use client';

import React from 'react';
import { Calendar, Users, Clock, Activity } from 'lucide-react';

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'shift' | 'attendance' | 'system' | 'request';
}

interface RecentActivityProps {
  userRole?: string;
  isAdmin?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ userRole, isAdmin = false }) => {
  // Mock activity data - replace with real API calls
  const adminActivities: ActivityItem[] = [
    {
      id: '1',
      user: 'Dr. Sarah Wijaya',
      action: 'menambahkan',
      target: 'shift malam di ICU',
      timestamp: '5 menit lalu',
      type: 'shift'
    },
    {
      id: '2',
      user: 'Ns. Ahmad Fauzi',
      action: 'melakukan',
      target: 'absen masuk tepat waktu',
      timestamp: '12 menit lalu',
      type: 'attendance'
    },
    {
      id: '3',
      user: 'Sistem',
      action: 'memproses',
      target: 'laporan harian otomatis',
      timestamp: '1 jam lalu',
      type: 'system'
    },
    {
      id: '4',
      user: 'Ns. Linda Sari',
      action: 'mengajukan',
      target: 'tukar shift dengan Ns. Maya',
      timestamp: '2 jam lalu',
      type: 'request'
    },
    {
      id: '5',
      user: 'Dr. Budi Santoso',
      action: 'menyetujui',
      target: 'permintaan cuti Ns. Rina',
      timestamp: '3 jam lalu',
      type: 'system'
    }
  ];

  const employeeActivities: ActivityItem[] = [
    {
      id: '1',
      user: 'Anda',
      action: 'melakukan',
      target: 'absen masuk shift pagi',
      timestamp: '2 jam lalu',
      type: 'attendance'
    },
    {
      id: '2',
      user: 'Supervisor',
      action: 'menyetujui',
      target: 'permintaan tukar shift Anda',
      timestamp: '1 hari lalu',
      type: 'shift'
    },
    {
      id: '3',
      user: 'Anda',
      action: 'mengajukan',
      target: 'tukar shift hari Sabtu',
      timestamp: '2 hari lalu',
      type: 'request'
    },
    {
      id: '4',
      user: 'Sistem',
      action: 'mengirim',
      target: 'reminder jadwal shift besok',
      timestamp: '3 hari lalu',
      type: 'system'
    },
    {
      id: '5',
      user: 'Anda',
      action: 'melengkapi',
      target: 'evaluasi kinerja bulanan',
      timestamp: '1 minggu lalu',
      type: 'system'
    }
  ];

  const activities = isAdmin ? adminActivities : employeeActivities;

  const getIcon = (type: ActivityItem['type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'shift':
        return <Calendar className={`${iconClass} text-blue-500`} />;
      case 'attendance':
        return <Clock className={`${iconClass} text-green-500`} />;
      case 'system':
        return <Activity className={`${iconClass} text-purple-500`} />;
      case 'request':
        return <Users className={`${iconClass} text-orange-500`} />;
      default:
        return <Activity className={`${iconClass} text-gray-500`} />;
    }
  };

  const getTypeLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'shift':
        return 'Jadwal';
      case 'attendance':
        return 'Absensi';
      case 'system':
        return 'Sistem';
      case 'request':
        return 'Permintaan';
      default:
        return 'Aktivitas';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
        <button className="text-sm text-hospitalBlue hover:text-hospitalBlue/80">
          Lihat Semua
        </button>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
            <div className="flex-shrink-0 mt-1">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {getTypeLabel(activity.type)}
                </span>
              </div>
              <p className="text-sm text-gray-900 mb-1">
                <span className="font-medium">{activity.user}</span>
                {' '}{activity.action}{' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Belum ada aktivitas</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
