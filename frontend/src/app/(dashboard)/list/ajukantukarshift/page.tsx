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
  
  const itemsPerPage = 10;

  // Fetch tukar shift data
  const fetchTukarShiftData = async () => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setTukarShiftData([]);
        setLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/shift-swap-requests`, {
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
          setCurrentUserId(user.id);
          setCurrentUserRole(user.role);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchTukarShiftData();
  }, []);

  // Filter and search logic
  const processedData = useMemo(() => {
    let filtered = tukarShiftData;

    // Filter data untuk user biasa (bukan ADMIN/SUPERVISOR)
    if (currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase())) {
      filtered = filtered.filter(item =>
        item.fromUser?.id === currentUserId || item.toUser?.id === currentUserId
      );
    }

    // Filter by search
    if (searchValue) {
      filtered = filtered.filter(item =>
        `${item.fromUser.namaDepan} ${item.fromUser.namaBelakang}`.toLowerCase().includes(searchValue.toLowerCase()) ||
        `${item.toUser.namaDepan} ${item.toUser.namaBelakang}`.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.shift.lokasishift.toLowerCase().includes(searchValue.toLowerCase()) ||
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
            aValue = new Date(a.shift.tanggal);
            bValue = new Date(b.shift.tanggal);
            break;
          case 'pengaju':
            aValue = `${a.fromUser.namaDepan} ${a.fromUser.namaBelakang}`;
            bValue = `${b.fromUser.namaDepan} ${b.fromUser.namaBelakang}`;
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
  }, [tukarShiftData, searchValue, selectedStatus, sortConfig, currentUserId, currentUserRole]);

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
          <span>
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
          
          {/* Edit - only for pending requests by current user */}
          {item.fromUser?.id === currentUserId && item.status === 'PENDING' && (
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
          
          {/* Delete - only for current user's requests */}
          {item.fromUser?.id === currentUserId && (
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ajukan Tukar Shift</h1> 
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
              { value: 'PENDING', label: 'Menunggu' },
              { value: 'APPROVED', label: 'Disetujui' },
              { value: 'REJECTED', label: 'Ditolak' }
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

          <FormModal
            table="tukarshift"
            type="create"
            onCreated={handleCreate}
            onUpdated={handleUpdate}
            onDeleted={handleDelete}
          />
        </div>
      </div>

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
              Tidak ada data tukar shift
            </h3>
            <p className="text-gray-500 mb-4">
              {searchValue || selectedStatus 
                ? 'Tidak ada data yang sesuai dengan filter yang dipilih'
                : 'Belum ada pengajuan tukar shift yang dibuat'
              }
            </p>
            {!searchValue && !selectedStatus && (
              <FormModal
                table="tukarshift"
                type="create"
                onCreated={handleCreate}
                onUpdated={handleUpdate}
                onDeleted={handleDelete}
              />
            )}
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

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {tukarShiftData.filter(item => item.status === 'PENDING').length}
          </div>
          <div className="text-sm text-gray-600">Menunggu</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {tukarShiftData.filter(item => item.status === 'APPROVED').length}
          </div>
          <div className="text-sm text-gray-600">Disetujui</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {tukarShiftData.filter(item => item.status === 'REJECTED').length}
          </div>
          <div className="text-sm text-gray-600">Ditolak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {tukarShiftData.length}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

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
