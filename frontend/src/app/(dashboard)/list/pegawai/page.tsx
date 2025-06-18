'use client';

// Force dynamic rendering for real-time employee data
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import FormModal from '@/component/FormModal';
import Table from '@/component/Table';
import TableSearch from '@/component/TableSearch';
import Pagination from '@/component/Pagination';
import Image from 'next/image';
import FilterButton from '@/component/FilterButton';
import SortButton from '@/component/SortButton';
import { getApiUrl } from '@/config/api';
import { fetchWithFallback } from '@/utils/fetchWithFallback';
import RouteGuard from '@/component/RouteGuard';
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
    console.error('Error formatting date:', dateStr, e);
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterValue, setFilterValue] = useState<string>('');
  const [sortValue, setSortValue] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State untuk menampilkan/hide modal Create
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter options for pegawai
  const filterOptions = [
    { label: 'Semua', value: '' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Dokter', value: 'DOKTER' },
    { label: 'Perawat', value: 'PERAWAT' },
    { label: 'Staf', value: 'STAF' },
    { label: 'Supervisor', value: 'SUPERVISOR' },
    { label: 'Aktif', value: 'ACTIVE_STATUS' },
    { label: 'Nonaktif', value: 'INACTIVE_STATUS' },
  ];

  // Sort options for pegawai
  const sortOptions = [
    { label: 'Nama', value: 'nama' },
    { label: 'Email', value: 'email' },
    { label: 'Role', value: 'role' },
    { label: 'Tanggal Lahir', value: 'tanggalLahir' },
  ];

  // 1) Fetch data dari /users (bukan /pegawai)
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = getApiUrl();
        console.log('Using API URL:', apiUrl);
        
        const users = await fetchWithFallback(
          apiUrl,
          '/users',
          '/mock-users.json',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            timeout: 8000
          }
        );
        
        // Filter for specific roles
        if (users && Array.isArray(users)) {
          const filtered = users.filter((u: any) =>
            ['ADMIN', 'DOKTER', 'PERAWAT', 'STAF', 'SUPERVISOR'].includes(u.role)
          );
          setPegawaiList(filtered);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  // Filter + Sort + Pagination
  const filteredAndSortedList = useMemo(() => {
    // First apply search
    let result = pegawaiList.filter((u) => {
      const fullName = `${u.namaDepan} ${u.namaBelakang}`.toLowerCase();
      return (
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.includes(searchTerm.toLowerCase())
      );
    });
    
    // Then apply filter
    if (filterValue) {
      if (filterValue === 'ACTIVE_STATUS') {
        result = result.filter(u => u.status === 'ACTIVE');
      } else if (filterValue === 'INACTIVE_STATUS') {
        result = result.filter(u => u.status === 'INACTIVE');
      } else {
        // Filter by role
        result = result.filter(u => u.role === filterValue);
      }
    }
    
    // Finally apply sorting
    if (sortValue) {
      result.sort((a, b) => {
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
          // Extract dates for comparison in a more robust way
          const parseDate = (dateStr: string): number => {
            if (!dateStr) return 0;
            
            try {
              // Handle ISO format dates (YYYY-MM-DD)
              if (dateStr.includes('-') && !dateStr.includes('T')) {
                const [year, month, day] = dateStr.split('-');
                return new Date(`${year}-${month}-${day}`).getTime();
              }
              // Handle ISO string format with T
              else if (dateStr.includes('T')) {
                return new Date(dateStr).getTime();
              }
              // Handle DD/MM/YYYY format
              else if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                  // Convert DD/MM/YYYY to YYYY-MM-DD for reliable parsing
                  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
                }
              }
              
              // Default fallback
              return new Date(dateStr).getTime();
            } catch (e) {
              console.error('Error parsing date for sorting:', dateStr, e);
              return 0;
            }
          };
          
          valueA = parseDate(a.tanggalLahir);
          valueB = parseDate(b.tanggalLahir);
          
          // Handle NaN values (invalid dates)
          if (isNaN(valueA)) valueA = 0;
          if (isNaN(valueB)) valueB = 0;
          
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
    }
    
    return result;
  }, [pegawaiList, searchTerm, filterValue, sortValue, sortDirection]);
  
  const totalItems = filteredAndSortedList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedList = filteredAndSortedList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
    { headers: 'No', accessor: 'no' },
    { headers: 'Nama', accessor: 'namaDepan' },
    { headers: 'Email', accessor: 'email' },
    { headers: 'No HP', accessor: 'noHp', className: 'hidden md:table-cell' },
    {
      headers: 'Jenis Kelamin',
      accessor: 'jenisKelamin',
      className: 'hidden md:table-cell',
    },
    {
      headers: 'Tanggal Lahir',
      accessor: 'tanggalLahir',
      className: 'hidden md:table-cell',
    },
    { headers: 'Role', accessor: 'role', className: 'hidden md:table-cell' },
    {
      headers: 'Status',
      accessor: 'status',
      className: 'hidden md:table-cell',
    },
    { headers: 'Aksi', accessor: 'action' },
  ];

  const renderRow = (item: Pegawai) => {
    // Hitung nomor urut tampilan:
    const rowIndex = paginatedList.indexOf(item); // 0-based di halaman ini
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
        <td className="px-4 py-2 hidden md:table-cell">{item.noHp}</td>
        <td className="px-4 py-2 hidden md:table-cell">
          {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
        </td>
        <td className="px-4 py-2 hidden md:table-cell">
          {formatDateForDisplay(item.tanggalLahir)}
        </td>
        <td className="px-4 py-2 hidden md:table-cell">{item.role}</td>
        <td className="px-4 py-2 hidden md:table-cell">{item.status}</td>
        
        <td className="px-4 py-2">
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
      <div className="p-4 bg-white rounded-lg m-4 flex-1">
        {/* Header bar dengan Search + Filter/Sort + Create */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <h1 className="text-2xl font-semibold">Manajemen Pegawai</h1>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <TableSearch
              placeholder="Cari Username / Email / Nama…"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
            />

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
        <Table columns={columns} data={paginatedList} renderRow={renderRow} />

        {/* Pagination di bawah tabel */}
        <div className="mt-4">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

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
