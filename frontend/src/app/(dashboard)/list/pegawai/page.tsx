'use client';

import { useEffect, useState } from 'react';
import FormModal from '@/component/FormModal';
import Table from '@/component/Table';
import TableSearch from '@/component/TableSearch';
import Pagination from '@/component/Pagination';
import Image from 'next/image';

type Pegawai = {
  id: number;
  username: string;
  email: string;
  namaDepan: string;
  namaBelakang: string;
  alamat: string;
  noHp: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  role: 'ADMIN' | 'DOKTER' | 'PERAWAT' | 'STAF';
  status: 'ACTIVE' | 'INACTIVE';
};

const ITEMS_PER_PAGE = 10;

export default function PegawaiPage() {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // State untuk menampilkan/hide modal Create
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1) Fetch data dari /users (bukan /pegawai)
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3004/users', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Gagal fetch pegawai');
        const json: Pegawai[] = await res.json();
        // Hanya include role tertentu
        const filtered = json.filter((u) =>
          ['ADMIN', 'DOKTER', 'PERAWAT', 'STAF'].includes(u.role)
        );
        setPegawaiList(filtered);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  // 2) Filter + Pagination
  const filteredList = pegawaiList.filter((u) => {
    const fullName = `${u.namaDepan} ${u.namaBelakang}`.toLowerCase();
    return (
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase())
    );
  });
  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 3) Callback setelah “Create” sukses
  const handleAfterCreate = (newPegawai: Pegawai) => {
    setPegawaiList((prev) => [...prev, newPegawai]);
  };

  // 4) Callback setelah “Update” sukses
  const handleAfterUpdate = (updated: Pegawai) => {
    setPegawaiList((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  // 5) Callback setelah “Delete” sukses
  const handleAfterDelete = (deletedId: number) => {
    setPegawaiList((prev) => prev.filter((p) => p.id !== deletedId));
  };

  // 6) Kolom dan fungsi renderRow
  const columns = [
    { headers: 'No', accessor: 'no' },
    { headers: 'Nama', accessor: 'namaDepan' },
    { headers: 'Email', accessor: 'email' },
    { headers: 'No HP', accessor: 'noHp', className: 'hidden md:table-cell' },
    {
      headers: 'Jenis Kelamin',
      accessor: 'jenisKelamin',
      className: 'hidden md:table-cell',
    },
    {
      headers: 'Tanggal Lahir',
      accessor: 'tanggalLahir',
      className: 'hidden md:table-cell',
    },
    { headers: 'Role', accessor: 'role', className: 'hidden md:table-cell' },
    {
      headers: 'Status',
      accessor: 'status',
      className: 'hidden md:table-cell',
    },
    { headers: 'Aksi', accessor: 'action' },
  ];

  const renderRow = (item: Pegawai) => {
    // Hitung nomor urut tampilan:
    const rowIndex = paginatedList.indexOf(item); // 0-based di halaman ini
    const noTampil =
      (currentPage - 1) * ITEMS_PER_PAGE + (rowIndex + 1);

    return (
      <tr
        key={item.id}
        className="border-b even:bg-gray-50 hover:bg-gray-100"
      >
        {/* Kolom “No” */}
        <td className="px-4 py-2">{noTampil}</td>
        <td className="px-4 py-2">
          {item.namaDepan} {item.namaBelakang}
        </td>
        <td className="px-4 py-2">{item.email}</td>
        <td className="px-4 py-2 hidden md:table-cell">{item.noHp}</td>
        <td className="px-4 py-2 hidden md:table-cell">
          {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
        </td>
        <td className="px-4 py-2 hidden md:table-cell">
          {new Date(item.tanggalLahir).toLocaleDateString('id-ID')}
        </td>
        <td className="px-4 py-2 hidden md:table-cell">{item.role}</td>
        <td className="px-4 py-2 hidden md:table-cell">{item.status}</td>
        
        <td className="px-4 py-2">
          <div className="flex gap-2">
            {/* Tombol “Update” */}
            <FormModal
              table="pegawai"
              type="update"
              data={{
                id: item.id,
                username: item.username,
                email: item.email,
                namaDepan: item.namaDepan,
                namaBelakang: item.namaBelakang,
                alamat: item.alamat,
                noHp: item.noHp,
                tanggalLahir: item.tanggalLahir,
                jenisKelamin: item.jenisKelamin,
                role: item.role,
                status: item.status,
              }}
              onCreated={() => {}}
              onUpdated={handleAfterUpdate}
              onDeleted={() => {}}
              // default renderTrigger=true → ikon ✏️ muncul di tabel
            />

            {/* Tombol “Delete” */}
            <FormModal
              table="pegawai"
              type="delete"
              id={String(item.id)}
              nameLabel={`${item.namaDepan} ${item.namaBelakang}`}
              onCreated={() => {}}
              onUpdated={() => {}}
              onDeleted={(did) => handleAfterDelete(Number(did))}
              // default renderTrigger=true → ikon 🗑️ muncul di tabel
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg m-4 flex-1">
      {/* Header bar dengan Search + Filter/Sort + Create */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <h1 className="text-2xl font-semibold">Manajemen Pegawai</h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <TableSearch
            placeholder="Cari Username / Email / Nama…"
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
          />

          {/* Icon filter & sort (dummy saja) */}
          <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">
            <Image src="/filter.png" alt="Filter" width={16} height={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">
            <Image src="/sort.png" alt="Sort" width={16} height={16} />
          </button>

          {/* Tombol “Create” (plus) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
          >
            <Image src="/create.png" alt="Create" width={16} height={16} />
          </button>
        </div>
      </div>

      {/* Table daftar pegawai */}
      <Table columns={columns} data={paginatedList} renderRow={renderRow} />

      {/* Pagination di bawah tabel */}
      <div className="mt-4">
        <Pagination
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Modal “Create Pegawai” */}
      {isModalOpen && (
        <FormModal
          table="pegawai"
          type="create"
          onCreated={handleAfterCreate}
          onUpdated={() => {}}
          onDeleted={() => {}}
          renderTrigger={false}  // agar tombol “+” di dalam FormModal tidak dirender
          initialOpen={true}     // buka modal langsung begitu komponen mount
          // Tambahkan onClose agar setelah cancel parent tahu harus unmount
          onAfterClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
