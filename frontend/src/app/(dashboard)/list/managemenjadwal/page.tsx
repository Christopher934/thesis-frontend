'use client';

// Force dynamic rendering for real-time schedule management data
export const dynamic = 'force-dynamic';

import FormModal from '@/component/FormModal';
import { useState, useEffect } from 'react';
import Table from '@/component/Table';
import TableSearch from '@/component/TableSearch';
import Pagination from '@/component/Pagination';
import Image from 'next/image';
import FilterButton from '@/component/FilterButton';
import SortButton from '@/component/SortButton';

// Utility function to join URL parts
const joinUrl = (base: string, path: string) => {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

// Utility function to check if a location is a critical unit
const isCriticalUnit = (location: string) => {
  const criticalUnits = ['UGD', 'ICU', 'EMERGENCY', 'CRITICAL'];
  return criticalUnits.some(unit => location.toUpperCase().includes(unit));
};

/**
 * Format a date string to DD/MM/YYYY format, handling various input formats
 * @param dateStr Date string in various formats
 * @returns Formatted date as DD/MM/YYYY
 */
const formatDateForDisplay = (dateStr: string): { formatted: string, original: string } => {
    if (!dateStr) return { formatted: '', original: '' };
    
    let formattedDate = dateStr;
    let originalDate = dateStr;
    
    try {
        // Handle ISO format dates (YYYY-MM-DD)
        if (dateStr.includes('-') && !dateStr.includes('T')) {
            const [year, month, day] = dateStr.split('-');
            formattedDate = `${day}/${month}/${year}`;
            originalDate = dateStr; // Keep the YYYY-MM-DD format
        }
        // Handle ISO string format with T (e.g. "2025-06-10T00:00:00.000Z")
        else if (dateStr.includes('T')) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                formattedDate = `${day}/${month}/${year}`;
                originalDate = `${year}-${month}-${day}`;
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
                formattedDate = `${day}/${month}/${year}`;
                originalDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
    } catch (e) {
        console.error('Error formatting date:', dateStr, e);
    }
    
    return { formatted: formattedDate, original: originalDate };
};

const columns = [
    { headers: "Nama", accessor: "nama" },
    { headers: "ID Pegawai", accessor: "idpegawai", className: "hidden md:table-cell" },
    { headers: "Tanggal", accessor: "tanggal", className: "hidden md:table-cell" },
    { headers: "Jam Mulai", accessor: "jammulai", className: "hidden md:table-cell" },
    { headers: "Jam Selesai", accessor: "jamselesai", className: "hidden md:table-cell" },
    { headers: "Lokasi", accessor: "lokasishift", className: "hidden md:table-cell" },
    { headers: "Action", accessor: "action" },
];

// Type for User data 
type User = {
    id: number;
    username: string;
    email: string;
    namaDepan: string;
    namaBelakang: string;
    role: string;
    status: string;
}

// Type for Jadwal data
type Jadwal = {
    id: number;
    idpegawai: string;
    nama: string;
    tanggal: string;
    lokasishift: string;
    jammulai: string;
    jamselesai: string;
    kelamin?: string; // Optional field for gender
    userId?: number; // Optional field to link to user
    user?: User; // Optional related user object
    originalDate?: string; // Store original date format
}

// Main component for the Manajemen Jadwal page
const ManagemenJadwalPage = () => {
    const [jadwalData, setJadwalData] = useState<Jadwal[]>([]);
    const [filteredJadwal, setFilteredJadwal] = useState<Jadwal[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [userRole, setUserRole] = useState('pegawai');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValue, setFilterValue] = useState("");
    const [sortValue, setSortValue] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Define filter options for jadwal management
    const filterOptions = [
        { label: "Semua", value: "" },
        { label: "Shift Pagi", value: "PAGI" },
        { label: "Shift Siang", value: "SIANG" },
        { label: "Shift Malam", value: "MALAM" },
        { label: "Shift UGD", value: "UGD" },
    ];

    // Define sort options for jadwal management
    const sortOptions = [
        { label: "Tanggal", value: "tanggal" },
        { label: "Nama Pegawai", value: "nama" },
        { label: "Lokasi", value: "lokasishift" },
        { label: "Jam Mulai", value: "jammulai" },
    ];

    // Handle filtering
    const handleFilter = (value: string) => {
        setFilterValue(value);
    };

    // Handle sorting
    const handleSort = (value: string, direction: "asc" | "desc") => {
        setSortValue(value);
        setSortDirection(direction);
    };

    // Fetch jadwal and users data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Get user role from localStorage (if available)
                const role = localStorage.getItem('role');
                if (role) {
                    setUserRole(role.toLowerCase());
                }

                console.log('Fetching data...');
                
                // Get token from localStorage
                const token = localStorage.getItem('token');
                
                let shiftsData, usersData;
                
                try {
                    // Try to fetch from the API server first
                    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                    console.log('Using API URL:', apiUrl);
                    const [jadwalRes, usersRes] = await Promise.all([
                        fetch(joinUrl(apiUrl, '/shifts'), {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }),
                        fetch(joinUrl(apiUrl, '/users'), {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                    ]);
                    
                    if (!jadwalRes.ok || !usersRes.ok) {
                        throw new Error("API server returned an error");
                    }
                    
                    [shiftsData, usersData] = await Promise.all([
                        jadwalRes.json(),
                        usersRes.json()
                    ]);
                    
                    console.log('API data loaded:', shiftsData.length, 'shifts and', usersData.length, 'users');
                } catch (apiError) {
                    console.warn('Error fetching from API, falling back to mock data:', apiError);
                    
                    // Fallback to local mock data files
                    const [mockShiftsRes, mockUsersRes] = await Promise.all([
                        fetch('/mock-shifts.json'),
                        fetch('/mock-users.json')
                    ]);
                    
                    if (!mockShiftsRes.ok) {
                        throw new Error("Failed to fetch shift data: " + mockShiftsRes.status);
                    }
                    
                    if (!mockUsersRes.ok) {
                        throw new Error("Failed to fetch user data: " + mockUsersRes.status);
                    }
                    
                    [shiftsData, usersData] = await Promise.all([
                        mockShiftsRes.json(),
                        mockUsersRes.json()
                    ]);
                    
                    console.log('Mock data loaded:', shiftsData.length, 'shifts and', usersData.length, 'users');
                }
                
                setUsers(usersData);
                
                // Check for previously deleted items in localStorage
                const deletedIdsJSON = localStorage.getItem('deleted_jadwal_ids') || '[]';
                let deletedIds = [];
                
                // Safely parse the JSON
                try {
                    deletedIds = JSON.parse(deletedIdsJSON);
                    // Ensure it's an array
                    if (!Array.isArray(deletedIds)) {
                        console.warn('Deleted IDs in localStorage is not an array, resetting');
                        deletedIds = [];
                    }
                } catch (parseError) {
                    console.warn('Error parsing deleted IDs from localStorage, resetting', parseError);
                    deletedIds = [];
                }
                
                console.log('Previously deleted jadwal IDs:', deletedIds);
                
                // Filter out previously deleted items before processing
                const filteredShiftsData = shiftsData.filter((shift: Jadwal) => 
                    !deletedIds.includes(shift.id.toString())
                );
                
                console.log(`Filtered out ${shiftsData.length - filteredShiftsData.length} deleted items`);
                
                // Format dates and map user names to jadwal data
                const enhancedJadwalData = filteredShiftsData.map((jadwal: Jadwal) => {
                    // Find the user by either userId or idpegawai
                    const user = usersData.find((u: User) => 
                        u.id === jadwal.userId || 
                        u.username === jadwal.idpegawai
                    );
                    
                    // Format date for better display
                    const { formatted, original } = formatDateForDisplay(jadwal.tanggal);
                    
                    // Log for debugging
                    console.log(`Formatted date: ${jadwal.tanggal} -> ${formatted}, originalDate: ${original}`);
                    
                    return {
                        ...jadwal,
                        tanggal: formatted,
                        originalDate: original, // Keep original date for form editing
                        nama: user ? user.namaDepan + " " + user.namaBelakang : jadwal.nama || 'Nama tidak tersedia',
                        user: user || jadwal.user
                    };
                });
                
                setJadwalData(enhancedJadwalData);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setError(error.message || 'An error occurred while fetching data');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    // Handle successful creation of a new jadwal entry
    const handleJadwalCreated = (newJadwal: Jadwal) => {
        console.log('Handling created jadwal data:', newJadwal);
        
        // Find user data to supplement the jadwal entry
        const user = users.find(u => u.username === newJadwal.idpegawai || u.id === newJadwal.userId);
        
        if (user) {
            newJadwal.nama = user.namaDepan + " " + user.namaBelakang;
            newJadwal.user = user;
        }
        
        // Format date properly for display
        if (newJadwal.tanggal) {
            const { formatted, original } = formatDateForDisplay(newJadwal.tanggal);
            newJadwal.tanggal = formatted;
            newJadwal.originalDate = original;
            console.log('Formatted date for display:', formatted, 'Original:', original);
        }
        
        setJadwalData(prev => [...prev, newJadwal]);
    };
    
    // Handle successful update of a jadwal entry
    const handleJadwalUpdated = (updatedJadwal: Jadwal) => {
        // Find user data to supplement the jadwal entry
        const user = users.find(u => u.username === updatedJadwal.idpegawai || u.id === updatedJadwal.userId);
        
        if (user) {
            updatedJadwal.nama = user.namaDepan + " " + user.namaBelakang;
            updatedJadwal.user = user;
        }
        
        // Format date properly for display
        if (updatedJadwal.tanggal) {
            const { formatted, original } = formatDateForDisplay(updatedJadwal.tanggal);
            updatedJadwal.tanggal = formatted;
            updatedJadwal.originalDate = original;
            console.log('Updated jadwal - Formatted date:', formatted, 'Original:', original);
        }
        
        setJadwalData(prev => 
            prev.map(item => item.id === updatedJadwal.id ? updatedJadwal : item)
        );
    };
    
    // Handle successful deletion of a jadwal entry
    const handleJadwalDeleted = (deletedId: string) => {
        // Update UI by removing the deleted item
        setJadwalData(prev => prev.filter(item => item.id.toString() !== deletedId));
        
        // Add ID to localStorage for persistence after page refresh
        try {
            const storageKey = 'deleted_jadwal_ids';
            const deletedIdsJSON = localStorage.getItem(storageKey) || '[]';
            let deletedIds = [];
            
            // Safely parse the JSON
            try {
                deletedIds = JSON.parse(deletedIdsJSON);
                // Ensure it's an array
                if (!Array.isArray(deletedIds)) {
                    console.warn('Deleted IDs in localStorage is not an array, resetting');
                    deletedIds = [];
                }
            } catch (parseError) {
                console.warn('Error parsing deleted IDs from localStorage, resetting', parseError);
                deletedIds = [];
            }
            
            // Add the current ID if not already in the list
            if (!deletedIds.includes(deletedId)) {
                deletedIds.push(deletedId);
                localStorage.setItem(storageKey, JSON.stringify(deletedIds));
                console.log(`Added ID ${deletedId} to deleted jadwal list in localStorage`);
            }
        } catch (storageError) {
            console.error('Error updating localStorage with deleted ID:', storageError);
        }
    };
    
    // Apply filters, sorting, and search
    useEffect(() => {
        let result = [...jadwalData];
        
        // Apply search filter
        if (searchTerm.trim() !== '') {
            const lowercaseSearch = searchTerm.toLowerCase();
            result = result.filter(item => 
                (item.nama || '').toLowerCase().includes(lowercaseSearch) ||
                (item.idpegawai || '').toLowerCase().includes(lowercaseSearch) ||
                (item.lokasishift || '').toLowerCase().includes(lowercaseSearch) ||
                (item.tanggal || '').toLowerCase().includes(lowercaseSearch)
            );
        }
        
        // Apply shift type filter
        if (filterValue) {
            // Determine how to filter based on shift type
            // This logic might need adjustment based on how shift types are stored
            result = result.filter(item => {
                // First try to check if the shift type is directly stored
                if (item.lokasishift && item.lokasishift.includes(filterValue)) {
                    return true;
                }
                
                // Then try to infer from time (example: PAGI = before noon, SIANG = afternoon, MALAM = evening/night)
                if (filterValue === 'PAGI' && item.jammulai) {
                    const hourStart = parseInt(item.jammulai.split(':')[0]);
                    return hourStart >= 6 && hourStart < 12;
                }
                
                if (filterValue === 'SIANG' && item.jammulai) {
                    const hourStart = parseInt(item.jammulai.split(':')[0]);
                    return hourStart >= 12 && hourStart < 18;
                }
                
                if (filterValue === 'MALAM' && item.jammulai) {
                    const hourStart = parseInt(item.jammulai.split(':')[0]);
                    return hourStart >= 18 || hourStart < 6;
                }
                
                if (filterValue === 'UGD' && item.lokasishift) {
                    return isCriticalUnit(item.lokasishift);
                }
                
                return false;
            });
        }
        
        // Apply sorting
        if (sortValue) {
            result.sort((a, b) => {
                let valueA, valueB;
                
                switch (sortValue) {
                    case "tanggal":
                        // Convert dates to sortable format (YYYY-MM-DD)
                        // Use the stored originalDate if available as it's more reliable for sorting
                        if (a.originalDate && b.originalDate) {
                            valueA = a.originalDate;
                            valueB = b.originalDate;
                        } else {
                            // If originalDate is not available, try to create sortable strings from the displayed format
                            try {
                                // For displayed date format (DD/MM/YYYY)
                                if (a.tanggal && a.tanggal.includes('/') && b.tanggal && b.tanggal.includes('/')) {
                                    const [dayA, monthA, yearA] = a.tanggal.split('/');
                                    const [dayB, monthB, yearB] = b.tanggal.split('/');
                                    valueA = `${yearA}-${monthA.padStart(2, '0')}-${dayA.padStart(2, '0')}`;
                                    valueB = `${yearB}-${monthB.padStart(2, '0')}-${dayB.padStart(2, '0')}`;
                                } else {
                                    valueA = a.tanggal || '';
                                    valueB = b.tanggal || '';
                                }
                            } catch (e) {
                                console.error('Error converting dates for sorting:', e);
                                valueA = a.tanggal || '';
                                valueB = b.tanggal || '';
                            }
                        }
                        break;
                    case "nama":
                        valueA = a.nama || '';
                        valueB = b.nama || '';
                        break;
                    case "lokasishift":
                        valueA = a.lokasishift || '';
                        valueB = b.lokasishift || '';
                        break;
                    case "jammulai":
                        valueA = a.jammulai || '';
                        valueB = b.jammulai || '';
                        break;
                    default:
                        return 0;
                }
                
                if (sortDirection === "asc") {
                    return valueA > valueB ? 1 : -1;
                } else {
                    return valueA < valueB ? 1 : -1;
                }
            });
        }
        
        setFilteredJadwal(result);
        // Reset to first page when filtering changes
        setCurrentPage(1);
    }, [jadwalData, searchTerm, filterValue, sortValue, sortDirection]);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredJadwal.slice(indexOfFirstItem, indexOfLastItem);
    
    // Format location name for display (convert enum format to readable text)
    const formatLokasiShift = (lokasi: string) => {
        if (!lokasi) return '-';
        
        // Replace underscores with spaces and capitalize each word
        return lokasi
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };
    
    const renderRow = (item: Jadwal) => {
        // Get full name for display
        const fullName = item.nama || 'Nama tidak tersedia';
        const formattedLocation = formatLokasiShift(item.lokasishift);
        
        return (
            <tr key={item.id} className="border-b border-gray-500 even:bg-slate-50 text-md hover:bg-gray-50 transition-colors">
                <td className="flex items-center gap-4 p-4">
                    <div className="flex flex-col">
                        <h3 className="font-semibold">{fullName}</h3>
                        <p className="text-xs text-gray-500">{formattedLocation}</p>
                    </div>
                </td>
                <td className="hidden md:table-cell">{item.idpegawai}</td>
                <td className="hidden md:table-cell">{item.tanggal}</td>
                <td className="hidden md:table-cell">{item.jammulai}</td>
                <td className="hidden md:table-cell">{item.jamselesai}</td>
                <td className="hidden md:table-cell">{formattedLocation}</td>
                <td>
                    <div className="flex items-center gap-2">
                        {(userRole === "admin" || userRole === "supervisor") && (
                            <>
                                <FormModal 
                                    table="jadwal" 
                                    type="update" 
                                    data={item} 
                                    onUpdated={handleJadwalUpdated} 
                                    onCreated={() => {}} 
                                    onDeleted={() => {}}
                                />
                                <FormModal 
                                    table="jadwal" 
                                    type="delete" 
                                    id={item.id.toString()} 
                                    nameLabel={fullName}
                                    onDeleted={handleJadwalDeleted}
                                    onCreated={() => {}}
                                    onUpdated={() => {}}
                                />
                            </>
                        )}
                    </div>
                </td>
            </tr>
        );
    };
    
    // Display loading or error state
    if (isLoading) {
        return (
            <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0 flex justify-center items-center min-h-[300px]'>
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-500">Memuat data jadwal...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-red-700 font-semibold">Error</h3>
                    </div>
                    <p className="text-red-700 mt-2">{error}</p>
                    <button 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Halaman
                    </button>
                </div>
            </div>
        );
    }
    
    if (jadwalData.length === 0) {
        return (
            <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0 flex flex-col items-center justify-center min-h-[300px]'>
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-500">Data Jadwal Kosong</h3>
                <p className="text-gray-400 mt-2">Belum ada jadwal shift yang tersedia</p>
                {(userRole === "admin" || userRole === "supervisor") && (
                    <div className="mt-4">
                        <button 
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Tambah Jadwal Baru
                        </button>
                    </div>
                )}
                
                {/* Modal Tambah Jadwal */}
                {isModalOpen && (
                    <FormModal
                        table="jadwal"
                        type="create"
                        onCreated={handleJadwalCreated}
                        onUpdated={() => {}}
                        onDeleted={() => {}}
                        renderTrigger={false}
                        initialOpen={true}
                        onAfterClose={() => setIsModalOpen(false)}
                    />
                )}
            </div>
        );
    }
    
    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Manajemen Jadwal</h1>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <TableSearch 
                        placeholder="Cari jadwal..." 
                        value={searchTerm} 
                        onChange={setSearchTerm}
                    />
                    <div className="flex items-center gap-4 self-end">
                        <FilterButton 
                            options={filterOptions} 
                            onFilter={handleFilter}
                        />
                        <SortButton 
                            options={sortOptions} 
                            onSort={handleSort} 
                        />
                        {(userRole === "admin" || userRole === "supervisor") && (
                            <button 
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:opacity-90 transition"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <Image src="/create.png" alt="Create" width={16} height={16} />
                            </button>
                        )}
                        
                        {/* Modal Tambah Jadwal */}
                        {isModalOpen && (
                            <FormModal 
                                table="jadwal" 
                                type="create"
                                onCreated={handleJadwalCreated}
                                onUpdated={() => {}}
                                onDeleted={() => {}}
                                renderTrigger={false}
                                initialOpen={true}
                                onAfterClose={() => setIsModalOpen(false)}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {/* Show empty search results message if needed */}
            {filteredJadwal.length === 0 && searchTerm.trim() !== '' ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-500">Tidak ada hasil</h3>
                    <p className="text-gray-400">Tidak ada jadwal yang cocok dengan pencarian &quot;{searchTerm}&quot;</p>
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Hapus Filter
                    </button>
                </div>
            ) : (
                <>
                    {/* List */}
                    <Table columns={columns} data={currentItems} renderRow={renderRow} />
                    {/* Pagination */}
                    <Pagination 
                        totalItems={filteredJadwal.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
};

// Export the ManagemenJadwalPage component as the default export
export default ManagemenJadwalPage;
