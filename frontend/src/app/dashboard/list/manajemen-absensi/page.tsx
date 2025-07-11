"use client";

import { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle, XCircle, Eye, Edit, Filter, Download } from 'lucide-react';

interface User {
  namaDepan: string;
  namaBelakang: string;
  role: string;
}

interface Shift {
  tanggal: string;
  jammulai: string;
  jamselesai: string;
  lokasishift: string;
  tipeshift: string;
}

interface Absensi {
  id: number;
  jamMasuk: string | null;
  jamKeluar: string | null;
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'ALFA';
  lokasi?: string;
  foto?: string;
  catatan?: string;
  createdAt: string;
  user: User;
  shift: Shift;
}

interface DashboardStats {
  todayStats: Array<{
    status: string;
    _count: { status: number };
  }>;
  usersNotCheckedIn: Array<{
    id: number;
    namaDepan: string;
    namaBelakang: string;
  }>;
  totalShiftsToday: number;
}

const capitalizeWords = (str: string) => {
  return str.toLowerCase().split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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

const formatDate = (dateString: string) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const date = new Date(dateString);
  const dayName = days[date.getDay()];
  const formattedDate = date.toLocaleDateString('id-ID');
  return `${dayName}, ${formattedDate}`;
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'HADIR': { label: 'Hadir', className: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs' },
    'TERLAMBAT': { label: 'Terlambat', className: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs' },
    'IZIN': { label: 'Izin', className: 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs' },
    'ALFA': { label: 'Alfa', className: 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['ALFA'];
  return <span className={config.className}>{config.label}</span>;
};

export default function ManajemenAbsensi() {
  const [stats, setStats] = useState<DashboardStats>({
    todayStats: [],
    usersNotCheckedIn: [],
    totalShiftsToday: 0
  });
  const [absensiData, setAbsensiData] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    userId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingItem, setEditingItem] = useState<Absensi | null>(null);

  const itemsPerPage = 15;

  useEffect(() => {
    fetchDashboardStats();
    fetchAbsensiData();
  }, [currentPage, filters]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/absensi/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status }),
        ...(filters.userId && { userId: filters.userId })
      });

      const response = await fetch(`http://localhost:3001/absensi/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAbsensiData(data);
      }
    } catch (error) {
      console.error('Error fetching absensi data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAttendance = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/absensi/verify/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchAbsensiData();
        alert('Status Absensi Berhasil Diperbarui');
      }
    } catch (error) {
      console.error('Error verifying attendance:', error);
      alert('Gagal Memperbarui Status Absensi');
    }
  };

  const getTodayStatsSummary = () => {
    const summary = {
      hadir: 0,
      terlambat: 0,
      izin: 0,
      alfa: 0
    };

    stats.todayStats.forEach(stat => {
      switch (stat.status) {
        case 'HADIR':
          summary.hadir = stat._count.status;
          break;
        case 'TERLAMBAT':
          summary.terlambat = stat._count.status;
          break;
        case 'IZIN':
          summary.izin = stat._count.status;
          break;
        case 'ALFA':
          summary.alfa = stat._count.status;
          break;
      }
    });

    return summary;
  };

  const todayStats = getTodayStatsSummary();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Absensi</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hari Ini</h3>
              <p className="text-sm text-gray-500">Total Shift: {stats.totalShiftsToday}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-bold text-green-600">{todayStats.hadir}</div>
              <div className="text-green-700">Hadir</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="font-bold text-yellow-600">{todayStats.terlambat}</div>
              <div className="text-yellow-700">Terlambat</div>
            </div>
          </div>
        </div>

        {/* Users Not Checked In */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Belum Absen</h3>
              <p className="text-sm text-gray-500">{stats.usersNotCheckedIn.length} pegawai</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-4">
            {stats.usersNotCheckedIn.slice(0, 3).map((user) => (
              <div key={user.id} className="text-sm text-gray-700 py-1">
                {capitalizeWords(`${user.namaDepan} ${user.namaBelakang}`)}
              </div>
            ))}
            {stats.usersNotCheckedIn.length > 3 && (
              <div className="text-sm text-gray-500">
                +{stats.usersNotCheckedIn.length - 3} lainnya
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
              Laporan Harian
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100">
              Laporan Bulanan
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
              Statistik
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Hadir Tepat Waktu:</span>
              <span className="font-medium text-green-600">{todayStats.hadir}</span>
            </div>
            <div className="flex justify-between">
              <span>Terlambat:</span>
              <span className="font-medium text-yellow-600">{todayStats.terlambat}</span>
            </div>
            <div className="flex justify-between">
              <span>Izin:</span>
              <span className="font-medium text-blue-600">{todayStats.izin}</span>
            </div>
            <div className="flex justify-between">
              <span>Alfa:</span>
              <span className="font-medium text-red-600">{todayStats.alfa}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="HADIR">Hadir</option>
                <option value="TERLAMBAT">Terlambat</option>
                <option value="IZIN">Izin</option>
                <option value="ALFA">Alfa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="number"
                placeholder="ID Pegawai"
                value={filters.userId}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ startDate: '', endDate: '', status: '', userId: '' })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pegawai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Masuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Keluar
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
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                absensiData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {capitalizeWords(`${item.user.namaDepan} ${item.user.namaBelakang}`)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {capitalizeWords(item.user.role)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.shift.tanggal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(item.shift.jammulai)} - {formatTime(item.shift.jamselesai)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {capitalizeWords(item.shift.lokasishift)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(item.jamMasuk)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(item.jamKeluar)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {item.status === 'TERLAMBAT' && (
                          <button
                            onClick={() => handleVerifyAttendance(item.id, 'HADIR')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && absensiData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Belum ada data absensi</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {absensiData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Halaman {currentPage}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={absensiData.length < itemsPerPage}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
