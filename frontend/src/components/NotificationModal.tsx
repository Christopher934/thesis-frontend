'use client';

import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Clock,
  MapPin,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: {
    createdShifts?: number;
    conflicts?: Array<{
      date?: string;
      location?: string;
      shiftType?: string;
      reason?: string;
      error?: string;
    } | string>;
    capacityIssues?: Array<{
      location: string;
      currentCount: number;
      maxCapacity: number;
      utilizationPercentage: number;
      status: string;
    }>;
    workloadAlerts?: Array<{
      employeeId: string;
      name: string;
      currentShifts: number;
      status: string;
      recommendation: string;
    }>;
    workloadIssues?: Array<string>;
    fulfillmentRate?: number;
    recommendations?: string[];
    totalRequested?: number;
    successfulAssignments?: number;
    timestamp?: string;
    employee?: string;
    weeklyHours?: string;
    monthlyHours?: string;
  };
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationData | null;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, notification }) => {
  if (!isOpen || !notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return <Info className="w-6 h-6 text-gray-600" />;
    }
  };

  const getHeaderClass = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTitleClass = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-4 border-b ${getHeaderClass()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h2 className={`text-lg font-semibold ${getTitleClass()}`}>
                {notification.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Message */}
          <p className="text-gray-700 mb-4">{notification.message}</p>

          {/* Details Section */}
          {notification.details && (
            <div className="space-y-4">
              {/* Success Statistics */}
              {notification.details.createdShifts !== undefined && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {notification.details.createdShifts}
                    </div>
                    <div className="text-sm text-green-700">Shift Dibuat</div>
                  </div>
                  
                  {notification.details.successfulAssignments !== undefined && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {notification.details.successfulAssignments}
                      </div>
                      <div className="text-sm text-blue-700">Berhasil Assign</div>
                    </div>
                  )}
                  
                  {notification.details.fulfillmentRate !== undefined && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {notification.details.fulfillmentRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-purple-700">Tingkat Pemenuhan</div>
                    </div>
                  )}
                  
                  {notification.details.conflicts && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {notification.details.conflicts.length}
                      </div>
                      <div className="text-sm text-orange-700">Konflik</div>
                    </div>
                  )}
                </div>
              )}

              {/* Conflicts */}
              {notification.details.conflicts && notification.details.conflicts.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Konflik Jadwal ({notification.details.conflicts.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notification.details.conflicts.map((conflict, index) => (
                      <div key={index} className="bg-white border border-orange-200 rounded p-3 text-sm">
                        {typeof conflict === 'string' ? (
                          <div className="text-orange-700 font-medium">{conflict}</div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              {conflict.date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-500" />
                                  <span className="text-gray-600">Tanggal:</span>
                                  <span className="font-medium">{conflict.date}</span>
                                </div>
                              )}
                              {conflict.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gray-500" />
                                  <span className="text-gray-600">Lokasi:</span>
                                  <span className="font-medium">{conflict.location}</span>
                                </div>
                              )}
                              {conflict.shiftType && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <span className="text-gray-600">Shift:</span>
                                  <span className="font-medium">{conflict.shiftType}</span>
                                </div>
                              )}
                            </div>
                            {(conflict.reason || conflict.error) && (
                              <div className="mt-2 text-orange-700 font-medium">
                                {conflict.reason || conflict.error}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workload Issues */}
              {notification.details.workloadIssues && notification.details.workloadIssues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Masalah Beban Kerja ({notification.details.workloadIssues.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notification.details.workloadIssues.map((issue, index) => (
                      <div key={index} className="bg-white border border-red-200 rounded p-3 text-sm">
                        <div className="text-red-700 font-medium">{issue}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity Issues */}
              {notification.details.capacityIssues && notification.details.capacityIssues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Masalah Kapasitas Lokasi ({notification.details.capacityIssues.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notification.details.capacityIssues.map((issue, index) => (
                      <div key={index} className="bg-white border border-red-200 rounded p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{issue.location}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            issue.status === 'OVER_CAPACITY' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {issue.utilizationPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-gray-600">
                          {issue.currentCount}/{issue.maxCapacity} pegawai 
                          {issue.status === 'OVER_CAPACITY' && ' (Melebihi Kapasitas!)'}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              issue.utilizationPercentage > 100 ? 'bg-red-500' : 
                              issue.utilizationPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(issue.utilizationPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workload Alerts */}
              {notification.details.workloadAlerts && notification.details.workloadAlerts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Peringatan Beban Kerja ({notification.details.workloadAlerts.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notification.details.workloadAlerts.map((alert, index) => (
                      <div key={index} className="bg-white border border-yellow-200 rounded p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{alert.name}</span>
                          <span className="text-xs text-gray-500">({alert.employeeId})</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">{alert.currentShifts} shift bulan ini</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.status === 'CRITICAL' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                        <div className="text-yellow-700 text-xs">
                          {alert.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {notification.details.recommendations && notification.details.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Rekomendasi Sistem
                  </h3>
                  <ul className="space-y-1">
                    {notification.details.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          {notification.details?.timestamp && (
            <div className="text-sm text-gray-500">
              {notification.details.timestamp}
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
