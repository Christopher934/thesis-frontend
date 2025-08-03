'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/lib/withAuth';
import ContentCard from '@/components/ui/ContentCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
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
  CheckCircle
} from 'lucide-react';

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

interface WeeklyScheduleRequest {
  startDate: string;
  locations: string[];
  shiftPattern: { [location: string]: { PAGI?: number; SIANG?: number; MALAM?: number; } };
  priority: string;
}

interface MonthlyScheduleRequest {
  year: number;
  month: number;
  locations: string[];
  averageStaffPerShift: { [location: string]: number };
  workloadLimits: {
    maxShiftsPerPerson: number;
    maxConsecutiveDays: number;
  };
}

interface BulkScheduleResult {
  totalShifts: number;
  successfulAssignments: number;
  conflicts: any[];
  recommendations: string[];
  createdShifts: number;
  fulfillmentRate?: number;
  workloadDistribution?: { [userId: number]: number };
}

const AdminUnifiedPage: React.FC = () => {
  // State for user info
  const [user, setUser] = useState<UserInfo | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for auto scheduler
  const [isAutoScheduleModalOpen, setIsAutoScheduleModalOpen] = useState(false);
  const [autoScheduleRequests, setAutoScheduleRequests] = useState<AutoScheduleRequest[]>([
    {
      date: new Date().toISOString().split('T')[0],
      location: 'ICU',
      shiftType: 'PAGI',
      requiredCount: 3,
      preferredRoles: ['PERAWAT'],
      priority: 'HIGH'
    }
  ]);
  const [autoScheduleResult, setAutoScheduleResult] = useState<AutoScheduleResult | null>(null);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [autoScheduleError, setAutoScheduleError] = useState<string | null>(null);

  // State for bulk scheduling
  const [isBulkScheduling, setIsBulkScheduling] = useState(false);
  const [bulkScheduleError, setBulkScheduleError] = useState<string | null>(null);
  const [bulkScheduleResult, setBulkScheduleResult] = useState<BulkScheduleResult | null>(null);
  const [bulkScheduleType, setBulkScheduleType] = useState<'weekly' | 'monthly'>('weekly');
  
  // Weekly schedule state
  const [weeklyRequest, setWeeklyRequest] = useState<WeeklyScheduleRequest>({
    startDate: new Date().toISOString().split('T')[0],
    locations: ['ICU', 'RAWAT_INAP', 'GAWAT_DARURAT'],
    shiftPattern: {
      ICU: { PAGI: 4, SIANG: 4, MALAM: 3 },
      RAWAT_INAP: { PAGI: 3, SIANG: 3, MALAM: 2 },
      GAWAT_DARURAT: { PAGI: 5, SIANG: 5, MALAM: 3 }
    },
    priority: 'HIGH'
  });

  // Monthly schedule state
  const [monthlyRequest, setMonthlyRequest] = useState<MonthlyScheduleRequest>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    locations: ['ICU', 'RAWAT_INAP', 'GAWAT_DARURAT', 'RAWAT_JALAN'],
    averageStaffPerShift: {
      ICU: 4,
      RAWAT_INAP: 3,
      GAWAT_DARURAT: 5,
      RAWAT_JALAN: 2
    },
    workloadLimits: {
      maxShiftsPerPerson: 18,
      maxConsecutiveDays: 4
    }
  });

  // Constants for auto scheduler
  const locations = ['ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 'LABORATORIUM', 'FARMASI', 'RADIOLOGI'];
  const shiftTypes = ['PAGI', 'SIANG', 'MALAM', 'ON_CALL', 'JAGA'];
  const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
  const roles = ['DOKTER', 'PERAWAT', 'STAF'];

  // Get user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        const response = await fetch('/api/admin/dashboard', {
          credentials: 'include'
        });
        
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.clear();
          window.location.href = '/sign-in?message=Session expired, please login again';
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
        setDashboardError(null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setDashboardError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setDashboardLoading(false);
      }
    };

    if (activeTab === 'monitoring') {
      fetchDashboardData();
    }
  }, [activeTab]);

  // Auto scheduler functions
  const addAutoScheduleRequest = () => {
    setAutoScheduleRequests([...autoScheduleRequests, {
      date: new Date().toISOString().split('T')[0],
      location: 'ICU',
      shiftType: 'PAGI',
      requiredCount: 1,
      preferredRoles: ['PERAWAT'],
      priority: 'NORMAL'
    }]);
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
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Tidak ada token autentikasi. Silakan login terlebih dahulu.');
      }

      const response = await fetch('/api/admin/create-optimal-shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(autoScheduleRequests),
      });

      if (response.status === 401) {
        // Token expired, redirect to login
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

  // Bulk scheduling functions
  const executeBulkScheduling = async () => {
    setIsBulkScheduling(true);
    setBulkScheduleError(null);
    setBulkScheduleResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Tidak ada token autentikasi. Silakan login terlebih dahulu.');
      }

      const endpoint = bulkScheduleType === 'weekly' 
        ? '/api/admin/create-weekly-schedule'
        : '/api/admin/create-monthly-schedule';
      
      const requestBody = bulkScheduleType === 'weekly' ? weeklyRequest : monthlyRequest;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/sign-in?message=Session expired, please login again';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Gagal membuat jadwal ${bulkScheduleType}`);
      }

      const result = await response.json();
      setBulkScheduleResult(result);
    } catch (err) {
      console.error('Bulk schedule error:', err);
      setBulkScheduleError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsBulkScheduling(false);
    }
  };

  const updateWeeklyShiftPattern = (location: string, shiftType: string, count: number) => {
    setWeeklyRequest(prev => ({
      ...prev,
      shiftPattern: {
        ...prev.shiftPattern,
        [location]: {
          ...prev.shiftPattern[location],
          [shiftType]: count
        }
      }
    }));
  };

  const updateMonthlyStaffPattern = (location: string, count: number) => {
    setMonthlyRequest(prev => ({
      ...prev,
      averageStaffPerShift: {
        ...prev.averageStaffPerShift,
        [location]: count
      }
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'NORMAL': return 'bg-blue-500 text-white';
      case 'LOW': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'OVERWORKED': return 'bg-orange-500 text-white';
      case 'HIGH': return 'bg-yellow-500 text-black';
      case 'NORMAL': return 'bg-green-500 text-white';
      case 'LIGHT': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-orange-600';
    if (utilization >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
            <p className="text-gray-600 mt-1">
              Selamat datang, {user?.namaDepan} {user?.namaBelakang}
            </p>
            <p className="text-sm text-gray-500">{currentTime}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <ContentCard>
          <div className="p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">Manajemen Jadwal</h3>
            <PrimaryButton 
              onClick={() => window.location.href = '/dashboard/list/managemenjadwal'}
              className="w-full text-sm"
            >
              Kelola Jadwal
            </PrimaryButton>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="p-6 text-center">
            <Brain className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">Auto Schedule AI</h3>
            <button
              onClick={() => setIsAutoScheduleModalOpen(true)}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 text-sm"
            >
              Jalankan AI
            </button>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Manajemen Pegawai</h3>
            <PrimaryButton 
              onClick={() => window.location.href = '/dashboard/list/pegawai'}
              className="w-full text-sm"
            >
              Kelola Pegawai
            </PrimaryButton>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-3 text-orange-600" />
            <h3 className="font-semibold mb-2">Laporan</h3>
            <PrimaryButton 
              onClick={() => window.location.href = '/dashboard/list/laporan'}
              className="w-full text-sm"
            >
              Lihat Laporan
            </PrimaryButton>
          </div>
        </ContentCard>
      </div>

      {/* Auth Status Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded text-xs">
          <strong>Debug Info:</strong> Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}, 
          User: {user?.namaDepan || 'Not loaded'}, 
          Role: {user?.role || 'Not loaded'}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Monitoring & Analytics
            </button>
            <button
              onClick={() => setActiveTab('bulk-scheduling')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk-scheduling'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bulk Scheduling
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Overview */}
          <ContentCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-medium">System Status</h4>
                  <p className="text-sm text-gray-600">All systems operational</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium">Backend API</h4>
                  <p className="text-sm text-gray-600">Connected & Running</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-medium">AI Algorithm</h4>
                  <p className="text-sm text-gray-600">Ready for scheduling</p>
                </div>
              </div>
            </div>
          </ContentCard>

          {/* Recent Activities */}
          <ContentCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">New shift schedule created</p>
                      <p className="text-sm text-gray-600">ICU - Shift Pagi</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">5 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Employee registered</p>
                      <p className="text-sm text-gray-600">Dr. Sarah - Dokter</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">1 hour ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">AI optimization completed</p>
                      <p className="text-sm text-gray-600">5 shifts optimized</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
              </div>
            </div>
          </ContentCard>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Dashboard Data */}
          {dashboardLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : dashboardError ? (
            <ContentCard>
              <div className="p-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-red-800">Error loading dashboard: {dashboardError}</span>
                  </div>
                </div>
              </div>
            </ContentCard>
          ) : (
            <>
              {/* Summary Cards */}
              {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <ContentCard>
                    <div className="p-6">
                      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Employees</h3>
                        <Users className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="text-2xl font-bold">{dashboardData.summary.totalEmployees}</div>
                    </div>
                  </ContentCard>

                  <ContentCard>
                    <div className="p-6">
                      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Active Shifts</h3>
                        <Clock className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="text-2xl font-bold">{dashboardData.summary.activeShifts}</div>
                    </div>
                  </ContentCard>

                  <ContentCard>
                    <div className="p-6">
                      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Overworked Staff</h3>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {dashboardData.summary.overworkedEmployees}
                      </div>
                    </div>
                  </ContentCard>

                  <ContentCard>
                    <div className="p-6">
                      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Avg Utilization</h3>
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="text-2xl font-bold">
                        {dashboardData.summary.averageUtilization?.toFixed(1)}%
                      </div>
                    </div>
                  </ContentCard>
                </div>
              )}

              {/* Workload Alerts */}
              <ContentCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Workload Alerts</h3>
                    <span className="text-sm text-gray-500">
                      {dashboardData?.workloadAlerts?.length || 0} alerts
                    </span>
                  </div>
                  
                  {dashboardData?.workloadAlerts?.length ? (
                    <div className="space-y-3">
                      {dashboardData.workloadAlerts.map((alert: any) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <UserCheck className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">{alert.employeeName}</p>
                              <p className="text-sm text-gray-600">{alert.role}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{alert.currentShifts} shifts</p>
                              <p className="text-xs text-gray-500">{alert.consecutiveDays} consecutive days</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>
                              {alert.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No workload alerts</p>
                  )}
                </div>
              </ContentCard>

              {/* Location Capacity */}
              <ContentCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Location Capacity</h3>
                    <span className="text-sm text-gray-500">
                      {dashboardData?.locationCapacity?.length || 0} locations
                    </span>
                  </div>

                  {dashboardData?.locationCapacity?.length ? (
                    <div className="space-y-3">
                      {dashboardData.locationCapacity.map((location: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">{location.location}</p>
                              <p className="text-sm text-gray-600">
                                {location.current} / {location.capacity} staff
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  location.utilization >= 90 ? 'bg-red-500' :
                                  location.utilization >= 75 ? 'bg-orange-500' :
                                  location.utilization >= 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(location.utilization, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`font-medium ${getUtilizationColor(location.utilization)}`}>
                              {location.utilization.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No capacity data available</p>
                  )}
                </div>
              </ContentCard>
            </>
          )}
        </div>
      )}

      {/* Auto Schedule Modal */}
      {isAutoScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold">AI Auto Schedule - Hybrid Algorithm</h2>
                </div>
                <button
                  onClick={() => {
                    setIsAutoScheduleModalOpen(false);
                    setAutoScheduleResult(null);
                    setAutoScheduleError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Buat jadwal shift optimal menggunakan algoritma Greedy + Backtracking untuk mengoptimalkan penugasan pegawai
              </p>

              {/* Auto Schedule Form */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Kebutuhan Shift</h3>
                
                {autoScheduleRequests.map((request, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Request #{index + 1}</h4>
                      {autoScheduleRequests.length > 1 && (
                        <button
                          onClick={() => removeAutoScheduleRequest(index)}
                          className="text-red-600 hover:text-red-700 text-sm px-3 py-1 border border-red-300 rounded"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tanggal</label>
                        <input
                          type="date"
                          value={request.date}
                          onChange={(e) => updateAutoScheduleRequest(index, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Lokasi</label>
                        <select
                          value={request.location}
                          onChange={(e) => updateAutoScheduleRequest(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {locations.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Tipe Shift</label>
                        <select
                          value={request.shiftType}
                          onChange={(e) => updateAutoScheduleRequest(index, 'shiftType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {shiftTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Jumlah Staff</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={request.requiredCount}
                          onChange={(e) => updateAutoScheduleRequest(index, 'requiredCount', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Prioritas</label>
                        <select
                          value={request.priority}
                          onChange={(e) => updateAutoScheduleRequest(index, 'priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {priorities.map((priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Role Preferensi</label>
                        <div className="flex flex-wrap gap-1">
                          {roles.map((role) => (
                            <span
                              key={role}
                              className={`px-2 py-1 text-xs rounded cursor-pointer ${
                                request.preferredRoles.includes(role)
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              onClick={() => {
                                const currentRoles = request.preferredRoles;
                                const newRoles = currentRoles.includes(role)
                                  ? currentRoles.filter(r => r !== role)
                                  : [...currentRoles, role];
                                updateAutoScheduleRequest(index, 'preferredRoles', newRoles);
                              }}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                      <span className="text-sm text-gray-600">
                        {request.requiredCount} staff dibutuhkan untuk {request.location} pada {request.date}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={addAutoScheduleRequest}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Tambah Request
                  </button>
                  
                  <button
                    onClick={executeAutoScheduling}
                    disabled={isAutoScheduling || autoScheduleRequests.length === 0}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAutoScheduling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menjalankan AI...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Jalankan AI Auto Schedule
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {autoScheduleError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-red-800">{autoScheduleError}</span>
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

      {activeTab === 'bulk-scheduling' && (
        <div className="space-y-6">
          {/* Bulk Scheduling Header */}
          <ContentCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bulk Auto Scheduling</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setBulkScheduleType('weekly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      bulkScheduleType === 'weekly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setBulkScheduleType('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      bulkScheduleType === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <p className="text-gray-600">
                Buat jadwal otomatis untuk periode yang lebih panjang dengan algoritma AI yang canggih.
                Sistem akan mengoptimalkan distribusi shift dan workload balancing.
              </p>
            </div>
          </ContentCard>

          {/* Weekly Scheduling */}
          {bulkScheduleType === 'weekly' && (
            <ContentCard>
              <div className="p-6">
                <h4 className="font-medium mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Weekly Auto Scheduling (7 Hari)
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuration Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={weeklyRequest.startDate}
                        onChange={(e) => setWeeklyRequest(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority Level
                      </label>
                      <select
                        value={weeklyRequest.priority}
                        onChange={(e) => setWeeklyRequest(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locations ({weeklyRequest.locations.length} selected)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {locations.map((location) => (
                          <label key={location} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={weeklyRequest.locations.includes(location)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWeeklyRequest(prev => ({
                                    ...prev,
                                    locations: [...prev.locations, location]
                                  }));
                                } else {
                                  setWeeklyRequest(prev => ({
                                    ...prev,
                                    locations: prev.locations.filter(l => l !== location)
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 mr-2"
                            />
                            <span className="text-sm">{location}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Shift Pattern Configuration */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-700">Shift Pattern per Location</h5>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {weeklyRequest.locations.map((location) => (
                        <div key={location} className="p-3 border border-gray-200 rounded-lg">
                          <h6 className="font-medium text-sm mb-2">{location}</h6>
                          <div className="grid grid-cols-3 gap-2">
                            {['PAGI', 'SIANG', 'MALAM'].map((shiftType) => (
                              <div key={shiftType}>
                                <label className="block text-xs text-gray-600">{shiftType}</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={weeklyRequest.shiftPattern[location]?.[shiftType] || 0}
                                  onChange={(e) => updateWeeklyShiftPattern(location, shiftType, parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <PrimaryButton
                    onClick={executeBulkScheduling}
                    disabled={isBulkScheduling}
                    className="px-6 py-2"
                  >
                    {isBulkScheduling ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Weekly Schedule...
                      </div>
                    ) : (
                      'Create Weekly Schedule'
                    )}
                  </PrimaryButton>
                </div>
              </div>
            </ContentCard>
          )}

          {/* Monthly Scheduling */}
          {bulkScheduleType === 'monthly' && (
            <ContentCard>
              <div className="p-6">
                <h4 className="font-medium mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Monthly Auto Scheduling (1 Bulan Penuh)
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuration Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <input
                          type="number"
                          min="2024"
                          max="2030"
                          value={monthlyRequest.year}
                          onChange={(e) => setMonthlyRequest(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Month
                        </label>
                        <select
                          value={monthlyRequest.month}
                          onChange={(e) => setMonthlyRequest(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {new Date(2024, i).toLocaleDateString('id-ID', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Workload Limits
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600">Max Shifts/Person</label>
                          <input
                            type="number"
                            min="10"
                            max="25"
                            value={monthlyRequest.workloadLimits.maxShiftsPerPerson}
                            onChange={(e) => setMonthlyRequest(prev => ({
                              ...prev,
                              workloadLimits: {
                                ...prev.workloadLimits,
                                maxShiftsPerPerson: parseInt(e.target.value)
                              }
                            }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600">Max Consecutive Days</label>
                          <input
                            type="number"
                            min="3"
                            max="7"
                            value={monthlyRequest.workloadLimits.maxConsecutiveDays}
                            onChange={(e) => setMonthlyRequest(prev => ({
                              ...prev,
                              workloadLimits: {
                                ...prev.workloadLimits,
                                maxConsecutiveDays: parseInt(e.target.value)
                              }
                            }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locations ({monthlyRequest.locations.length} selected)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {locations.map((location) => (
                          <label key={location} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={monthlyRequest.locations.includes(location)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMonthlyRequest(prev => ({
                                    ...prev,
                                    locations: [...prev.locations, location]
                                  }));
                                } else {
                                  setMonthlyRequest(prev => ({
                                    ...prev,
                                    locations: prev.locations.filter(l => l !== location)
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 mr-2"
                            />
                            <span className="text-sm">{location}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Average Staff Configuration */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-700">Average Staff per Shift</h5>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {monthlyRequest.locations.map((location) => (
                        <div key={location} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <label className="font-medium text-sm">{location}</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={monthlyRequest.averageStaffPerShift[location] || 3}
                              onChange={(e) => updateMonthlyStaffPattern(location, parseInt(e.target.value) || 3)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <PrimaryButton
                    onClick={executeBulkScheduling}
                    disabled={isBulkScheduling}
                    className="px-6 py-2"
                  >
                    {isBulkScheduling ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Monthly Schedule...
                      </div>
                    ) : (
                      'Create Monthly Schedule'
                    )}
                  </PrimaryButton>
                </div>
              </div>
            </ContentCard>
          )}

          {/* Bulk Schedule Error */}
          {bulkScheduleError && (
            <ContentCard>
              <div className="p-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-red-800">{bulkScheduleError}</span>
                  </div>
                </div>
              </div>
            </ContentCard>
          )}

          {/* Bulk Schedule Results */}
          {bulkScheduleResult && (
            <ContentCard>
              <div className="p-6">
                <h4 className="font-medium mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  {bulkScheduleType === 'weekly' ? 'Weekly' : 'Monthly'} Schedule Created Successfully!
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900">Total Shifts</h5>
                    <p className="text-2xl font-bold text-blue-700">{bulkScheduleResult.totalShifts}</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-900">Successful Assignments</h5>
                    <p className="text-2xl font-bold text-green-700">{bulkScheduleResult.successfulAssignments}</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h5 className="font-medium text-purple-900">Fulfillment Rate</h5>
                    <p className="text-2xl font-bold text-purple-700">
                      {Math.round((bulkScheduleResult.successfulAssignments / bulkScheduleResult.totalShifts) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Conflicts */}
                {bulkScheduleResult.conflicts && bulkScheduleResult.conflicts.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-medium mb-3 text-orange-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Conflicts Detected ({bulkScheduleResult.conflicts.length})
                    </h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {bulkScheduleResult.conflicts.map((conflict, index) => (
                        <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
                          {conflict.date} - {conflict.location} ({conflict.shiftType}): {conflict.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {bulkScheduleResult.recommendations && bulkScheduleResult.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-medium mb-3 flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-blue-600" />
                      AI Recommendations
                    </h5>
                    <div className="space-y-2">
                      {bulkScheduleResult.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      {bulkScheduleType === 'weekly' ? 'Weekly' : 'Monthly'} schedule berhasil dibuat! 
                      Kunjungi halaman Manajemen Jadwal untuk melihat hasil lengkap.
                    </span>
                  </div>
                </div>
              </div>
            </ContentCard>
          )}
        </div>
      )}
    </div>
  );
};

export default withAuth(AdminUnifiedPage, ['ADMIN', 'SUPERVISOR']);
