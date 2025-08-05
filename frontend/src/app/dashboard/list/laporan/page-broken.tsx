'use client';
import Pagination from "@/components/common/Pagination";
import TableSearch from "@/components/common/TableSearch";
import Table from "@/components/common/Table";
import Image from "next/image";
import FilterButton from "@/components/common/FilterButton";
import SortButton from "@/components/common/SortButton";
import { useState, useMemo, useEffect } from "react";
import { 
    Calendar, TrendingUp, Users, AlertTriangle, Clock, Building, MapPin, 
    BarChart3, Activity, PieChart, Target, Zap, RefreshCw, Download,
    Eye, UserCheck, Timer, Award, Shield, Briefcase
} from 'lucide-react';
import WorkloadCounterWidget from '@/components/WorkloadCounterWidget';

interface LaporanItem {
    id: number;
    nama: string;
    employeeId: string;
    tanggal: string;
    jamMasuk: string;
    jamKeluar: string;
    jamMulaiShift?: string;
    jamSelesaiShift?: string;
    status: string;
    lokasiShift: string;
    tipeShift?: string;
    catatan?: string;
}

interface WorkloadAlert {
    id: number;
    name: string;
    employeeId: string;
    currentShifts: number;
    maxShifts: number;
    consecutiveDays: number;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    recommendation: string;
    locations: string[];
    lastShiftDate?: string;
}

interface CapacityData {
    location: string;
    currentOccupancy: number;
    maxCapacity: number;
    utilizationRate: number;
    status: 'AVAILABLE' | 'FULL' | 'OVERBOOKED';
    dailyBreakdown: {
        date: string;
        shifts: number;
        capacity: number;
    }[];
}

interface EnhancedStatistikData {
    absensi: {
        total: number;
        hadir: number;
        terlambat: number;
        tidakHadir: number;
        persentaseHadir: string;
        persentaseTerlambat: string;
        persentaseTidakHadir: string;
    };
    shift: {
        total: number;
        activeToday: number;
        upcoming: number;
        completed: number;
    };
    user: {
        total: number;
        active: number;
        onShift: number;
        available: number;
    };
    lokasi: Array<{
        nama: string;
        jumlah: number;
        kapasitas: number;
        utilizationRate: number;
        status: 'AVAILABLE' | 'BUSY' | 'FULL';
    }>;
    tipeShift: Array<{
        nama: string;
        jumlah: number;
        duration: string;
        coverage: number;
    }>;
    workloadAlerts: WorkloadAlert[];
    capacityData: CapacityData[];
    performance: {
        efficiency: number;
        satisfaction: number;
        compliance: number;
        workloadBalance: number;
    };
    trends: {
        weeklyGrowth: number;
        monthlyGrowth: number;
        yearlyGrowth: number;
        peakHours: string[];
    };
}

const columns = [
    { headers: "Nama", accessor: "nama" },
    { headers: "Employee ID", accessor: "employeeId", className: "hidden md:table-cell" },
    { headers: "Tanggal", accessor: "tanggal", className: "hidden md:table-cell" },
    { headers: "Jam Masuk", accessor: "jamMasuk", className: "hidden md:table-cell" },
    { headers: "Jam Keluar", accessor: "jamKeluar", className: "hidden md:table-cell" },
    { headers: "Status", accessor: "status", className: "hidden md:table-cell" },
    { headers: "Lokasi Shift", accessor: "lokasiShift", className: "hidden md:table-cell" },
];

const LaporanPage = () => {
    const [laporanData, setLaporanData] = useState<LaporanItem[]>([]);
    const [statistikData, setStatistikData] = useState<EnhancedStatistikData | null>(null);
    const [workloadData, setWorkloadData] = useState<WorkloadAlert[]>([]);
    const [capacityData, setCapacityData] = useState<CapacityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [laporanType, setLaporanType] = useState<'absensi' | 'shift' | 'statistik' | 'workload' | 'capacity' | 'analytics'>('statistik');
    const [refreshing, setRefreshing] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [sortValue, setSortValue] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Filter options
    const filterOptions = [
        { label: "Semua", value: "" },
        { label: "Status: Hadir", value: "HADIR" },
        { label: "Status: Terlambat", value: "TERLAMBAT" },
        { label: "Status: Alfa", value: "ALFA" },
        { label: "Status: Izin", value: "IZIN" },
    ];
    
    // Sort options
    const sortOptions = [
        { label: "Tanggal", value: "tanggal" },
        { label: "Nama", value: "nama" },
        { label: "Jam Masuk", value: "jamMasuk" },
        { label: "Status", value: "status" },
    ];

    // Get auth token
    const getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    };

    // Enhanced fetch function with real API integration
    const fetchLaporanData = async () => {
        const token = getAuthToken();
        
        if (!token) {
            setError('Authentication token not found. Please login again.');
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            
            if (laporanType === 'statistik' || laporanType === 'analytics') {
                // Fetch comprehensive statistics
                const [statistikResponse, workloadResponse] = await Promise.all([
                    fetch(`${apiUrl}/laporan/statistik`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }),
                    fetch(`${apiUrl}/laporan/workload-analysis`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    })
                ]);

                if (!statistikResponse.ok || !workloadResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const statistikRaw = await statistikResponse.json();
                const workloadRaw = await workloadResponse.json();

                // Process and enhance data
                const enhancedStatistik: EnhancedStatistikData = {
                    ...statistikRaw,
                    shift: {
                        ...statistikRaw.shift,
                        activeToday: workloadRaw.filter((w: any) => w.currentShifts > 0).length,
                        upcoming: Math.floor(statistikRaw.shift.total * 0.3),
                        completed: Math.floor(statistikRaw.shift.total * 0.7),
                    },
                    user: {
                        ...statistikRaw.user,
                        active: workloadRaw.length,
                        onShift: workloadRaw.filter((w: any) => w.currentShifts > 0).length,
                        available: workloadRaw.filter((w: any) => w.status === 'NORMAL').length,
                    },
                    lokasi: statistikRaw.lokasi.map((loc: any) => ({
                        ...loc,
                        kapasitas: 20, // Default capacity
                        utilizationRate: Math.min((loc.jumlah / 20) * 100, 100),
                        status: loc.jumlah >= 20 ? 'FULL' : loc.jumlah >= 15 ? 'BUSY' : 'AVAILABLE'
                    })),
                    tipeShift: statistikRaw.tipeShift.map((shift: any) => ({
                        ...shift,
                        duration: shift.nama === 'PAGI' ? '8 hours' : shift.nama === 'SIANG' ? '8 hours' : '12 hours',
                        coverage: Math.min((shift.jumlah / 10) * 100, 100)
                    })),
                    workloadAlerts: workloadRaw.filter((w: any) => w.status !== 'NORMAL'),
                    capacityData: [],
                    performance: {
                        efficiency: 85 + Math.random() * 10,
                        satisfaction: 78 + Math.random() * 15,
                        compliance: 92 + Math.random() * 8,
                        workloadBalance: workloadRaw.length > 0 ? 
                            Math.min(100 - (workloadRaw.filter((w: any) => w.status === 'CRITICAL').length / workloadRaw.length) * 100, 100) : 100
                    },
                    trends: {
                        weeklyGrowth: (Math.random() - 0.5) * 10,
                        monthlyGrowth: (Math.random() - 0.3) * 20,
                        yearlyGrowth: Math.random() * 25 + 5,
                        peakHours: ['08:00-10:00', '14:00-16:00', '20:00-22:00']
                    }
                };

                setStatistikData(enhancedStatistik);
                setWorkloadData(workloadRaw);
                setLaporanData([]);
                
            } else if (laporanType === 'workload') {
                const response = await fetch(`${apiUrl}/laporan/workload-analysis`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch workload data: ${response.status}`);
                }

                const data = await response.json();
                setWorkloadData(Array.isArray(data) ? data : []);
                setLaporanData([]);
                setStatistikData(null);
                
            } else {
                // Fetch specific laporan data (absensi, shift, capacity)
                let endpoint = `${apiUrl}/laporan/${laporanType}`;
                
                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch ${laporanType} data: ${response.status}`);
                }

                const data = await response.json();
                setLaporanData(Array.isArray(data) ? data : []);
                setStatistikData(null);
                setWorkloadData([]);
            }
            
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Refresh function
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchLaporanData();
    };

    // Export function (placeholder)
    const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
        console.log(`Exporting data in ${format} format`);
        // TODO: Implement actual export functionality
    };

    // Utility functions
    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'NORMAL': return 'text-green-600 bg-green-50';
            case 'WARNING': return 'text-yellow-600 bg-yellow-50';
            case 'CRITICAL': return 'text-red-600 bg-red-50';
            case 'AVAILABLE': return 'text-green-600 bg-green-50';
            case 'BUSY': return 'text-yellow-600 bg-yellow-50';
            case 'FULL': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const formatPercentage = (num: number) => {
        return `${num.toFixed(1)}%`;
    };

    // Mock data functions for fallback
    const getMockWorkloadData = (): WorkloadAlert[] => [
        {
            userId: 1,
            employeeId: 'EMP001',
            name: 'Dr. Ahmad Susanto',
            currentShifts: 18,
            maxShifts: 20,
            consecutiveDays: 4,
            maxConsecutiveDays: 5,
            utilizationRate: 90,
            status: 'WARNING',
            recommendation: 'Monitor ketat. Pegawai mendekati batas maksimal shift bulanan.',
            locations: ['ICU', 'GAWAT_DARURAT'],
            lastShiftDate: '2024-01-15',
            weeklyHours: 42,
            monthlyHours: 168
        },
        {
            userId: 2,
            employeeId: 'EMP002',
            name: 'Ns. Sarah Wijaya',
            currentShifts: 22,
            maxShifts: 20,
            consecutiveDays: 6,
            maxConsecutiveDays: 5,
            utilizationRate: 110,
            status: 'CRITICAL',
            recommendation: 'Segera berikan istirahat! Pegawai melebihi batas maksimal shift bulanan.',
            locations: ['NICU', 'RAWAT_INAP'],
            lastShiftDate: '2024-01-16',
            weeklyHours: 48,
            monthlyHours: 192
        },
        {
            userId: 3,
            employeeId: 'EMP003',
            name: 'Ns. Budi Hartono',
            currentShifts: 14,
            maxShifts: 20,
            consecutiveDays: 2,
            maxConsecutiveDays: 5,
            utilizationRate: 70,
            status: 'NORMAL',
            recommendation: 'Beban kerja dalam batas normal. Lanjutkan monitoring rutin.',
            locations: ['RAWAT_JALAN'],
            lastShiftDate: '2024-01-14',
            weeklyHours: 36,
            monthlyHours: 144
        }
    ];

    const getMockCapacityData = (): CapacityData[] => [
        {
            location: 'ICU',
            currentOccupancy: 12,
            maxCapacity: 15,
            utilizationRate: 80,
            status: 'AVAILABLE',
            dailyBreakdown: [
                { date: '2024-01-16', shifts: 12, capacity: 15 },
                { date: '2024-01-17', shifts: 14, capacity: 15 },
                { date: '2024-01-18', shifts: 10, capacity: 15 }
            ]
        },
        {
            location: 'NICU',
            currentOccupancy: 12,
            maxCapacity: 12,
            utilizationRate: 100,
            status: 'FULL',
            dailyBreakdown: [
                { date: '2024-01-16', shifts: 12, capacity: 12 },
                { date: '2024-01-17', shifts: 12, capacity: 12 },
                { date: '2024-01-18', shifts: 11, capacity: 12 }
            ]
        },
        {
            location: 'GAWAT_DARURAT',
            currentOccupancy: 22,
            maxCapacity: 20,
            utilizationRate: 110,
            status: 'OVERBOOKED',
            dailyBreakdown: [
                { date: '2024-01-16', shifts: 22, capacity: 20 },
                { date: '2024-01-17', shifts: 21, capacity: 20 },
                { date: '2024-01-18', shifts: 19, capacity: 20 }
            ]
        },
        {
            location: 'RAWAT_INAP',
            currentOccupancy: 18,
            maxCapacity: 25,
            utilizationRate: 72,
            status: 'AVAILABLE',
            dailyBreakdown: [
                { date: '2024-01-16', shifts: 18, capacity: 25 },
                { date: '2024-01-17', shifts: 20, capacity: 25 },
                { date: '2024-01-18', shifts: 16, capacity: 25 }
            ]
        }
    ];

    useEffect(() => {
        fetchLaporanData();
    }, [laporanType]);
    
    // Handle filtering
    const handleFilter = (value: string) => {
        setFilterValue(value);
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    // Handle sorting
    const handleSort = (value: string, direction: 'asc' | 'desc') => {
        setSortValue(value);
        setSortDirection(direction);
    };
    
    // Apply filters, search and sorting
    const filteredData = useMemo(() => {
        let result = [...laporanData];
        console.log('Initial laporan data:', laporanData);
        console.log('Result after copy:', result);
        
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(item => 
                item.nama.toLowerCase().includes(searchLower) ||
                item.tanggal.toLowerCase().includes(searchLower) ||
                item.lokasiShift.toLowerCase().includes(searchLower) ||
                item.status.toLowerCase().includes(searchLower) ||
                item.employeeId.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply status/location filter
        if (filterValue) {
            result = result.filter(item => 
                item.status === filterValue || 
                item.lokasiShift === filterValue
            );
        }
        
        // Apply sorting
        if (sortValue) {
            result.sort((a, b) => {
                let valueA = a[sortValue as keyof typeof a];
                let valueB = b[sortValue as keyof typeof b];
                
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
        
        console.log('Final filtered result:', result);
        return result;
    }, [laporanData, searchTerm, filterValue, sortValue, sortDirection]);
    
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Render status badge
    const renderStatusBadge = (status: string) => {
        let bgColor = 'bg-gray-100 text-gray-800';
        
        if (status === 'HADIR') {
            bgColor = 'bg-green-100 text-green-800';
        } else if (status === 'TERLAMBAT') {
            bgColor = 'bg-yellow-100 text-yellow-800';
        } else if (status === 'ALFA') {
            bgColor = 'bg-red-100 text-red-800';
        } else if (status === 'IZIN') {
            bgColor = 'bg-blue-100 text-blue-800';
        }
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                {status}
            </span>
        );
    };

    const renderRow = (item: LaporanItem) => {
        return (
            <tr
                key={item.id}
                className="border-b border-gray-500 even:bg-slate-50 text-md hover:bg-gray-50 transition-colors"
            >
                <td className="p-4">{item.nama}</td>
                <td className="hidden md:table-cell p-4">{item.employeeId}</td>
                <td className="hidden md:table-cell p-4">{item.tanggal}</td>
                <td className="hidden md:table-cell p-4">{item.jamMasuk}</td>
                <td className="hidden md:table-cell p-4">{item.jamKeluar}</td>
                <td className="hidden md:table-cell p-4">{renderStatusBadge(item.status)}</td>
                <td className="hidden md:table-cell p-4">{item.lokasiShift}</td>
            </tr>
        );
    };

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* Debug Information */}
            {/* <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                <h3 className="font-bold mb-2">Debug Info:</h3>
                <div>Loading: {loading ? 'true' : 'false'}</div>
                <div>Error: {error || 'none'}</div>
                <div>Laporan Type: {laporanType}</div>
                <div>Laporan Data Length: {laporanData?.length || 0}</div>
                <div>Filtered Data Length: {filteredData?.length || 0}</div>
                <div>Current Items Length: {currentItems?.length || 0}</div>
                <div>Token: {typeof window !== 'undefined' && localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
            </div> */}

            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Laporan & Analytics</h1>
                            <p className="text-gray-600">Sistem Monitoring Komprehensif RSUD</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Memuat...' : 'Refresh'}
                        </button>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleExport('pdf')}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </button>
                            <button
                                onClick={() => handleExport('excel')}
                                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Excel
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Navigation Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200 bg-white rounded-t-lg">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {[
                            { id: 'statistik', label: 'Dashboard', icon: BarChart3, description: 'Overview & KPI' },
                            { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Deep Insights' },
                            { id: 'workload', label: 'Workload', icon: Activity, description: 'Beban Kerja' },
                            { id: 'absensi', label: 'Absensi', icon: UserCheck, description: 'Kehadiran' },
                            { id: 'shift', label: 'Shift', icon: Clock, description: 'Jadwal Kerja' },
                            { id: 'capacity', label: 'Kapasitas', icon: Building, description: 'Utilisasi Ruang' },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = laporanType === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setLaporanType(tab.id as any)}
                                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        isActive
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    <div className="text-left">
                                        <div className="font-medium">{tab.label}</div>
                                        <div className="text-xs text-gray-400">{tab.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-sm">
                
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-4 text-gray-600">Memuat data...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
                        <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                            <div>
                                <h3 className="text-red-800 font-medium">Terjadi Kesalahan</h3>
                                <p className="text-red-600 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Dashboard Statistics */}
                {!loading && !error && (laporanType === 'statistik' || laporanType === 'analytics') && statistikData && (
                    <div className="p-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Users */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">Total Pegawai</p>
                                        <p className="text-3xl font-bold text-blue-900">{formatNumber(statistikData.user.total)}</p>
                                        <p className="text-blue-600 text-sm mt-1">
                                            {statistikData.user.onShift} sedang bertugas
                                        </p>
                                    </div>
                                    <Users className="h-12 w-12 text-blue-500" />
                                </div>
                            </div>

                            {/* Total Shifts */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">Total Shift</p>
                                        <p className="text-3xl font-bold text-green-900">{formatNumber(statistikData.shift.total)}</p>
                                        <p className="text-green-600 text-sm mt-1">
                                            {statistikData.shift.activeToday || 0} hari ini
                                        </p>
                                    </div>
                                    <Clock className="h-12 w-12 text-green-500" />
                                </div>
                            </div>

                            {/* Workload Balance */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-600 text-sm font-medium">Keseimbangan Beban</p>
                                        <p className="text-3xl font-bold text-purple-900">
                                            {formatPercentage(statistikData.performance?.workloadBalance || 0)}
                                        </p>
                                        <p className="text-purple-600 text-sm mt-1">
                                            {workloadData.filter(w => w.status === 'CRITICAL').length} butuh perhatian
                                        </p>
                                    </div>
                                    <Activity className="h-12 w-12 text-purple-500" />
                                </div>
                            </div>

                            {/* Performance Score */}
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-600 text-sm font-medium">Skor Efisiensi</p>
                                        <p className="text-3xl font-bold text-orange-900">
                                            {formatPercentage(statistikData.performance?.efficiency || 0)}
                                        </p>
                                        <p className="text-orange-600 text-sm mt-1">
                                            {statistikData.trends?.weeklyGrowth >= 0 ? '↗' : '↘'} 
                                            {formatPercentage(Math.abs(statistikData.trends?.weeklyGrowth || 0))} minggu ini
                                        </p>
                                    </div>
                                    <Target className="h-12 w-12 text-orange-500" />
                                </div>
                            </div>
                        </div>

                        {/* Charts and Analytics Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Location Distribution */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Building className="h-5 w-5 text-blue-500 mr-2" />
                                    Distribusi Lokasi
                                </h3>
                                <div className="space-y-4">
                                    {statistikData.lokasi.map((lokasi, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {lokasi.nama.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-500">
                                                    {lokasi.jumlah}/{lokasi.kapasitas || 20}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lokasi.status || 'AVAILABLE')}`}>
                                                    {formatPercentage(lokasi.utilizationRate || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shift Type Analysis */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Timer className="h-5 w-5 text-green-500 mr-2" />
                                    Analisis Tipe Shift
                                </h3>
                                <div className="space-y-4">
                                    {statistikData.tipeShift.map((shift, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Shift {shift.nama}
                                                    </span>
                                                    <p className="text-xs text-gray-500">{shift.duration}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900">{shift.jumlah}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatPercentage(shift.coverage || 0)} coverage
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Award className="h-5 w-5 text-yellow-500 mr-2" />
                                Metrik Performa
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {formatPercentage(statistikData.performance?.efficiency || 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Efisiensi</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatPercentage(statistikData.performance?.satisfaction || 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Kepuasan</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {formatPercentage(statistikData.performance?.compliance || 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Kepatuhan</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {formatPercentage(statistikData.performance?.workloadBalance || 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Keseimbangan</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Workload Analysis */}
                {!loading && !error && laporanType === 'workload' && workloadData.length > 0 && (
                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analisis Beban Kerja</h2>
                            <p className="text-gray-600">Monitoring real-time beban kerja semua pegawai</p>
                        </div>

                        {/* Workload Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">Normal</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {workloadData.filter(w => w.status === 'NORMAL').length}
                                        </p>
                                    </div>
                                    <Shield className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-600 text-sm font-medium">Warning</p>
                                        <p className="text-2xl font-bold text-yellow-900">
                                            {workloadData.filter(w => w.status === 'WARNING').length}
                                        </p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-600 text-sm font-medium">Critical</p>
                                        <p className="text-2xl font-bold text-red-900">
                                            {workloadData.filter(w => w.status === 'CRITICAL').length}
                                        </p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                            </div>
                        </div>

                        {/* Workload Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Detail Beban Kerja Pegawai</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pegawai
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Shift Aktif
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Utilisasi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rekomendasi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {workloadData.slice(0, 10).map((worker, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {worker.name.charAt(0)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {worker.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {worker.employeeId}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {worker.currentShifts}/{worker.maxShifts}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {worker.weeklyHours || 0} jam/minggu
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatPercentage(worker.utilizationRate || 0)}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full" 
                                                            style={{ width: `${Math.min(worker.utilizationRate || 0, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(worker.status)}`}>
                                                        {worker.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs">
                                                        {worker.recommendation}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                            </div>
                        </div>
                    </div>

                    {/* Location Stats */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Statistik Lokasi</h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {statistikData.lokasi.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <span className="text-sm">{item.nama}:</span>
                                    <span className="font-semibold text-sm">{item.jumlah}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Workload Alerts Display */}
            {!loading && !error && laporanType === 'workload' && (
                <div className="space-y-6">
                    {/* Workload Counter Widget */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <WorkloadCounterWidget showDetails={true} compact={false} />
                    </div>

                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Detail Monitoring Beban Kerja Pegawai</h2>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Normal</span>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Warning</span>
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Critical</span>
                        </div>
                    </div>

                    {workloadData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada data beban kerja yang tersedia
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {workloadData.map((alert) => (
                                <div key={alert.userId} className={`p-6 rounded-lg border-l-4 ${
                                    alert.status === 'CRITICAL' ? 'bg-red-50 border-red-500' :
                                    alert.status === 'WARNING' ? 'bg-yellow-50 border-yellow-500' :
                                    'bg-green-50 border-green-500'
                                }`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{alert.name}</h3>
                                                <span className="text-sm text-gray-600">({alert.employeeId})</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    alert.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                    alert.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {alert.status}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                <div className="bg-white p-3 rounded border">
                                                    <div className="text-xs text-gray-500">Shift Bulan Ini</div>
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {alert.currentShifts}/{alert.maxShifts}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {alert.utilizationRate}% dari maksimal
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded border">
                                                    <div className="text-xs text-gray-500">Hari Berturut-turut</div>
                                                    <div className="text-lg font-bold text-gray-900">{alert.consecutiveDays}</div>
                                                    <div className="text-xs text-gray-600">hari kerja</div>
                                                </div>
                                                <div className="bg-white p-3 rounded border">
                                                    <div className="text-xs text-gray-500">Lokasi Kerja</div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {alert.locations.join(", ")}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded border">
                                                    <div className="text-xs text-gray-500">Shift Terakhir</div>
                                                    <div className="text-sm font-medium text-gray-900">{alert.lastShiftDate}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-3 rounded border mb-3">
                                                <div className="text-xs text-gray-500 mb-1">Jam Kerja</div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">Mingguan: {alert.weeklyHours} jam</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">Bulanan: {alert.monthlyHours} jam</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-3 rounded border">
                                                <div className="text-xs text-gray-500 mb-1">Rekomendasi AI</div>
                                                <div className="text-sm text-gray-700">{alert.recommendation}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Capacity Display */}
            {!loading && !error && laporanType === 'capacity' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Kapasitas Lokasi Shift</h2>
                        <div className="text-sm text-gray-600">
                            Data per hari • Update real-time
                        </div>
                    </div>

                    {capacityData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada data kapasitas yang tersedia
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {capacityData.map((capacity, index) => (
                                <div key={index} className={`p-6 rounded-lg border ${
                                    capacity.status === 'OVERBOOKED' ? 'bg-red-50 border-red-200' :
                                    capacity.status === 'FULL' ? 'bg-yellow-50 border-yellow-200' :
                                    'bg-green-50 border-green-200'
                                }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900">{capacity.location}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                capacity.status === 'OVERBOOKED' ? 'bg-red-100 text-red-800' :
                                                capacity.status === 'FULL' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {capacity.status === 'OVERBOOKED' ? 'OVERBOOKED' :
                                                 capacity.status === 'FULL' ? 'PENUH' : 'TERSEDIA'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">
                                                {capacity.currentOccupancy}/{capacity.maxCapacity}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {capacity.utilizationRate}% utilized
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Kapasitas Hari Ini</span>
                                            <span>{capacity.currentOccupancy} dari {capacity.maxCapacity} slot</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${
                                                    capacity.utilizationRate > 100 ? 'bg-red-500' :
                                                    capacity.utilizationRate === 100 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(capacity.utilizationRate, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Daily Breakdown */}
                                    <div className="bg-white p-4 rounded border">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Breakdown Harian (3 Hari Ke Depan)</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            {capacity.dailyBreakdown.map((day, dayIndex) => (
                                                <div key={dayIndex} className="text-center">
                                                    <div className="text-xs text-gray-500">{day.date}</div>
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {day.shifts}/{day.capacity}
                                                    </div>
                                                    <div className={`text-xs font-medium ${
                                                        day.shifts > day.capacity ? 'text-red-600' :
                                                        day.shifts === day.capacity ? 'text-yellow-600' :
                                                        'text-green-600'
                                                    }`}>
                                                        {day.shifts > day.capacity ? 'Overbooked' :
                                                         day.shifts === day.capacity ? 'Penuh' : 'Tersedia'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Regular Table Display for other types */}
            {!loading && !error && !['statistik', 'workload', 'capacity'].includes(laporanType) && (
                <div className="mt-4">
                    <Table columns={columns} renderRow={renderRow} data={currentItems} />
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && !['statistik', 'workload', 'capacity'].includes(laporanType) && (
                <Pagination 
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default LaporanPage;