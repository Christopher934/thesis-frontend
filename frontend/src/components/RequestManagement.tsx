'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Mail,
  Phone,
  Building,
  Filter,
  Search,
  Plus,
  Download
} from 'lucide-react';

interface OvertimeRequest {
  id: string;
  userId: number;
  requestDate: string;
  shiftDate: string;
  hoursRequested: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    namaDepan: string;
    namaBelakang: string;
    employeeId: string;
    role: string;
  };
  reviewer?: {
    namaDepan: string;
    namaBelakang: string;
  };
  reviewerNotes?: string;
  approvedHours?: number;
}

interface LeaveRequest {
  id: string;
  userId: number;
  leaveType: 'ANNUAL_LEAVE' | 'SICK_LEAVE' | 'EMERGENCY_LEAVE' | 'MATERNITY_LEAVE' | 'PERSONAL_LEAVE';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    namaDepan: string;
    namaBelakang: string;
    employeeId: string;
    role: string;
  };
  reviewer?: {
    namaDepan: string;
    namaBelakang: string;
  };
  reviewerNotes?: string;
}

export default function RequestManagement() {
  const [activeTab, setActiveTab] = useState<'overtime' | 'leave'>('overtime');
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState<any>({});

  // Mock data untuk testing
  const mockOvertimeRequests: OvertimeRequest[] = [
    {
      id: '1',
      userId: 1,
      requestDate: '2025-01-28',
      shiftDate: '2025-02-01',
      hoursRequested: 4,
      reason: 'Kekurangan staff untuk shift malam',
      status: 'PENDING',
      user: {
        namaDepan: 'John',
        namaBelakang: 'Doe',
        employeeId: 'EMP001',
        role: 'PERAWAT'
      }
    },
    {
      id: '2',
      userId: 2,
      requestDate: '2025-01-27',
      shiftDate: '2025-01-30',
      hoursRequested: 6,
      reason: 'Emergency case - butuh tambahan jam kerja',
      status: 'APPROVED',
      user: {
        namaDepan: 'Jane',
        namaBelakang: 'Smith',
        employeeId: 'EMP002',
        role: 'DOKTER'
      },
      reviewer: {
        namaDepan: 'Dr. Admin',
        namaBelakang: 'Manager'
      },
      approvedHours: 6,
      reviewerNotes: 'Disetujui karena kondisi darurat'
    }
  ];

  const mockLeaveRequests: LeaveRequest[] = [
    {
      id: '1',
      userId: 3,
      leaveType: 'ANNUAL_LEAVE',
      startDate: '2025-02-05',
      endDate: '2025-02-07',
      totalDays: 3,
      reason: 'Liburan keluarga',
      status: 'PENDING',
      user: {
        namaDepan: 'Alice',
        namaBelakang: 'Johnson',
        employeeId: 'EMP003',
        role: 'PERAWAT'
      }
    },
    {
      id: '2',
      userId: 4,
      leaveType: 'SICK_LEAVE',
      startDate: '2025-01-29',
      endDate: '2025-01-31',
      totalDays: 3,
      reason: 'Sakit demam tinggi',
      status: 'APPROVED',
      user: {
        namaDepan: 'Bob',
        namaBelakang: 'Wilson',
        employeeId: 'EMP004',
        role: 'PERAWAT'
      },
      reviewer: {
        namaDepan: 'Dr. Admin',
        namaBelakang: 'Manager'
      },
      reviewerNotes: 'Disetujui, segera istirahat'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock loading data
    setIsLoading(true);
    setTimeout(() => {
      setOvertimeRequests(mockOvertimeRequests);
      setLeaveRequests(mockLeaveRequests);
      setStats({
        overtime: {
          pending: 5,
          approved: 12,
          rejected: 2,
          total: 19
        },
        leave: {
          pending: 3,
          approved: 8,
          rejected: 1,
          total: 12
        }
      });
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const types = {
      'ANNUAL_LEAVE': 'Cuti Tahunan',
      'SICK_LEAVE': 'Cuti Sakit',
      'EMERGENCY_LEAVE': 'Cuti Darurat',
      'MATERNITY_LEAVE': 'Cuti Melahirkan',
      'PERSONAL_LEAVE': 'Cuti Pribadi'
    };
    return types[type as keyof typeof types] || type;
  };

  const filteredOvertimeRequests = overtimeRequests.filter(req => {
    const matchesFilter = filter === 'ALL' || req.status === filter;
    const matchesSearch = searchQuery === '' || 
      `${req.user.namaDepan} ${req.user.namaBelakang}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredLeaveRequests = leaveRequests.filter(req => {
    const matchesFilter = filter === 'ALL' || req.status === filter;
    const matchesSearch = searchQuery === '' || 
      `${req.user.namaDepan} ${req.user.namaBelakang}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔄 Request Management System
        </h1>
        <p className="text-gray-600">
          Kelola permintaan lembur, cuti, dan tukar shift dengan sistem approval yang terintegrasi
        </p>
      </div>

      {/* Stats Cards */}
      {stats.overtime && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Lembur</p>
                <p className="text-3xl font-bold">{stats.overtime.total}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Cuti</p>
                <p className="text-3xl font-bold">{stats.leave.total}</p>
              </div>
              <Calendar className="w-12 h-12 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending Approval</p>
                <p className="text-3xl font-bold">{stats.overtime.pending + stats.leave.pending}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Approved Today</p>
                <p className="text-3xl font-bold">{stats.overtime.approved + stats.leave.approved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overtime')}
              className={`flex-1 px-6 py-4 text-center font-medium ${
                activeTab === 'overtime'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="w-5 h-5 inline mr-2" />
              Permintaan Lembur ({filteredOvertimeRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`flex-1 px-6 py-4 text-center font-medium ${
                activeTab === 'leave'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Permintaan Cuti ({filteredLeaveRequests.length})
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama atau ID pegawai..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Disetujui</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Buat Permintaan
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : activeTab === 'overtime' ? (
            <OvertimeRequestList requests={filteredOvertimeRequests} />
          ) : (
            <LeaveRequestList requests={filteredLeaveRequests} />
          )}
        </div>
      </div>
    </div>
  );
}

// Overtime Request List Component
function OvertimeRequestList({ requests }: { requests: OvertimeRequest[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Tidak ada permintaan lembur</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {request.user.namaDepan} {request.user.namaBelakang}
                </h3>
                <p className="text-gray-600">{request.user.employeeId} • {request.user.role}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              {request.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Tanggal Shift</p>
              <p className="font-medium">{new Date(request.shiftDate).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Jam Lembur</p>
              <p className="font-medium">{request.hoursRequested} jam</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tanggal Permintaan</p>
              <p className="font-medium">{new Date(request.requestDate).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Alasan</p>
            <p className="text-gray-800">{request.reason}</p>
          </div>

          {request.reviewer && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Direview oleh</p>
              <p className="font-medium">{request.reviewer.namaDepan} {request.reviewer.namaBelakang}</p>
              {request.reviewerNotes && (
                <>
                  <p className="text-sm text-gray-600 mt-2 mb-1">Catatan</p>
                  <p className="text-gray-800">{request.reviewerNotes}</p>
                </>
              )}
              {request.approvedHours && (
                <>
                  <p className="text-sm text-gray-600 mt-2 mb-1">Jam Disetujui</p>
                  <p className="font-medium text-green-600">{request.approvedHours} jam</p>
                </>
              )}
            </div>
          )}

          {request.status === 'PENDING' && (
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Setujui
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Tolak
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Leave Request List Component
function LeaveRequestList({ requests }: { requests: LeaveRequest[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const types = {
      'ANNUAL_LEAVE': 'Cuti Tahunan',
      'SICK_LEAVE': 'Cuti Sakit',
      'EMERGENCY_LEAVE': 'Cuti Darurat',
      'MATERNITY_LEAVE': 'Cuti Melahirkan',
      'PERSONAL_LEAVE': 'Cuti Pribadi'
    };
    return types[type as keyof typeof types] || type;
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'ANNUAL_LEAVE': return 'bg-blue-100 text-blue-800';
      case 'SICK_LEAVE': return 'bg-red-100 text-red-800';
      case 'EMERGENCY_LEAVE': return 'bg-orange-100 text-orange-800';
      case 'MATERNITY_LEAVE': return 'bg-pink-100 text-pink-800';
      case 'PERSONAL_LEAVE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Tidak ada permintaan cuti</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {request.user.namaDepan} {request.user.namaBelakang}
                </h3>
                <p className="text-gray-600">{request.user.employeeId} • {request.user.role}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              {request.status}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLeaveTypeColor(request.leaveType)}`}>
              {getLeaveTypeLabel(request.leaveType)}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {request.totalDays} hari
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Tanggal Mulai</p>
              <p className="font-medium">{new Date(request.startDate).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tanggal Selesai</p>
              <p className="font-medium">{new Date(request.endDate).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Alasan</p>
            <p className="text-gray-800">{request.reason}</p>
          </div>

          {request.reviewer && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Direview oleh</p>
              <p className="font-medium">{request.reviewer.namaDepan} {request.reviewer.namaBelakang}</p>
              {request.reviewerNotes && (
                <>
                  <p className="text-sm text-gray-600 mt-2 mb-1">Catatan</p>
                  <p className="text-gray-800">{request.reviewerNotes}</p>
                </>
              )}
            </div>
          )}

          {request.status === 'PENDING' && (
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Setujui
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Tolak
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
