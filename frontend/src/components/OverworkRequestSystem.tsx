'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Send,
  Users,
  Calendar,
  AlertCircle,
  Shield,
  Plus
} from 'lucide-react';

interface UserEligibility {
  canTakeShift: boolean;
  reason: string;
  currentShifts: number;
  maxShifts: number;
  needsOverworkRequest: boolean;
}

interface OverworkRequest {
  id: number;
  userName: string;
  request: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  data: any;
}

const OverworkRequestSystem = () => {
  const [activeTab, setActiveTab] = useState('check-eligibility');
  const [userId, setUserId] = useState('');
  const [eligibility, setEligibility] = useState<UserEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<OverworkRequest[]>([]);

  // Request form state
  const [requestForm, setRequestForm] = useState({
    userId: '',
    requestedAdditionalShifts: 1,
    reason: '',
    urgency: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    requestType: 'TEMPORARY' as 'TEMPORARY' | 'PERMANENT'
  });

  // Check user eligibility
  const checkEligibility = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/overwork/user/${userId}/eligibility`);
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

  // Create overwork request
  const submitOverworkRequest = async () => {
    if (!requestForm.userId || !requestForm.reason) return;

    setLoading(true);
    try {
      const response = await fetch('/api/overwork/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(requestForm.userId),
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
          userId: '',
          requestedAdditionalShifts: 1,
          reason: '',
          urgency: 'MEDIUM',
          requestType: 'TEMPORARY'
        });
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('❌ Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  // Get pending requests (for admin)
  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/overwork/admin/pending');
      const result = await response.json();
      
      if (result.success) {
        setPendingRequests(result.data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Approve request
  const approveRequest = async (requestId: number, adminNotes: string) => {
    try {
      const response = await fetch(`/api/overwork/admin/approve/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: 1, // Replace with actual admin ID
          adminNotes
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Request approved successfully!');
        fetchPendingRequests(); // Refresh list
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('❌ Error approving request');
    }
  };

  // Reject request
  const rejectRequest = async (requestId: number, rejectionReason: string) => {
    try {
      const response = await fetch(`/api/overwork/admin/reject/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: 1, // Replace with actual admin ID
          rejectionReason
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('❌ Request rejected');
        fetchPendingRequests(); // Refresh list
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('❌ Error rejecting request');
    }
  };

  useEffect(() => {
    if (activeTab === 'admin-panel') {
      fetchPendingRequests();
    }
  }, [activeTab]);

  const getEligibilityColor = (eligibility: UserEligibility) => {
    if (!eligibility.canTakeShift) return 'text-red-600 bg-red-50';
    if (eligibility.needsOverworkRequest) return 'text-orange-600 bg-orange-50';
    if (eligibility.currentShifts >= eligibility.maxShifts * 0.9) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            🔥 Overwork Request System
          </h1>
          <p className="text-gray-600 mt-2">
            Sistem untuk mengelola permintaan overwork ketika pegawai sudah mencapai batas maksimal shift
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-4">
            {[
              { id: 'check-eligibility', label: 'Check Eligibility', icon: User },
              { id: 'submit-request', label: 'Submit Request', icon: Send },
              { id: 'admin-panel', label: 'Admin Panel', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Check Eligibility Tab */}
          {activeTab === 'check-eligibility' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Check User Shift Eligibility
                </h2>
                <p className="text-gray-600 mt-1">
                  Cek apakah user masih bisa mengambil shift atau perlu overwork request
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={checkEligibility}
                  disabled={loading || !userId}
                  className="self-end px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Checking...' : 'Check'}
                </button>
              </div>

              {eligibility && (
                <div className={`p-4 rounded-lg border ${getEligibilityColor(eligibility)}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {eligibility.canTakeShift ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                        <h3 className="font-semibold">
                          {eligibility.canTakeShift ? 'CAN TAKE SHIFTS' : 'CANNOT TAKE SHIFTS'}
                        </h3>
                      </div>
                      
                      <p className="text-sm">{eligibility.reason}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span>Current: {eligibility.currentShifts} shifts</span>
                        <span>Max: {eligibility.maxShifts} shifts</span>
                        <span>Progress: {Math.round((eligibility.currentShifts / eligibility.maxShifts) * 100)}%</span>
                      </div>
                    </div>

                    {eligibility.needsOverworkRequest && (
                      <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <AlertTriangle className="h-4 w-4" />
                          OVERWORK REQUEST REQUIRED
                        </div>
                        <p className="text-xs mt-1">
                          User must submit overwork request to get additional shifts
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Request Tab */}
          {activeTab === 'submit-request' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Submit Overwork Request
                </h2>
                <p className="text-gray-600 mt-1">
                  Buat permintaan overwork untuk menambah kapasitas shift user
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID *
                  </label>
                  <input
                    type="number"
                    value={requestForm.userId}
                    onChange={(e) => setRequestForm({...requestForm, userId: e.target.value})}
                    placeholder="Enter user ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Shifts Requested *
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Overwork Request *
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
                disabled={loading || !requestForm.userId || !requestForm.reason}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Overwork Request'}
              </button>
            </div>
          )}

          {/* Admin Panel Tab */}
          {activeTab === 'admin-panel' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin: Pending Overwork Requests
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Review and approve/reject overwork requests
                  </p>
                </div>
                <button
                  onClick={fetchPendingRequests}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No pending overwork requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{request.userName}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency} PRIORITY
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="text-sm whitespace-pre-wrap">{request.request}</pre>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const notes = prompt('Admin notes (optional):');
                            if (notes !== null) {
                              approveRequest(request.id, notes);
                            }
                          }}
                          className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) {
                              rejectRequest(request.id, reason);
                            }
                          }}
                          className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverworkRequestSystem;
