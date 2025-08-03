'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle, TrendingUp, Calendar } from 'lucide-react';

interface WorkloadData {
  userId: number;
  employeeId: string;
  name: string;
  currentShifts: number;
  maxShifts: number;
  consecutiveDays: number;
  maxConsecutiveDays: number;
  utilizationRate: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  recommendation: string;
  locations: string[];
  lastShiftDate: string | null;
  weeklyHours: number;
  monthlyHours: number;
}

interface WorkloadCounterProps {
  employeeId?: string;
  userName?: string;
  compact?: boolean;
  showDetails?: boolean;
}

const WorkloadCounterWidget: React.FC<WorkloadCounterProps> = ({
  employeeId,
  userName,
  compact = false,
  showDetails = true
}) => {
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
  const [employeeWorkload, setEmployeeWorkload] = useState<WorkloadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkloadData();
  }, [employeeId]);

  const fetchWorkloadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/laporan/workload-analysis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch workload data: ${response.status}`);
      }

      const data = await response.json();
      setWorkloadData(data);

      // If specific employeeId is provided, find that employee's data
      if (employeeId) {
        const employeeData = data.find((emp: WorkloadData) => 
          emp.employeeId === employeeId || emp.name.toLowerCase().includes(userName?.toLowerCase() || '')
        );
        setEmployeeWorkload(employeeData || null);
      }

    } catch (error) {
      console.error('Error fetching workload data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch workload data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'NORMAL': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4" />;
      case 'WARNING': return <Clock className="h-4 w-4" />;
      case 'NORMAL': return <CheckCircle className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getUtilizationBarColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 75) return 'bg-yellow-500';
    if (rate >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading workload data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-600">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="text-sm">Error: {error}</span>
        </div>
      </div>
    );
  }

  // If specific employee data is requested
  if (employeeId && employeeWorkload) {
    return (
      <div className={`bg-white border rounded-lg ${compact ? 'p-3' : 'p-4'} shadow-sm`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            Beban Kerja: {employeeWorkload.name}
          </h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(employeeWorkload.status)}`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(employeeWorkload.status)}
              {employeeWorkload.status}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <div className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-blue-600`}>
              {employeeWorkload.currentShifts}/{employeeWorkload.maxShifts}
            </div>
            <div className="text-xs text-gray-500">Shift Bulan Ini</div>
          </div>
          <div className="text-center">
            <div className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-purple-600`}>
              {employeeWorkload.consecutiveDays}
            </div>
            <div className="text-xs text-gray-500">Hari Berturut</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Utilisasi</span>
            <span>{employeeWorkload.utilizationRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUtilizationBarColor(employeeWorkload.utilizationRate)}`}
              style={{ width: `${Math.min(employeeWorkload.utilizationRate, 100)}%` }}
            ></div>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Jam Minggu Ini:</span>
                <span className="ml-1 font-medium">{employeeWorkload.weeklyHours}h</span>
              </div>
              <div>
                <span className="text-gray-500">Jam Bulan Ini:</span>
                <span className="ml-1 font-medium">{employeeWorkload.monthlyHours}h</span>
              </div>
            </div>
            
            {employeeWorkload.locations.length > 0 && (
              <div className="text-xs">
                <span className="text-gray-500">Lokasi:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {employeeWorkload.locations.map((location, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {employeeWorkload.recommendation && (
              <div className="text-xs p-2 bg-gray-50 rounded border">
                <span className="text-gray-600">{employeeWorkload.recommendation}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Summary view for all employees
  const criticalCount = workloadData.filter(emp => emp.status === 'CRITICAL').length;
  const warningCount = workloadData.filter(emp => emp.status === 'WARNING').length;
  const normalCount = workloadData.filter(emp => emp.status === 'NORMAL').length;
  const totalEmployees = workloadData.length;

  const averageUtilization = totalEmployees > 0 
    ? Math.round(workloadData.reduce((sum, emp) => sum + emp.utilizationRate, 0) / totalEmployees)
    : 0;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Ringkasan Beban Kerja
        </h3>
        <button 
          onClick={fetchWorkloadData}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Calendar className="h-3 w-3" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">{criticalCount}</div>
          <div className="text-xs text-gray-500">Kritis</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">{warningCount}</div>
          <div className="text-xs text-gray-500">Peringatan</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{normalCount}</div>
          <div className="text-xs text-gray-500">Normal</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{averageUtilization}%</div>
          <div className="text-xs text-gray-500">Rata-rata</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Utilisasi Keseluruhan</span>
          <span>{averageUtilization}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getUtilizationBarColor(averageUtilization)}`}
            style={{ width: `${Math.min(averageUtilization, 100)}%` }}
          ></div>
        </div>
      </div>

      {showDetails && workloadData.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Pegawai dengan Beban Tinggi</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {workloadData
              .filter(emp => emp.status === 'CRITICAL' || emp.status === 'WARNING')
              .slice(0, 5)
              .map((emp, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(emp.status)}
                    <span className="font-medium">{emp.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{emp.currentShifts}/{emp.maxShifts}</div>
                    <div className="text-gray-500">{emp.utilizationRate}%</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkloadCounterWidget;
