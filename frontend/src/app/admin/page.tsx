'use client';

import { useState, useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import withAuth from '@/lib/withAuth';

// Import dashboard components
import RecentActivity from '@/components/dashboard/RecentActivity';
import ShiftManagementDashboard from '@/components/dashboard/ShiftManagementDashboard';

// Dynamic imports for existing components - OPTIMIZED FOR SPEED
const UserCard = nextDynamic(() => import('@/components/common/UserCard'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />
});
const CountChart = nextDynamic(() => import('@/components/common/CountChart'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
});
const AttendanceChart = nextDynamic(() => import('@/components/common/AttandenceChart'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
});
const EventCalendar = nextDynamic(() => import('@/components/common/EventCalendar'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
});
const Announcements = nextDynamic(() => import('@/components/common/Announcement'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />
});

// Force dynamic rendering for real-time admin dashboard data
export const dynamic = 'force-dynamic';

interface UserInfo {
  id: number;
  role: string;
  namaDepan: string;
  namaBelakang: string;
  username: string;
}

const AdminPage: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Get user info and current time
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();

    // Update time every minute
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hospitalBlue mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hospitalGrayLight">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {user?.namaDepan || 'Admin'}! 👋
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                {getCurrentDate()} • Panel Administrasi RSUD Anugerah
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-3xl font-bold text-hospitalBlue">{currentTime}</div>
              <p className="text-sm text-gray-500">Waktu Sekarang</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">

        {/* Shift Management Dashboard */}
        <div className="mb-8">
          <ShiftManagementDashboard />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* User Cards Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Statistik Pegawai</h2>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <UserCard type="Dokter" />
                <UserCard type="Perawat" />
                <UserCard type="Staf" />
                <UserCard type="Supervisor" />
                <UserCard type="Total" />
              </div>
            </div>


            {/* Recent Activity */}
            <RecentActivity userRole={user?.role} isAdmin={true} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Event Calendar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Event & Kegiatan</h2>
                <a 
                  href="/dashboard/list/events" 
                  className="text-hospitalBlue hover:text-hospitalBlue/80 text-sm"
                >
                  Kelola Event
                </a>
              </div>
              <EventCalendar />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
          <p>© 2024 RSUD Anugerah Tomohon - Panel Administrasi Sistem</p>
          <p className="mt-1">Admin Panel v2.1.0 • Last Update: {getCurrentDate()}</p>
        </div>
      </div>
    </div>
  );
};

// Proteksi halaman hanya untuk role ADMIN dan SUPERVISOR
export default withAuth(AdminPage, ['ADMIN', 'SUPERVISOR']);
