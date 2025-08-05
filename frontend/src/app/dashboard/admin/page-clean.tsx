'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/lib/withAuth';
import { 
  Brain, 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Activity, 
  UserCheck, 
  MapPin, 
  TrendingUp,
  Building,
  Settings,
  BarChart3,
  RefreshCw,
  Loader2,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';

// Import components
import QuickActions from '@/components/dashboard/QuickActions';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import RecentActivity from '@/components/dashboard/RecentActivity';
import TodaySchedule from '@/components/dashboard/TodaySchedule';
import ShiftManagementDashboard from '@/components/dashboard/ShiftManagementDashboard';

// Force dynamic rendering for real-time admin dashboard data
export const dynamic = 'force-dynamic';

// Types
interface UserInfo {
  id: number;
  role: string;
  namaDepan: string;
  namaBelakang: string;
  username: string;
}

interface DashboardData {
  workloadAlerts: any[];
  locationCapacity: any[];
  summary: {
    totalEmployees: number;
    activeShifts: number;
    overworkedEmployees: number;
    averageUtilization: number;
  };
}

interface AutoScheduleRequest {
  date: string;
  location: string;
  shiftType: string;
  requiredCount: number;
  preferredRoles: string[];
  priority: string;
}

interface AutoScheduleResult {
  assignments: any[];
  conflicts: any[];
  workloadAlerts: any[];
  locationCapacityStatus: any[];
  fulfillmentRate: number;
  recommendations: string[];
}

const AdminPage: React.FC = () => {
  // User and time state
  const [user, setUser] = useState<UserInfo | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Auto Schedule AI Modal state
  const [isAutoScheduleModalOpen, setIsAutoScheduleModalOpen] = useState(false);
  const [autoScheduleRequests, setAutoScheduleRequests] = useState<AutoScheduleRequest[]>([
    {
      date: new Date().toISOString().split('T')[0],
      location: '1',
      shiftType: 'PAGI',
      requiredCount: 2,
      preferredRoles: ['PERAWAT'],
      priority: 'HIGH'
    }
  ]);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [autoScheduleError, setAutoScheduleError] = useState<string | null>(null);
  const [autoScheduleResult, setAutoScheduleResult] = useState<AutoScheduleResult | null>(null);

  // Initialize data
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    };

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID'));
    };

    getUserInfo();
    updateTime();
    
    const timeInterval = setInterval(updateTime, 1000);
    fetchDashboardData();

    return () => clearInterval(timeInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/sign-in?message=Please login to access admin dashboard';
        return;
      }

      const response = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/sign-in?message=Session expired, please login again';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardLoading(false);
      setLoading(false);
    }
  };

  // Auto Schedule functions
  const addAutoScheduleRequest = () => {
    setAutoScheduleRequests([
      ...autoScheduleRequests,
      {
        date: new Date().toISOString().split('T')[0],
        location: '1',
        shiftType: 'PAGI',
        requiredCount: 1,
        preferredRoles: ['PERAWAT'],
        priority: 'NORMAL'
      }
    ]);
  };

  const updateAutoScheduleRequest = (index: number, field: keyof AutoScheduleRequest, value: any) => {
    const updated = [...autoScheduleRequests];
    updated[index] = { ...updated[index], [field]: value };
    setAutoScheduleRequests(updated);
  };

  const removeAutoScheduleRequest = (index: number) => {
    setAutoScheduleRequests(autoScheduleRequests.filter((_, i) => i !== index));
  };

  const executeAutoScheduling = async () => {
    setIsAutoScheduling(true);
    setAutoScheduleError(null);
    setAutoScheduleResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Tidak ada token autentikasi. Silakan login terlebih dahulu.');
      }

      const response = await fetch('/api/admin/create-optimal-shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(autoScheduleRequests),
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/sign-in?message=Session expired, please login again';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal membuat jadwal optimal');
      }

      const result = await response.json();
      setAutoScheduleResult(result);
    } catch (err) {
      console.error('Auto schedule error:', err);
      setAutoScheduleError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsAutoScheduling(false);
    }
  };

  // Helper functions
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAutoScheduleModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 flex items-center space-x-2 text-sm font-medium"
              >
                <Brain className="w-4 h-4" />
                <span>Auto Schedule AI</span>
              </button>
              <div className="text-right hidden sm:block">
                <div className="text-3xl font-bold text-blue-600">{currentTime}</div>
                <p className="text-sm text-gray-500">Waktu Sekarang</p>
              </div>
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

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">Manajemen Jadwal</h3>
            <button 
              onClick={() => window.location.href = '/dashboard/list/managemenjadwal'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Kelola Jadwal
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Brain className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">Auto Schedule AI</h3>
            <button
              onClick={() => setIsAutoScheduleModalOpen(true)}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 text-sm"
            >
              Jalankan AI
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Manajemen Pegawai</h3>
            <button 
              onClick={() => window.location.href = '/dashboard/list/pegawai'}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Kelola Pegawai
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-3 text-orange-600" />
            <h3 className="font-semibold mb-2">Laporan</h3>
            <button 
              onClick={() => window.location.href = '/dashboard/list/laporan'}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
            >
              Lihat Laporan
            </button>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Ringkasan Sistem
            </h3>
            {dashboardLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pegawai</span>
                  <span className="font-medium">{dashboardData?.summary?.totalEmployees || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shift Aktif</span>
                  <span className="font-medium">{dashboardData?.summary?.activeShifts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overworked</span>
                  <span className="font-medium text-orange-600">{dashboardData?.summary?.overworkedEmployees || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Utilization</span>
                  <span className="font-medium">{dashboardData?.summary?.averageUtilization || 0}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Workload Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Peringatan Beban Kerja
            </h3>
            {dashboardLoading ? (
              <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
            ) : (
              <div className="space-y-2">
                {dashboardData?.workloadAlerts?.length > 0 ? (
                  dashboardData.workloadAlerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                      <div className="font-medium text-orange-800">{alert.employeeName}</div>
                      <div className="text-orange-600">{alert.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p>Tidak ada peringatan</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location Capacity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-green-600" />
              Kapasitas Lokasi
            </h3>
            {dashboardLoading ? (
              <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
            ) : (
              <div className="space-y-2">
                {dashboardData?.locationCapacity?.length > 0 ? (
                  dashboardData.locationCapacity.slice(0, 3).map((location, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{location.name}</div>
                        <div className="text-xs text-gray-500">{location.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{location.current}/{location.capacity}</div>
                        <div className={`text-xs ${location.utilization > 80 ? 'text-red-600' : location.utilization > 60 ? 'text-orange-600' : 'text-green-600'}`}>
                          {location.utilization}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Data tidak tersedia</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Existing Dashboard Components */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Recent Activity */}
            <RecentActivity />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Today's Schedule */}
            <TodaySchedule />
            
            {/* Notification Center */}
            <NotificationCenter />
          </div>
        </div>

        {/* Auth Status Debug */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-3 bg-gray-100 border border-gray-300 rounded text-xs">
            <strong>Debug Info:</strong> Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}, 
            User: {user?.namaDepan || 'Not loaded'}, 
            Role: {user?.role || 'Not loaded'}
          </div>
        )}
      </div>

      {/* Auto Schedule AI Modal */}
      {isAutoScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-purple-600" />
                  <h2 className="text-xl font-semibold">Auto Schedule AI</h2>
                </div>
                <button
                  onClick={() => {
                    setIsAutoScheduleModalOpen(false);
                    setAutoScheduleError(null);
                    setAutoScheduleResult(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Schedule Requests Configuration */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Konfigurasi Jadwal</h3>
                  <button
                    onClick={addAutoScheduleRequest}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Request
                  </button>
                </div>

                <div className="space-y-4">
                  {autoScheduleRequests.map((request, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                          <input
                            type="date"
                            value={request.date}
                            onChange={(e) => updateAutoScheduleRequest(index, 'date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                          <select
                            value={request.location}
                            onChange={(e) => updateAutoScheduleRequest(index, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="1">Ruang IGD</option>
                            <option value="2">Ruang Rawat Inap</option>
                            <option value="3">Ruang Operasi</option>
                            <option value="4">Ruang ICU</option>
                            <option value="5">Poliklinik</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                          <select
                            value={request.shiftType}
                            onChange={(e) => updateAutoScheduleRequest(index, 'shiftType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="PAGI">Pagi (07:00-15:00)</option>
                            <option value="SIANG">Siang (15:00-23:00)</option>
                            <option value="MALAM">Malam (23:00-07:00)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={request.requiredCount}
                            onChange={(e) => updateAutoScheduleRequest(index, 'requiredCount', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                          <select
                            value={request.priority}
                            onChange={(e) => updateAutoScheduleRequest(index, 'priority', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="URGENT">Urgent</option>
                            <option value="HIGH">High</option>
                            <option value="NORMAL">Normal</option>
                            <option value="LOW">Low</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          {autoScheduleRequests.length > 1 && (
                            <button
                              onClick={() => removeAutoScheduleRequest(index)}
                              className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mb-6">
                <button
                  onClick={() => setIsAutoScheduleModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isAutoScheduling}
                >
                  Batal
                </button>
                <button
                  onClick={executeAutoScheduling}
                  disabled={isAutoScheduling || autoScheduleRequests.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isAutoScheduling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses AI...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Jalankan Auto Schedule AI
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {autoScheduleError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    <div className="text-red-800">
                      <div className="font-medium">Error:</div>
                      <div>{autoScheduleError}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {autoScheduleResult && (
                <div className="border-t pt-6">
                  <div className="flex items-center mb-6">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    <h3 className="text-lg font-semibold">Hasil AI Algorithm</h3>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {autoScheduleResult.assignments?.length || 0}
                      </div>
                      <div className="text-sm text-green-700">Jadwal Dibuat</div>
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {autoScheduleResult.fulfillmentRate?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-blue-700">Tingkat Pemenuhan</div>
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">
                        {autoScheduleResult.conflicts?.length || 0}
                      </div>
                      <div className="text-sm text-orange-700">Konflik Diselesaikan</div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {autoScheduleResult.workloadAlerts?.length || 0}
                      </div>
                      <div className="text-sm text-purple-700">Peringatan Beban Kerja</div>
                    </div>
                  </div>

                  {/* Shift Details */}
                  {autoScheduleResult.assignments && autoScheduleResult.assignments.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Detail Shift yang Dibuat
                      </h4>
                      <div className="space-y-3">
                        {autoScheduleResult.assignments.map((assignment, index) => (
                          <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <div className="text-sm text-gray-500">Pegawai</div>
                                <div className="font-medium">{assignment.employee?.namaDepan} {assignment.employee?.namaBelakang}</div>
                                <div className="text-xs text-gray-400">{assignment.employee?.username}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Tanggal & Waktu</div>
                                <div className="font-medium">{new Date(assignment.tanggal).toLocaleDateString('id-ID')}</div>
                                <div className="text-sm text-blue-600">{assignment.waktuMulai} - {assignment.waktuSelesai}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Lokasi</div>
                                <div className="font-medium flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {assignment.lokasi?.namaLokasi}
                                </div>
                                <div className="text-xs text-gray-400">{assignment.lokasi?.jenisRuangan}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Status</div>
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Terjadwal
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {autoScheduleResult.recommendations && autoScheduleResult.recommendations.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Rekomendasi AI
                      </h4>
                      <div className="space-y-2">
                        {autoScheduleResult.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Algorithm Process */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Proses Algoritma Hybrid</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Step 1: Algoritma Greedy diterapkan untuk penugasan awal
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Step 2: Optimasi Backtracking untuk resolusi konflik
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Step 3: Penyeimbangan beban kerja dan verifikasi kapasitas
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Step 4: Optimasi akhir dan rekomendasi dibuat
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Jadwal berhasil dibuat! Kunjungi halaman Manajemen Jadwal untuk melihat hasil.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(AdminPage, ['ADMIN']);
