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
import { Brain, Calendar, Clock, MapPin, Users, AlertTriangle, CheckCircle, Loader2, Grid, List, Zap, Plus, RefreshCw, Eye, Edit, Trash2, Download, BarChart3, Shield } from 'lucide-react';
import WorkloadCounterWidget from '@/components/WorkloadCounterWidget';
import MonthlyScheduleView from '@/components/MonthlyScheduleView';
import AutoScheduleModal from '@/components/modals/AutoScheduleModal';
import EnhancedManualAddModal from '@/components/modals/EnhancedManualAddModal';
import BulkScheduleModal from '@/components/modals/BulkScheduleModal';
import SwapRequestModal from '@/components/modals/SwapRequestModal';
import NotificationModal, { NotificationData } from '@/components/NotificationModal';
import EnhancedShiftTable from '@/components/enhanced/EnhancedShiftTable';
import InteractiveCalendar from '@/components/enhanced/InteractiveCalendar';
import RealTimeWorkloadValidator from '@/components/RealTimeWorkloadValidator';

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
        // First, try to create a Date object to check if it's valid
        let dateObj: Date;
        
        // Handle ISO format dates (YYYY-MM-DD)
        if (dateStr.includes('-') && !dateStr.includes('T')) {
            dateObj = new Date(dateStr + 'T00:00:00.000Z'); // Add time to ensure proper parsing
            if (!isNaN(dateObj.getTime())) {
                const day = dateObj.getUTCDate().toString().padStart(2, '0');
                const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
                const year = dateObj.getUTCFullYear();
                formattedDate = `${day}/${month}/${year}`;
                originalDate = `${year}-${month}-${day}`;
            } else {
                throw new Error('Invalid date format');
            }
        }
        // Handle ISO string format with T
        else if (dateStr.includes('T')) {
            dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                const day = dateObj.getDate().toString().padStart(2, '0');
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const year = dateObj.getFullYear();
                formattedDate = `${day}/${month}/${year}`;
                originalDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            } else {
                throw new Error('Invalid date format');
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
                
                // Validate the extracted date parts
                const dayNum = parseInt(day);
                const monthNum = parseInt(month);
                const yearNum = parseInt(year);
                
                if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum > 1900) {
                    formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
                    originalDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                } else {
                    throw new Error('Invalid date parts');
                }
            } else {
                throw new Error('Invalid date format');
            }
        }
        // Try standard Date parsing as fallback
        else {
            dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                const day = dateObj.getDate().toString().padStart(2, '0');
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const year = dateObj.getFullYear();
                formattedDate = `${day}/${month}/${year}`;
                originalDate = `${year}-${month}-${day}`;
            } else {
                throw new Error('Invalid date format');
            }
        }
    } catch (e) {
        console.error('Error formatting date:', dateStr, e);
        // Instead of returning the invalid date string, return a placeholder
        return { formatted: 'Invalid Date', original: '' };
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
    { label: "Hari Ini", value: "tanggal" },
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
        className: "",
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
        className: "",
        tooltip: "Tindakan yang tersedia"
    },
];

// Type for Auto Scheduler Request
interface AutoScheduleRequest {
  date: string;
  location: string;
  shiftType: string;
  requiredCount: number;
  preferredRoles: string[];
  priority: string;
}

// Type for Auto Scheduler Result
interface AutoScheduleResult {
    assignments: any[];
    conflicts: any[];
    workloadAlerts: any[];
    locationCapacityStatus: any[];
    fulfillmentRate: number;
    recommendations: string[];
}

// Bulk Scheduling Interfaces
interface WeeklyScheduleRequest {
    startDate: string;
    locations: string[];
    shiftPattern: { [location: string]: { PAGI?: number; SIANG?: number; MALAM?: number; } };
    priority: string;
}

interface MonthlyScheduleRequest {
    year: number;
    month: number;
    locations: string[];
    averageStaffPerShift: { [location: string]: number };
    workloadLimits: {
        maxShiftsPerPerson: number;
        maxConsecutiveDays: number;
    };
}

interface BulkScheduleResult {
    totalShifts: number;
    successfulAssignments: number;
    conflicts: any[];
    recommendations: string[];
    createdShifts: number;
    fulfillmentRate?: number;
    workloadDistribution?: { [userId: number]: number };
}
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

// Workload Analysis Component
const WorkloadAnalysisSection = ({ jadwalData, users }: { jadwalData: Jadwal[], users: User[] }) => {
    const [workloadData, setWorkloadData] = useState<Record<number, {
        monthlyShifts: number;
        weeklyShifts: number;
        dailyShifts: number;
        status: 'NORMAL' | 'WARNING' | 'CRITICAL';
        utilizationRate: number;
        totalHours: number;
    }>>({});

    // Fetch workload data
    const fetchWorkloadData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/overwork/admin/workload/analysis`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const workloadMap: Record<number, any> = {};
                
                if (Array.isArray(data)) {
                    data.forEach((item: any) => {
                        workloadMap[item.userId] = {
                            monthlyShifts: item.currentShifts || 0,
                            weeklyShifts: item.weeklyShifts || 0,
                            dailyShifts: item.dailyShifts || 0,
                            status: item.status === 'CRITICAL' ? 'CRITICAL' : 
                                   item.status === 'WARNING' ? 'WARNING' : 'NORMAL',
                            utilizationRate: item.utilizationRate || 0,
                            totalHours: item.weeklyHours || 0,
                        };
                    });
                }
                
                setWorkloadData(workloadMap);
            }
        } catch (error) {
            console.error('Error fetching workload data:', error);
        }
    };

    useEffect(() => {
        fetchWorkloadData();
    }, [jadwalData]);

    // Calculate total weekly and daily shifts from all users
    const totalWeeklyShifts = Object.values(workloadData).reduce((sum, workload) => sum + workload.weeklyShifts, 0);
    const totalDailyShifts = Object.values(workloadData).reduce((sum, workload) => sum + workload.dailyShifts, 0);

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Analisis Beban Kerja</h2>
                        <p className="text-sm text-gray-600">Monitoring real-time beban kerja pegawai</p>
                    </div>
                </div>
                <button
                    onClick={fetchWorkloadData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{jadwalData.length}</div>
                    <div className="text-sm text-gray-600">Total Shift</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                        {[...new Set(jadwalData.map(j => j.idpegawai))].length}
                    </div>
                    <div className="text-sm text-gray-600">Pegawai Aktif</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">{totalWeeklyShifts}</div>
                    <div className="text-sm text-gray-600">Total Shift Minggu Ini</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">{totalDailyShifts}</div>
                    <div className="text-sm text-gray-600">Total Shift Hari Ini</div>
                </div>
            </div>
        </div>
    );
};

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
    const [showAllSchedules, setShowAllSchedules] = useState(false); // Toggle untuk melihat semua jadwal
    const [viewMode, setViewMode] = useState<'table' | 'monthly'>('table'); // Toggle untuk view mode
    const [showWorkloadCounters, setShowWorkloadCounters] = useState(true); // Toggle untuk workload counters
    
    // Additional state variables for missing functionality
    const [isCreateShiftModalOpen, setIsCreateShiftModalOpen] = useState(false);
    const [swapShiftEmployeeId, setSwapShiftEmployeeId] = useState<string | null>(null);
    const [showSwapRequests, setShowSwapRequests] = useState(false);
    
    // Notification system
    const [showNotification, setShowNotification] = useState(false);
    const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
    
    // Enhanced table and calendar view modes
    const [useEnhancedTable, setUseEnhancedTable] = useState(true);
    const [useInteractiveCalendar, setUseInteractiveCalendar] = useState(false);
    
    // Workload validation state
    const [workloadValidationData, setWorkloadValidationData] = useState<any>(null);
    const [showWorkloadValidator, setShowWorkloadValidator] = useState(true);
    const [workloadRefreshTrigger, setWorkloadRefreshTrigger] = useState(0);
    
    // State untuk menunda refresh sampai notification ditutup
    const [pendingRefresh, setPendingRefresh] = useState(false);
    
    // Pagination data
    const totalPages = Math.ceil(filteredJadwal.length / itemsPerPage);
    const filteredShifts = filteredJadwal;
    const paginatedShifts = filteredJadwal.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    // Handle create shift function
    const handleCreateShift = (shiftData: any) => {
        console.log('Creating shift:', shiftData);
        // Add implementation here
    };
    
    // Notification helper function
    const showNotificationModal = (notification: NotificationData) => {
        setNotificationData(notification);
        setShowNotification(true);
    };

    const closeNotification = () => {
        setShowNotification(false);
        setNotificationData(null);
        
        // Jika ada pending refresh, lakukan refresh setelah notification ditutup
        if (pendingRefresh) {
            setPendingRefresh(false);
            setTimeout(() => {
                window.location.reload();
            }, 300); // Delay kecil untuk smooth transition
        }
    };

    // Enhanced table handlers
    const handleShiftEdit = (shift: Jadwal) => {
        // Open edit modal or form
        console.log('Edit shift:', shift);
        // Implementation: Open enhanced form with pre-filled data
    };

    const handleShiftDelete = (shiftId: number) => {
        // Show confirmation and delete
        console.log('Delete shift:', shiftId);
        // Implementation: Add confirmation modal and delete logic
    };

    const handleShiftView = (shift: Jadwal) => {
        // Show shift details
        console.log('View shift:', shift);
        // Implementation: Open detail modal
    };

    // Interactive calendar handlers
    const handleShiftMove = async (shiftId: number, newDate: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/admin/shifts/${shiftId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tanggal: newDate }),
            });

            if (response.ok) {
                // Set pending refresh instead of immediate reload
                setPendingRefresh(true);
                
                showNotificationModal({
                    type: 'success',
                    title: 'Shift Berhasil Dipindah',
                    message: `Shift berhasil dipindahkan ke tanggal ${new Date(newDate).toLocaleDateString('id-ID')}`,
                    details: {
                        recommendations: ['Data akan diperbarui setelah Anda menutup notifikasi ini']
                    }
                });
            } else {
                throw new Error('Gagal memindahkan shift');
            }
        } catch (error: any) {
            showNotificationModal({
                type: 'error',
                title: 'Gagal Memindahkan Shift',
                message: error.message || 'Terjadi kesalahan saat memindahkan shift',
                details: {
                    recommendations: [
                        'Periksa koneksi internet',
                        'Pastikan shift belum dimulai',
                        'Hubungi administrator jika masalah berlanjut'
                    ]
                }
            });
        }
    };

    const handleCalendarDateClick = (date: string) => {
        console.log('Date clicked:', date);
        // Implementation: Filter shifts by date or open add shift modal
    };

    const handleAddShiftToDate = (date: string) => {
        console.log('Add shift to date:', date);
        // Implementation: Open add shift modal with pre-filled date
        setIsCreateShiftModalOpen(true);
    };
    
    // Auto Scheduler States
    const [isAutoScheduleModalOpen, setIsAutoScheduleModalOpen] = useState(false);
    const [autoScheduleRequests, setAutoScheduleRequests] = useState<AutoScheduleRequest[]>([
        {
            date: new Date().toISOString().split('T')[0],
            location: 'ICU',
            shiftType: 'PAGI',
            requiredCount: 3,
            preferredRoles: ['PERAWAT'],
            priority: 'HIGH'
        }
    ]);
    const [autoScheduleResult, setAutoScheduleResult] = useState<AutoScheduleResult | null>(null);
    
    // Debug: Monitor modal state changes
    useEffect(() => {
        console.log('Modal states changed:', {
            isAutoScheduleModalOpen,
            isBulkScheduleModalOpen,
            isCreateShiftModalOpen
        });
    }, [isAutoScheduleModalOpen, isBulkScheduleModalOpen, isCreateShiftModalOpen]);
    
    // Debug function to test state
    const testModalStates = () => {
        console.log('Testing modal states...');
        console.log('Current states:', {
            isAutoScheduleModalOpen,
            isBulkScheduleModalOpen,
            isCreateShiftModalOpen
        });
        
        // Test if setters work
        console.log('Setting all modals to true...');
        setIsAutoScheduleModalOpen(true);
        setIsBulkScheduleModalOpen(true);
        setIsCreateShiftModalOpen(true);
    };
    const [isAutoScheduling, setIsAutoScheduling] = useState(false);
    const [autoScheduleError, setAutoScheduleError] = useState<string | null>(null);

    // Bulk Scheduling States
    const [isBulkScheduleModalOpen, setIsBulkScheduleModalOpen] = useState(false);
    const [bulkScheduleType, setBulkScheduleType] = useState<'weekly' | 'monthly'>('weekly');
    const [isBulkScheduling, setIsBulkScheduling] = useState(false);
    const [bulkScheduleError, setBulkScheduleError] = useState<string | null>(null);
    const [bulkScheduleResult, setBulkScheduleResult] = useState<BulkScheduleResult | null>(null);
    
    // Weekly schedule state
    const [weeklyRequest, setWeeklyRequest] = useState<WeeklyScheduleRequest>({
        startDate: new Date().toISOString().split('T')[0],
        locations: ['ICU', 'RAWAT_INAP', 'GAWAT_DARURAT'],
        shiftPattern: {
            ICU: { PAGI: 4, SIANG: 4, MALAM: 3 },
            RAWAT_INAP: { PAGI: 3, SIANG: 3, MALAM: 2 },
            GAWAT_DARURAT: { PAGI: 5, SIANG: 5, MALAM: 3 }
        },
        priority: 'HIGH'
    });

    // Monthly schedule state
    const [monthlyRequest, setMonthlyRequest] = useState<MonthlyScheduleRequest>({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        locations: ['ICU', 'RAWAT_INAP', 'GAWAT_DARURAT', 'RAWAT_JALAN'],
        averageStaffPerShift: {
            ICU: 4,
            RAWAT_INAP: 3,
            GAWAT_DARURAT: 5,
            RAWAT_JALAN: 2
        },
        workloadLimits: {
            maxShiftsPerPerson: 18,
            maxConsecutiveDays: 4
        }
    });

    // Auto Scheduler Functions
    const locations = [
        'ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN',
        'LABORATORIUM', 'FARMASI', 'RADIOLOGI'
    ];

    const shiftTypes = ['PAGI', 'SIANG', 'MALAM', 'ON_CALL', 'JAGA'];
    const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
    const roles = ['DOKTER', 'PERAWAT', 'STAF'];

    const addAutoScheduleRequest = () => {
        setAutoScheduleRequests([...autoScheduleRequests, {
            date: new Date().toISOString().split('T')[0],
            location: 'ICU',
            shiftType: 'PAGI',
            requiredCount: 1,
            preferredRoles: ['PERAWAT'],
            priority: 'NORMAL'
        }]);
    };

    const updateAutoScheduleRequest = (index: number, field: keyof AutoScheduleRequest, value: any) => {
        const updated = [...autoScheduleRequests];
        updated[index] = { ...updated[index], [field]: value };
        setAutoScheduleRequests(updated);
    };

    const removeAutoScheduleRequest = (index: number) => {
        setAutoScheduleRequests(autoScheduleRequests.filter((_, i) => i !== index));
    };

    const executeAutoScheduling = async () => {
        setIsAutoScheduling(true);
        setAutoScheduleError(null);
        setAutoScheduleResult(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/admin/shift-optimization/create-optimal-shifts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate: autoScheduleRequests[0]?.date || new Date().toISOString().split('T')[0],
                    endDate: autoScheduleRequests[0]?.date || new Date().toISOString().split('T')[0],
                    schedulingType: 'daily'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal membuat jadwal optimal');
            }

            const result = await response.json();
            setAutoScheduleResult(result);
            
            // Show detailed notification instead of auto-refresh
            const hasConflicts = result.conflicts && result.conflicts.length > 0;
            const hasWorkloadAlerts = result.workloadAlerts && result.workloadAlerts.length > 0;
            const hasCapacityIssues = result.locationCapacityStatus && 
                result.locationCapacityStatus.some((loc: any) => loc.status === 'OVER_CAPACITY');
            
            const createdCount = result.createdShifts?.length || 0;
            
            if (createdCount > 0) {
                showNotificationModal({
                    type: hasConflicts || hasWorkloadAlerts || hasCapacityIssues ? 'warning' : 'success',
                    title: hasConflicts || hasWorkloadAlerts || hasCapacityIssues 
                        ? 'Jadwal Dibuat dengan Peringatan' 
                        : 'Jadwal Otomatis Berhasil Dibuat',
                    message: `${createdCount} shift berhasil dibuat. ${
                        hasConflicts || hasWorkloadAlerts || hasCapacityIssues 
                            ? 'Namun terdapat beberapa masalah yang perlu diperhatikan.' 
                            : 'Semua shift berhasil dijadwalkan tanpa konflik.'
                    }`,
                    details: {
                        createdShifts: createdCount,
                        successfulAssignments: result.assignments?.length || createdCount,
                        fulfillmentRate: result.fulfillmentRate || 100,
                        conflicts: result.conflicts || [],
                        workloadAlerts: result.workloadAlerts || [],
                        capacityIssues: result.locationCapacityStatus?.filter((loc: any) => 
                            loc.status === 'OVER_CAPACITY' || loc.utilizationPercentage > 80
                        ) || [],
                        recommendations: result.recommendations || []
                    }
                });
            } else {
                showNotificationModal({
                    type: 'error',
                    title: 'Gagal Membuat Jadwal Otomatis',
                    message: 'Tidak ada shift yang berhasil dibuat. Periksa ketersediaan pegawai dan kapasitas lokasi.',
                    details: {
                        createdShifts: 0,
                        conflicts: result.conflicts || [],
                        workloadAlerts: result.workloadAlerts || [],
                        capacityIssues: result.locationCapacityStatus?.filter((loc: any) => 
                            loc.status === 'OVER_CAPACITY'
                        ) || [],
                        recommendations: [
                            'Periksa ketersediaan pegawai pada tanggal yang dipilih',
                            'Pastikan tidak ada konflik jadwal dengan shift yang sudah ada',
                            'Pertimbangkan untuk mengurangi jumlah shift yang diminta',
                            ...(result.recommendations || [])
                        ]
                    }
                });
            }
            
            // Set pending refresh instead of immediate reload
            setPendingRefresh(true);
        } catch (err) {
            setAutoScheduleError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            showNotificationModal({
                type: 'error',
                title: 'Error Jadwal Otomatis',
                message: err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui. Data akan diperbarui setelah Anda menutup notifikasi ini.',
                details: {
                    recommendations: [
                        'Periksa koneksi internet Anda',
                        'Pastikan backend server berjalan dengan baik',
                        'Coba lagi dalam beberapa saat',
                        'Hubungi administrator sistem jika masalah berlanjut'
                    ]
                }
            });
            
            // Set pending refresh instead of immediate reload
            setPendingRefresh(true);
        } finally {
            setIsAutoScheduling(false);
        }
    };

    // Bulk Scheduling Functions
    const handleCreateWeeklySchedule = async () => {
        setIsBulkScheduling(true);
        setBulkScheduleError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/admin/shift-optimization/create-weekly-schedule`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(weeklyRequest),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal membuat jadwal mingguan');
            }

            const result = await response.json();
            setBulkScheduleResult(result);
            
            // Show notification instead of auto-refresh
            const createdCount = result.weeklySchedule?.createdShifts || result.createdShifts || 0;
            const hasConflicts = result.weeklySchedule?.conflicts?.length > 0 || result.conflicts?.length > 0;
            const fulfillmentRate = result.weeklySchedule?.fulfillmentRate || result.fulfillmentRate || 0;
            
            if (createdCount > 0) {
                showNotificationModal({
                    type: hasConflicts ? 'warning' : 'success',
                    title: hasConflicts ? 'Jadwal Mingguan Dibuat dengan Konflik' : 'Jadwal Mingguan Berhasil Dibuat',
                    message: `${createdCount} shift mingguan berhasil dibuat. ${
                        hasConflicts 
                            ? 'Terdapat beberapa konflik yang perlu diperhatikan. Data akan diperbarui setelah Anda menutup notifikasi ini.' 
                            : 'Semua shift mingguan berhasil dijadwalkan. Data akan diperbarui setelah Anda menutup notifikasi ini.'
                    }`,
                    details: {
                        createdShifts: createdCount,
                        successfulAssignments: result.weeklySchedule?.successfulAssignments || result.successfulAssignments || createdCount,
                        fulfillmentRate: fulfillmentRate,
                        conflicts: result.weeklySchedule?.conflicts || result.conflicts || [],
                        workloadAlerts: result.weeklySchedule?.workloadAlerts || result.workloadAlerts || [],
                        recommendations: result.weeklySchedule?.recommendations || result.recommendations || []
                    }
                });
            } else {
                showNotificationModal({
                    type: 'error',
                    title: 'Gagal Membuat Jadwal Mingguan',
                    message: 'Tidak ada shift mingguan yang berhasil dibuat. Data akan diperbarui setelah Anda menutup notifikasi ini.',
                    details: {
                        createdShifts: 0,
                        conflicts: result.weeklySchedule?.conflicts || result.conflicts || [],
                        recommendations: [
                            'Periksa pola shift yang diminta',
                            'Pastikan ada cukup pegawai tersedia',
                            'Kurangi jumlah shift per lokasi jika diperlukan'
                        ]
                    }
                });
            }
            
            setIsBulkScheduleModalOpen(false);
            
            // Set pending refresh instead of immediate reload
            setPendingRefresh(true);
        } catch (error: any) {
            setBulkScheduleError(error.message);
            showNotificationModal({
                type: 'error',
                title: 'Error Jadwal Mingguan',
                message: error.message || 'Terjadi kesalahan saat membuat jadwal mingguan. Data akan diperbarui setelah Anda menutup notifikasi ini.',
                details: {
                    recommendations: [
                        'Periksa konfigurasi pola shift',
                        'Pastikan tanggal mulai valid',
                        'Coba dengan jumlah staff yang lebih sedikit',
                        'Hubungi administrator jika masalah berlanjut'
                    ]
                }
            });
        } finally {
            setIsBulkScheduling(false);
        }
    };

    const handleCreateMonthlySchedule = async () => {
        setIsBulkScheduling(true);
        setBulkScheduleError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/admin/shift-optimization/create-monthly-schedule`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(monthlyRequest),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal membuat jadwal bulanan');
            }

            const result = await response.json();
            setBulkScheduleResult(result);
            
            // Show notification instead of auto-refresh
            const createdCount = result.monthlySchedule?.createdShifts || result.createdShifts || 0;
            const hasConflicts = result.monthlySchedule?.conflicts?.length > 0 || result.conflicts?.length > 0;
            const fulfillmentRate = result.monthlySchedule?.fulfillmentRate || result.fulfillmentRate || 0;
            
            if (createdCount > 0) {
                showNotificationModal({
                    type: hasConflicts ? 'warning' : 'success',
                    title: hasConflicts ? 'Jadwal Bulanan Dibuat dengan Konflik' : 'Jadwal Bulanan Berhasil Dibuat',
                    message: `${createdCount} shift bulanan berhasil dibuat untuk ${monthlyRequest.month}/${monthlyRequest.year}. ${
                        hasConflicts 
                            ? 'Terdapat beberapa konflik yang perlu diperhatikan. Data akan diperbarui setelah Anda menutup notifikasi ini.' 
                            : 'Semua shift bulanan berhasil dijadwalkan. Data akan diperbarui setelah Anda menutup notifikasi ini.'
                    }`,
                    details: {
                        createdShifts: createdCount,
                        successfulAssignments: result.monthlySchedule?.successfulAssignments || result.successfulAssignments || createdCount,
                        fulfillmentRate: fulfillmentRate,
                        conflicts: result.monthlySchedule?.conflicts || result.conflicts || [],
                        workloadAlerts: result.monthlySchedule?.workloadAlerts || result.workloadAlerts || [],
                        recommendations: result.monthlySchedule?.recommendations || result.recommendations || []
                    }
                });
            } else {
                showNotificationModal({
                    type: 'error',
                    title: 'Gagal Membuat Jadwal Bulanan',
                    message: `Tidak ada shift bulanan yang berhasil dibuat untuk ${monthlyRequest.month}/${monthlyRequest.year}. Data akan diperbarui setelah Anda menutup notifikasi ini.`,
                    details: {
                        createdShifts: 0,
                        conflicts: result.monthlySchedule?.conflicts || result.conflicts || [],
                        recommendations: [
                            'Periksa rata-rata staff per shift',
                            'Pastikan ada cukup pegawai untuk seluruh bulan',
                            'Kurangi workload limits jika terlalu ketat',
                            'Pilih bulan yang berbeda jika sudah banyak jadwal'
                        ]
                    }
                });
            }
            
            setIsBulkScheduleModalOpen(false);
            
            // Set pending refresh instead of immediate reload
            setPendingRefresh(true);
        } catch (error: any) {
            setBulkScheduleError(error.message);
            showNotificationModal({
                type: 'error',
                title: 'Error Jadwal Bulanan',
                message: error.message || 'Terjadi kesalahan saat membuat jadwal bulanan. Data akan diperbarui setelah Anda menutup notifikasi ini.',
                details: {
                    recommendations: [
                        'Periksa konfigurasi pola shift',
                        'Pastikan tanggal mulai valid',
                        'Coba dengan jumlah staff yang lebih sedikit',
                        'Hubungi administrator jika masalah berlanjut'
                    ]
                }
            });
        } finally {
            setIsBulkScheduling(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-500 text-white';
            case 'HIGH': return 'bg-orange-500 text-white';
            case 'NORMAL': return 'bg-blue-500 text-white';
            case 'LOW': return 'bg-gray-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    // Update filter counts whenever data changes
    const updateFilterCounts = (data: Jadwal[]) => {
        // Filter out past dates first for accurate counts (unless showing all schedules)
        let activeJadwal = data;
        
        if (!showAllSchedules) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            activeJadwal = data.filter(item => {
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
        }
        
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
                
                let shiftsData, usersResponse, usersData;
                
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
                    
                    [shiftsData, usersResponse] = await Promise.all([
                        jadwalRes.json(),
                        usersRes.json()
                    ]);
                    
                    // Extract users array from response object
                    usersData = usersResponse.data || usersResponse;
                    
                } catch (apiError) {
                    console.error('Error fetching from API:', apiError);
                    
                    // Show more specific error for connection issues
                    if (apiError instanceof TypeError && apiError.message.includes('fetch')) {
                        throw new Error('❌ Backend server tidak dapat diakses. Pastikan backend server berjalan di port 3001.\n\n💡 Untuk menjalankan backend:\n1. Buka terminal baru\n2. Jalankan: cd /Users/jo/Downloads/Thesis\n3. Jalankan: ./start-backend.sh\n\nAtau jalankan: npm run start:dev di folder backend/');
                    }
                    
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
                    // Ensure usersData is an array before using find
                    const user = Array.isArray(usersData) ? usersData.find((u: User) => 
                        u.id === jadwal.userId || 
                        u.username === jadwal.idpegawai
                    ) : null;
                    
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
                console.log('Fetched jadwal data:', enhancedJadwalData.length, 'items');
                console.log('Sample data:', enhancedJadwalData.slice(0, 2));
                
                // Debug: Check why data might be empty
                if (enhancedJadwalData.length === 0) {
                    console.log('❌ No shift data found! Reasons might be:');
                    console.log('1. Database is empty');
                    console.log('2. API endpoint is not working');
                    console.log('3. Data is being filtered out');
                    console.log('Original shifts data:', shiftsData?.length || 0, 'items');
                    console.log('Deleted IDs:', deletedIds?.length || 0, 'items');
                }
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
        
        // Filter out past dates (keep only today and future dates) - unless showAllSchedules is true
        if (!showAllSchedules) {
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
        }
        
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
                        const todayShiftDate = new Date(item.originalDate || item.tanggal);
                        const today = new Date();
                        todayShiftDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        return todayShiftDate.getTime() === today.getTime();
                        
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
            // When showing all schedules, also include past dates at the end
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
                    
                    if (showAllSchedules) {
                        // When showing all schedules: Past dates first (oldest first), then present day, then future
                        const aIsPast = dateA.getTime() < today.getTime();
                        const bIsPast = dateB.getTime() < today.getTime();
                        const aIsToday = dateA.getTime() === today.getTime();
                        const bIsToday = dateB.getTime() === today.getTime();
                        
                        // Past dates come first
                        if (aIsPast && !bIsPast) return -1;
                        if (!aIsPast && bIsPast) return 1;
                        
                        // Present day comes after past but before future
                        if (aIsToday && !bIsToday && !bIsPast) return -1;
                        if (!aIsToday && bIsToday && !aIsPast) return 1;
                        
                        // Within the same category, sort chronologically
                        return dateA.getTime() - dateB.getTime();
                    } else {
                        // Original logic: Present day first, then future dates
                        const aIsToday = dateA.getTime() === today.getTime();
                        const bIsToday = dateB.getTime() === today.getTime();
                        
                        // Present day schedules come first
                        if (aIsToday && !bIsToday) return -1;
                        if (!aIsToday && bIsToday) return 1;
                        
                        // For non-today dates, sort in ascending order (earliest first)
                        return dateA.getTime() - dateB.getTime();
                    }
                    
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
    }, [jadwalData, searchTerm, filterValue, sortValue, sortDirection, showAllSchedules]);

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
        
        // Handle specific unit mappings first
        const unitMappings: { [key: string]: string } = {
            'RAWAT_INAP_3_SHIFT': 'Rawat Inap',
            'RAWAT_INAP': 'Rawat Inap',
            'RAWAT_JALAN': 'Rawat Jalan',
            'UGD': 'UGD',
            'ICU': 'ICU',
            'EMERGENCY': 'Emergency',
            'KAMAR_OPERASI': 'Kamar Operasi',
            'LABORATORIUM': 'Laboratorium',
            'RADIOLOGI': 'Radiologi',
            'FARMASI': 'Farmasi',
            'GIZI': 'Gizi',
            'FISIOTERAPI': 'Fisioterapi',
            'HEMODIALISA': 'Hemodialisa',
            'NICU': 'NICU',
            'PICU': 'PICU'
        };
        
        // Check if we have a direct mapping
        const upperLokasi = lokasi.toUpperCase();
        if (unitMappings[upperLokasi]) {
            return unitMappings[upperLokasi];
        }
        
        // For other cases, process the string
        let formatted = lokasi
            .split('_')
            .map(word => {
                // Skip numbers and "SHIFT" word
                if (/^\d+$/.test(word) || word.toUpperCase() === 'SHIFT') {
                    return null;
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .filter(word => word !== null)
            .join(' ');
        
        // Clean up any remaining shift references
        formatted = formatted.replace(/\s*\d+\s*(Shift|shift)/gi, '');
        
        // Clean up any trailing spaces and multiple spaces
        return formatted.replace(/\s+/g, ' ').trim();
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
        
        // Check if this schedule is in the past
        const isPastSchedule = (() => {
            if (!showAllSchedules) return false; // Only check when showing all schedules
            
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                let itemDate;
                if (item.originalDate) {
                    const [year, month, day] = item.originalDate.split('-');
                    itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else if (item.tanggal && item.tanggal.includes('/')) {
                    const [day, month, year] = item.tanggal.split('/');
                    itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                    itemDate = new Date(item.tanggal);
                    itemDate.setHours(0, 0, 0, 0);
                }
                
                return itemDate.getTime() < today.getTime();
            } catch (error) {
                return false;
            }
        })();
        
        return (
            <tr key={item.id} className={`border-b border-gray-500 even:bg-slate-50 text-md hover:bg-gray-50 transition-colors ${
                isPastSchedule ? 'opacity-60 bg-gray-50' : ''
            }`}>
                {/* Info Pegawai - Sesuai kolom pertama */}
                <td className="px-4 lg:px-6 py-3">
                    <div className="flex flex-col">
                        <h3 className={`font-semibold capitalize ${isPastSchedule ? 'text-gray-500' : ''}`}>
                            {fullName}
                            {isPastSchedule && <span className="text-xs text-red-500 ml-2">(Selesai)</span>}
                        </h3>
                        <p className={`text-xs ${isPastSchedule ? 'text-gray-400' : 'text-gray-500'}`}>{timeRange}</p>
                        <p className={`text-xs ${isPastSchedule ? 'text-gray-400' : 'text-blue-600'}`}>{formattedLocation}</p>
                    </div>
                </td>
                
                {/* Tanggal - Sesuai kolom kedua */}
                <td className={`hidden md:table-cell px-4 lg:px-6 py-3 ${isPastSchedule ? 'text-gray-500' : ''}`}>
                    {item.tanggal}
                </td>
                
                {/* Jam Mulai - Sesuai kolom ketiga */}
                <td className={`hidden md:table-cell px-4 lg:px-6 py-3 ${isPastSchedule ? 'text-gray-500' : ''}`}>
                    {formatTime(item.jammulai)}
                </td>
                
                {/* Jam Selesai - Sesuai kolom keempat */}
                <td className={`hidden md:table-cell px-4 lg:px-6 py-3 ${isPastSchedule ? 'text-gray-500' : ''}`}>
                    {formatTime(item.jamselesai)}
                </td>
                
                {/* Tipe Shift - Sesuai kolom kelima */}
                <td className="hidden md:table-cell px-4 lg:px-6 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isPastSchedule 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                        {formattedShiftType}
                    </span>
                </td>
                
                {/* Aksi - Sesuai kolom keenam */}
                <td className="px-4 lg:px-6 py-3">
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">Koneksi Backend Bermasalah</h3>
                            
                            {error.includes('Backend server tidak dapat diakses') ? (
                                <div className="space-y-4">
                                    <p className="text-red-700">
                                        Backend server tidak dapat diakses. Aplikasi memerlukan backend server untuk mengambil data jadwal shift.
                                    </p>
                                    
                                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                                        <h4 className="font-medium text-yellow-800 mb-2">🔧 Cara Mengatasi:</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                                            <li>Buka terminal baru</li>
                                            <li>Navigasi ke: <code className="bg-yellow-200 px-1 rounded text-xs">/Users/jo/Downloads/Thesis</code></li>
                                            <li>Jalankan: <code className="bg-yellow-200 px-1 rounded text-xs">./start-backend.sh</code></li>
                                            <li>Tunggu server aktif (biasanya 10-30 detik)</li>
                                            <li>Refresh halaman ini</li>
                                        </ol>
                                    </div>
                                    
                                    <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                                        <p className="text-sm text-blue-700">
                                            <strong>💡 Tips:</strong> Backend server perlu dijalankan terpisah dari frontend. 
                                            Server akan menyediakan API untuk data pegawai, jadwal shift, dan fitur Auto Schedule AI.
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => {
                                            setPendingRefresh(true);
                                            closeNotification();
                                        }}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        🔄 Coba Lagi
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-red-700">{error}</p>
                                    <button 
                                        onClick={() => {
                                            setPendingRefresh(true);
                                            closeNotification();
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        🔄 Refresh Halaman
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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
                    <div className="mt-6 flex flex-col items-center gap-4">
                        {/* Auto Schedule AI Button - Primary CTA */}
                        <button 
                            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all shadow-lg font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Auto Schedule AI button clicked');
                                try {
                                    setIsAutoScheduleModalOpen(true);
                                } catch (error) {
                                    console.error('Error opening Auto Schedule modal:', error);
                                }
                            }}
                            title="Buat jadwal otomatis menggunakan AI Hybrid Algorithm"
                        >
                            <Brain className="w-5 h-5" />
                            Gunakan Auto Schedule AI
                        </button>
                        
                        {/* Bulk Schedule Button */}
                        <button 
                            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Bulk Schedule button clicked');
                                try {
                                    setIsBulkScheduleModalOpen(true);
                                } catch (error) {
                                    console.error('Error opening Bulk Schedule modal:', error);
                                }
                            }}
                            title="Buat jadwal mingguan atau bulanan"
                        >
                            <Calendar className="w-5 h-5" />
                            Jadwal Mingguan/Bulanan
                        </button>
                        <p className="text-sm text-gray-500 text-center max-w-md">
                            Buat jadwal shift optimal secara otomatis menggunakan algoritma Greedy + Backtracking
                        </p>
                        
                        {/* Alternative manual option */}
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-2">atau</p>
                            <button 
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Manual Add button clicked');
                                    try {
                                        setIsCreateShiftModalOpen(true);
                                    } catch (error) {
                                        console.error('Error opening Manual Add modal:', error);
                                    }
                                }}
                            >
                                Tambah Jadwal Manual
                            </button>
                            
                            {/* Debug Test Button */}
                            <button 
                                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-xs"
                                onClick={testModalStates}
                            >
                                🧪 Test Modal States
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
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
        <div>


            {/* MAIN CONTENT */}
            <div className='bg-white p-6 rounded-xl flex-1 m-6 mt-0 shadow-sm'>
            {/* TOP SECTION */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Jadwal</h1>
                    <p className="text-gray-600">Kelola jadwal shift pegawai rumah sakit</p>
                </div>
                
                {/* SEARCH AND CONTROLS */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full lg:w-auto">
                    <div className="flex-1 md:min-w-[300px]">
                        <TableSearch 
                            placeholder="Cari berdasarkan nama pegawai, lokasi, atau tanggal..." 
                            value={searchTerm} 
                            onChange={setSearchTerm}
                        />
                    </div>
                </div>
            </div>

            {/* CONTROLS SECTION */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                {/* Toggle untuk melihat semua jadwal */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAllSchedules(!showAllSchedules)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            showAllSchedules 
                                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                        }`}
                        title={showAllSchedules ? 'Sembunyikan jadwal yang sudah lewat' : 'Tampilkan semua jadwal termasuk yang sudah lewat'}
                    >
                        {showAllSchedules ? '📅 Semua Jadwal' : '⏰ Jadwal Aktif'}
                    </button>
                </div>

                {/* Tab untuk view mode */}
                <div className="flex gap-1 p-1 bg-white rounded-lg border border-gray-200">
                    <button
                        onClick={() => {
                            setViewMode('table');
                            setUseInteractiveCalendar(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            viewMode === 'table' && !useInteractiveCalendar
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        <span>Tabel {useEnhancedTable ? 'Enhanced' : 'Standard'}</span>
                    </button>
                    <button
                        onClick={() => {
                            setViewMode('table');
                            setUseInteractiveCalendar(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            useInteractiveCalendar
                                ? 'bg-purple-600 text-white shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                        title="Kalender interaktif dengan drag & drop"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Kalender Interaktif</span>
                    </button>
                    <button
                        onClick={() => {
                            setViewMode('monthly');
                            setUseInteractiveCalendar(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            viewMode === 'monthly' && !useInteractiveCalendar
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                        title="Tampilan kalender bulanan untuk melihat jadwal shift secara visual"
                    >
                        <Grid className="w-4 h-4" />
                        <span>Monthly View</span>
                    </button>
                </div>

                {/* Enhanced Table Toggle */}
                {viewMode === 'table' && !useInteractiveCalendar && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setUseEnhancedTable(!useEnhancedTable)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                useEnhancedTable 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' 
                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                            }`}
                            title={useEnhancedTable ? 'Gunakan tabel standard' : 'Gunakan tabel enhanced dengan fitur spreadsheet'}
                        >
                            <BarChart3 className="w-4 h-4 inline mr-2" />
                            {useEnhancedTable ? 'Enhanced ON' : 'Enhanced OFF'}
                        </button>
                    </div>
                )}

                {/* Info about calendar functionality */}
                {viewMode === 'monthly' && jadwalData.length === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">Tentang Kalender Shift:</p>
                                <p className="text-blue-700 mt-1">
                                    Kalender menampilkan jadwal shift semua pegawai dalam tampilan bulanan. 
                                    Setiap hari akan menunjukkan daftar pegawai yang bertugas, lokasi, dan jam kerja.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toggle untuk workload counters */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowWorkloadCounters(!showWorkloadCounters)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            showWorkloadCounters 
                                ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                        }`}
                        title={showWorkloadCounters ? 'Sembunyikan counter beban kerja' : 'Tampilkan counter beban kerja'}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        {showWorkloadCounters ? 'Counter ON' : 'Counter OFF'}
                    </button>
                    
                    {/* Toggle untuk workload validator */}
                    <button
                        onClick={() => setShowWorkloadValidator(!showWorkloadValidator)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            showWorkloadValidator 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                        }`}
                        title={showWorkloadValidator ? 'Sembunyikan validator workload' : 'Tampilkan validator workload'}
                    >
                        <Shield className="w-4 h-4 inline mr-2" />
                        {showWorkloadValidator ? 'Validator ON' : 'Validator OFF'}
                    </button>
                </div>
                
                {/* Filter and Sort Controls */}
                <div className="flex items-center gap-3 ml-auto">
                    <FilterButton 
                        options={filterOptions} 
                        onFilter={handleFilter}
                    />
                    <SortButton 
                        options={sortOptions} 
                        onSort={handleSort} 
                    />
                </div>
            </div>

            {/* ACTION BUTTONS SECTION */}
            {(userRole === "admin" || userRole === "supervisor") && (
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <button 
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-all shadow-md text-sm font-medium"
                        onClick={() => setIsAutoScheduleModalOpen(true)}
                        title="Buat jadwal otomatis menggunakan AI Hybrid Algorithm"
                    >
                        <Zap className="w-4 h-4" />
                        Jadwal Otomatis AI
                    </button>
                    
                    <button 
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-md text-sm font-medium"
                        onClick={() => setIsCreateShiftModalOpen(true)}
                        title="Buat shift baru secara manual"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Shift Manual
                    </button>
                    
                    <button 
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md text-sm font-medium"
                        onClick={() => setIsBulkScheduleModalOpen(true)}
                        title="Buat jadwal untuk banyak pegawai sekaligus"
                    >
                        <Calendar className="w-4 h-4" />
                        Bulk Scheduling
                    </button>
                    
                    <button 
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transition-all shadow-md text-sm font-medium"
                        onClick={() => {
                            setSwapShiftEmployeeId(null);
                            setShowSwapRequests(true);
                        }}
                        title="Kelola permintaan tukar shift"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Kelola Swap Request
                    </button>
                </div>
            )}

            {/* STATISTICS AND COUNTERS SECTION */}
            {showWorkloadCounters && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Analisis Beban Kerja</h3>
                    {jadwalData.length === 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                                <div className="text-2xl font-bold text-blue-600">0</div>
                                <div className="text-sm text-gray-600">Total Shift</div>
                                <div className="text-xs text-gray-400 mt-1">Belum ada data</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                                <div className="text-2xl font-bold text-green-600">0</div>
                                <div className="text-sm text-gray-600">Pegawai Aktif</div>
                                <div className="text-xs text-gray-400 mt-1">Belum ada data</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                                <div className="text-2xl font-bold text-purple-600">0</div>
                                <div className="text-sm text-gray-600">Lokasi Aktif</div>
                                <div className="text-xs text-gray-400 mt-1">Belum ada data</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                                <div className="text-2xl font-bold text-orange-600">0</div>
                                <div className="text-sm text-gray-600">Rata-rata/Hari</div>
                                <div className="text-xs text-gray-400 mt-1">Belum ada data</div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Quick Statistics based on actual data */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                                    <div className="text-2xl font-bold text-blue-600">{jadwalData.length}</div>
                                    <div className="text-sm text-gray-600">Total Shift</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                                    <div className="text-2xl font-bold text-green-600">
                                        {[...new Set(jadwalData.map(j => j.idpegawai))].length}
                                    </div>
                                    <div className="text-sm text-gray-600">Pegawai Aktif</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {[...new Set(jadwalData.map(j => j.lokasishift))].length}
                                    </div>
                                    <div className="text-sm text-gray-600">Lokasi Aktif</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {Math.round(jadwalData.length / Math.max(1, [...new Set(jadwalData.map(j => j.tanggal))].length))}
                                    </div>
                                    <div className="text-sm text-gray-600">Rata-rata/Hari</div>
                                </div>
                            </div>

                            {/* WORKLOAD ANALYSIS SECTION */}
                            <WorkloadAnalysisSection 
                                jadwalData={jadwalData}
                                users={users}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* REAL-TIME WORKLOAD VALIDATOR SECTION */}
            {showWorkloadValidator && (
                <div className="mb-8">
                    <RealTimeWorkloadValidator 
                        onValidationResult={(result) => {
                            setWorkloadValidationData(result);
                            // Trigger refresh when needed
                            if (result.disabledUsers > 0) {
                                setWorkloadRefreshTrigger(prev => prev + 1);
                            }
                        }}
                        refreshTrigger={workloadRefreshTrigger}
                    />
                </div>
            )}

            {/* WORKLOAD ANALYSIS SECTION - Always Show */}
            {jadwalData.length > 0 && (
                <div className="mb-6">
                    <WorkloadAnalysisSection 
                        jadwalData={jadwalData}
                        users={users}
                    />
                </div>
            )}

            {/* CONTENT SECTION */}
            <div className="min-h-[600px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : useInteractiveCalendar ? (
                    /* Interactive Calendar View */
                    <InteractiveCalendar
                        shifts={filteredShifts.map(shift => ({
                            id: shift.id,
                            nama: shift.nama,
                            idpegawai: shift.idpegawai,
                            tanggal: shift.tanggal,
                            jammulai: shift.jammulai,
                            jamselesai: shift.jamselesai,
                            lokasishift: shift.lokasishift,
                            tipeshift: shift.tipeshift,
                            status: 'ACTIVE', // Default status
                            userId: shift.userId
                        }))}
                        onShiftMove={handleShiftMove}
                        onShiftClick={handleShiftView}
                        onDateClick={handleCalendarDateClick}
                        onAddShift={handleAddShiftToDate}
                        readonly={userRole !== 'admin' && userRole !== 'supervisor'}
                    />
                ) : viewMode === 'table' ? (
                    useEnhancedTable ? (
                        /* Enhanced Table View */
                        <EnhancedShiftTable
                            data={filteredShifts.map(shift => ({
                                id: shift.id,
                                nama: shift.nama,
                                idpegawai: shift.idpegawai,
                                tanggal: shift.tanggal,
                                jammulai: shift.jammulai,
                                jamselesai: shift.jamselesai,
                                lokasishift: shift.lokasishift,
                                tipeshift: shift.tipeshift,
                                status: 'ACTIVE', // Default status
                                priority: 'NORMAL' // Default priority
                            }))}
                            onEdit={handleShiftEdit}
                            onDelete={handleShiftDelete}
                            onView={handleShiftView}
                            loading={isLoading}
                        />
                    ) : (
                        /* Standard Table View */
                        filteredShifts.length === 0 && searchTerm.trim() !== '' ? (
                            <div className="flex flex-col items-center justify-center py-16 px-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-500 mb-2">Tidak ada hasil</h3>
                                <p className="text-gray-400 mb-4">Tidak ada jadwal yang cocok dengan pencarian "{searchTerm}"</p>
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Hapus Filter
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <Table
                                    columns={columns}
                                    data={paginatedShifts}
                                    renderRow={renderRow}
                                />
                                {/* PAGINATION */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filteredShifts.length)} 
                                            - {Math.min(currentPage * itemsPerPage, filteredShifts.length)} 
                                            dari {filteredShifts.length} shift
                                        </p>
                                        <Pagination
                                            currentPage={currentPage}
                                            totalItems={filteredShifts.length}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    )
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        {filteredJadwal.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <div className="text-center max-w-md">
                                    <svg className="w-16 h-16 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Kalender Kosong</h3>
                                    <p className="text-gray-500 mb-4">
                                        Belum ada jadwal shift yang tersedia. 
                                        {filteredJadwal.length === 0 && jadwalData.length === 0 ? 
                                            ' Database belum memiliki data shift.' : 
                                            ' Filter yang Anda gunakan tidak menghasilkan data.'}
                                    </p>
                                    
                                    {jadwalData.length === 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-sm text-blue-600 font-medium">
                                                💡 Mulai buat jadwal shift pertama dengan:
                                            </p>
                                            
                                            {(userRole === "admin" || userRole === "supervisor") && (
                                                <div className="flex flex-col gap-2">
                                                    <button 
                                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all shadow-md text-sm font-medium"
                                                        onClick={() => setIsAutoScheduleModalOpen(true)}
                                                    >
                                                        <Brain className="w-4 h-4" />
                                                        Auto Schedule AI
                                                    </button>
                                                    <button 
                                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                                        onClick={() => setIsCreateShiftModalOpen(true)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Tambah Manual
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                                Coba ubah filter atau reset pencarian
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    setFilterValue('');
                                                    setSearchTerm('');
                                                }}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                            >
                                                Reset Filter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <MonthlyScheduleView 
                                shifts={filteredJadwal as any}
                                onShiftClick={(shift) => {
                                    console.log('Shift clicked:', shift);
                                }}
                                showWorkloadCounters={showWorkloadCounters}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Modal Bulk Schedule */}
            {isBulkScheduleModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <Calendar className="w-6 h-6 mr-3 text-emerald-600" />
                                    <h2 className="text-xl font-semibold">Jadwal Otomatis Mingguan/Bulanan</h2>
                                </div>
                                <button
                                    onClick={() => setIsBulkScheduleModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Bulk Schedule Type Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Jadwal</label>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setBulkScheduleType('weekly')}
                                        className={`px-4 py-2 rounded-lg font-medium ${
                                            bulkScheduleType === 'weekly'
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Jadwal Mingguan
                                    </button>
                                    <button
                                        onClick={() => setBulkScheduleType('monthly')}
                                        className={`px-4 py-2 rounded-lg font-medium ${
                                            bulkScheduleType === 'monthly'
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Jadwal Bulanan
                                    </button>
                                </div>
                            </div>

                            {/* Weekly Schedule Form */}
                            {bulkScheduleType === 'weekly' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            value={weeklyRequest.startDate}
                                            onChange={(e) => setWeeklyRequest({ ...weeklyRequest, startDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lokasi (pilih semua yang diperlukan)
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {locations.map((location) => (
                                                <label key={location} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={weeklyRequest.locations.includes(location)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setWeeklyRequest({
                                                                    ...weeklyRequest,
                                                                    locations: [...weeklyRequest.locations, location]
                                                                });
                                                            } else {
                                                                setWeeklyRequest({
                                                                    ...weeklyRequest,
                                                                    locations: weeklyRequest.locations.filter(l => l !== location)
                                                                });
                                                            }
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm">{location}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prioritas
                                        </label>
                                        <select
                                            value={weeklyRequest.priority}
                                            onChange={(e) => setWeeklyRequest({ ...weeklyRequest, priority: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        >
                                            {priorities.map((priority) => (
                                                <option key={priority} value={priority}>{priority}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Shift Pattern Configuration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Konfigurasi Pola Shift per Lokasi
                                        </label>
                                        {weeklyRequest.locations.map((location) => (
                                            <div key={location} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                                <h4 className="font-medium text-gray-800 mb-3">{location}</h4>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">PAGI</label>
                                                        <input
                                                            type="number"
                                                            value={weeklyRequest.shiftPattern[location]?.PAGI || 0}
                                                            onChange={(e) => setWeeklyRequest({
                                                                ...weeklyRequest,
                                                                shiftPattern: {
                                                                    ...weeklyRequest.shiftPattern,
                                                                    [location]: {
                                                                        ...weeklyRequest.shiftPattern[location],
                                                                        PAGI: parseInt(e.target.value) || 0
                                                                    }
                                                                }
                                                            })}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                            min="0"
                                                            max="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">SIANG</label>
                                                        <input
                                                            type="number"
                                                            value={weeklyRequest.shiftPattern[location]?.SIANG || 0}
                                                            onChange={(e) => setWeeklyRequest({
                                                                ...weeklyRequest,
                                                                shiftPattern: {
                                                                    ...weeklyRequest.shiftPattern,
                                                                    [location]: {
                                                                        ...weeklyRequest.shiftPattern[location],
                                                                        SIANG: parseInt(e.target.value) || 0
                                                                    }
                                                                }
                                                            })}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                            min="0"
                                                            max="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">MALAM</label>
                                                        <input
                                                            type="number"
                                                            value={weeklyRequest.shiftPattern[location]?.MALAM || 0}
                                                            onChange={(e) => setWeeklyRequest({
                                                                ...weeklyRequest,
                                                                shiftPattern: {
                                                                    ...weeklyRequest.shiftPattern,
                                                                    [location]: {
                                                                        ...weeklyRequest.shiftPattern[location],
                                                                        MALAM: parseInt(e.target.value) || 0
                                                                    }
                                                                }
                                                            })}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                            min="0"
                                                            max="10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Monthly Schedule Form */}
                            {bulkScheduleType === 'monthly' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tahun
                                            </label>
                                            <input
                                                type="number"
                                                value={monthlyRequest.year}
                                                onChange={(e) => setMonthlyRequest({ ...monthlyRequest, year: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                min="2024"
                                                max="2030"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bulan
                                            </label>
                                            <select
                                                value={monthlyRequest.month}
                                                onChange={(e) => setMonthlyRequest({ ...monthlyRequest, month: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                                    <option key={month} value={month}>
                                                        {new Date(2024, month - 1).toLocaleString('id-ID', { month: 'long' })}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lokasi (pilih semua yang diperlukan)
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {locations.map((location) => (
                                                <label key={location} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={monthlyRequest.locations.includes(location)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setMonthlyRequest({
                                                                    ...monthlyRequest,
                                                                    locations: [...monthlyRequest.locations, location]
                                                                });
                                                            } else {
                                                                setMonthlyRequest({
                                                                    ...monthlyRequest,
                                                                    locations: monthlyRequest.locations.filter(l => l !== location)
                                                                });
                                                            }
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm">{location}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Batas Beban Kerja
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Max Shift per Orang</label>
                                                <input
                                                    type="number"
                                                    value={monthlyRequest.workloadLimits.maxShiftsPerPerson}
                                                    onChange={(e) => setMonthlyRequest({
                                                        ...monthlyRequest,
                                                        workloadLimits: {
                                                            ...monthlyRequest.workloadLimits,
                                                            maxShiftsPerPerson: parseInt(e.target.value)
                                                        }
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    min="1"
                                                    max="31"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Max Hari Berturut-turut</label>
                                                <input
                                                    type="number"
                                                    value={monthlyRequest.workloadLimits.maxConsecutiveDays}
                                                    onChange={(e) => setMonthlyRequest({
                                                        ...monthlyRequest,
                                                        workloadLimits: {
                                                            ...monthlyRequest.workloadLimits,
                                                            maxConsecutiveDays: parseInt(e.target.value)
                                                        }
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    min="1"
                                                    max="7"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Average Staff Configuration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Rata-rata Staff per Shift per Lokasi
                                        </label>
                                        {monthlyRequest.locations.map((location) => (
                                            <div key={location} className="mb-3 flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                <span className="font-medium text-gray-800">{location}</span>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        value={monthlyRequest.averageStaffPerShift[location] || 0}
                                                        onChange={(e) => setMonthlyRequest({
                                                            ...monthlyRequest,
                                                            averageStaffPerShift: {
                                                                ...monthlyRequest.averageStaffPerShift,
                                                                [location]: parseInt(e.target.value) || 0
                                                            }
                                                        })}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        min="0"
                                                        max="20"
                                                    />
                                                    <span className="text-xs text-gray-600">orang/shift</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {bulkScheduleError && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center text-red-800">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        <span className="font-medium">{bulkScheduleError}</span>
                                    </div>
                                </div>
                            )}

                            {/* Bulk Schedule Result */}
                            {bulkScheduleResult && (
                                <div className="mt-6 border-t pt-6">
                                    <div className="flex items-center mb-4">
                                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                        <h3 className="text-lg font-semibold">Hasil Jadwal {bulkScheduleType === 'weekly' ? 'Mingguan' : 'Bulanan'}</h3>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                            <div className="text-2xl font-bold text-green-600">
                                                {bulkScheduleResult.createdShifts}
                                            </div>
                                            <div className="text-sm text-green-700">Shift Dibuat</div>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {bulkScheduleResult.fulfillmentRate?.toFixed(1)}%
                                            </div>
                                            <div className="text-sm text-blue-700">Tingkat Pemenuhan</div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {bulkScheduleResult.conflicts?.length || 0}
                                            </div>
                                            <div className="text-sm text-orange-700">Konflik</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {bulkScheduleResult.recommendations?.length || 0}
                                            </div>
                                            <div className="text-sm text-purple-700">Rekomendasi</div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center text-green-800">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            <span className="font-medium">
                                                Jadwal {bulkScheduleType === 'weekly' ? 'mingguan' : 'bulanan'} berhasil dibuat! 
                                                Halaman akan dimuat ulang untuk menampilkan jadwal baru.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setIsBulkScheduleModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={bulkScheduleType === 'weekly' ? handleCreateWeeklySchedule : handleCreateMonthlySchedule}
                                    disabled={isBulkScheduling}
                                    className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isBulkScheduling ? (
                                        <>
                                            <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                            Membuat Jadwal...
                                        </>
                                    ) : (
                                        `Buat Jadwal ${bulkScheduleType === 'weekly' ? 'Mingguan' : 'Bulanan'}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALS SECTION */}
            
            {/* Modal Tambah/Create Shift */}
            {(isModalOpen || isCreateShiftModalOpen) && (
                <FormModal 
                    table="jadwal" 
                    type="create"
                    onCreated={handleJadwalCreated}
                    onUpdated={() => {}}
                    onDeleted={() => {}}
                    renderTrigger={false}
                    initialOpen={true}
                    onAfterClose={() => {
                        setIsModalOpen(false);
                        setIsCreateShiftModalOpen(false);
                    }}
                />
            )}

            {/* Enhanced Manual Add Modal */}
            <EnhancedManualAddModal
                isOpen={isCreateShiftModalOpen}
                onClose={() => setIsCreateShiftModalOpen(false)}
                users={users}
                onShiftCreated={() => {
                    handleJadwalCreated();
                    setWorkloadRefreshTrigger(prev => prev + 1); // Refresh workload validator
                }}
            />

            {/* Modal Auto Schedule AI */}
            {isAutoScheduleModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Brain className="w-6 h-6 text-purple-600" />
                                    <h2 className="text-xl font-semibold">AI Auto Schedule - Hybrid Algorithm</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAutoScheduleModalOpen(false);
                                        setAutoScheduleResult(null);
                                        setAutoScheduleError(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            AI Auto Schedule Information
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>Buat jadwal shift optimal otomatis menggunakan algoritma AI Hybrid (Greedy + Backtracking).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Auto Schedule Form */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800">Konfigurasi Auto Schedule</h3>
                                
                                {/* Auto Schedule Requests */}
                                <div className="space-y-4">
                                    {autoScheduleRequests.map((request, index) => (
                                        <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-700">Request #{index + 1}</h4>
                                                {autoScheduleRequests.length > 1 && (
                                                    <button
                                                        onClick={() => removeAutoScheduleRequest(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                                    <input
                                                        type="date"
                                                        value={request.date}
                                                        onChange={(e) => updateAutoScheduleRequest(index, 'date', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                                                    <select
                                                        value={request.location}
                                                        onChange={(e) => updateAutoScheduleRequest(index, 'location', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        {locations.map(location => (
                                                            <option key={location} value={location}>{location}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Shift</label>
                                                    <select
                                                        value={request.shiftType}
                                                        onChange={(e) => updateAutoScheduleRequest(index, 'shiftType', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        {shiftTypes.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Staff</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        value={request.requiredCount}
                                                        onChange={(e) => updateAutoScheduleRequest(index, 'requiredCount', parseInt(e.target.value))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                                                    <select
                                                        value={request.priority}
                                                        onChange={(e) => updateAutoScheduleRequest(index, 'priority', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        {priorities.map(priority => (
                                                            <option key={priority} value={priority}>
                                                                {priority}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Preferensi</label>
                                                    <select
                                                        value={request.preferredRoles[0] || ''}
                                                        onChange={(e) => updateAutoScheduleRequest(index, 'preferredRoles', [e.target.value])}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        {roles.map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Request Button */}
                                <button
                                    onClick={addAutoScheduleRequest}
                                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
                                >
                                    + Tambah Request Jadwal
                                </button>

                                {/* Error Display */}
                                {autoScheduleError && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center text-red-800">
                                            <AlertTriangle className="w-5 h-5 mr-2" />
                                            <span className="font-medium">Error:</span>
                                        </div>
                                        <p className="text-red-700 mt-1">{autoScheduleError}</p>
                                    </div>
                                )}

                                {/* Success Result */}
                                {autoScheduleResult && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center text-green-800">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            <span className="font-medium">
                                                Jadwal berhasil dibuat! Halaman akan dimuat ulang untuk menampilkan jadwal baru.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setIsAutoScheduleModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={executeAutoScheduling}
                                    disabled={isAutoScheduling}
                                    className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isAutoScheduling ? (
                                        <>
                                            <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                            Membuat Jadwal...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="w-4 h-4 mr-2" />
                                            Buat Jadwal AI
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Swap Requests */}
            {showSwapRequests && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <RefreshCw className="w-6 h-6 text-orange-600" />
                                    <h2 className="text-xl font-semibold">Kelola Permintaan Tukar Shift</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowSwapRequests(false);
                                        setSwapShiftEmployeeId(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-orange-800">
                                            Swap Request Management
                                        </h3>
                                        <div className="mt-2 text-sm text-orange-700">
                                            <p>Kelola permintaan tukar shift dari pegawai. Anda dapat menyetujui atau menolak permintaan.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Placeholder content - you can replace this with actual swap request data */}
                                <div className="text-center py-8">
                                    <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">Belum ada permintaan tukar shift</p>
                                    <p className="text-sm text-gray-400">
                                        Permintaan tukar shift dari pegawai akan muncul di sini
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowSwapRequests(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            <NotificationModal
                isOpen={showNotification}
                onClose={() => setShowNotification(false)}
                notification={notificationData}
            />
            </div>
        </div>
    );
};

// Export the ManagemenJadwalPage component as the default export
export default ManagemenJadwalPage;
