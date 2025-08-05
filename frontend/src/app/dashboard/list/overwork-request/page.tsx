'use client';

import React, { useState, useEffect } from 'react';
import withAuth from '@/lib/withAuth';
import { 
  Shield, 
  User, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface UserEligibility {
  canTakeShift: boolean;
  needsOverworkRequest: boolean;
  currentShifts: number;
  maxShifts: number;
  reason?: string;
  workloadStatus: string;
}

interface OverworkRequest {
  id: number;
  title: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  data?: any;
}

function OverworkRequestPage() {
  const [user, setUser] = useState<any>(null);
  const [eligibility, setEligibility] = useState<UserEligibility | null>(null);
  const [userRequests, setUserRequests] = useState<OverworkRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Form state
  const [requestForm, setRequestForm] = useState({
    requestedAdditionalShifts: 1,
    reason: '',
    urgency: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    requestType: 'TEMPORARY' as 'TEMPORARY' | 'PERMANENT'
  });

  // Get user info
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }
  }, []);

  // Check user eligibility
  const checkEligibility = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/overwork/user/${user.id}/eligibility`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setEligibility(result.data);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's overwork request history
  const fetchUserRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/overwork/user/${user.id}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setUserRequests(result.data);
      }
    } catch (error) {
      console.error('Error fetching user requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit overwork request
  const submitOverworkRequest = async () => {
    if (!user || !requestForm.reason) return;

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/overwork/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          requestedAdditionalShifts: requestForm.requestedAdditionalShifts,
          reason: requestForm.reason,
          urgency: requestForm.urgency,
          requestType: requestForm.requestType
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Overwork request submitted successfully!');
        setRequestForm({
          requestedAdditionalShifts: 1,
          reason: '',
          urgency: 'MEDIUM',
          requestType: 'TEMPORARY'
        });
        // Refresh data
        checkEligibility();
        fetchUserRequests();
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('❌ Error submitting request');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      checkEligibility();
      fetchUserRequests();
    }
  }, [user]);

  // Helper functions
  const getEligibilityColor = (eligibility: UserEligibility) => {
    if (eligibility.needsOverworkRequest) {
      return 'border-red-200 bg-red-50';
    }
    return eligibility.canTakeShift ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100 border-green-200';
      case 'REJECTED': return 'text-red-600 bg-red-100 border-red-200';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Overwork Request</h1>
              <p className="text-gray-600">
                Submit request untuk menambah kapasitas shift ketika sudah mencapai batas maksimal
              </p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    {user.namaDepan} {user.namaBelakang}
                  </p>
                  <p className="text-sm text-blue-700">
                    {user.employeeId} • {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Current Status & Submit Request */}
          <div className="space-y-6">
            {/* Current Eligibility Status */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Status Eligibility</h2>
                <button
                  onClick={checkEligibility}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Checking...' : '🔄 Refresh'}
                </button>
              </div>

              {eligibility ? (
                <div className={`p-4 rounded-lg border ${getEligibilityColor(eligibility)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {eligibility.needsOverworkRequest ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : eligibility.canTakeShift ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-2">
                        {eligibility.needsOverworkRequest 
                          ? '🚫 Overwork Request Required'
                          : eligibility.canTakeShift 
                            ? '✅ Can Take New Shifts'
                            : '⚠️ Approaching Limit'
                        }
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <p>Current Shifts: <span className="font-medium">{eligibility.currentShifts}/{eligibility.maxShifts}</span></p>
                        <p>Status: <span className="font-medium">{eligibility.workloadStatus}</span></p>
                        {eligibility.reason && <p>Reason: {eligibility.reason}</p>}
                      </div>

                      {eligibility.needsOverworkRequest && (
                        <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                          <div className="text-sm font-medium text-red-800 mb-1">
                            Action Required:
                          </div>
                          <p className="text-sm text-red-700">
                            You must submit an overwork request to get additional shifts
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click refresh to check your eligibility status</p>
                </div>
              )}
            </div>

            {/* Submit Request Form */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Submit New Request</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Shifts *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={requestForm.requestedAdditionalShifts}
                      onChange={(e) => setRequestForm({...requestForm, requestedAdditionalShifts: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <select
                      value={requestForm.urgency}
                      onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select
                    value={requestForm.requestType}
                    onChange={(e) => setRequestForm({...requestForm, requestType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TEMPORARY">Temporary (This Month Only)</option>
                    <option value="PERMANENT">Permanent (Update Monthly Limit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Request *
                  </label>
                  <textarea
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                    placeholder="Explain why additional shifts are needed..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={submitOverworkRequest}
                  disabled={submitLoading || !requestForm.reason}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitLoading ? 'Submitting...' : 'Submit Overwork Request'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Request History */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Request History</h2>
              </div>
              <button
                onClick={fetchUserRequests}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {userRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No overwork requests yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Your submitted requests will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{request.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                        <p className="text-xs text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(request.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            📋 Cara Kerja Overwork Request
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-medium mb-2">1. Check Status</div>
              <p>Periksa eligibility status Anda untuk mengambil shift tambahan</p>
            </div>
            <div>
              <div className="font-medium mb-2">2. Submit Request</div>
              <p>Ajukan permintaan dengan alasan yang jelas jika sudah mencapai limit</p>
            </div>
            <div>
              <div className="font-medium mb-2">3. Wait Approval</div>
              <p>Admin akan review dan approve/reject request Anda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OverworkRequestPage, ['DOKTER', 'PERAWAT', 'STAF']);
