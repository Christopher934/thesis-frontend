'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  disabled?: boolean;
}

interface QuickActionsProps {
  userRole?: string;
  isAdmin?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ userRole, isAdmin = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
  };

  const adminActions: QuickAction[] = [
    {
      title: "Kelola Jadwal Shift",
      description: "Atur dan monitor jadwal shift seluruh pegawai",
      icon: <Calendar className="w-6 h-6" />,
      href: "/list/managemenjadwal",
      color: "blue"
    },
    {
      title: "Manajemen Absensi",
      description: "Pantau kehadiran dan keterlambatan pegawai",
      icon: <Clock className="w-6 h-6" />,
      href: "/list/manajemen-absensi",
      color: "green"
    },
    {
      title: "Kelola Pegawai",
      description: "Tambah, edit, dan kelola data pegawai",
      icon: <Users className="w-6 h-6" />,
      href: "/list/pegawai",
      color: "purple"
    },
    {
      title: "Laporan Sistem",
      description: "Lihat laporan dan analitik komprehensif",
      icon: <AlertTriangle className="w-6 h-6" />,
      href: "/list/laporan",
      color: "orange"
    }
  ];

  const employeeActions: QuickAction[] = [
    {
      title: "Jadwal Saya",
      description: "Lihat jadwal shift dan kalender pribadi",
      icon: <Calendar className="w-6 h-6" />,
      href: "/list/jadwalsaya",
      color: "blue"
    },
    {
      title: "Absen Masuk/Keluar",
      description: "Catat kehadiran harian Anda",
      icon: <CheckCircle className="w-6 h-6" />,
      href: "/list/dashboard-absensi",
      color: "green"
    },
    {
      title: "Ajukan Tukar Shift",
      description: "Request pertukaran jadwal dengan rekan kerja",
      icon: <XCircle className="w-6 h-6" />,
      href: "/list/ajukantukarshift",
      color: "orange"
    },
    {
      title: "Riwayat Absensi",
      description: "Pantau riwayat kehadiran Anda",
      icon: <Clock className="w-6 h-6" />,
      href: "/list/riwayat-absensi",
      color: "purple"
    }
  ];

  const actions = isAdmin ? adminActions : employeeActions;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Aksi Cepat</h2>
        <div className="text-sm text-gray-500">
          {isAdmin ? 'Panel Admin' : 'Panel Pegawai'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className={`
              flex items-start gap-4 p-4 rounded-lg border transition-all duration-200
              ${colorClasses[action.color]}
              ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex-shrink-0 mt-1">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm mb-1">{action.title}</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                {action.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
