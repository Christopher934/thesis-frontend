'use client'

import Pagination from '@/component/Pagination'
import TableSearch from '@/component/TableSearch'
import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import FormModal from '@/component/FormModal'
import FilterButton from '@/component/FilterButton'
import SortButton from '@/component/SortButton'

interface EventItem {
    id: number
    judul: string
    deskripsi: string
    tanggal: string
    lokasi: string
}

export default function EventPage() {
    const [events, setEvents] = useState<EventItem[]>([])
    const [role, setRole] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterValue, setFilterValue] = useState('')
    const [sortValue, setSortValue] = useState('')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(5) // Adjust based on desired items per page

    // Filter options
    const filterOptions = [
        { label: "Semua Lokasi", value: "" },
        { label: "Ruang Rapat Utama", value: "Ruang Rapat Utama" },
        { label: "Aula RSUD", value: "Aula RSUD" },
        { label: "Ruang Seminar", value: "Ruang Seminar" },
    ]

    // Sort options
    const sortOptions = [
        { label: "Tanggal", value: "tanggal" },
        { label: "Judul", value: "judul" },
        { label: "Lokasi", value: "lokasi" },
    ]

    // Handle filtering
    const handleFilter = (value: string) => {
        setFilterValue(value)
        setCurrentPage(1)
    }

    // Handle sorting
    const handleSort = (value: string, direction: 'asc' | 'desc') => {
        setSortValue(value)
        setSortDirection(direction)
        setCurrentPage(1)
    }

    useEffect(() => {
        const storedRole = localStorage.getItem('role')
        if (storedRole) {
            setRole(storedRole.toLowerCase())
        }

        // Dummy data
        setEvents([
            {
                id: 1,
                judul: 'Rapat Evaluasi Bulanan',
                deskripsi: 'Membahas evaluasi layanan bulan sebelumnya.',
                tanggal: '2025-06-01',
                lokasi: 'Ruang Rapat Utama',
            },
            {
                id: 2,
                judul: 'Pelatihan P3K',
                deskripsi: 'Pelatihan P3K untuk seluruh staf medis dan nonmedis.',
                tanggal: '2025-06-03',
                lokasi: 'Aula RSUD',
            },
        ])
    }, [])

    // Apply filters and sorting
    const filteredEvents = useMemo(() => {
        let result = [...events];
        
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(item => 
                item.judul.toLowerCase().includes(searchLower) ||
                item.deskripsi.toLowerCase().includes(searchLower) ||
                item.lokasi.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply location filter
        if (filterValue) {
            result = result.filter(item => item.lokasi === filterValue);
        }
        
        // Apply sorting
        if (sortValue) {
            result.sort((a, b) => {
                let valueA = a[sortValue as keyof typeof a];
                let valueB = b[sortValue as keyof typeof b];
                
                if (sortValue === 'tanggal') {
                    // Sort dates
                    valueA = new Date(valueA as string).getTime();
                    valueB = new Date(valueB as string).getTime();
                } else if (typeof valueA === 'string' && typeof valueB === 'string') {
                    // For string values, use locale compare
                    if (sortDirection === 'asc') {
                        return valueA.localeCompare(valueB);
                    } else {
                        return valueB.localeCompare(valueA);
                    }
                }
                
                // For numeric values or dates
                if (sortDirection === 'asc') {
                    return (valueA as number) - (valueB as number);
                } else {
                    return (valueB as number) - (valueA as number);
                }
            });
        }
        
        return result;
    }, [events, searchTerm, filterValue, sortValue, sortDirection]);
    
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

    // Move the role check after all hooks are called to avoid rules of hooks violation
    const isLoading = role === null;

    // Show loading state if role is not yet loaded
    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Daftar Event / Kegiatan</h1>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <TableSearch 
                        placeholder="Cari event..." 
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
                        {(role === 'admin' || role === 'supervisor') && (
                            <FormModal 
                                table="jadwal" 
                                type="create"
                                onCreated={() => {}}
                                onUpdated={() => {}}
                                onDeleted={() => {}}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4 w-full mt-4">
                {currentItems.map((event) => (
                    <div key={event.id} className="border rounded-md p-4 shadow-sm bg-white">
                        <h2 className="text-lg font-bold">{event.judul}</h2>
                        <p className="text-sm text-gray-600">{new Date(event.tanggal).toLocaleDateString('id-ID')}</p>
                        <p className="mt-1 text-gray-700">{event.deskripsi}</p>
                        <p className="mt-1 text-sm text-gray-500">Lokasi: {event.lokasi}</p>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <Pagination 
                totalItems={filteredEvents.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
