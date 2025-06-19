'use client';

// Force dynamic rendering for real-time shift swap data
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from "react";
import React from 'react';
import Image from "next/image";
import Link from "next/link";
import Pagination from "@/component/Pagination";
import TableSearch from "@/component/TableSearch";
import Table from "@/component/Table";
import FilterButton from "@/component/FilterButton";
import SortButton from "@/component/SortButton";
import FormModal from "@/component/FormModal";

// TypeScript interfaces
interface User {
  id: number;
  namaDepan: string;
  namaBelakang: string;
  role: string;
  unit?: string; // pastikan backend juga mengirimkan unit/bidang supervisor
}

interface Shift {
  id: number;
  tanggal: string;
  jammulai: string;
  jamselesai: string;
  lokasishift: string;
  user: User;
}

interface TukarShift {
  id: number;
  fromUser: User;
  toUser: User;
  shift: Shift;
  status: string;
  alasan: string;
  tanggalSwap: string;
  createdAt: string;
}

// Utility functions
const capitalizeWords = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDateWithDay = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = days[date.getDay()];
  const formattedDate = date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  return `${dayName}, ${formattedDate}`;
};

// Status mapping untuk semua status backend
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu Persetujuan',
  APPROVED_BY_TARGET: 'Menunggu Supervisor',
  REJECTED_BY_TARGET: 'Ditolak Partner',
  WAITING_UNIT_HEAD: 'Menunggu Kepala Unit',
  REJECTED_BY_UNIT_HEAD: 'Ditolak Kepala Unit',
  WAITING_SUPERVISOR: 'Menunggu Supervisor',
  REJECTED_BY_SUPERVISOR: 'Ditolak Supervisor',
  APPROVED: 'Disetujui',
};

const STATUS_BADGE_STYLE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  APPROVED_BY_TARGET: 'bg-blue-100 text-blue-800 border border-blue-300',
  WAITING_UNIT_HEAD: 'bg-purple-100 text-purple-800 border border-purple-300',
  WAITING_SUPERVISOR: 'bg-blue-100 text-blue-800 border border-blue-300',
  APPROVED: 'bg-green-100 text-green-800 border border-green-300',
  REJECTED_BY_TARGET: 'bg-red-100 text-red-800 border border-red-300',
  REJECTED_BY_UNIT_HEAD: 'bg-red-100 text-red-800 border border-red-300',
  REJECTED_BY_SUPERVISOR: 'bg-red-100 text-red-800 border border-red-300',
};

export default function AjukanTukarShiftPage() {
  const [tukarShiftData, setTukarShiftData] = useState<TukarShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'my-requests' | 'requests-to-me'>('my-requests');
  
  const itemsPerPage = 10;

  // Fetch tukar shift data
  const fetchTukarShiftData = async () => {
    try {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      if (!token) {
        setTukarShiftData([]);
        setLoading(false);
        return;
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // Always fetch only current user's requests for regular users
      let url = `${apiUrl}/shift-swap-requests`;
      if (currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) && currentUserId) {
        url += `?userId=${currentUserId}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTukarShiftData(data);
        setErrorMsg(null);
      } else {
        setErrorMsg('Gagal memuat data tukar shift.');
        setTukarShiftData([]);
      }
    } catch (error) {
      setErrorMsg('Gagal memuat data tukar shift.');
      setTukarShiftData([]);
    } finally {
      setLoading(false);
    }
  };

  // Get current user info
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setCurrentUserId(user.id);
          setCurrentUserRole(user.role);
        } catch (error) {
          // Error parsing user data
        }
      }
    }
  }, []);

  // Load data on component mount and when user info changes
  useEffect(() => {
    if (currentUserId !== null && currentUserRole !== null) {
      fetchTukarShiftData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, currentUserRole]);

  // Filter and search logic
  const processedData = useMemo(() => {
    let filtered = tukarShiftData;

    // Filter data untuk user biasa (bukan ADMIN/SUPERVISOR)
    if (currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase())) {
      // Filter berdasarkan tab yang aktif untuk user biasa
      if (activeTab === 'my-requests') {
        // Hanya request yang diajukan oleh user
        filtered = filtered.filter(item => item.fromUser?.id === currentUserId);
      } else if (activeTab === 'requests-to-me') {
        // Hanya request yang ditujukan kepada user
        filtered = filtered.filter(item => item.toUser?.id === currentUserId);
      }
    } else {
      // Admin/Supervisor tetap melihat semua data
      filtered = filtered.filter(item =>
        item.fromUser?.id === currentUserId || item.toUser?.id === currentUserId
      );
    }

    // Filter by search
    if (searchValue) {
      filtered = filtered.filter(item =>
        capitalizeWords(`${item.fromUser?.namaDepan || ''} ${item.fromUser?.namaBelakang || ''}`.trim()).toLowerCase().includes(searchValue.toLowerCase()) ||
        capitalizeWords(`${item.toUser?.namaDepan || ''} ${item.toUser?.namaBelakang || ''}`.trim()).toLowerCase().includes(searchValue.toLowerCase()) ||
        item.shift?.lokasishift?.toLowerCase().includes(searchValue.toLowerCase()) ||
        (item.alasan && item.alasan.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Sort data
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'tanggal':
            aValue = new Date(a.shift?.tanggal || 0);
            bValue = new Date(b.shift?.tanggal || 0);
            break;
          case 'pengaju':
            aValue = capitalizeWords(`${a.fromUser?.namaDepan || ''} ${a.fromUser?.namaBelakang || ''}`.trim());
            bValue = capitalizeWords(`${b.fromUser?.namaDepan || ''} ${b.fromUser?.namaBelakang || ''}`.trim());
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            aValue = a[sortConfig.key as keyof TukarShift];
            bValue = b[sortConfig.key as keyof TukarShift];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tukarShiftData, searchValue, selectedStatus, sortConfig, currentUserId, currentUserRole, activeTab]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.slice(startIndex, startIndex + itemsPerPage);

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  const handleCreate = (newData: any) => {
    setTukarShiftData(prev => [newData, ...prev]);
  };

  const handleUpdate = (updatedData: any) => {
    setTukarShiftData(prev => 
      prev.map(item => item.id === updatedData.id ? updatedData : item)
    );
  };

  const handleDelete = (deletedId: string) => {
    setTukarShiftData(prev => prev.filter(item => item.id !== parseInt(deletedId)));
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_STYLE[status] || 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
        {STATUS_LABELS[status] || status}
      </span>
    );
  };

  // Modal detail sederhana
  const [detailItem, setDetailItem] = useState<TukarShift | null>(null);
  const handleShowDetail = (item: TukarShift) => setDetailItem(item);
  const handleCloseDetail = () => setDetailItem(null);

  // Table columns configuration
  const columns = [
    { headers: 'Pengaju', accessor: 'pengaju' },
    { headers: 'Target Partner', accessor: 'targetUser' },
    { headers: 'Jadwal Shift', accessor: 'tanggal' },
    { headers: 'Status', accessor: 'status' },
    { headers: 'Alasan', accessor: 'alasan' },
    { headers: 'Aksi', accessor: 'actions' }
  ];

  // Cek apakah supervisor membawahi unit shift
  function isSupervisorOfUnit(currentUser: User | null, shift: Shift | undefined) {
    return currentUser?.role === 'SUPERVISOR' && currentUser?.unit && shift?.lokasishift && currentUser.unit === shift.lokasishift;
  }

  // Handler supervisor approve/reject
  const handleSupervisorAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const endpoint = `${apiUrl}/shift-swap-requests/${id}/${action === 'approve' ? 'approve-supervisor' : 'reject-supervisor'}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Notifikasi sukses (bisa diganti dengan toast/modal sesuai preferensi)
        alert('Berhasil memproses permintaan!');
        fetchTukarShiftData();
      } else {
        alert('Gagal memproses permintaan!');
      }
    } catch {
      alert('Terjadi kesalahan jaringan!');
    }
  };

  // Handler untuk target user menerima/menolak request
  const handleTargetUserAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const endpoint = `${apiUrl}/shift-swap-requests/${id}/${action === 'approve' ? 'approve-target' : 'reject-target'}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert(action === 'approve' ? 'Request berhasil diterima!' : 'Request berhasil ditolak!');
        fetchTukarShiftData();
      } else {
        alert('Gagal memproses permintaan!');
      }
    } catch {
      alert('Terjadi kesalahan jaringan!');
    }
  };

  // Render row function for Table component
  const renderRow = (item: TukarShift) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">
              {item.fromUser?.namaDepan?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <span className="font-medium">
            {capitalizeWords(`${item.fromUser?.namaDepan || ''} ${item.fromUser?.namaBelakang || ''}`.trim()) || 'Unknown'}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-sm font-medium">
              {item.toUser?.namaDepan?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <span className="font-medium">
            {capitalizeWords(`${item.toUser?.namaDepan || ''} ${item.toUser?.namaBelakang || ''}`.trim()) || 'Unknown'}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <div className="font-medium">{formatDateWithDay(item.shift?.tanggal || '')}</div>
          <div className="text-sm text-gray-600">
            {item.shift?.jammulai || 'N/A'} - {item.shift?.jamselesai || 'N/A'}
          </div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded">
            {item.shift?.lokasishift || 'N/A'}
          </div>
        </div>
      </td>
      <td className="p-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="p-4">
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 truncate" title={item.alasan || ''}>
            {item.alasan || 'No reason provided'}
          </p>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          {/* View Details */}
          <button className="p-1 hover:bg-blue-100 rounded" onClick={() => handleShowDetail(item)}>
            <Image src="/view.png" alt="View" width={16} height={16} />
          </button>
          
          {/* Edit - only for pending requests by current user and in "my-requests" tab */}
          {item.fromUser?.id === currentUserId && item.status === 'PENDING' && 
           (currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) || activeTab === 'my-requests') && (
            <FormModal
              table="tukarshift"
              type="update"
              data={item}
              id={item.id.toString()}
              onCreated={handleCreate}
              onUpdated={handleUpdate}
              onDeleted={handleDelete}
              renderTrigger={false}
            />
          )}
          
          {/* Delete - only for current user's requests and in "my-requests" tab */}
          {item.fromUser?.id === currentUserId && 
           (currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) || activeTab === 'my-requests') && (
            <FormModal
              table="tukarshift"
              type="delete"
              data={item}
              id={item.id.toString()}
              nameLabel={`pengajuan tukar shift ke ${`${item.toUser?.namaDepan || ''} ${item.toUser?.namaBelakang || ''}`.trim() || 'Unknown'}`}
              onCreated={handleCreate}
              onUpdated={handleUpdate}
              onDeleted={handleDelete}
              renderTrigger={false}
            />
          )}

          {/* Target User Actions - untuk request yang ditujukan kepada user saat ini dan di tab "requests-to-me" */}
          {item.toUser?.id === currentUserId && item.status === 'PENDING' && 
           (currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) || activeTab === 'requests-to-me') && (
            <>
              <button
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs mr-1"
                onClick={() => handleTargetUserAction(item.id, 'approve')}
                title="Terima permintaan tukar shift"
              >
                Terima
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                onClick={() => handleTargetUserAction(item.id, 'reject')}
                title="Tolak permintaan tukar shift"
              >
                Tolak
              </button>
            </>
          )}

          {/* Supervisor Approve/Reject - hanya untuk supervisor unit terkait */}
          {currentUser?.role === 'SUPERVISOR' && item.status === 'WAITING_SUPERVISOR' && isSupervisorOfUnit(currentUser, item.shift) && (
            <>
              <button
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                onClick={() => handleSupervisorAction(item.id, 'approve')}
              >
                Setujui
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                onClick={() => handleSupervisorAction(item.id, 'reject')}
              >
                Tolak
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Mobile Card Component
  const MobileCard = ({ item }: { item: TukarShift }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      {/* Header with status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs font-medium">
                {item.fromUser?.namaDepan?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {capitalizeWords(`${item.fromUser?.namaDepan || ''} ${item.fromUser?.namaBelakang || ''}`.trim()) || 'Unknown'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            → {capitalizeWords(`${item.toUser?.namaDepan || ''} ${item.toUser?.namaBelakang || ''}`.trim()) || 'Unknown'}
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Shift details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{formatDateWithDay(item.shift?.tanggal || '')}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{item.shift?.jammulai || 'N/A'} - {item.shift?.jamselesai || 'N/A'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{item.shift?.lokasishift || 'N/A'}</span>
        </div>
      </div>

      {/* Reason */}
      {item.alasan && (
        <div className="mb-3">
          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
            <span className="font-medium">Alasan: </span>
            {item.alasan}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button 
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          onClick={() => handleShowDetail(item)}
        >
          <Image src="/view.png" alt="View" width={14} height={14} />
          <span>Detail</span>
        </button>
        
        <div className="flex items-center space-x-2">
          {/* Edit - only for pending requests by current user and in "my-requests" tab */}
          {item.fromUser?.id === currentUserId && item.status === 'PENDING' && 
           (currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) || activeTab === 'my-requests') && (
            <FormModal
              table="tukarshift"
              type="update"
              data={item}
              id={item.id.toString()}
              onCreated={handleCreate}
              onUpdated={handleUpdate}
              onDeleted={handleDelete}
              renderTrigger={false}
            />
          )}
          
          {/* Delete - only for current user's requests and in "my-requests" tab */}
          {item.fromUser?.id === currentUserId && 
           (currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) || activeTab === 'my-requests') && (
            <FormModal
              table="tukarshift"
              type="delete"
              data={item}
              id={item.id.toString()}
              nameLabel={`pengajuan tukar shift ke ${capitalizeWords(`${item.toUser?.namaDepan || ''} ${item.toUser?.namaBelakang || ''}`.trim()) || 'Unknown'}`}
              onCreated={handleCreate}
              onUpdated={handleUpdate}
              onDeleted={handleDelete}
              renderTrigger={false}
            />
          )}

          {/* Target User Actions - untuk request yang ditujukan kepada user saat ini dan di tab "requests-to-me" */}
          {item.toUser?.id === currentUserId && item.status === 'PENDING' && 
           (currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) || activeTab === 'requests-to-me') && (
            <>
              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                onClick={() => handleTargetUserAction(item.id, 'approve')}
                title="Terima permintaan tukar shift"
              >
                Terima
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                onClick={() => handleTargetUserAction(item.id, 'reject')}
                title="Tolak permintaan tukar shift"
              >
                Tolak
              </button>
            </>
          )}

          {/* Supervisor Approve/Reject - hanya untuk supervisor unit terkait */}
          {currentUser?.role === 'SUPERVISOR' && item.status === 'WAITING_SUPERVISOR' && isSupervisorOfUnit(currentUser, item.shift) && (
            <>
              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                onClick={() => handleSupervisorAction(item.id, 'approve')}
              >
                Setujui
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                onClick={() => handleSupervisorAction(item.id, 'reject')}
              >
                Tolak
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data tukar shift...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-md flex-1 m-2 md:m-4 mt-0">
      {/* Error display */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-4" role="alert">
          <span className="block font-medium">{errorMsg}</span>
        </div>
      )}
      
      {/* Header and Main Actions */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) 
              ? 'Manajemen Tukar Shift' 
              : 'Ajukan Tukar Shift'
            }
          </h1>
          
          {/* Tombol Ajukan Baru - Mobile positioned at top right */}
          {currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) && activeTab === 'my-requests' && (
            <div className="flex justify-end">
              <FormModal
                table="tukarshift"
                type="create"
                onCreated={handleCreate}
                onUpdated={handleUpdate}
                onDeleted={handleDelete}
              />
            </div>
          )}
        </div>
        
        {/* Filters - Mobile responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1">
            <TableSearch 
              onChange={handleSearch}
              placeholder="Cari pengaju, partner, lokasi..."
              value={searchValue}
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              onFilter={handleStatusFilter}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'PENDING', label: 'Menunggu Persetujuan' },
                { value: 'APPROVED_BY_TARGET', label: 'Menunggu Supervisor' },
                { value: 'REJECTED_BY_TARGET', label: 'Ditolak Partner' },
                { value: 'WAITING_SUPERVISOR', label: 'Menunggu Supervisor' },
                { value: 'APPROVED', label: 'Disetujui' },
                { value: 'REJECTED_BY_SUPERVISOR', label: 'Ditolak Supervisor' }
              ]}
            />
            
            <SortButton
              onSort={handleSort}
              options={[
                { value: 'tanggal', label: 'Tanggal Shift' },
                { value: 'pengaju', label: 'Pengaju' },
                { value: 'status', label: 'Status' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation - hanya untuk user biasa (bukan admin/supervisor) */}
      {currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) && (
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'my-requests'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('my-requests')}
          >
            <span className="hidden sm:inline">Request Saya</span>
            <span className="sm:hidden">Saya</span>
            <span className="ml-1">({tukarShiftData.filter(item => item.fromUser?.id === currentUserId).length})</span>
          </button>
          <button
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'requests-to-me'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('requests-to-me')}
          >
            <span className="hidden sm:inline">Request untuk Saya</span>
            <span className="sm:hidden">Untuk Saya</span>
            <span className="ml-1">({tukarShiftData.filter(item => item.toUser?.id === currentUserId).length})</span>
          </button>
        </div>
      )}

      {/* Table/Card Container */}
      <div className="overflow-hidden">
        {paginatedData.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table 
                columns={columns} 
                data={paginatedData}
                renderRow={renderRow}
              />
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {paginatedData.map((item) => (
                <MobileCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Image
              src="/announcement.png" 
              alt="No data"
              width={64}
              height={64}
              className="mx-auto mb-4 opacity-50"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchValue || selectedStatus 
                ? 'Tidak ada data yang sesuai dengan filter'
                : currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase())
                  ? (activeTab === 'my-requests' 
                      ? 'Belum ada request yang Anda ajukan'
                      : 'Belum ada request yang ditujukan kepada Anda')
                  : 'Tidak ada data tukar shift'
              }
            </h3>
            <p className="text-gray-500 mb-4 text-sm md:text-base">
              {searchValue || selectedStatus 
                ? 'Coba ubah filter pencarian atau status'
                : currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase())
                  ? (activeTab === 'my-requests'
                      ? 'Klik tombol "+" untuk mengajukan tukar shift baru'
                      : 'Request akan muncul ketika ada rekan yang mengajukan tukar shift kepada Anda')
                  : 'Belum ada pengajuan tukar shift yang dibuat'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalItems={processedData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Role information banner for admins */}
      {currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) && (
        <div className="mt-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start md:items-center gap-2">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 md:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs md:text-sm font-medium text-blue-800">
              Anda masuk sebagai {currentUserRole === 'ADMIN' ? 'Administrator' : 'Supervisor'} - 
              Dapat melihat dan mengelola semua pengajuan tukar shift
            </span>
          </div>
        </div>
      )}

      {/* Modal detail */}
      {detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded" onClick={handleCloseDetail}>
              <Image src="/close.png" alt="Close" width={16} height={16} />
            </button>
            <h2 className="text-lg font-bold mb-4 pr-8">Detail Pengajuan Tukar Shift</h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24 flex-shrink-0">Status:</span>
                <div className="flex-1">
                  <StatusBadge status={detailItem.status} />
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24 flex-shrink-0">Pengaju:</span>
                <span className="flex-1 text-gray-900">
                  {capitalizeWords(`${detailItem.fromUser?.namaDepan || ''} ${detailItem.fromUser?.namaBelakang || ''}`.trim()) || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24 flex-shrink-0">Partner:</span>
                <span className="flex-1 text-gray-900">
                  {capitalizeWords(`${detailItem.toUser?.namaDepan || ''} ${detailItem.toUser?.namaBelakang || ''}`.trim()) || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24 flex-shrink-0">Tanggal:</span>
                <span className="flex-1 text-gray-900">
                  {formatDateWithDay(detailItem.shift?.tanggal || '')}
                </span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24 flex-shrink-0">Jam:</span>
                <span className="flex-1 text-gray-900">
                  {detailItem.shift?.jammulai || 'N/A'} - {detailItem.shift?.jamselesai || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24 flex-shrink-0">Lokasi:</span>
                <span className="flex-1 text-gray-900">{detailItem.shift?.lokasishift || 'N/A'}</span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24 flex-shrink-0">Alasan:</span>
                <span className="flex-1 text-gray-900">{detailItem.alasan || 'Tidak ada alasan'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
