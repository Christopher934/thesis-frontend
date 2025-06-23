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
        <div className="flex gap-3">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            + Buat Shift Baru
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
            Export Data
          </button>
        </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Kerja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Sample data row 1 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Ns. Ani Suryani</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Perawat</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">IGD</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Pagi</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">07:00 - 15:00</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Hadir
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-blue-600 hover:text-blue-900">Detail</button>
                  </td>
                </tr>
                
                {/* Sample data row 2 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Ns. Budi Santoso</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Perawat</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">ICU</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Sore</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">15:00 - 23:00</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Hadir
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-blue-600 hover:text-blue-900">Detail</button>
                  </td>
                </tr>

                {/* Sample data row 3 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Ns. Citra Dewi</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Kepala Ruang</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Rawat Inap</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Malam</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">23:00 - 07:00</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Izin
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-blue-600 hover:text-blue-900">Detail</button>
                  </td>
                </tr>

                {/* Sample data row 4 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Dr. Dani Pratama</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Dokter Jaga</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">IGD</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Pagi</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">07:00 - 15:00</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Hadir
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-blue-600 hover:text-blue-900">Detail</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftManagementDashboard;
