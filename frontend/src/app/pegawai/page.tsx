'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import withAuth from '@/lib/withAuth';
import FilterButton from '@/components/common/FilterButton';
import SortButton from '@/components/common/SortButton';
import { getApiUrl } from '@/config/api';
import { fetchWithFallback } from '@/utils/fetchWithFallback';
import Image from 'next/image';

// Helper function to format time from DateTime string to HH:mm format
const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

// Load components that need browser-only (like FullCalendar) without SSR
const BigCalendar = dynamic(() => import('@/components/common/BigCalendar'), { ssr: false });
const EventCalendar = dynamic(() => import('@/components/common/EventCalendar'), { ssr: false });
const Announcements = dynamic(() => import('@/components/common/Announcement'), { ssr: false });

// Interface for shift data
interface ShiftData {
  id: number;
  idpegawai: string;
  tanggal: string;
  jammulai: string;
  jamselesai: string;
  lokasishift: string;
  status?: string;
}

function PegawaiPage() {
  // State management
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'calendar'>('dashboard');

  // Filter and sort options
  const filterOptions = [
    { label: "Semua", value: "" },
    { label: "Hari Ini", value: "today" },
    { label: "Minggu Ini", value: "week" },
    { label: "Bulan Ini", value: "month" }
  ];

  const sortOptions = [
    { label: "Tanggal", value: "tanggal" },
    { label: "Jam Mulai", value: "jammulai" },
    { label: "Lokasi", value: "lokasishift" }
  ];

  // Initialize user data and fetch shifts
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get user ID from localStorage
        const storedUserId = localStorage.getItem('idpegawai') || localStorage.getItem('username');
        if (storedUserId) {
          setUserId(storedUserId);
          await fetchUserShifts(storedUserId);
        } else {
          setError('User ID not found');
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to initialize user data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Fetch user shifts from API
  const fetchUserShifts = async (userIdParam: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const apiUrl = getApiUrl();
      const response = await fetchWithFallback(apiUrl, '/shifts', '/mock-shifts.json');
      
      if (Array.isArray(response)) {
        // Filter shifts for current user
        const userShifts = response.filter((shift: ShiftData) => 
          shift.idpegawai === userIdParam
        );
        setShifts(userShifts);
      } else {
        setShifts([]);
      }
    } catch (err) {
      console.error('Error fetching shifts:', err);
      setError('Failed to load shift data');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  // Memoized upcoming shifts for performance
  const upcomingShifts = useMemo(() => {
    const today = new Date();
    return shifts
      .filter(shift => new Date(shift.tanggal) >= today)
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
      .slice(0, 5);
  }, [shifts]);

  // Handle filter and sort
  const handleFilter = (value: string) => {
    // Implement filter logic
    console.log('Filter:', value);
  };

  const handleSort = (value: string, direction: 'asc' | 'desc') => {
    // Implement sort logic
    console.log('Sort:', value, direction);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Pegawai</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'dashboard' ? 'calendar' : 'dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {viewMode === 'dashboard' ? 'Lihat Kalender' : 'Lihat Dashboard'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {viewMode === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Shift Bulan Ini</h3>
                <p className="text-2xl font-bold text-blue-600">{shifts.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Shift Mendatang</h3>
                <p className="text-2xl font-bold text-green-600">{upcomingShifts.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Jam Kerja Minggu Ini</h3>
                <p className="text-2xl font-bold text-purple-600">40</p>
              </div>
            </div>

            {/* Upcoming Shifts */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Shift Mendatang</h3>
                <div className="flex items-center gap-2">
                  <FilterButton options={filterOptions} onFilter={handleFilter} />
                  <SortButton options={sortOptions} onSort={handleSort} />
                </div>
              </div>
              
              {upcomingShifts.length > 0 ? (
                <div className="space-y-3">
                  {upcomingShifts.map((shift) => (
                    <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Image src="/calendar.png" alt="Shift" width={20} height={20} />
                        </div>
                        <div>
                          <p className="font-medium">{shift.lokasishift}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(shift.tanggal).toLocaleDateString('id-ID')} • {formatTime(shift.jammulai)} - {formatTime(shift.jamselesai)}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Terjadwal
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Tidak ada shift mendatang</p>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Event Calendar */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Kalender</h3>
              <EventCalendar />
            </div>

            {/* Announcements */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Pengumuman</h3>
              <Announcements />
            </div>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white p-4 rounded-lg shadow">
          <BigCalendar shifts={shifts} useDefaultEvents={false} />
        </div>
      )}
    </div>
  );
}

// Protect the page with authentication and role-based access
export default withAuth(PegawaiPage, ['PERAWAT', 'DOKTER', 'STAF']);
