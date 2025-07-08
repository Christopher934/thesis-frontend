"use client";

import { useState, useEffect } from 'react';
import { Clock, MapPin, Camera, User, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Shift {
  id: number;
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
}

interface TodayData {
  shift: Shift | null;
  absensi: Absensi | null;
}

interface DashboardStats {
  monthlyStats: Array<{
    status: string;
    _count: { status: number };
  }>;
}

const capitalizeWords = (str: string) => {
  return str.toLowerCase().split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatTime = (timeString: string) => {
  return new Date(timeString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
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

export default function DashboardAbsensi() {
  const [todayData, setTodayData] = useState<TodayData>({ shift: null, absensi: null });
  const [stats, setStats] = useState<DashboardStats>({ monthlyStats: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTodayData();
    fetchStats();
  }, []);

  const fetchTodayData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/absensi/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTodayData(data || { shift: null, absensi: null });
      } else {
        console.error('Failed to fetch today data:', response.statusText);
        setTodayData({ shift: null, absensi: null });
      }
    } catch (error) {
      console.error('Error fetching today data:', error);
      setTodayData({ shift: null, absensi: null });
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/absensi/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data || { monthlyStats: [] });
      } else {
        console.error('Failed to fetch stats:', response.statusText);
        setStats({ monthlyStats: [] });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ monthlyStats: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleAbsenMasuk = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get current location if available
      let lokasi = '';
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          lokasi = `${position.coords.latitude}, ${position.coords.longitude}`;
        } catch (error) {
          console.log('Could not get location');
        }
      }

      const response = await fetch('http://localhost:3002/absensi/masuk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lokasi })
      });

      if (response.ok) {
        await fetchTodayData();
        alert('Absen Masuk Berhasil!');
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal Melakukan Absen Masuk');
      }
    } catch (error) {
      console.error('Error during absen masuk:', error);
      alert('Terjadi Kesalahan Saat Absen Masuk');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAbsenKeluar = async () => {
    if (!todayData.absensi) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      let lokasi = '';
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          lokasi = `${position.coords.latitude}, ${position.coords.longitude}`;
        } catch (error) {
          console.log('Could not get location');
        }
      }

      const response = await fetch(`http://localhost:3002/absensi/keluar/${todayData.absensi.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lokasi })
      });

      if (response.ok) {
        await fetchTodayData();
        alert('Absen Keluar Berhasil!');
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal Melakukan Absen Keluar');
      }
    } catch (error) {
      console.error('Error during absen keluar:', error);
      alert('Terjadi Kesalahan Saat Absen Keluar');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getMonthlyStatsSummary = () => {
    const summary = {
      hadir: 0,
      terlambat: 0,
      izin: 0,
      alfa: 0
    };

    // Add null check to prevent forEach error
    if (stats.monthlyStats && Array.isArray(stats.monthlyStats)) {
      stats.monthlyStats.forEach(stat => {
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
    }

    return summary;
  };

  const monthlyStats = getMonthlyStatsSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Absensi</h1>
        <div className="text-sm text-gray-500">
          {formatDate(new Date().toISOString())}
        </div>
      </div>

      {/* Today's Shift Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Shift Hari Ini</h2>
        </div>
        
        {todayData.shift ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {todayData.shift.jammulai} - {todayData.shift.jamselesai}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{capitalizeWords(todayData.shift.lokasishift)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{capitalizeWords(todayData.shift.tipeshift || '')}</span>
              </div>
            </div>

            {/* Attendance Status */}
            {todayData.absensi ? (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status Absensi:</span>
                  {getStatusBadge(todayData.absensi.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {todayData.absensi.jamMasuk && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Masuk: {formatTime(todayData.absensi.jamMasuk)}</span>
                    </div>
                  )}
                  {todayData.absensi.jamKeluar && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Keluar: {formatTime(todayData.absensi.jamKeluar)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {!todayData.absensi.jamMasuk && (
                    <button 
                      onClick={handleAbsenMasuk}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {actionLoading ? 'Memproses...' : 'Absen Masuk'}
                    </button>
                  )}
                  {todayData.absensi.jamMasuk && !todayData.absensi.jamKeluar && (
                    <button 
                      onClick={handleAbsenKeluar}
                      disabled={actionLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {actionLoading ? 'Memproses...' : 'Absen Keluar'}
                    </button>
                  )}
                  {todayData.absensi.jamMasuk && todayData.absensi.jamKeluar && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Absensi hari ini selesai</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Belum melakukan absensi</span>
                </div>
                <button 
                  onClick={handleAbsenMasuk}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {actionLoading ? 'Memproses...' : 'Absen Masuk'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada shift untuk hari ini</p>
          </div>
        )}
      </div>

      {/* Monthly Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Statistik Bulan Ini</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{monthlyStats.hadir}</div>
            <div className="text-sm text-green-700">Hadir</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{monthlyStats.terlambat}</div>
            <div className="text-sm text-yellow-700">Terlambat</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{monthlyStats.izin}</div>
            <div className="text-sm text-blue-700">Izin</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{monthlyStats.alfa}</div>
            <div className="text-sm text-red-700">Alfa</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Menu Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="h-auto p-4 flex flex-col items-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={() => window.location.href = '/list/riwayat-absensi'}
          >
            <Clock className="h-6 w-6" />
            <span>Riwayat Absensi</span>
          </button>
          <button 
            className="h-auto p-4 flex flex-col items-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={() => window.location.href = '/list/jadwalsaya'}
          >
            <Calendar className="h-6 w-6" />
            <span>Jadwal Saya</span>
          </button>
          <button 
            className="h-auto p-4 flex flex-col items-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={() => window.location.href = '/list/ajukantukarshift'}
          >
            <User className="h-6 w-6" />
            <span>Tukar Shift</span>
          </button>
        </div>
      </div>
    </div>
  );
}
