'use client';
import Pagination from "@/components/common/Pagination";
import TableSearch from "@/components/common/TableSearch";
import Table from "@/components/common/Table";
import Image from "next/image";
import FilterButton from "@/components/common/FilterButton";
import SortButton from "@/components/common/SortButton";
import { useState, useMemo, useEffect } from "react";

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

interface StatistikData {
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
    };
    user: {
        total: number;
    };
    lokasi: Array<{
        nama: string;
        jumlah: number;
    }>;
    tipeShift: Array<{
        nama: string;
        jumlah: number;
    }>;
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
    const [statistikData, setStatistikData] = useState<StatistikData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [laporanType, setLaporanType] = useState<'absensi' | 'shift' | 'statistik'>('absensi');
    
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

    // Fetch laporan data
    const fetchLaporanData = async () => {
        const token = getAuthToken();
        console.log('Token from localStorage:', token);
        
        if (!token) {
            console.error('No token found');
            setError('Authentication token not found. Please login again.');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching data for type:', laporanType);
            const response = await fetch(`/api/laporan?type=${laporanType}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Response error:', errorData);
                throw new Error(`Failed to fetch laporan data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Raw received data:', data);
            console.log('Data type:', typeof data);
            console.log('Data is array:', Array.isArray(data));
            
            if (laporanType === 'statistik') {
                console.log('Setting statistik data');
                setStatistikData(data);
                setLaporanData([]);
            } else {
                console.log('Setting laporan data with length:', data?.length);
                setLaporanData(Array.isArray(data) ? data : []);
                setStatistikData(null);
            }
            
            console.log('Data set successfully');
            
        } catch (error) {
            console.error('Error in fetchLaporanData:', error);
            setError('Gagal mengambil data laporan: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            console.log('Setting loading to false');
            setLoading(false);
        }
    };

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

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold">Laporan & Statistik</h1>
                    <button className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600">
                        Unduh PDF
                    </button>
                    <button className="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600">
                        Unduh Excel
                    </button>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <TableSearch 
                        placeholder="Cari laporan..." 
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
                    </div>
                </div>
            </div>

            {/* Laporan Type Selector */}
            <div className="mb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setLaporanType('absensi')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            laporanType === 'absensi' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Laporan Absensi
                    </button>
                    <button
                        onClick={() => setLaporanType('shift')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            laporanType === 'shift' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Laporan Shift
                    </button>
                    <button
                        onClick={() => setLaporanType('statistik')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            laporanType === 'statistik' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Statistik
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Image src="/close.png" alt="Error" width={20} height={20} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistik Display */}
            {!loading && !error && laporanType === 'statistik' && statistikData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Absensi Stats */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Statistik Absensi</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Absensi:</span>
                                <span className="font-semibold">{statistikData.absensi.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Hadir:</span>
                                <span className="font-semibold text-green-600">{statistikData.absensi.hadir} ({statistikData.absensi.persentaseHadir}%)</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Terlambat:</span>
                                <span className="font-semibold text-yellow-600">{statistikData.absensi.terlambat} ({statistikData.absensi.persentaseTerlambat}%)</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tidak Hadir:</span>
                                <span className="font-semibold text-red-600">{statistikData.absensi.tidakHadir} ({statistikData.absensi.persentaseTidakHadir}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Shift Stats */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Statistik Shift</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Shift:</span>
                                <span className="font-semibold">{statistikData.shift.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Pegawai:</span>
                                <span className="font-semibold">{statistikData.user.total}</span>
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

            {/* Table Display */}
            {!loading && !error && laporanType !== 'statistik' && (
                <div className="mt-4">
                    <Table columns={columns} renderRow={renderRow} data={currentItems} />
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && laporanType !== 'statistik' && (
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