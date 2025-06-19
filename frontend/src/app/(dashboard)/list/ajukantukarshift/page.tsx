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
        `${item.fromUser?.namaDepan || ''} ${item.fromUser?.namaBelakang || ''}`.toLowerCase().includes(searchValue.toLowerCase()) ||
        `${item.toUser?.namaDepan || ''} ${item.toUser?.namaBelakang || ''}`.toLowerCase().includes(searchValue.toLowerCase()) ||
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
            aValue = `${a.fromUser?.namaDepan || ''} ${a.fromUser?.namaBelakang || ''}`;
            bValue = `${b.fromUser?.namaDepan || ''} ${b.fromUser?.namaBelakang || ''}`;
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
              {item.fromUser?.namaDepan?.charAt(0) || '?'}
            </span>
          </div>
          <span className="font-medium">
            {`${item.fromUser?.namaDepan || ''} ${item.fromUser?.namaBelakang || ''}`.trim() || 'Unknown'}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-sm font-medium">
              {item.toUser?.namaDepan?.charAt(0) || '?'}
            </span>
          </div>
          <span className="font-medium">
            {`${item.toUser?.namaDepan || ''} ${item.toUser?.namaBelakang || ''}`.trim() || 'Unknown'}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <div className="font-medium">{item.shift?.tanggal ? new Date(item.shift.tanggal).toLocaleDateString() : 'N/A'}</div>
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
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Error display */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-4" role="alert">
          <span className="block font-medium">{errorMsg}</span>
        </div>
      )}
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) 
              ? 'Manajemen Tukar Shift' 
              : 'Ajukan Tukar Shift'
            }
          </h1>
        </div>
        
        <div className="flex gap-2">
          <TableSearch 
            onChange={handleSearch}
            placeholder="Cari pengaju, partner, lokasi, atau alasan..."
            value={searchValue}
          />
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

          {/* Tombol Ajukan Baru hanya untuk staff (bukan admin/supervisor) dan di tab "Request Saya" */}
          {currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) && activeTab === 'my-requests' && (
            <FormModal
              table="tukarshift"
              type="create"
              onCreated={handleCreate}
              onUpdated={handleUpdate}
              onDeleted={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Tab Navigation - hanya untuk user biasa (bukan admin/supervisor) */}
      {currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) && (
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'my-requests'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('my-requests')}
          >
            Request Saya ({tukarShiftData.filter(item => item.fromUser?.id === currentUserId).length})
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'requests-to-me'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('requests-to-me')}
          >
            Request untuk Saya ({tukarShiftData.filter(item => item.toUser?.id === currentUserId).length})
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden">
        {paginatedData.length > 0 ? (
          <Table 
            columns={columns} 
            data={paginatedData}
            renderRow={renderRow}
          />
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
            <p className="text-gray-500 mb-4">
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

      {/* Stats Footer with role-based information */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {processedData.filter(item => item.status === 'PENDING').length}
          </div>
          <div className="text-sm text-gray-600">
            {currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) 
              ? 'Menunggu Review' 
              : 'Menunggu'
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {processedData.filter(item => item.status === 'APPROVED' || item.status === 'APPROVED_BY_TARGET').length}
          </div>
          <div className="text-sm text-gray-600">Disetujui</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {processedData.filter(item => item.status && item.status.startsWith('REJECTED')).length}
          </div>
          <div className="text-sm text-gray-600">Ditolak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {processedData.length}
          </div>
          <div className="text-sm text-gray-600">
            {currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) 
              ? 'Total Semua' 
              : 'Total Saya'
            }
          </div>
        </div>
      </div>

      {/* Role information banner for admins */}
      {currentUserRole && ['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase()) && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-800">
              Anda masuk sebagai {currentUserRole === 'ADMIN' ? 'Administrator' : 'Supervisor'} - 
              Dapat melihat dan mengelola semua pengajuan tukar shift
            </span>
          </div>
        </div>
      )}

      {/* Modal detail */}
      {detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
            <button className="absolute top-2 right-2 p-1" onClick={handleCloseDetail}>
              <Image src="/close.png" alt="Close" width={16} height={16} />
            </button>
            <h2 className="text-lg font-bold mb-2">Detail Pengajuan Tukar Shift</h2>
            <div className="mb-2"><b>Status:</b> <StatusBadge status={detailItem.status} /></div>
            <div className="mb-2"><b>Pengaju:</b> {detailItem.fromUser?.namaDepan} {detailItem.fromUser?.namaBelakang}</div>
            <div className="mb-2"><b>Partner:</b> {detailItem.toUser?.namaDepan} {detailItem.toUser?.namaBelakang}</div>
            <div className="mb-2"><b>Tanggal Shift:</b> {detailItem.shift?.tanggal ? new Date(detailItem.shift.tanggal).toLocaleDateString() : '-'}</div>
            <div className="mb-2"><b>Jam:</b> {detailItem.shift?.jammulai} - {detailItem.shift?.jamselesai}</div>
            <div className="mb-2"><b>Lokasi:</b> {detailItem.shift?.lokasishift}</div>
            <div className="mb-2"><b>Alasan:</b> {detailItem.alasan}</div>
          </div>
        </div>
      )}
    </div>
  );
}
