'use client';

// Force dynamic rendering for real-time employee data
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, useCallback } from 'react';
import FormModal from '@/components/common/FormModal';
import Table from '@/components/common/Table';
import TableSearch from '@/components/common/TableSearch';
import Pagination from '@/components/common/Pagination';
import Image from 'next/image';
import FilterButton from '@/components/common/FilterButton';
import SortButton from '@/components/common/SortButton';
import { getApiUrl } from '@/config/api';
import RouteGuard from '@/components/auth/RouteGuard';
import { capitalizeWords } from '@/lib/capitalize';

/**
 * Format a date string to DD/MM/YYYY format, handling various input formats
 * @param dateStr Date string in various formats
 * @returns Formatted date as DD/MM/YYYY or empty string if invalid
 */
const formatDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    // Handle ISO format dates (YYYY-MM-DD)
    if (dateStr.includes('-') && !dateStr.includes('T')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    // Handle ISO string format with T (e.g. "2025-06-10T00:00:00.000Z")
    else if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
    // Handle problematic format like "10T00:00:00.000Z/06/2025"
    else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length >= 3) {
        let day = parts[0];
        if (day.includes('T')) {
          day = day.split('T')[0]; // Extract just the day part
        }
        const month = parts[1];
        const year = parts[2];
        
        // Format properly
        return `${day}/${month}/${year}`;
      }
    }
    
    // Try standard Date object as fallback
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('id-ID');
    }
    
    // If all parsing attempts fail, return the original string
    return dateStr;
  } catch (e) {
    return '';
  }
};

type Pegawai = {
  id: number;
  username: string;
  email: string;
  namaDepan: string;
  namaBelakang: string;
  alamat: string;
  noHp: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  role: 'ADMIN' | 'DOKTER' | 'PERAWAT' | 'STAF' | 'SUPERVISOR';
  status: 'ACTIVE' | 'INACTIVE';
};

const ITEMS_PER_PAGE = 10;

export default function PegawaiPage() {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterValue, setFilterValue] = useState<string>('');
  const [sortValue, setSortValue] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State untuk menampilkan/hide modal Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Workload data state
  const [workloadData, setWorkloadData] = useState<Record<number, {
    shiftsThisMonth: number;
    totalHours: number;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    utilizationRate: number;
    weeklyShifts: number;
    dailyShifts: number;
  }>>({});

  // Fetch workload data untuk semua pegawai
  const fetchWorkloadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/admin/workload/analysis', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform data ke format yang sesuai dengan state
        const workloadMap: Record<number, any> = {};
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            workloadMap[item.userId] = {
              shiftsThisMonth: item.currentShifts || 0,
              totalHours: item.weeklyHours || item.totalHours || 0,
              status: item.status === 'CRITICAL' ? 'CRITICAL' : 
                     item.status === 'WARNING' ? 'WARNING' : 'NORMAL',
              utilizationRate: item.utilizationRate || Math.round(((item.currentShifts || 0) / (item.maxShifts || 20)) * 100) || 0,
              weeklyShifts: item.weeklyShifts || 0,
              dailyShifts: item.dailyShifts || 0
            };
          });
        }
        
        setWorkloadData(workloadMap);
      } else {
        console.error('Failed to fetch workload data, using fallback API');
        // Fallback to direct backend API
        const apiUrl = getApiUrl();
        const fallbackResponse = await fetch(`${apiUrl}/overwork/admin/workload/analysis`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const workloadMap: Record<number, any> = {};
          if (Array.isArray(fallbackData)) {
            fallbackData.forEach((item: any) => {
              workloadMap[item.userId] = {
                shiftsThisMonth: item.currentShifts || 0,
                totalHours: item.weeklyHours || item.totalHours || 0,
                status: item.status === 'CRITICAL' ? 'CRITICAL' : 
                       item.status === 'WARNING' ? 'WARNING' : 'NORMAL',
                utilizationRate: item.utilizationRate || Math.round(((item.currentShifts || 0) / (item.maxShifts || 20)) * 100) || 0,
                weeklyShifts: item.weeklyShifts || 0,
                dailyShifts: item.dailyShifts || 0
              };
            });
          }
          setWorkloadData(workloadMap);
        }
      }
    } catch (error) {
      console.error('Error fetching workload data:', error);
      // Set empty workload data to prevent showing 0/0 for all employees
      setWorkloadData({});
    }
  }, []);

  // Filter options for pegawai
  const filterOptions = [
    { label: 'Semua', value: '' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Dokter', value: 'DOKTER' },
    { label: 'Perawat', value: 'PERAWAT' },
    { label: 'Staf', value: 'STAF' },
    { label: 'Supervisor', value: 'SUPERVISOR' },
  ];

  // Sort options for pegawai
  const sortOptions = [
    { label: 'Nama', value: 'nama' },
    { label: 'Email', value: 'email' },
    { label: 'Role', value: 'role' },
    { label: 'Tanggal Lahir', value: 'tanggalLahir' },
  ];

  // Fetch data dari /users dengan pagination
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterValue && { role: filterValue }),
      });
      
      const response = await fetch(`${apiUrl}/users?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        // Filter for specific roles only
        const filtered = result.data.filter((u: any) =>
          ['ADMIN', 'DOKTER', 'PERAWAT', 'STAF', 'SUPERVISOR'].includes(u.role)
        );
        setPegawaiList(filtered);
        setTotalItems(result.meta?.total || filtered.length);
      }
    } catch (e) {
      console.error('Error fetching pegawai data:', e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterValue]);

  useEffect(() => {
    fetchData();
    fetchWorkloadData(); // Fetch workload data bersama dengan data pegawai
  }, [fetchData, fetchWorkloadData]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue]);

  // Since we're using backend pagination, we just need to apply frontend sorting if needed
  const sortedList = useMemo(() => {
    if (!sortValue) return pegawaiList;
    
    return [...pegawaiList].sort((a, b) => {
      let valueA, valueB;
      
      if (sortValue === 'nama') {
        valueA = `${a.namaDepan} ${a.namaBelakang}`;
        valueB = `${b.namaDepan} ${b.namaBelakang}`;
      } else if (sortValue === 'email') {
        valueA = a.email;
        valueB = b.email;
      } else if (sortValue === 'role') {
        valueA = a.role;
        valueB = b.role;
      } else if (sortValue === 'tanggalLahir') {
        valueA = new Date(a.tanggalLahir || 0).getTime();
        valueB = new Date(b.tanggalLahir || 0).getTime();
        
        if (sortDirection === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (sortDirection === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }
      
      return 0;
    });
  }, [pegawaiList, sortValue, sortDirection]);

  // 3) Callback setelah “Create” sukses
  const handleAfterCreate = (newPegawai: Pegawai) => {
    setPegawaiList((prev) => [...prev, newPegawai]);
  };

  // 4) Callback setelah “Update” sukses
  const handleAfterUpdate = (updated: Pegawai) => {
    setPegawaiList((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  // 5) Callback setelah “Delete” sukses
  const handleAfterDelete = (deletedId: number) => {
    setPegawaiList((prev) => prev.filter((p) => p.id !== deletedId));
  };

  // 6) Kolom dan fungsi renderRow
  const columns = [
    { headers: 'No', accessor: 'no', className: 'w-12' },
    { headers: 'Nama', accessor: 'namaDepan', className: 'min-w-32' },
    { headers: 'Email', accessor: 'email', className: 'hidden xl:table-cell min-w-48' },
    { headers: 'ID', accessor: 'employeeId', className: 'hidden lg:table-cell w-20' },
    { headers: 'HP', accessor: 'noHp', className: 'hidden xl:table-cell w-32' },
    {
      headers: 'Gender',
      accessor: 'jenisKelamin',
      className: 'hidden xl:table-cell w-16',
    },
    {
      headers: 'Lahir',
      accessor: 'tanggalLahir',
      className: 'hidden xl:table-cell w-24',
    },
    { headers: 'Role', accessor: 'role', className: 'hidden md:table-cell w-24' },
    { 
      headers: 'Beban Kerja', 
      accessor: 'workload', 
      className: 'hidden lg:table-cell w-32',
      tooltip: 'Jumlah shift bulan ini dan status beban kerja'
    },
    {
      headers: 'Status',
      accessor: 'status',
      className: 'hidden md:table-cell w-20',
    },
    { headers: 'Aksi', accessor: 'action' },
  ];

  const renderRow = (item: Pegawai) => {
    // Hitung nomor urut tampilan:
    const rowIndex = sortedList.indexOf(item); // 0-based di halaman ini
    const noTampil =
      (currentPage - 1) * ITEMS_PER_PAGE + (rowIndex + 1);

    return (
      <tr
        key={item.id}
        className="border-b even:bg-gray-50 hover:bg-gray-100"
      >
        {/* Kolom “No” */}
        <td className="px-4 py-2">{noTampil}</td>
        <td className="px-4 py-2">
          {capitalizeWords(item.namaDepan)} {capitalizeWords(item.namaBelakang)}
        </td>
        <td className="px-4 py-2">{item.email}</td>
        
        {/* Employee ID Column */}
        <td className="px-2 py-2 hidden lg:table-cell">
          <span className="font-mono text-xs bg-gray-100 px-1 py-1 rounded">
            {(item as any).employeeId || `${item.role.substring(0,3)}${String(item.id).padStart(3, '0')}`}
          </span>
        </td>
        
        <td className="px-2 py-2 hidden xl:table-cell text-xs">{item.noHp}</td>
        <td className="px-2 py-2 hidden xl:table-cell text-xs">
          {item.jenisKelamin === 'L' ? 'L' : 'P'}
        </td>
        <td className="px-2 py-2 hidden xl:table-cell text-xs">
          {formatDateForDisplay(item.tanggalLahir)}
        </td>
        <td className="px-2 py-2 hidden md:table-cell">
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {item.role}
          </span>
        </td>
        
        {/* Workload Column */}
        <td className="px-2 py-2 hidden lg:table-cell">
          <div className="space-y-1 min-w-0">
            {(() => {
              // Get workload data for this employee
              const workload = workloadData[item.id] || {
                shiftsThisMonth: 0,
                totalHours: 0,
                status: 'NORMAL',
                utilizationRate: 0,
                weeklyShifts: 0,
                dailyShifts: 0
              };

              // If no workload data is available, show loading or no data state
              if (Object.keys(workloadData).length === 0) {
                return (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-1 py-1 text-xs font-medium rounded border bg-gray-100 text-gray-600 border-gray-200">
                      <span className="mr-1">⏳</span>
                      Loading
                    </span>
                  </div>
                );
              }

              // Function to get workload status badge
              const getWorkloadBadge = (status: string, utilizationRate: number) => {
                if (status === 'CRITICAL' || utilizationRate > 90) {
                  return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: '🔴',
                    text: 'T'
                  };
                } else if (status === 'WARNING' || utilizationRate > 70) {
                  return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: '⚠️',
                    text: 'S'
                  };
                } else {
                  return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: '✅',
                    text: 'N'
                  };
                }
              };

              const workloadBadge = getWorkloadBadge(workload.status, workload.utilizationRate);
              const maxShifts = 20; // Default max shifts per month

              return (
                <>
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`inline-flex items-center px-1 py-0.5 text-xs font-medium rounded border ${workloadBadge.color}`}>
                      <span className="mr-0.5">{workloadBadge.icon}</span>
                      {workloadBadge.text}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {/* Monthly stats */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Bulan: {workload.shiftsThisMonth}/{maxShifts}</span>
                      <span className={`font-medium text-xs ${
                        workload.utilizationRate > 90 ? 'text-red-600' : 
                        workload.utilizationRate > 70 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {workload.utilizationRate}%
                      </span>
                    </div>
                    
                    {/* Weekly stats */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Minggu: {workload.weeklyShifts}/6</span>
                      <span className={`text-xs ${
                        workload.weeklyShifts >= 6 ? 'text-red-600' : 
                        workload.weeklyShifts >= 5 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {workload.weeklyShifts >= 6 ? 'Max' : workload.weeklyShifts >= 5 ? 'Tinggi' : 'Normal'}
                      </span>
                    </div>
                    
                    {/* Daily stats */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Hari ini: {workload.dailyShifts}</span>
                      <span className={`text-xs ${
                        workload.dailyShifts >= 2 ? 'text-red-600' : 
                        workload.dailyShifts >= 1 ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {workload.dailyShifts >= 2 ? 'Double' : workload.dailyShifts >= 1 ? 'Active' : 'Off'}
                      </span>
                    </div>
                    
                    {/* Progress bar for monthly utilization */}
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className={`h-1 rounded-full ${
                          workload.utilizationRate > 90 ? 'bg-red-500' : 
                          workload.utilizationRate > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(workload.utilizationRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </td>
        
        <td className="px-2 py-2 hidden md:table-cell">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {item.status}
          </span>
        </td>
        
        <td className="px-2 py-2">
          <div className="flex gap-2">
            {/* Tombol “Update” */}
            <FormModal
              table="pegawai"
              type="update"
              data={{
                id: item.id,
                username: item.username,
                email: item.email,
                namaDepan: item.namaDepan,
                namaBelakang: item.namaBelakang,
                alamat: item.alamat,
                noHp: item.noHp,
                tanggalLahir: item.tanggalLahir,
                jenisKelamin: item.jenisKelamin,
                role: item.role,
                status: item.status,
              }}
              onCreated={() => {}}
              onUpdated={handleAfterUpdate}
              onDeleted={() => {}}
              // default renderTrigger=true → ikon ✏️ muncul di tabel
            />

            {/* Tombol “Delete” */}
            <FormModal
              table="pegawai"
              type="delete"
              id={String(item.id)}
              nameLabel={`${item.namaDepan} ${item.namaBelakang}`}
              onCreated={() => {}}
              onUpdated={() => {}}
              onDeleted={(did) => handleAfterDelete(Number(did))}
              // default renderTrigger=true → ikon 🗑️ muncul di tabel
            />
          </div>
        </td>
      </tr>
    );
  };

  // Handle filtering
  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (value: string, direction: 'asc' | 'desc') => {
    setSortValue(value);
    setSortDirection(direction);
  };

  return (
    <RouteGuard>
      <div className="p-2 md:p-4 bg-white rounded-lg m-2 md:m-4 flex-1 overflow-hidden">
        {/* Header bar dengan Search + Filter/Sort + Create */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">Manajemen Pegawai</h1>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <div className="flex-1 md:flex-none min-w-0">
              <TableSearch
                placeholder="Cari Username / Email / Nama…"
                value={searchTerm}
                onChange={(val) => {
                  setSearchTerm(val);
                  setCurrentPage(1);
                }}
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

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
            >
              <Image src="/create.png" alt="Create" width={16} height={16} />
            </button>
          </div>
        </div>

        {/* Table daftar pegawai */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Desktop/Tablet Table View */}
            <div className="hidden sm:block">
              <Table columns={columns} data={sortedList} renderRow={renderRow} />
            </div>
            
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {sortedList.map((item, index) => {
                const rowIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                const workload = workloadData[item.id] || {
                  shiftsThisMonth: 0,
                  totalHours: 0,
                  status: 'NORMAL',
                  utilizationRate: 0,
                  weeklyShifts: 0,
                  dailyShifts: 0
                };
                
                return (
                  <div key={item.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-sm">
                          {capitalizeWords(item.namaDepan)} {capitalizeWords(item.namaBelakang)}
                        </h3>
                        <p className="text-xs text-gray-500">{item.email}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-gray-500">Role:</span>
                        <span className="ml-1 font-medium">{item.role}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">ID:</span>
                        <span className="ml-1 font-mono text-xs">
                          {(item as any).employeeId || `${item.role.substring(0,3)}${String(item.id).padStart(3, '0')}`}
                        </span>
                      </div>
                    </div>
                    
                    {/* Workload indicator for mobile */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Beban Kerja:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{workload.shiftsThisMonth}/20</span>
                          <span className={`text-xs font-medium ${
                            workload.utilizationRate > 90 ? 'text-red-600' : 
                            workload.utilizationRate > 70 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            ({workload.utilizationRate}%)
                          </span>
                        </div>
                      </div>
                      
                      {/* Weekly and Daily stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Minggu:</span>
                          <span className={`font-medium ${
                            workload.weeklyShifts >= 6 ? 'text-red-600' : 
                            workload.weeklyShifts >= 5 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {workload.weeklyShifts}/6
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Hari ini:</span>
                          <span className={`font-medium ${
                            workload.dailyShifts >= 2 ? 'text-red-600' : 
                            workload.dailyShifts >= 1 ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {workload.dailyShifts}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            workload.utilizationRate > 90 ? 'bg-red-500' : 
                            workload.utilizationRate > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(workload.utilizationRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Action buttons for mobile */}
                    <div className="flex justify-end gap-2">
                      <FormModal
                        table="pegawai"
                        type="update"
                        id={String(item.id)}
                        data={item}
                        onCreated={() => {}}
                        onUpdated={(updated) => handleAfterUpdate(updated)}
                        onDeleted={() => {}}
                        renderTrigger={(openModal) => (
                          <button
                            onClick={openModal}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                          </button>
                        )}
                      />
                      <FormModal
                        table="pegawai"
                        type="delete"
                        id={String(item.id)}
                        nameLabel={`${item.namaDepan} ${item.namaBelakang}`}
                        onCreated={() => {}}
                        onUpdated={() => {}}
                        onDeleted={(did) => handleAfterDelete(Number(did))}
                        renderTrigger={(openModal) => (
                          <button
                            onClick={openModal}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination di bawah tabel */}
        {!loading && (
          <div className="mt-4">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}

        {/* Modal “Create Pegawai” */}
        {isModalOpen && (
          <FormModal
            table="pegawai"
            type="create"
            onCreated={handleAfterCreate}
            onUpdated={() => {}}
            onDeleted={() => {}}
            renderTrigger={false}  // agar tombol “+” di dalam FormModal tidak dirender
            initialOpen={true}     // buka modal langsung begitu komponen mount
            // Tambahkan onClose agar setelah cancel parent tahu harus unmount
            onAfterClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </RouteGuard>
  );
}
