'use client';

// Force dynamic rendering for real-time employee dashboard data
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import nextDynamic from 'next/dynamic';
import withAuth from '@/lib/withAuth';

// Import dashboard components
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';

// Dynamic imports for existing components
const EventCalendar = nextDynamic(() => import('@/components/common/EventCalendar'), { ssr: false });
const Announcements = nextDynamic(() => import('@/components/common/Announcement'), { ssr: false });
const BigCalendar = nextDynamic(() => import('@/components/common/BigCalendar'), { ssr: false });

// Dynamic imports for heavy/rarely-used dashboard components
const NotificationCenter = nextDynamic(() => import('@/components/dashboard/NotificationCenter'), { 
  loading: () => <div>Memuat notifikasi...</div>,
  ssr: false
});
const RecentActivity = nextDynamic(() => import('@/components/dashboard/RecentActivity'), {
  loading: () => <div>Memuat aktivitas terbaru...</div>,
  ssr: false
});
const TodaySchedule = nextDynamic(() => import('@/components/dashboard/TodaySchedule'), {
  loading: () => <div>Memuat jadwal hari ini...</div>,
  ssr: false
});

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
  idpegawai?: string; // Optional since backend might not provide this directly
  tipeshift?: string;
  tanggal: string;
  originalDate?: string;
  lokasishift: string;
  jammulai: string;
  jamselesai: string;
  nama?: string;
  userId?: number;
  user?: {
    id: number;
    employeeId?: string;
    namaDepan?: string;
    namaBelakang?: string;
    username: string;
  };
}

function PegawaiPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState<boolean>(true);
  const [shiftsError, setShiftsError] = useState<string | null>(null);
  const [workloadStatus, setWorkloadStatus] = useState<any>(null);
  const [showOverworkWarning, setShowOverworkWarning] = useState<boolean>(false);

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
      // Use Indonesian timezone (GMT+7)
      const now = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
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
    console.log('PegawaiDashboard: 🚀 fetchShifts called');
    console.log('PegawaiDashboard: 👤 Current user:', user);
    
    if (!user) {
      console.log('PegawaiDashboard: ❌ No user data, aborting fetchShifts');
      return;
    }

    try {
      setShiftsLoading(true);
      setShiftsError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Fetch shifts
      const response = await fetch(`${apiUrl}/shifts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Check workload status for overwork warning
      const workloadResponse = await fetch(`${apiUrl}/overwork/user/${user.id}/eligibility`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (workloadResponse.ok) {
        const workloadResult = await workloadResponse.json();
        if (workloadResult.success) {
          setWorkloadStatus(workloadResult.data);
          // Show warning if user needs overwork request or approaching limit
          const needsWarning = workloadResult.data.needsOverworkRequest || 
                             (workloadResult.data.currentShifts / workloadResult.data.maxShifts) >= 0.8;
          setShowOverworkWarning(needsWarning);
        }
      }

      console.log('PegawaiDashboard: 🔍 API Response received');
      console.log('PegawaiDashboard: Response status:', response.status);
      console.log('PegawaiDashboard: Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PegawaiDashboard: 📊 Raw API data:', data);
      console.log('PegawaiDashboard: 📊 Data type:', typeof data, Array.isArray(data) ? '(array)' : '(not array)');
      
      // DEBUG: Log first few shifts to see actual structure
      if (Array.isArray(data) && data.length > 0) {
        console.log('PegawaiDashboard: 🔍 First shift structure:', data[0]);
        console.log('PegawaiDashboard: 🔍 First shift keys:', Object.keys(data[0]));
        if (data.length > 1) {
          console.log('PegawaiDashboard: 🔍 Second shift structure:', data[1]);
        }
      }
      
      let userShifts: ShiftData[] = [];
      if (Array.isArray(data)) {
        console.log('PegawaiDashboard: 👤 User info for filtering:', {
          role: user.role,
          username: user.username,
          id: user.id
        });
        
        if (user.role?.toLowerCase() === 'admin') {
          // Admin sees all shifts
          userShifts = data;
          console.log('PegawaiDashboard: 👑 Admin mode - showing all shifts:', userShifts.length);
        } else {
          // Regular users see only their shifts
          console.log('PegawaiDashboard: 🔍 Filtering shifts for regular user...');
          console.log('PegawaiDashboard: Total shifts before filter:', data.length);
          
          userShifts = data.filter((shift: ShiftData) => {
            // Backend mengembalikan data dengan relasi user, bukan idpegawai langsung
            const shiftUsername = shift.idpegawai || shift.user?.username || shift.user?.employeeId;
            
            if (!shiftUsername || !user.username) {
              console.log('PegawaiDashboard: ❌ Skipping shift - missing user identification:', {
                shift: shift,
                shiftUsername,
                hasShiftUsername: !!shiftUsername,
                userUsername: user.username,
                hasUserUsername: !!user.username,
                shiftUserData: shift.user
              });
              return false;
            }
            
            const exactMatch = shiftUsername === user.username;
            const caseInsensitiveMatch = !exactMatch && 
                                        shiftUsername.toLowerCase() === user.username.toLowerCase();
            const userIdMatch = shift.userId && shift.userId === user.id;
            
            console.log('PegawaiDashboard: 🔍 Checking shift:', {
              shiftId: shift.id,
              shiftUsername,
              userUsername: user.username,
              userId: user.id,
              shiftUserId: shift.userId,
              exactMatch,
              caseInsensitiveMatch,
              userIdMatch,
              willInclude: exactMatch || caseInsensitiveMatch || userIdMatch
            });
            
            return exactMatch || caseInsensitiveMatch || userIdMatch;
          });
          
          console.log('PegawaiDashboard: ✅ Filtered shifts count:', userShifts.length);
        }
      } else {
        console.log('PegawaiDashboard: ❌ API data is not an array:', data);
      }

      console.log('PegawaiDashboard: 🎯 Final shifts to display:', userShifts);
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
    // Use Indonesian timezone (GMT+7)
    const now = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
    return now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    // Use Indonesian timezone (GMT+7)
    const hour = new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).getHours();
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
        {/* Overwork Warning Banner */}
        {showOverworkWarning && workloadStatus && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  {workloadStatus.needsOverworkRequest ? '🚫 Overwork Request Required' : '⚠️ Approaching Shift Limit'}
                </h3>
                <div className="text-orange-800 mb-4">
                  <p className="mb-2">
                    Current Shifts: <span className="font-bold">{workloadStatus.currentShifts}/{workloadStatus.maxShifts}</span> 
                    {' '}({Math.round((workloadStatus.currentShifts / workloadStatus.maxShifts) * 100)}%)
                  </p>
                  <p className="text-sm">
                    {workloadStatus.needsOverworkRequest 
                      ? 'You have reached your monthly shift limit. To take additional shifts, please submit an overwork request.'
                      : 'You are approaching your monthly shift limit. Consider submitting an overwork request if you need more shifts.'
                    }
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="/dashboard/list/overwork-request"
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Overwork Request
                  </a>
                  <button
                    onClick={() => setShowOverworkWarning(false)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
     

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
                    href="/dashboard/list/jadwalsaya" 
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
            {/* <RecentActivity userRole={user?.role} isAdmin={false} /> */}
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
                  Lihat Semua
                </a>
              </div>
              <EventCalendar />
            </div>
            {/* Today's Schedule */}
            {/* <TodaySchedule userRole={user?.role} userId={user?.id?.toString()} /> */}

            {/* Notifications */}
            {/* <NotificationCenter userRole={user?.role} userId={user?.id?.toString()} /> */}

          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
          <p>© 2024 RSUD Anugerah Tomohon - Sistem Manajemen Shift Rumah Sakit</p>
          {/* <p className="mt-1">Untuk bantuan teknis, hubungi IT Support: ext. 1234</p> */}
        </div>
      </div>
    </div>
  );
}

// Hanya user dengan role DOKTER, PERAWAT, atau STAF yang bisa akses
export default withAuth(PegawaiPage, ['DOKTER', 'PERAWAT', 'STAF']);
