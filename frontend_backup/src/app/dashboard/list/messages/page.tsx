'use client';

import Pagination from "@/components/common/Pagination";
import TableSearch from "@/components/common/TableSearch";
import Table from "@/components/common/Table";
import Image from "next/image";
import FilterButton from "@/components/common/FilterButton";
import SortButton from "@/components/common/SortButton";
import { useState, useMemo } from "react";
import FormModal from "@/components/common/FormModal";

// Sample data for messages (replace with API call when backend is implemented)
const messagesData = [
    {
        id: 1,
        sender: "dr. Ana",
        recipient: "Semua Staf",
        subject: "Rapat Koordinasi Minggu Ini",
        message: "Diberitahukan kepada seluruh staf bahwa akan diadakan rapat koordinasi pada hari Jumat, 6 Juni 2025 pukul 10:00 WIB di Ruang Rapat Utama.",
        date: "2025-06-02",
        status: "UNREAD",
        priority: "HIGH"
    },
    {
        id: 2,
        sender: "Admin Sistem",
        recipient: "Semua Pengguna",
        subject: "Pembaruan Sistem Shift",
        message: "Sistem manajemen shift telah diperbarui dengan fitur baru untuk pengajuan tukar shift. Silakan cek panduan penggunaan di portal internal.",
        date: "2025-06-01",
        status: "READ",
        priority: "MEDIUM"
    },
    {
        id: 3,
        sender: "dr. Budi",
        recipient: "dr. Ana",
        subject: "Diskusi Kasus Pasien",
        message: "Mohon waktu untuk berdiskusi mengenai kasus pasien di ruang 302. Kapan Anda memiliki waktu luang?",
        date: "2025-05-30",
        status: "READ",
        priority: "HIGH"
    },
];

const columns = [
    { headers: "Pengirim", accessor: "sender" },
    { headers: "Subjek", accessor: "subject" },
    { headers: "Tanggal", accessor: "date", className: "hidden md:table-cell" },
    { headers: "Status", accessor: "status" },
    { headers: "Prioritas", accessor: "priority", className: "hidden md:table-cell" },
    { headers: "Action", accessor: "action" },
];

const MessagesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [sortValue, setSortValue] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Filter options
    const filterOptions = [
        { label: "Semua Pesan", value: "" },
        { label: "Belum Dibaca", value: "UNREAD" },
        { label: "Sudah Dibaca", value: "READ" },
        { label: "Prioritas Tinggi", value: "HIGH_PRIORITY" },
    ];
    
    // Sort options
    const sortOptions = [
        { label: "Tanggal", value: "date" },
        { label: "Pengirim", value: "sender" },
        { label: "Subjek", value: "subject" },
        { label: "Prioritas", value: "priority" },
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
        let result = [...messagesData];
        
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(item => 
                item.sender.toLowerCase().includes(searchLower) ||
                item.subject.toLowerCase().includes(searchLower) ||
                item.message.toLowerCase().includes(searchLower) ||
                item.recipient.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply status/priority filter
        if (filterValue) {
            if (filterValue === 'UNREAD' || filterValue === 'READ') {
                result = result.filter(item => item.status === filterValue);
            } else if (filterValue === 'HIGH_PRIORITY') {
                result = result.filter(item => item.priority === 'HIGH');
            }
        }
        
        // Apply sorting
        if (sortValue) {
            result.sort((a, b) => {
                let valueA = a[sortValue as keyof typeof a];
                let valueB = b[sortValue as keyof typeof b];
                
                if (sortValue === 'date') {
                    // Sort dates
                    valueA = new Date(valueA as string).getTime();
                    valueB = new Date(valueB as string).getTime();
                    
                    if (sortDirection === 'asc') {
                        return valueA - valueB;
                    } else {
                        return valueB - valueA;
                    }
                } else if (typeof valueA === 'string' && typeof valueB === 'string') {
                    // For string values, use locale compare
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

    // Format display date
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Render status badge
    const renderStatusBadge = (status: string) => {
        const bgColor = status === 'UNREAD' 
            ? 'bg-hospitalBlueLight text-hospitalBlueDark' 
            : 'bg-gray-100 text-gray-800';
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                {status === 'UNREAD' ? 'Belum Dibaca' : 'Sudah Dibaca'}
            </span>
        );
    };

    // Render priority badge
    const renderPriorityBadge = (priority: string) => {
        let bgColor = 'bg-gray-100 text-gray-800';
        let label = 'Normal';
        
        if (priority === 'HIGH') {
            bgColor = 'bg-red-100 text-red-800';
            label = 'Tinggi';
        } else if (priority === 'MEDIUM') {
            bgColor = 'bg-yellow-100 text-yellow-800';
            label = 'Sedang';
        } else if (priority === 'LOW') {
            bgColor = 'bg-green-100 text-green-800';
            label = 'Rendah';
        }
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                {label}
            </span>
        );
    };

    const renderRow = (item: any) => {
        return (
            <tr
                key={item.id}
                className={`border-b border-gray-500 hover:bg-gray-50 transition-colors ${
                    item.status === 'UNREAD' ? 'font-semibold bg-hospitalBlueLight/30' : 'even:bg-slate-50'
                }`}
            >
                <td className="p-4">{item.sender}</td>
                <td>{item.subject}</td>
                <td className="hidden md:table-cell">{formatDate(item.date)}</td>
                <td>{renderStatusBadge(item.status)}</td>
                <td className="hidden md:table-cell">{renderPriorityBadge(item.priority)}</td>
                <td>
                    <div className="flex items-center gap-2">
                        <button className="p-1 rounded hover:bg-blue-100">
                            <Image src="/view.png" alt="View" width={16} height={16} />
                        </button>
                        <button className="p-1 rounded hover:bg-red-100">
                            <Image src="/delete.png" alt="Delete" width={16} height={16} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Pesan & Notifikasi</h1>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <TableSearch 
                        placeholder="Cari pesan..." 
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
                        <button className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all">
                            <Image src="/create.png" alt="New Message" width={14} height={14} />
                        </button>
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

export default MessagesPage;