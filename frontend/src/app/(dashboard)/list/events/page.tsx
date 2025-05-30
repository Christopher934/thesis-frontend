'use client'

import Pagination from '@/component/Pagination'
import TableSearch from '@/component/TableSearch'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import FormModal from '@/component/FormModal'

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

    if (!role) return null // bisa diganti spinner jika perlu

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Daftar Event / Kegiatan</h1>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                        {role === 'admin' && (
                            <FormModal table="jadwal" type="create" />
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4 w-full mt-4">
                {events.map((event) => (
                    <div key={event.id} className="border rounded-md p-4 shadow-sm bg-white">
                        <h2 className="text-lg font-bold">{event.judul}</h2>
                        <p className="text-sm text-gray-600">{new Date(event.tanggal).toLocaleDateString('id-ID')}</p>
                        <p className="mt-1 text-gray-700">{event.deskripsi}</p>
                        <p className="mt-1 text-sm text-gray-500">Lokasi: {event.lokasi}</p>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <Pagination />
        </div>
    )
}
