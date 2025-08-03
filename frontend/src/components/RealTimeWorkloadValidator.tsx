'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, CheckCircle, XCircle, Shield, AlertCircle } from 'lucide-react';

interface UserWorkloadStatus {
  userId: number;
  namaDepan: string;
  namaBelakang: string;
  employeeId: string;
  currentShifts: number;
  maxShifts: number;
  totalHours: number;
  maxHours: number;
  status: 'AVAILABLE' | 'APPROACHING_LIMIT' | 'AT_LIMIT' | 'OVERWORKED' | 'DISABLED';
  canTakeMoreShifts: boolean;
  requiresApproval: boolean;
  isDisabledForShifts: boolean;
  overworkRequestRequired: boolean;
}

interface RealTimeWorkloadValidatorProps {
  onValidationResult?: (result: any) => void;
  refreshTrigger?: number;
}

const RealTimeWorkloadValidator: React.FC<RealTimeWorkloadValidatorProps> = ({
  onValidationResult,
  refreshTrigger = 0
}) => {
  const [userStatuses, setUserStatuses] = useState<UserWorkloadStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users workload status
  const fetchWorkloadStatuses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/workload/all-users-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Try fallback API if the first one fails
        console.warn('Primary API failed, trying fallback...');
        const fallbackResponse = await fetch('/api/overwork/workload-status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to fetch workload statuses: ${fallbackResponse.status}`);
        }
        
        const fallbackResult = await fallbackResponse.json();
        if (fallbackResult.success && fallbackResult.data) {
          setUserStatuses(fallbackResult.data);
          
          if (onValidationResult) {
            onValidationResult({
              totalUsers: fallbackResult.data.length,
              availableUsers: fallbackResult.data.filter((u: UserWorkloadStatus) => u.status === 'AVAILABLE').length,
              disabledUsers: fallbackResult.data.filter((u: UserWorkloadStatus) => u.isDisabledForShifts).length,
              overworkedUsers: fallbackResult.data.filter((u: UserWorkloadStatus) => u.status === 'OVERWORKED').length,
              usersNeedingOverworkRequest: fallbackResult.data.filter((u: UserWorkloadStatus) => u.overworkRequestRequired).length
            });
          }
          return;
        } else {
          throw new Error(fallbackResult.message || 'Failed to fetch fallback data');
        }
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUserStatuses(result.data);
        
        // Call validation result callback if provided
        if (onValidationResult) {
          onValidationResult({
            totalUsers: result.data.length,
            availableUsers: result.data.filter((u: UserWorkloadStatus) => u.status === 'AVAILABLE').length,
            disabledUsers: result.data.filter((u: UserWorkloadStatus) => u.isDisabledForShifts).length,
            overworkedUsers: result.data.filter((u: UserWorkloadStatus) => u.status === 'OVERWORKED').length,
            usersNeedingOverworkRequest: result.data.filter((u: UserWorkloadStatus) => u.overworkRequestRequired).length
          });
        }
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching workload statuses:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchWorkloadStatuses();
    
    const interval = setInterval(fetchWorkloadStatuses, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600 bg-green-50 border-green-200';
      case 'APPROACHING_LIMIT': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'AT_LIMIT': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'OVERWORKED': return 'text-red-600 bg-red-50 border-red-200';
      case 'DISABLED': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <CheckCircle className="w-4 h-4" />;
      case 'APPROACHING_LIMIT': return <AlertTriangle className="w-4 h-4" />;
      case 'AT_LIMIT': return <AlertCircle className="w-4 h-4" />;
      case 'OVERWORKED': return <XCircle className="w-4 h-4" />;
      case 'DISABLED': return <Shield className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Status text mapping
  const getStatusText = (user: UserWorkloadStatus) => {
    if (user.isDisabledForShifts) {
      if (user.overworkRequestRequired) {
        return 'DISABLED - Needs Overwork Request';
      }
      return 'DISABLED';
    }
    
    switch (user.status) {
      case 'AVAILABLE': return 'Available for Shifts';
      case 'APPROACHING_LIMIT': return 'Approaching Limit';
      case 'AT_LIMIT': return 'At Maximum Limit';
      case 'OVERWORKED': return 'Overworked';
      default: return user.status;
    }
  };

  // Summary statistics
  const summary = {
    total: userStatuses.length,
    available: userStatuses.filter(u => u.status === 'AVAILABLE').length,
    approaching: userStatuses.filter(u => u.status === 'APPROACHING_LIMIT').length,
    disabled: userStatuses.filter(u => u.isDisabledForShifts).length,
    needsOverwork: userStatuses.filter(u => u.overworkRequestRequired).length
  };

  if (loading && userStatuses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading workload statuses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header with refresh button */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Real-Time Workload Validator
          </h3>
          <button
            onClick={fetchWorkloadStatuses}
            disabled={loading}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-blue-800">Total Users</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.available}</div>
            <div className="text-sm text-green-800">Available</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{summary.approaching}</div>
            <div className="text-sm text-yellow-800">Approaching</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{summary.disabled}</div>
            <div className="text-sm text-red-800">Disabled</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{summary.needsOverwork}</div>
            <div className="text-sm text-orange-800">Need Request</div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <XCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="p-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {userStatuses.map((user) => (
            <div
              key={user.userId}
              className={`p-3 rounded-lg border-l-4 ${getStatusColor(user.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(user.status)}
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">
                      {user.namaDepan} {user.namaBelakang}
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {user.employeeId} • {getStatusText(user)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {user.currentShifts}/{user.maxShifts} shifts
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.totalHours}/{user.maxHours} hours
                  </div>
                  {user.overworkRequestRequired && (
                    <div className="text-xs text-red-600 font-medium mt-1">
                      🚫 Overwork Request Required
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealTimeWorkloadValidator;
