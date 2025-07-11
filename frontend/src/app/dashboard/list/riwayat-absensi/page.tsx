"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface Absensi {
  id: number;
  jamMasuk: string | null;
  jamKeluar: string | null;
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'ALFA';
  lokasi?: string;
  createdAt: string;
  shift: {
    tanggal: string;
    jammulai: string;
    jamselesai: string;
    lokasishift: string;
    tipeshift: string;
  };
}

const capitalizeWords = (str: string) => {
  return str.toLowerCase().split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

export default function RiwayatAbsensi() {
  const [absensiData, setAbsensiData] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAbsensiData();
  }, [currentPage, filters]);

  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status })
      });

      const response = await fetch(`http://localhost:3001/absensi/my-attendance?${queryParams}`, {
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: ''
    });
    setCurrentPage(1);
  };

  const exportToPDF = () => {
    // Placeholder for PDF export functionality
    alert('Fitur export PDF akan segera tersedia');
  };

  // Mobile Card Component
  const MobileCard = ({ item }: { item: Absensi }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">
            {formatDate(item.shift.tanggal)}
          </h3>
          <p className="text-sm text-gray-500">
            {capitalizeWords(item.shift.lokasishift)} • {capitalizeWords(item.shift.tipeshift)}
          </p>
        </div>
        {getStatusBadge(item.status)}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Jadwal:</span>
          <p className="font-medium">{formatTime(item.shift.jammulai)} - {formatTime(item.shift.jamselesai)}</p>
        </div>
        <div>
          <span className="text-gray-500">Aktual:</span>
          <p className="font-medium">
            {formatTime(item.jamMasuk)} - {formatTime(item.jamKeluar)}
          </p>
        </div>
      </div>
      
      {item.lokasi && (
        <div className="text-sm">
          <span className="text-gray-500">Lokasi: </span>
          <span className="text-gray-700">{item.lokasi}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Absensi</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
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
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="HADIR">Hadir</option>
                <option value="TERLAMBAT">Terlambat</option>
                <option value="IZIN">Izin</option>
                <option value="ALFA">Alfa</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table */}
      {!loading && (
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
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
              {absensiData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.shift.tanggal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{formatTime(item.shift.jammulai)} - {formatTime(item.shift.jamselesai)}</div>
                      <div className="text-gray-500">{capitalizeWords(item.shift.tipeshift)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {capitalizeWords(item.shift.lokasishift)}
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
                </tr>
              ))}
            </tbody>
          </table>
          
          {absensiData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada data absensi</p>
            </div>
          )}
        </div>
      )}

      {/* Mobile Cards */}
      {!loading && (
        <div className="lg:hidden space-y-4">
          {absensiData.map((item) => (
            <MobileCard key={item.id} item={item} />
          ))}
          
          {absensiData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada data absensi</p>
            </div>
          )}
        </div>
      )}

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
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={absensiData.length < itemsPerPage}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
