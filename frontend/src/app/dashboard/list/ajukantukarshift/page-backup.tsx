'use client';

// Force dynamic rendering for real-time shift swap data
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from "react";
import React from 'react';
import Image from "next/image";
import Link from "next/link";
import Pagination from "@/components/common/Pagination";
import TableSearch from "@/components/common/TableSearch";
import Table from "@/components/common/Table";
import FilterButton from "@/components/common/FilterButton";
import SortButton from "@/components/common/SortButton";
import FormModal from "@/components/common/FormModal";
import { PageHeader, PrimaryButton, ContentCard, Tabs } from "@/components/ui";
import { textFormatter } from "@/lib/textFormatter";

// Helper function to format time from DateTime string to HH:mm format
const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

// TypeScript interfaces
interface User {
  id: number;
  employeeId: string;
  namaDepan: string;
  namaBelakang: string;
  role: string;
  unit?: string;
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
  return textFormatter.capitalizeWords(str);
};

const formatLokasiShift = (lokasi: string): string => {
  return textFormatter.formatLokasiShift(lokasi);
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

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'MENUNGGU PERSETUJUAN',
  APPROVED_BY_TARGET: 'MENUNGGU SUPERVISOR',
  REJECTED_BY_TARGET: 'DITOLAK PARTNER',
  WAITING_UNIT_HEAD: 'MENUNGGU KEPALA UNIT',
  REJECTED_BY_UNIT_HEAD: 'DITOLAK KEPALA UNIT',
  WAITING_SUPERVISOR: 'MENUNGGU SUPERVISOR',
  REJECTED_BY_SUPERVISOR: 'DITOLAK SUPERVISOR',
  APPROVED: 'DISETUJUI',
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

  // Filter options
  const filterOptions = [
    { label: "Semua Status", value: "" },
    { label: "MENUNGGU PERSETUJUAN", value: "PENDING" },
    { label: "DISETUJUI", value: "APPROVED" },
    { label: "DITOLAK", value: "REJECTED" },
  ];

  // Sort options
  const sortOptions = [
    { label: "Tanggal Dibuat", value: "createdAt" },
    { label: "Tanggal Shift", value: "shift.tanggal" },
    { label: "Status", value: "status" },
  ];

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

  useEffect(() => {
    if (currentUserId !== null && currentUserRole !== null) {
      fetchTukarShiftData();
    }
  }, [currentUserId, currentUserRole]);

  const processedData = useMemo(() => {
    let filtered = tukarShiftData;

    if (currentUserRole && !['ADMIN', 'SUPERVISOR'].includes(currentUserRole.toUpperCase())) {
      if (activeTab === 'my-requests') {
        filtered = filtered.filter(item => item.fromUser.id === currentUserId);
      } else {
        filtered = filtered.filter(item => item.toUser.id === currentUserId);
      }
    }

    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(item => 
        item.fromUser.namaDepan.toLowerCase().includes(searchLower) ||
        item.toUser.namaDepan.toLowerCase().includes(searchLower) ||
        formatLokasiShift(item.shift.lokasishift).toLowerCase().includes(searchLower) ||
        STATUS_LABELS[item.status]?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(item => {
        if (selectedStatus === 'REJECTED') {
          return item.status.includes('REJECTED');
        }
        return item.status === selectedStatus;
      });
    }

    // Sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'shift.tanggal':
            aValue = new Date(a.shift.tanggal).getTime();
            bValue = new Date(b.shift.tanggal).getTime();
            break;
          case 'status':
            aValue = STATUS_LABELS[a.status] || a.status;
            bValue = STATUS_LABELS[b.status] || b.status;
            break;
          default:
            return 0;
        }
        
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [tukarShiftData, searchValue, selectedStatus, sortConfig, activeTab, currentUserId, currentUserRole]);

  const handleFilter = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleSort = (value: string, direction: "asc" | "desc") => {
    setSortConfig({ key: value, direction });
    setCurrentPage(1);
  };

  const renderRequestCard = (item: TukarShift) => (
    <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">
                  {activeTab === 'my-requests' 
                    ? `Ke: ${textFormatter.formatUserName(item.toUser.namaDepan, item.toUser.namaBelakang)}`
                    : `Dari: ${textFormatter.formatUserName(item.fromUser.namaDepan, item.fromUser.namaBelakang)}`
                  }
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${STATUS_BADGE_STYLE[item.status] || 'bg-gray-100 text-gray-800'}`}>
                  {STATUS_LABELS[item.status] || item.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{formatLokasiShift(item.shift.lokasishift)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDateWithDay(item.shift.tanggal)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatTime(item.shift.jammulai)} - {formatTime(item.shift.jamselesai)}</span>
                </div>
                
                {item.alasan && (
                  <div className="flex items-start gap-2 mt-3">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span className="text-gray-700 italic">"{item.alasan}"</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:flex-col lg:items-end">
          <div className="text-xs text-gray-500">
            {new Date(item.createdAt).toLocaleDateString('id-ID')}
          </div>
          
          {activeTab === 'requests-to-me' && item.status === 'PENDING' && (
            <div className="flex gap-2">
              <PrimaryButton size="sm" variant="primary">
                Terima
              </PrimaryButton>
              <PrimaryButton size="sm" variant="danger">
                Tolak
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Tab configuration
  const tabs = [
    {
      id: 'my-requests',
      label: 'Permintaan Saya',
      content: (
        <ContentCard padding="none">
          {processedData.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-3 bg-gray-100 rounded-full mx-auto w-fit mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Permintaan</h3>
              <p className="text-gray-600 mb-4">Anda belum mengajukan permintaan tukar shift.</p>
              <Link href="/dashboard/shift/tukar">
                <PrimaryButton>
                  Ajukan Tukar Shift
                </PrimaryButton>
              </Link>
            </div>
          ) : (
            <div>
              {processedData.map(renderRequestCard)}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <Pagination 
                  totalItems={processedData.length} 
                  itemsPerPage={itemsPerPage} 
                  currentPage={currentPage} 
                  onPageChange={setCurrentPage} 
                />
              </div>
            </div>
          )}
        </ContentCard>
      )
    },
    {
      id: 'requests-to-me',
      label: 'Permintaan ke Saya',
      content: (
        <ContentCard padding="none">
          {processedData.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-3 bg-gray-100 rounded-full mx-auto w-fit mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Permintaan</h3>
              <p className="text-gray-600">Belum ada rekan yang mengajukan tukar shift dengan Anda.</p>
            </div>
          ) : (
            <div>
              {processedData.map(renderRequestCard)}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <Pagination 
                  totalItems={processedData.length} 
                  itemsPerPage={itemsPerPage} 
                  currentPage={currentPage} 
                  onPageChange={setCurrentPage} 
                />
              </div>
            </div>
          )}
        </ContentCard>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ContentCard>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Memuat data tukar shift...</p>
            </div>
          </ContentCard>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader title="Ajukan Tukar Shift" description="Kelola permintaan tukar shift Anda" />
          <ContentCard>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-3 bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
              <p className="text-gray-600 text-center mb-4">{errorMsg}</p>
              <PrimaryButton onClick={fetchTukarShiftData}>
                Coba Lagi
              </PrimaryButton>
            </div>
          </ContentCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Ajukan Tukar Shift"
          description="Kelola permintaan tukar shift Anda"
          action={
            <div className="flex items-center gap-3">
              <div className="w-64">
                <TableSearch 
                  placeholder="Cari berdasarkan nama, lokasi, atau status..." 
                  value={searchValue} 
                  onChange={setSearchValue} 
                />
              </div>
              
              <FilterButton 
                options={filterOptions} 
                onFilter={handleFilter}
              />
              
              <SortButton 
                options={sortOptions} 
                onSort={handleSort} 
              />
              
              <Link href="/dashboard/shift/tukar">
                <PrimaryButton>
                  Ajukan Baru
                </PrimaryButton>
              </Link>
            </div>
          }
        />

        <Tabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as 'my-requests' | 'requests-to-me')}
        />
      </div>
    </div>
  );
}
