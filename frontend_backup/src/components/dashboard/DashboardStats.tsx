'use client';

import React from 'react';
import { Users, Calendar, Clock, Activity, TrendingUp, AlertCircle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  description 
}) => {
  const changeColorClass = {
    positive: 'text-hospitalGreen',
    negative: 'text-red-500',
    neutral: 'text-gray-500'
  }[changeType];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-hospitalBlue/10 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center gap-1 ${changeColorClass}`}>
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">
          {description}
        </p>
      )}
    </div>
  );
};

interface DashboardStatsProps {
  userRole?: string;
  isAdmin?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ userRole, isAdmin = false }) => {
  // Mock data - replace with real API calls
  const adminStats = [
    {
      title: "Total Pegawai",
      value: "245",
      change: "+12%",
      changeType: "positive" as const,
      icon: <Users className="w-5 h-5 text-hospitalBlue" />,
      description: "Peningkatan dari bulan lalu"
    },
    {
      title: "Shift Aktif Hari Ini",
      value: "89",
      change: "+5%",
      changeType: "positive" as const,
      icon: <Calendar className="w-5 h-5 text-hospitalBlue" />,
      description: "Dari total 95 shift"
    },
    {
      title: "Tingkat Kehadiran",
      value: "94.5%",
      change: "-2.1%",
      changeType: "negative" as const,
      icon: <Clock className="w-5 h-5 text-hospitalBlue" />,
      description: "Rata-rata minggu ini"
    },
    {
      title: "Operasi Darurat",
      value: "12",
      change: "+3",
      changeType: "neutral" as const,
      icon: <Activity className="w-5 h-5 text-hospitalBlue" />,
      description: "Aktif saat ini"
    }
  ];

  const employeeStats = [
    {
      title: "Shift Bulan Ini",
      value: "22",
      icon: <Calendar className="w-5 h-5 text-hospitalBlue" />,
      description: "Dari total 24 shift"
    },
    {
      title: "Jam Kerja",
      value: "176h",
      change: "+8h",
      changeType: "positive" as const,
      icon: <Clock className="w-5 h-5 text-hospitalBlue" />,
      description: "Bulan ini"
    },
    {
      title: "Tingkat Kehadiran",
      value: "98.5%",
      icon: <Activity className="w-5 h-5 text-hospitalBlue" />,
      description: "Performa excellent"
    },
  ];

  const stats = isAdmin ? adminStats : employeeStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
