'use client';
import Pagination from "@/components/common/Pagination";
import TableSearch from "@/components/common/TableSearch";
import Table from "@/components/common/Table";
import Image from "next/image";
import FilterButton from "@/components/common/FilterButton";
import SortButton from "@/components/common/SortButton";
import { useState, useMemo } from "react";

const laporanData = [
    {
        id: 1,
        nama: "dr. Ana",
        tanggal: "Senin, 2 Juni 2025",
        jamMasuk: "07:05",
        jamKeluar: "13:00",
        status: "TERLAMBAT",
        lokasiShift: "Poli Umum"
    },
    {
        id: 2,
        nama: "Bapak Dedi",
        tanggal: "Senin, 2 Juni 2025",
        jamMasuk: "06:50",
        jamKeluar: "19:00",
        status: "HADIR",
        lokasiShift: "IGD"
    },
];

const columns = [
    { headers: "Nama", accessor: "nama" },
    { headers: "Tanggal", accessor: "tanggal", className: "hidden md:table-cell" },
    { headers: "Jam Masuk", accessor: "jamMasuk", className: "hidden md:table-cell" },
    { headers: "Jam Keluar", accessor: "jamKeluar", className: "hidden md:table-cell" },
    { headers: "Status", accessor: "status", className: "hidden md:table-cell" },
    { headers: "Lokasi Shift", accessor: "lokasiShift", className: "hidden md:table-cell" },
];

const LaporanPage = () => {
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
        { label: "Status: Tidak Hadir", value: "TIDAK_HADIR" },
        { label: "Lokasi: Poli Umum", value: "Poli Umum" },
        { label: "Lokasi: IGD", value: "IGD" },
    ];
    
    // Sort options
    const sortOptions = [
        { label: "Tanggal", value: "tanggal" },
        { label: "Nama", value: "nama" },
        { label: "Jam Masuk", value: "jamMasuk" },
        { label: "Status", value: "status" },
    ];
    
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
        
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(item => 
                item.nama.toLowerCase().includes(searchLower) ||
                item.tanggal.toLowerCase().includes(searchLower) ||
                item.lokasiShift.toLowerCase().includes(searchLower) ||
                item.status.toLowerCase().includes(searchLower)
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
        
        return result;
    }, [searchTerm, filterValue, sortValue, sortDirection]);
    
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
        } else if (status === 'TIDAK_HADIR') {
            bgColor = 'bg-red-100 text-red-800';
        }
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                {status}
            </span>
        );
    };

    const renderRow = (item: any) => {
        return (
            <tr
                key={item.id}
                className="border-b border-gray-500 even:bg-slate-50 text-md hover:bg-gray-50 transition-colors"
            >
                <td className="p-4">{item.nama}</td>
                <td className="hidden md:table-cell">{item.tanggal}</td>
                <td className="hidden md:table-cell">{item.jamMasuk}</td>
                <td className="hidden md:table-cell">{item.jamKeluar}</td>
                <td className="hidden md:table-cell">{renderStatusBadge(item.status)}</td>
                <td className="hidden md:table-cell">{item.lokasiShift}</td>
            </tr>
        );
    };

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
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

            <div className="mt-4">
                <Table columns={columns} renderRow={renderRow} data={currentItems} />
            </div>

            <Pagination 
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default LaporanPage;