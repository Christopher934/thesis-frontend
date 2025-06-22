"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';

interface MonthlyReport {
  id: number;
  jamMasuk: string | null;
  jamKeluar: string | null;
  status: string;
  createdAt: string;
  user: {
    namaDepan: string;
    namaBelakang: string;
    role: string;
  };
  shift: {
    tanggal: string;
    jammulai: string;
    jamselesai: string;
    lokasishift: string;
  };
}

interface AttendanceStats {
  stats: Array<{
    status: string;
    _count: { status: number };
  }>;
  total: number;
  percentage: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
}

const capitalizeWords = (str: string) => {
  return str.toLowerCase().split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const COLORS = {
  'HADIR': '#10B981',
  'TERLAMBAT': '#F59E0B',
  'IZIN': '#3B82F6',
  'ALFA': '#EF4444'
};

const statusLabels = {
  'HADIR': 'Hadir',
  'TERLAMBAT': 'Terlambat',
  'IZIN': 'Izin',
  'ALFA': 'Alfa'
};

export default function LaporanStatistik() {
  const [monthlyData, setMonthlyData] = useState<MonthlyReport[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    stats: [],
    total: 0,
    percentage: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'monthly' | 'stats'>('monthly');
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    userId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyReport();
    } else {
      fetchStats();
    }
  }, [activeTab, filters]);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        year: filters.year,
        month: filters.month,
        ...(filters.userId && { userId: filters.userId })
      });

      const response = await fetch(`http://localhost:3001/absensi/reports/monthly?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMonthlyData(data);
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.userId && { userId: filters.userId })
      });

      const response = await fetch(`http://localhost:3001/absensi/reports/stats?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyChartData = () => {
    const dailyStats: { [key: string]: { [status: string]: number } } = {};

    monthlyData.forEach(item => {
      const date = new Date(item.shift.tanggal).getDate().toString();
      if (!dailyStats[date]) {
        dailyStats[date] = { HADIR: 0, TERLAMBAT: 0, IZIN: 0, ALFA: 0 };
      }
      dailyStats[date][item.status] = (dailyStats[date][item.status] || 0) + 1;
    });

    return Object.keys(dailyStats)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(date => ({
        date: `Tgl ${date}`,
        Hadir: dailyStats[date]['HADIR'] || 0,
        Terlambat: dailyStats[date]['TERLAMBAT'] || 0,
        Izin: dailyStats[date]['IZIN'] || 0,
        Alfa: dailyStats[date]['ALFA'] || 0
      }));
  };

  const generatePieChartData = () => {
    return stats.percentage.map(item => ({
      name: statusLabels[item.status as keyof typeof statusLabels] || item.status,
      value: item.count,
      percentage: item.percentage,
      color: COLORS[item.status as keyof typeof COLORS] || '#6B7280'
    }));
  };

  const exportToExcel = () => {
    alert('Fitur export Excel akan segera tersedia');
  };

  const exportToPDF = () => {
    alert('Fitur export PDF akan segera tersedia');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Laporan & Statistik Absensi</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monthly'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="inline h-4 w-4 mr-2" />
            Laporan Bulanan
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="inline h-4 w-4 mr-2" />
            Statistik & Analisis
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        {activeTab === 'monthly' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2025, i).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Pegawai (Optional)
              </label>
              <input
                type="number"
                placeholder="User ID"
                value={filters.userId}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters(prev => ({ ...prev, userId: '' }))}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                ID Pegawai (Optional)
              </label>
              <input
                type="number"
                placeholder="User ID"
                value={filters.userId}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters(prev => ({ ...prev, startDate: '', endDate: '', userId: '' }))}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'monthly' && (
            <div className="space-y-6">
              {/* Monthly Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Grafik Absensi Harian - {new Date(parseInt(filters.year), parseInt(filters.month) - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={generateMonthlyChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Hadir" fill="#10B981" />
                    <Bar dataKey="Terlambat" fill="#F59E0B" />
                    <Bar dataKey="Izin" fill="#3B82F6" />
                    <Bar dataKey="Alfa" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Detail Absensi Bulanan</h3>
                </div>
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {monthlyData.slice(0, 20).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {capitalizeWords(`${item.user.namaDepan} ${item.user.namaBelakang}`)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.shift.tanggal).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.shift.jammulai} - {item.shift.jamselesai}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.jamMasuk ? new Date(item.jamMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.jamKeluar ? new Date(item.jamKeluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded ${
                              item.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                              item.status === 'TERLAMBAT' ? 'bg-yellow-100 text-yellow-800' :
                              item.status === 'IZIN' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {monthlyData.length > 20 && (
                  <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                    Menampilkan 20 dari {monthlyData.length} data. Export untuk melihat semua data.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Stats Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.percentage.map((item) => (
                  <div key={item.status} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                        </h3>
                        <p className="text-2xl font-bold" style={{ color: COLORS[item.status as keyof typeof COLORS] }}>
                          {item.count}
                        </p>
                        <p className="text-sm text-gray-500">{item.percentage}%</p>
                      </div>
                      <div className="p-3 rounded-full" style={{ backgroundColor: `${COLORS[item.status as keyof typeof COLORS]}20` }}>
                        {item.status === 'HADIR' && <Users className="h-6 w-6" style={{ color: COLORS[item.status] }} />}
                        {item.status === 'TERLAMBAT' && <Clock className="h-6 w-6" style={{ color: COLORS[item.status] }} />}
                        {item.status === 'IZIN' && <Calendar className="h-6 w-6" style={{ color: COLORS[item.status] }} />}
                        {item.status === 'ALFA' && <AlertTriangle className="h-6 w-6" style={{ color: COLORS[item.status] }} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Distribusi Status Absensi</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={generatePieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {generatePieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Ringkasan Statistik</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Absensi:</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      {stats.percentage.map((item) => (
                        <div key={item.status} className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[item.status as keyof typeof COLORS] }}
                            ></div>
                            {statusLabels[item.status as keyof typeof statusLabels]}:
                          </span>
                          <span className="font-medium">{item.count} ({item.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
