'use client';

// Force dynamic rendering for real-time employee dashboard data
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import nextDynamic from 'next/dynamic';
import withAuth from '@/lib/withAuth';

// Import dashboard components
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import RecentActivity from '@/components/dashboard/RecentActivity';
import TodaySchedule from '@/components/dashboard/TodaySchedule';

// Dynamic imports for existing components
const EventCalendar = nextDynamic(() => import('@/components/common/EventCalendar'), { ssr: false });
const Announcements = nextDynamic(() => import('@/components/common/Announcement'), { ssr: false });
const BigCalendar = nextDynamic(() => import('@/components/common/BigCalendar'), { ssr: false });

interface UserInfo {
  id: number;
  role: string;
  namaDepan: string;
  namaBelakang: string;
  username: string;
}

// Interface for shift data
interface ShiftData {
  id: number;
  idpegawai: string;
  tipeshift?: string;
  tanggal: string;
  originalDate?: string;
  lokasishift: string;
  jammulai: string;
  jamselesai: string;
  nama?: string;
  userId?: number;
}

function PegawaiPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState<boolean>(true);
  const [shiftsError, setShiftsError] = useState<string | null>(null);

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

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };

    getUserInfo();
    updateTime();
    const timeInterval = setInterval(updateTime, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Fetch shifts data for calendar
  const fetchShifts = useCallback(async () => {
    if (!user) return;

    try {
      setShiftsLoading(true);
      setShiftsError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/shifts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      let userShifts: ShiftData[] = [];
      if (Array.isArray(data)) {
        if (user.role?.toLowerCase() === 'admin') {
          // Admin sees all shifts
          userShifts = data;
        } else {
          // Regular users see only their shifts
          userShifts = data.filter((shift: ShiftData) => {
            if (!shift.idpegawai || !user.username) return false;
            
            const exactMatch = shift.idpegawai === user.username;
            const caseInsensitiveMatch = !exactMatch && 
                                        shift.idpegawai.toLowerCase() === user.username.toLowerCase();
            const userIdMatch = shift.userId && shift.userId === user.id;
            
            return exactMatch || caseInsensitiveMatch || userIdMatch;
          });
        }
      }

      setShifts(userShifts);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setShiftsError(error instanceof Error ? error.message : 'Failed to load shifts');
      setShifts([]);
    } finally {
      setShiftsLoading(false);
    }
  }, [user]);

  // Fetch shifts when user data is available
  useEffect(() => {
    if (user) {
      fetchShifts();
    }
  }, [user, fetchShifts]);

  // Auto-refresh shifts every 5 minutes
  useEffect(() => {
    if (user) {
      const refreshInterval = setInterval(fetchShifts, 5 * 60 * 1000);
      return () => clearInterval(refreshInterval);
    }
  }, [user, fetchShifts]);

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
          <p className="text-gray-600">Memuat dashboard...</p>
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
                {getGreeting()}, {user?.namaDepan || 'User'}! 👋
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                {getCurrentDate()} • Selamat datang di Dashboard RSUD Anugerah
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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Quick Actions */}
            <QuickActions userRole={user?.role} isAdmin={false} />

            {/* Calendar Widget */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Kalender Jadwal</h2>
                  {shiftsError && (
                    <p className="text-sm text-red-600 mt-1">{shiftsError}</p>
                  )}
                  {shiftsLoading && (
                    <p className="text-sm text-gray-500 mt-1">Memuat jadwal...</p>
                  )}
                  {!shiftsLoading && !shiftsError && shifts.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{shifts.length} jadwal ditemukan</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchShifts}
                    disabled={shiftsLoading}
                    className="text-sm text-gray-600 hover:text-hospitalBlue disabled:opacity-50"
                    title="Refresh jadwal"
                  >
                    🔄
                  </button>
                  <a 
                    href="/list/jadwalsaya" 
                    className="text-hospitalBlue hover:text-hospitalBlue/80 text-sm font-medium"
                  >
                    Lihat Detail →
                  </a>
                </div>
              </div>
              <div className="h-[400px] lg:h-[500px]">
                <BigCalendar 
                  shifts={shifts}
                  useDefaultEvents={false}
                  key={`dashboard-calendar-${shifts.length}`}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <RecentActivity userRole={user?.role} isAdmin={false} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Today's Schedule */}
            <TodaySchedule userRole={user?.role} userId={user?.id?.toString()} />

            {/* Notifications */}
            <NotificationCenter userRole={user?.role} isAdmin={false} />

            {/* Event Calendar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Event & Kegiatan</h2>
                <a 
                  href="/list/events" 
                  className="text-hospitalBlue hover:text-hospitalBlue/80 text-sm"
                >
                  Lihat Semua
                </a>
              </div>
              <EventCalendar />
            </div>

          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
          <p>© 2024 RSUD Anugerah Tomohon - Sistem Manajemen Rumah Sakit</p>
          <p className="mt-1">Untuk bantuan teknis, hubungi IT Support: ext. 1234</p>
        </div>
      </div>
    </div>
  );
}

// Hanya user dengan role DOKTER, PERAWAT, atau STAF yang bisa akses
export default withAuth(PegawaiPage, ['DOKTER', 'PERAWAT', 'STAF']);
