'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, AlertCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

// TypeScript interfaces
interface ShiftStats {
  totalStaffActive: number;
  todayShifts: number;
  permintaanTukar: number;
  staffCuti: number;
}

interface ShiftData {
  id: number;
  tanggal: string;
  jammulai: string;
  jamselesai: string;
  lokasishift: string;
  user: {
    employeeId: string;
    namaDepan: string;
    namaBelakang: string;
    role: string;
  };
  status: string;
}

interface FilterState {
  unit: string;
  bulan: string;
  jenisShift: string;
}

// Shift management dashboard component
const ShiftManagementDashboard: React.FC = () => {
  const [stats, setStats] = useState<ShiftStats>({
    totalStaffActive: 89,
    todayShifts: 12,
    permintaanTukar: 3,
    staffCuti: 2
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<ShiftData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    unit: 'Semua Unit',
    bulan: 'Juni 2025',
    jenisShift: 'Semua Shift'
  });
  const [loading, setLoading] = useState(true);

  // Fetch shift statistics from backend
  const fetchShiftStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Fetch total active staff
      const usersResponse = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch today's shifts
      const shiftsResponse = await fetch(`${apiUrl}/shifts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch shift swap requests
      const swapResponse = await fetch(`${apiUrl}/shift-swap-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch attendance data to calculate staff on leave
      const attendanceResponse = await fetch(`${apiUrl}/absensi/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (usersResponse.ok && shiftsResponse.ok && swapResponse.ok && attendanceResponse.ok) {
        const users = await usersResponse.json();
        const shifts = await shiftsResponse.json();
        const swapRequests = await swapResponse.json();
        const attendanceStats = await attendanceResponse.json();

        // Filter today's shifts
        const today = new Date().toISOString().split('T')[0];
        const todayShifts = shifts.filter((shift: any) => 
          shift.tanggal.startsWith(today)
        );

        // Count pending swap requests
        const pendingSwaps = swapRequests.filter((req: any) => 
          req.status === 'PENDING'
        );

        // Calculate staff on leave based on attendance data
        // Users with shifts today but haven't checked in could be on leave
        const staffOnLeave = attendanceStats.usersNotCheckedIn?.length || 2;

        setStats({
          totalStaffActive: users.length || 89,
          todayShifts: todayShifts.length || 12,
          permintaanTukar: pendingSwaps.length || 3,
          staffCuti: staffOnLeave
        });

        setScheduleData(todayShifts);
      }
    } catch (error) {
      console.error('Error fetching shift stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftStats();
    
    // Set up auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchShiftStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
      
      // Mock shift data for each day
      const shifts = [
        { type: 'pagi', color: 'bg-green-500' },
        { type: 'sore', color: 'bg-yellow-500' },
        { type: 'malam', color: 'bg-blue-500' }
      ];

      days.push({
        date: i,
        dayName: dayName.slice(0, 3),
        shifts: i <= 7 ? shifts : shifts.slice(0, 2) // Show fewer shifts for later days
      });
    }
    
    return days.slice(0, 7); // Show only first week for demo
  };

  const calendarDays = generateCalendarDays();
  const currentMonthYear = currentDate.toLocaleDateString('id-ID', { 
    month: 'long', 
    year: 'numeric' 
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard shift...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 h-50vh">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Management Shift</h1>
      </div>

      {/* Staff Schedule Table */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-4">STAFF SCHEDULE TABLE</h2>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Jadwal Staff Hari Ini</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] text-center">Nama Staff</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] text-center">Jabatan</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] text-center">Unit</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] text-center">Shift</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[110px] text-center">Jam Kerja</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduleData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      Tidak ada jadwal shift hari ini.
                    </td>
                  </tr>
                ) : (
                  scheduleData.map((shift) => {
                    const jabatan = shift.user && shift.user.role ? shift.user.role : <span className="text-gray-300">-</span>;
                    const shiftType = (shift as any).tipeshift || <span className="text-gray-300">-</span>;
                    const jamKerja = `${shift.jammulai} - ${shift.jamselesai}`;
                    let statusLabel = 'Belum Absensi';
                    let statusClass = 'bg-gray-100 text-gray-800';
                    const now = new Date();
                    const jamMulai = new Date(`${shift.tanggal}T${shift.jammulai}`);
                    if (shift.status === 'Hadir') {
                      statusLabel = 'Hadir';
                      statusClass = 'bg-green-100 text-green-800';
                    } else if (shift.status === 'Izin') {
                      statusLabel = 'Izin';
                      statusClass = 'bg-yellow-100 text-yellow-800';
                    } else if (now > jamMulai && !shift.status) {
                      statusLabel = 'Terlambat';
                      statusClass = 'bg-yellow-100 text-yellow-800';
                    }
                    return (
                      <tr key={shift.id}>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <div className="text-sm font-medium text-gray-900 min-w-[120px] text-center">{shift.user?.namaDepan} {shift.user?.namaBelakang}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <div className="text-sm text-gray-900 min-w-[100px] text-center">{jabatan}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <div className="text-sm text-gray-900 min-w-[100px] text-center">{shift.lokasishift}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <div className="text-sm text-gray-900 min-w-[80px] text-center">{shiftType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <div className="text-sm text-gray-900 min-w-[110px] text-center">{jamKerja}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>{statusLabel}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-blue-600 hover:text-blue-900">Detail</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftManagementDashboard;
