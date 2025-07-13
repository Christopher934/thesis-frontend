'use client';


// Force dynamic rendering for real-time schedule management data
export const dynamic = 'force-dynamic';

import FormModal from '@/components/common/FormModal';
import { useState, useEffect } from 'react';
import Table from '@/components/common/Table';
import TableSearch from '@/components/common/TableSearch';
import Pagination from '@/components/common/Pagination';
import Image from 'next/image';
import FilterButton from '@/components/common/FilterButton';
import SortButton from '@/components/common/SortButton';

// Enhanced utility functions
const joinUrl = (base: string, path: string) => {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

const isCriticalUnit = (location: string) => {
  const criticalUnits = ['UGD', 'ICU', 'EMERGENCY', 'CRITICAL'];
  return criticalUnits.some(unit => location.toUpperCase().includes(unit));
};

// Enhanced date formatting with better error handling
const formatDateForDisplay = (dateStr: string): { formatted: string, original: string } => {
    if (!dateStr) return { formatted: '', original: '' };
    
    let formattedDate = dateStr;
    let originalDate = dateStr;
    
    try {
        // Handle ISO format dates (YYYY-MM-DD)
        if (dateStr.includes('-') && !dateStr.includes('T')) {
            const [year, month, day] = dateStr.split('-');
            if (year && month && day) {
                formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
                originalDate = dateStr;
            }
        }
        // Handle ISO string format with T
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
                    day = day.split('T')[0];
                }
                const month = parts[1];
                const year = parts[2];
                
                formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
                originalDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
    } catch (e) {
        console.error('Error formatting date:', dateStr, e);
        // Return the original string if formatting fails
        return { formatted: dateStr, original: dateStr };
    }
    
    return { formatted: formattedDate, original: originalDate };
};

// Enhanced shift priority calculation
const calculateShiftPriority = (shift: Jadwal): number => {
    let priority = 0;
    
    // Critical units get higher priority
    if (isCriticalUnit(shift.lokasishift)) {
        priority += 100;
    }
    
    // Night shifts get higher priority
    if (shift.tipeshift === 'MALAM') {
        priority += 50;
    }
    
    // Recent dates get higher priority
    const shiftDate = new Date(shift.originalDate || shift.tanggal);
    const today = new Date();
    const daysDiff = Math.ceil((shiftDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) {
        priority += 25;
    }
    
    return priority;
};

// Enhanced validation functions
const validateShiftData = (jadwal: Jadwal): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!jadwal.nama || jadwal.nama.trim().length < 2) {
        errors.push('Nama pegawai harus diisi dengan minimal 2 karakter');
    }
    
    if (!jadwal.idpegawai || jadwal.idpegawai.trim().length < 1) {
        errors.push('ID pegawai harus diisi');
    }
    
    if (!jadwal.tanggal) {
        errors.push('Tanggal shift harus diisi');
    }
    
    if (!jadwal.jammulai || !jadwal.jamselesai) {
        errors.push('Jam mulai dan selesai harus diisi');
    }
    
    if (!jadwal.lokasishift) {
        errors.push('Lokasi shift harus diisi');
    }
    
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (jadwal.jammulai && !timeRegex.test(jadwal.jammulai)) {
        errors.push('Format jam mulai tidak valid (HH:MM)');
    }
    
    if (jadwal.jamselesai && !timeRegex.test(jadwal.jamselesai)) {
        errors.push('Format jam selesai tidak valid (HH:MM)');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Enhanced filter options with more categories
const filterOptions = [
    { label: "Semua Shift", value: "", count: 0 },
    { label: "Shift Pagi", value: "PAGI", count: 0 },
    { label: "Shift Siang", value: "SIANG", count: 0 },
    { label: "Shift Malam", value: "MALAM", count: 0 },
    { label: "Unit Kritis", value: "CRITICAL", count: 0 },
    { label: "Minggu Ini", value: "THIS_WEEK", count: 0 },
    { label: "Bulan Ini", value: "THIS_MONTH", count: 0 },
];

// Enhanced sort options
const sortOptions = [
    { label: "Tanggal Terbaru", value: "tanggal" },
    { label: "Nama Pegawai", value: "nama" },
    { label: "Lokasi Unit", value: "lokasishift" },
    { label: "Jam Mulai", value: "jammulai" },
    { label: "Prioritas", value: "priority" },
    { label: "Tipe Shift", value: "tipeshift" },
];

const columns = [
    { 
        headers: "Info Pegawai", 
        accessor: "nama",
        tooltip: "Informasi pegawai dan waktu kerja"
    },
    { 
        headers: "Tanggal", 
        accessor: "tanggal", 
        className: "hidden md:table-cell",
        tooltip: "Tanggal pelaksanaan shift"
    },
    { 
        headers: "Jam Mulai", 
        accessor: "jammulai", 
        className: "hidden md:table-cell",
        tooltip: "Waktu mulai shift"
    },
    { 
        headers: "Jam Selesai", 
        accessor: "jamselesai", 
        className: "hidden md:table-cell",
        tooltip: "Waktu selesai shift"
    },
    { 
        headers: "Tipe Shift", 
        accessor: "tipeshift", 
        className: "hidden md:table-cell",
        tooltip: "Kategori shift kerja"
    },
    { 
        headers: "Aksi", 
        accessor: "action",
        tooltip: "Tindakan yang tersedia"
    },
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
    tipeshift?: string; // Added field for shift type like "PAGI", "SIANG", "MALAM"
    shiftType?: string; // Added field for shift type system
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

    // Update filter counts whenever data changes
    const updateFilterCounts = (data: Jadwal[]) => {
        // Filter out past dates first for accurate counts
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activeJadwal = data.filter(item => {
            try {
                if (item.originalDate) {
                    const [year, month, day] = item.originalDate.split('-');
                    const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return itemDate >= today;
                } else if (item.tanggal && item.tanggal.includes('/')) {
                    const [day, month, year] = item.tanggal.split('/');
                    const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return itemDate >= today;
                } else {
                    const shiftDate = new Date(item.tanggal);
                    shiftDate.setHours(0, 0, 0, 0);
                    return shiftDate >= today;
                }
            } catch (error) {
                return true; // Keep if we can't parse date
            }
        });
        
        const counts = {
            "": activeJadwal.length,
            "PAGI": activeJadwal.filter(item => {
                if (item.tipeshift === 'PAGI') return true;
                if (item.jammulai) {
                    const hour = parseInt(item.jammulai.split(':')[0]);
                    return hour >= 6 && hour < 12;
                }
                return false;
            }).length,
            "SIANG": activeJadwal.filter(item => {
                if (item.tipeshift === 'SIANG') return true;
                if (item.jammulai) {
                    const hour = parseInt(item.jammulai.split(':')[0]);
                    return hour >= 12 && hour < 18;
                }
                return false;
            }).length,
            "MALAM": activeJadwal.filter(item => {
                if (item.tipeshift === 'MALAM') return true;
                if (item.jammulai) {
                    const hour = parseInt(item.jammulai.split(':')[0]);
                    return hour >= 18 || hour < 6;
                }
                return false;
            }).length,
            "CRITICAL": activeJadwal.filter(item => isCriticalUnit(item.lokasishift)).length,
            "THIS_WEEK": activeJadwal.filter(item => {
                const shiftDate = new Date(item.originalDate || item.tanggal);
                const now = new Date();
                const oneWeek = 7 * 24 * 60 * 60 * 1000;
                return Math.abs(shiftDate.getTime() - now.getTime()) <= oneWeek;
            }).length,
            "THIS_MONTH": activeJadwal.filter(item => {
                const shiftDate = new Date(item.originalDate || item.tanggal);
                const now = new Date();
                return shiftDate.getMonth() === now.getMonth() && shiftDate.getFullYear() === now.getFullYear();
            }).length,
        };
        
        // Update the filter options with counts for display
        filterOptions.forEach(option => {
            option.count = counts[option.value] || 0;
        });
    };

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

                
                // Get token from localStorage
                const token = localStorage.getItem('token');
                
                let shiftsData, usersData;
                
                try {
                    // Try to fetch from the API server first
                    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                    
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
                    
                } catch (apiError) {
                    console.error('Error fetching from API:', apiError);
                    throw new Error(`Failed to fetch data from backend: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
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
                
                // Filter out previously deleted items before processing
                const filteredShiftsData = shiftsData.filter((shift: Jadwal) => 
                    !deletedIds.includes(shift.id.toString())
                );
                
                // Format dates and map user names to jadwal data
                const enhancedJadwalData = filteredShiftsData.map((jadwal: Jadwal) => {
                    // Find the user by either userId or idpegawai
                    const user = usersData.find((u: User) => 
                        u.id === jadwal.userId || 
                        u.username === jadwal.idpegawai
                    );
                    
                    // Format date for better display
                    const { formatted, original } = formatDateForDisplay(jadwal.tanggal);
                    
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
                // console.log(`Added ID ${deletedId} to deleted jadwal list in localStorage`);
            }
        } catch (storageError) {
            console.error('Error updating localStorage with deleted ID:', storageError);
        }
    };
    
    // Apply filters, sorting, and search
    useEffect(() => {
        let result = [...jadwalData];
        
        // Filter out past dates (keep only today and future dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        
        result = result.filter(item => {
            try {
                const shiftDate = new Date(item.originalDate || item.tanggal);
                if (item.originalDate) {
                    // If we have originalDate in YYYY-MM-DD format
                    const [year, month, day] = item.originalDate.split('-');
                    const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return itemDate >= today;
                } else if (item.tanggal && item.tanggal.includes('/')) {
                    // If we have displayed format DD/MM/YYYY
                    const [day, month, year] = item.tanggal.split('/');
                    const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return itemDate >= today;
                } else {
                    // Fallback: try to parse the date directly
                    shiftDate.setHours(0, 0, 0, 0);
                    return shiftDate >= today;
                }
            } catch (error) {
                console.warn('Error parsing date for filtering:', item.tanggal, error);
                // If we can't parse the date, keep the item to be safe
                return true;
            }
        });
        
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
        
        // Enhanced shift type and category filtering
        if (filterValue) {
            result = result.filter(item => {
                switch (filterValue) {
                    case 'PAGI':
                        // Check tipeshift first, then infer from time
                        if (item.tipeshift === 'PAGI') return true;
                        if (item.jammulai) {
                            const hourStart = parseInt(item.jammulai.split(':')[0]);
                            return hourStart >= 6 && hourStart < 12;
                        }
                        return false;
                        
                    case 'SIANG':
                        if (item.tipeshift === 'SIANG') return true;
                        if (item.jammulai) {
                            const hourStart = parseInt(item.jammulai.split(':')[0]);
                            return hourStart >= 12 && hourStart < 18;
                        }
                        return false;
                        
                    case 'MALAM':
                        if (item.tipeshift === 'MALAM') return true;
                        if (item.jammulai) {
                            const hourStart = parseInt(item.jammulai.split(':')[0]);
                            return hourStart >= 18 || hourStart < 6;
                        }
                        return false;
                        
                    case 'CRITICAL':
                        return isCriticalUnit(item.lokasishift);
                        
                    case 'THIS_WEEK':
                        const shiftDate = new Date(item.originalDate || item.tanggal);
                        const now = new Date();
                        const oneWeek = 7 * 24 * 60 * 60 * 1000;
                        return Math.abs(shiftDate.getTime() - now.getTime()) <= oneWeek;
                        
                    case 'THIS_MONTH':
                        const shiftMonth = new Date(item.originalDate || item.tanggal);
                        const currentMonth = new Date();
                        return shiftMonth.getMonth() === currentMonth.getMonth() && 
                               shiftMonth.getFullYear() === currentMonth.getFullYear();
                               
                    default:
                        // Legacy support for direct location matching
                        if (item.lokasishift && item.lokasishift.includes(filterValue)) {
                            return true;
                        }
                        return false;
                }
            });
        }
        
        // Enhanced sorting with priority and validation
        if (sortValue) {
            result.sort((a, b) => {
                let valueA, valueB;
                
                switch (sortValue) {
                    case "tanggal":
                        // Convert dates to sortable format (YYYY-MM-DD)
                        if (a.originalDate && b.originalDate) {
                            valueA = a.originalDate;
                            valueB = b.originalDate;
                        } else {
                            // Fallback to creating sortable strings from displayed format
                            try {
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
                        valueA = (a.nama || '').toLowerCase();
                        valueB = (b.nama || '').toLowerCase();
                        break;
                        
                    case "lokasishift":
                        valueA = (a.lokasishift || '').toLowerCase();
                        valueB = (b.lokasishift || '').toLowerCase();
                        break;
                        
                    case "jammulai":
                        valueA = a.jammulai || '';
                        valueB = b.jammulai || '';
                        break;
                        
                    case "tipeshift":
                        // Sort by shift type with priority order
                        const shiftOrder = { 'PAGI': 1, 'SIANG': 2, 'MALAM': 3 };
                        valueA = shiftOrder[a.tipeshift as keyof typeof shiftOrder] || 99;
                        valueB = shiftOrder[b.tipeshift as keyof typeof shiftOrder] || 99;
                        break;
                        
                    case "priority":
                        // Sort by calculated priority
                        valueA = calculateShiftPriority(a);
                        valueB = calculateShiftPriority(b);
                        break;
                        
                    default:
                        return 0;
                }
                
                // Handle numeric vs string comparison
                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
                } else {
                    const stringA = String(valueA);
                    const stringB = String(valueB);
                    if (sortDirection === "asc") {
                        return stringA > stringB ? 1 : -1;
                    } else {
                        return stringA < stringB ? 1 : -1;
                    }
                }
            });
        } else {
            // Default sorting: Present day first, then future dates in ascending order
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            result.sort((a, b) => {
                let dateA, dateB;
                
                try {
                    // Parse dates from originalDate or tanggal
                    if (a.originalDate) {
                        const [year, month, day] = a.originalDate.split('-');
                        dateA = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    } else if (a.tanggal && a.tanggal.includes('/')) {
                        const [day, month, year] = a.tanggal.split('/');
                        dateA = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    } else {
                        dateA = new Date(a.tanggal);
                    }
                    
                    if (b.originalDate) {
                        const [year, month, day] = b.originalDate.split('-');
                        dateB = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    } else if (b.tanggal && b.tanggal.includes('/')) {
                        const [day, month, year] = b.tanggal.split('/');
                        dateB = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    } else {
                        dateB = new Date(b.tanggal);
                    }
                    
                    dateA.setHours(0, 0, 0, 0);
                    dateB.setHours(0, 0, 0, 0);
                    
                    // Check if dates are today
                    const aIsToday = dateA.getTime() === today.getTime();
                    const bIsToday = dateB.getTime() === today.getTime();
                    
                    // Present day schedules come first
                    if (aIsToday && !bIsToday) return -1;
                    if (!aIsToday && bIsToday) return 1;
                    
                    // For non-today dates, sort in ascending order (earliest first)
                    return dateA.getTime() - dateB.getTime();
                    
                } catch (error) {
                    console.warn('Error parsing dates for default sorting:', error);
                    // If we can't parse dates, maintain original order
                    return 0;
                }
            });
        }
        
        setFilteredJadwal(result);
        
        // Update filter counts
        updateFilterCounts(jadwalData);
        
        // Reset to first page when filtering changes
        setCurrentPage(1);
    }, [jadwalData, searchTerm, filterValue, sortValue, sortDirection]);

    // Update filter counts when jadwal data changes
    useEffect(() => {
        updateFilterCounts(jadwalData);
    }, [jadwalData]);
    
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
    
    // Format shift type for display (convert PAGI -> Shift Pagi, etc.)
    const formatTipeShift = (tipeshift: string) => {
        if (!tipeshift) return '-';
        
        // Convert common shift types to readable format
        const shiftTypeMap: { [key: string]: string } = {
            'PAGI': 'Shift Pagi',
            'SORE': 'Shift Sore', 
            'SIANG': 'Shift Siang',
            'MALAM': 'Shift Malam',
            'ON_CALL': 'On Call',
            'JAGA': 'Jaga',
            'REGULER': 'Reguler',
            'SENIN_JUMAT': 'Senin-Jumat',
            'SABTU': 'Sabtu',
            'SENIN_KAMIS': 'Senin-Kamis',
            'JUMAT': 'Jumat'
        };
        
        return shiftTypeMap[tipeshift.toUpperCase()] || tipeshift;
    };
    
    // Format time for display (extract time from datetime or format as needed)
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '-';
        
        try {
            // If it's a full datetime string, extract just the time
            if (timeStr.includes('T')) {
                const date = new Date(timeStr);
                return date.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                });
            }
            // If it's already just a time string, return as is
            return timeStr;
        } catch (error) {
            return timeStr;
        }
    };
    
    const renderRow = (item: Jadwal) => {
        // Get full name for display, capitalize
        const fullName = (item.nama || 'Nama tidak tersedia').replace(/\b\w/g, c => c.toUpperCase());
        const formattedLocation = formatLokasiShift(item.lokasishift);
        const formattedShiftType = formatTipeShift(item.tipeshift || '');
        const timeRange = `${formatTime(item.jammulai)} - ${formatTime(item.jamselesai)}`;
        
        return (
            <tr key={item.id} className="border-b border-gray-500 even:bg-slate-50 text-md hover:bg-gray-50 transition-colors">
                <td className="flex items-center gap-4 p-4">
                    <div className="flex flex-col">
                        <h3 className="font-semibold capitalize">{fullName}</h3>
                        <p className="text-xs text-gray-500">{timeRange}</p>
                        <p className="text-xs text-blue-600">{formattedLocation}</p>
                    </div>
                </td>
                {/* <td className="hidden md:table-cell">{item.idpegawai}</td> */}
                <td className="hidden md:table-cell">{item.tanggal}</td>
                <td className="hidden md:table-cell">{formatTime(item.jammulai)}</td>
                <td className="hidden md:table-cell">{formatTime(item.jamselesai)}</td>
                <td className="hidden md:table-cell">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {formattedShiftType}
                    </span>
                </td>
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
                <p className="text-gray-400 mt-2">Belum Ada Jadwal Shift Yang Tersedia</p>
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
    
    // Export functionality for analytics
    const exportToCSV = () => {
        const headers = ['Nama,ID Pegawai,Tanggal,Lokasi,Jam Mulai,Jam Selesai,Tipe Shift'];
        const rows = filteredJadwal.map(item => 
            `"${item.nama}","${item.idpegawai}","${item.tanggal}","${item.lokasishift}","${item.jammulai}","${item.jamselesai}","${item.tipeshift || 'N/A'}"`
        );
        
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `jadwal-shift-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Print functionality
    const printSchedule = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const printContent = `
            <html>
                <head>
                    <title>Jadwal Shift - RSUD Anugerah</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #1f2937; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f3f4f6; font-weight: bold; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .stats { display: flex; justify-content: center; gap: 20px; margin: 20px 0; }
                        .stat { background: #f9fafb; padding: 10px; border-radius: 8px; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Jadwal Shift Pegawai</h1>
                        <p>RSUD Anugerah - ${new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                    
                    <div class="stats">
                        <div class="stat">
                            <strong>Total Jadwal:</strong> ${filteredJadwal.length}
                        </div>
                        <div class="stat">
                            <strong>Unit Kritis:</strong> ${filteredJadwal.filter(item => isCriticalUnit(item.lokasishift)).length}
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Nama Pegawai</th>
                                <th>ID Pegawai</th>
                                <th>Tanggal</th>
                                <th>Lokasi</th>
                                <th>Jam Mulai</th>
                                <th>Jam Selesai</th>
                                <th>Tipe Shift</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredJadwal.map(item => `
                                <tr>
                                    <td>${item.nama}</td>
                                    <td>${item.idpegawai}</td>
                                    <td>${item.tanggal}</td>
                                    <td>${formatLokasiShift(item.lokasishift)}</td>
                                    <td>${formatTime(item.jammulai)}</td>
                                    <td>${formatTime(item.jamselesai)}</td>
                                    <td>${formatTipeShift(item.tipeshift || '')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    
    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Jadwal</h1>
                <p className="text-gray-600 mt-1">Kelola jadwal shift pegawai rumah sakit</p>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <TableSearch 
                        placeholder="Cari berdasarkan nama pegawai, lokasi, atau tanggal..." 
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
