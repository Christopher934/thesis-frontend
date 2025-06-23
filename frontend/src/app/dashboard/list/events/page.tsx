'use client'

import Pagination from '@/components/common/Pagination'
import TableSearch from '@/components/common/TableSearch'
import { useEffect, useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import FormModal from '@/components/common/FormModal'
import FilterButton from '@/components/common/FilterButton'
import SortButton from '@/components/common/SortButton'
import { getApiUrl } from '@/config/api'
import EventForm from '@/components/forms/EventForm'

interface EventItem {
    id: number;
    judul: string;
    deskripsi: string;
    tanggalMulai: string;
    tanggalSelesai?: string;
    lokasi: string;
    jenisKegiatan?: string;
    waktuMulai?: string;
    waktuSelesai?: string;
    kapasitas?: number;
    lokasiDetail?: string;
    penanggungJawab?: string;
    kontak?: string;
    departemen?: string;
    prioritas?: string;
    targetPeserta?: string[];
    anggaran?: number;
    status?: string;
    catatan?: string;
}

export default function EventPage() {
    const [events, setEvents] = useState<EventItem[]>([])
    const [role, setRole] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterValue, setFilterValue] = useState('')
    const [sortValue, setSortValue] = useState('')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(5)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newEvent, setNewEvent] = useState({ judul: '', deskripsi: '', tanggalMulai: '', tanggalSelesai: '', lokasi: '' })

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

    // Fetch events from backend (kegiatan)
    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
            setRole(storedRole.toLowerCase());
        }

        async function fetchEvents() {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const apiUrl = getApiUrl();
                const res = await fetch(`${apiUrl}/events`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                if (!res.ok) throw new Error('Gagal Memuat Data Event');
                const data = await res.json();
                setEvents(
                    data.map((item: any) => ({
                        id: item.id,
                        judul: item.nama,
                        deskripsi: item.deskripsi,
                        tanggalMulai: item.tanggalMulai,
                        tanggalSelesai: item.tanggalSelesai,
                        lokasi: item.lokasi || '',
                        jenisKegiatan: item.jenisKegiatan,
                        waktuMulai: item.waktuMulai,
                        waktuSelesai: item.waktuSelesai,
                        kapasitas: item.kapasitas,
                        lokasiDetail: item.lokasiDetail,
                        penanggungJawab: item.penanggungJawab,
                        kontak: item.kontak,
                        departemen: item.departemen,
                        prioritas: item.prioritas,
                        targetPeserta: item.targetPeserta,
                        anggaran: item.anggaran,
                        status: item.status,
                        catatan: item.catatan,
                    }))
                );
            } catch (e: any) {
                setError(e?.message || 'Gagal Memuat Data Event');
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, [])

    // Apply filters and sorting
    const filteredEvents = useMemo(() => {
        let result = [...events];
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(item => 
                item.judul.toLowerCase().includes(searchLower) ||
                item.deskripsi.toLowerCase().includes(searchLower) ||
                item.lokasi.toLowerCase().includes(searchLower)
            );
        }
        if (filterValue) {
            result = result.filter(item => item.lokasi === filterValue);
        }
        if (sortValue) {
            result.sort((a, b) => {
                let valueA = a[sortValue as keyof typeof a];
                let valueB = b[sortValue as keyof typeof b];
                if (sortValue === 'tanggal') {
                    valueA = new Date(valueA as string).getTime();
                    valueB = new Date(valueB as string).getTime();
                } else if (typeof valueA === 'string' && typeof valueB === 'string') {
                    if (sortDirection === 'asc') {
                        return valueA.localeCompare(valueB);
                    } else {
                        return valueB.localeCompare(valueA);
                    }
                }
                if (sortDirection === 'asc') {
                    return (valueA as number) - (valueB as number);
                } else {
                    return (valueB as number) - (valueA as number);
                }
            });
        }
        return result;
    }, [events, searchTerm, filterValue, sortValue, sortDirection]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

    // Handler for delete event
    const handleDelete = useCallback(async (eventId: number) => {
        if (!window.confirm('Yakin ingin menghapus event ini?')) return;
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('token')
            const apiUrl = getApiUrl()
            const res = await fetch(`${apiUrl}/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            })
            if (!res.ok) throw new Error('Gagal menghapus event')
            setEvents(prev => prev.filter(e => e.id !== eventId))
        } catch (e: any) {
            setError(e?.message || 'Gagal menghapus event')
        } finally {
            setLoading(false)
        }
    }, [setLoading, setError, setEvents])

    // Handler for edit event (open modal)
    const handleEdit = useCallback((event: EventItem) => {
        setEditingEvent(event)
        setShowEditModal(true)
    }, [])

    // Handler for create event (admin only)
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('token')
            const apiUrl = getApiUrl()
            const res = await fetch(`${apiUrl}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    nama: newEvent.judul,
                    deskripsi: newEvent.deskripsi,
                    tanggalMulai: newEvent.tanggalMulai,
                    tanggalSelesai: newEvent.tanggalSelesai,
                    lokasi: newEvent.lokasi,
                })
            })
            if (!res.ok) throw new Error('Gagal membuat event')
            const data = await res.json()
            setEvents(prev => [...prev, {
                id: data.id,
                judul: data.nama,
                deskripsi: data.deskripsi,
                tanggalMulai: data.tanggalMulai,
                tanggalSelesai: data.tanggalSelesai,
                lokasi: data.lokasi || '',
            }])
            setShowCreateModal(false)
            setNewEvent({ judul: '', deskripsi: '', tanggalMulai: '', tanggalSelesai: '', lokasi: '' })
        } catch (e: any) {
            setError(e?.message || 'Gagal membuat event')
        } finally {
            setLoading(false)
        }
    }

    // Handler for update event (submit)
    const handleUpdate = useCallback(async (updated: EventItem) => {
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('token')
            const apiUrl = getApiUrl()
            const res = await fetch(`${apiUrl}/events/${updated.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    nama: updated.judul,
                    deskripsi: updated.deskripsi,
                    tanggalMulai: updated.tanggalMulai,
                    tanggalSelesai: updated.tanggalSelesai,
                    lokasi: updated.lokasi,
                })
            })
            if (!res.ok) throw new Error('Gagal update event')
            const data = await res.json()
            setEvents(prev => prev.map(e => e.id === data.id ? {
                id: data.id,
                judul: data.nama,
                deskripsi: data.deskripsi,
                tanggalMulai: data.tanggalMulai,
                tanggalSelesai: data.tanggalSelesai,
                lokasi: data.lokasi || '',
            } : e))
            setShowEditModal(false)
            setEditingEvent(null)
        } catch (e: any) {
            setError(e?.message || 'Gagal update event')
        } finally {
            setLoading(false)
        }
    }, [setLoading, setError, setEvents])

    // Move loading and error checks after all hooks
    if (role === null || loading) {
        return <div className="p-4">Loading...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    // Render main content
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
                        {role === 'admin' && (
                            <button
                                className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full hover:bg-green-200 transition-all"
                                onClick={() => setShowCreateModal(true)}
                                title="Tambah Event"
                            >
                                <Image src="/create.png" alt="Tambah Event" width={16} height={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-6 w-full mt-6">
                {currentItems.map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-2xl p-6 shadow-lg bg-white flex flex-col gap-3 hover:shadow-xl transition-shadow duration-200 relative group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-extrabold text-gray-800 mb-0 flex items-center gap-2">
                              <span className="inline-block text-3xl">📝</span> {event.judul}
                            </h2>
                            {event.status && (
                              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                event.status === 'draft'
                                  ? 'bg-gray-100 text-gray-500'
                                  : event.status === 'direncanakan'
                                  ? 'bg-blue-100 text-blue-700'
                                  : event.status === 'disetujui'
                                  ? 'bg-green-100 text-green-700'
                                  : event.status === 'berlangsung'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : event.status === 'selesai'
                                  ? 'bg-purple-100 text-purple-700'
                                  : event.status === 'dibatalkan'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4 mb-2">
                            <span className="flex items-center gap-1">
                              <Image src="/calendar.png" alt="Tanggal" width={16} height={16} />
                              {event.tanggalMulai ?
                                (event.tanggalSelesai && event.tanggalSelesai !== event.tanggalMulai
                                  ? `${new Date(event.tanggalMulai).toLocaleDateString('id-ID')} - ${new Date(event.tanggalSelesai).toLocaleDateString('id-ID')}`
                                  : new Date(event.tanggalMulai).toLocaleDateString('id-ID'))
                                : 'Tidak ada tanggal'}
                            </span>
                            {event.lokasi && event.lokasi.trim() !== '' && (
                              <span className="flex items-center gap-1">
                                <span role="img" aria-label="Lokasi">📍</span>
                                {event.lokasi
                                  .replace(/[-_]/g, ' ')
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                            )}
                            {event.kapasitas && (
                              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                <span role="img" aria-label="Kapasitas">👥</span> {event.kapasitas} peserta
                              </span>
                            )}
                            {event.prioritas && (
                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                event.prioritas === 'urgent'
                                  ? 'bg-red-100 text-red-700'
                                  : event.prioritas === 'tinggi'
                                  ? 'bg-orange-100 text-orange-700'
                                  : event.prioritas === 'sedang'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                <span role="img" aria-label="Prioritas">⚡</span> {event.prioritas.charAt(0).toUpperCase() + event.prioritas.slice(1)}
                              </span>
                            )}
                          </div>
                          {event.deskripsi && event.deskripsi.trim() !== '' && (
                            <p className="text-gray-700 text-base mb-1 whitespace-pre-line">{event.deskripsi}</p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-2">
                            {event.jenisKegiatan && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-semibold">Jenis:</span> {event.jenisKegiatan}
                              </div>
                            )}
                            {event.waktuMulai && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-semibold">Waktu Mulai:</span> {event.waktuMulai}
                              </div>
                            )}
                            {event.waktuSelesai && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-semibold">Waktu Selesai:</span> {event.waktuSelesai}
                              </div>
                            )}
                            {event.lokasiDetail && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-semibold">Detail Lokasi:</span> {event.lokasiDetail}
                              </div>
                            )}
                            {event.penanggungJawab && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-semibold">Penanggung Jawab:</span> {event.penanggungJawab}
                              </div>
                            )}
                            {event.kontak && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-semibold">Kontak:</span> {event.kontak}
                              </div>
                            )}
                            {event.departemen && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-semibold">Departemen:</span> {event.departemen}
                              </div>
                            )}
                            {event.anggaran && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-semibold">Anggaran:</span> Rp {event.anggaran}
                              </div>
                            )}
                          </div>
                          {event.targetPeserta && event.targetPeserta.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="font-semibold text-xs text-gray-500">Target Peserta:</span>
                              {event.targetPeserta.map((peserta) => (
                                <span key={peserta} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                  {peserta.charAt(0).toUpperCase() + peserta.slice(1)}
                                </span>
                              ))}
                            </div>
                          )}
                          {event.catatan && (
                            <div className="mt-2 text-xs text-gray-400 italic border-l-4 border-blue-100 pl-3">
                              <span className="font-semibold text-blue-400 mr-1">Catatan:</span>{event.catatan}
                            </div>
                          )}
                        </div>
                        {role === 'admin' && (
                          <div className="flex flex-col gap-3 mt-2 self-end absolute right-6 top-6 z-10">
                            <button
                              className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-lg border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                              onClick={() => handleEdit(event)}
                              title="Edit"
                            >
                              <Image src="/update.png" alt="Update" width={20} height={20} />
                            </button>
                            <button
                              className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg border-2 border-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
                              onClick={() => handleDelete(event.id)}
                              title="Delete"
                            >
                              <Image src="/delete.png" alt="Delete" width={20} height={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-0 rounded shadow-md w-full max-w-3xl">
                        <EventForm
                            onSuccess={() => {
                                setShowCreateModal(false);
                                // Refresh event list after successful creation
                                const fetchEvents = async () => {
                                    setLoading(true);
                                    setError(null);
                                    try {
                                        const token = localStorage.getItem('token');
                                        const apiUrl = getApiUrl();
                                        const res = await fetch(`${apiUrl}/events`, {
                                            headers: {
                                                'Content-Type': 'application/json',
                                                ...(token ? { Authorization: `Bearer ${token}` } : {})
                                            }
                                        });
                                        if (!res.ok) throw new Error('Gagal memuat data event');
                                        const data = await res.json();
                                        setEvents(data.map((item: any) => ({
                                            id: item.id,
                                            judul: item.nama,
                                            deskripsi: item.deskripsi,
                                            tanggalMulai: item.tanggalMulai,
                                            tanggalSelesai: item.tanggalSelesai,
                                            lokasi: item.lokasi || '',
                                        })));
                                    } catch (e: any) {
                                        setError(e?.message || 'Gagal memuat data event');
                                    } finally {
                                        setLoading(false);
                                    }
                                };
                                fetchEvents();
                            }}
                        />
                        <div className="flex gap-2 justify-end px-6 pb-6">
                            <button type="button" className="px-3 py-1 bg-gray-300 rounded" onClick={() => setShowCreateModal(false)}>Batal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-0 rounded shadow-md w-full max-w-3xl">
                        <EventForm
                            eventId={editingEvent.id}
                            initialData={{
                                namaEvent: editingEvent.judul,
                                jenisKegiatan: editingEvent.jenisKegiatan || '',
                                deskripsi: editingEvent.deskripsi,
                                tanggalMulai: editingEvent.tanggalMulai ? editingEvent.tanggalMulai.split('T')[0] : '',
                                tanggalSelesai: editingEvent.tanggalSelesai ? editingEvent.tanggalSelesai.split('T')[0] : '',
                                waktuMulai: editingEvent.waktuMulai || '',
                                waktuSelesai: editingEvent.waktuSelesai || '',
                                lokasi: editingEvent.lokasi,
                                kapasitas: editingEvent.kapasitas,
                                lokasiDetail: editingEvent.lokasiDetail,
                                penanggungJawab: editingEvent.penanggungJawab || '',
                                kontak: editingEvent.kontak,
                                departemen: editingEvent.departemen,
                                prioritas: editingEvent.prioritas || 'sedang',
                                targetPeserta: editingEvent.targetPeserta || [],
                                anggaran: editingEvent.anggaran,
                                status: editingEvent.status || 'draft',
                                catatan: editingEvent.catatan,
                            }}
                            onSuccess={() => {
                                setShowEditModal(false);
                                setEditingEvent(null);
                                // Refresh event list after successful update
                                const fetchEvents = async () => {
                                    setLoading(true);
                                    setError(null);
                                    try {
                                        const token = localStorage.getItem('token');
                                        const apiUrl = getApiUrl();
                                        const res = await fetch(`${apiUrl}/events`, {
                                          headers: {
                                            'Content-Type': 'application/json',
                                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                                          }
                                        });
                                        if (!res.ok) throw new Error('Gagal memuat data event');
                                        const data = await res.json();
                                        setEvents(data.map((item: any) => ({
                                          id: item.id,
                                          judul: item.nama,
                                          deskripsi: item.deskripsi,
                                          tanggalMulai: item.tanggalMulai,
                                          tanggalSelesai: item.tanggalSelesai,
                                          lokasi: item.lokasi || '',
                                          jenisKegiatan: item.jenisKegiatan,
                                          waktuMulai: item.waktuMulai,
                                          waktuSelesai: item.waktuSelesai,
                                          kapasitas: item.kapasitas,
                                          lokasiDetail: item.lokasiDetail,
                                          penanggungJawab: item.penanggungJawab,
                                          kontak: item.kontak,
                                          departemen: item.departemen,
                                          prioritas: item.prioritas,
                                          targetPeserta: item.targetPeserta,
                                          anggaran: item.anggaran,
                                          status: item.status,
                                          catatan: item.catatan,
                                        })));
                                    } catch (e: any) {
                                        setError(e?.message || 'Gagal memuat data event');
                                    } finally {
                                        setLoading(false);
                                    }
                                };
                                fetchEvents();
                            }}
                        />
                        <div className="flex gap-2 justify-end px-6 pb-6">
                            <button type="button" className="px-3 py-1 bg-gray-300 rounded" onClick={() => { setShowEditModal(false); setEditingEvent(null); }}>Batal</button>
                        </div>
                    </div>
                </div>
            )}

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
