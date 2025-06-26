'use client';

import React, { useEffect, useState } from 'react';
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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        // Ganti endpoint sesuai backend Anda
        const res = await fetch(`${apiUrl}/activities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        } else {
          setActivities([]);
        }
      } catch (err) {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
    // Optional: polling setiap 30 detik
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

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
        {loading ? (
          <div className="text-center py-8 text-gray-400">Memuat aktivitas...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Belum ada aktivitas</p>
          </div>
        ) : (
          activities.map((activity) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
