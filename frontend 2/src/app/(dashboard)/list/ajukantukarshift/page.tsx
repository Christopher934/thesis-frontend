'use client';

import Pagination from "@/component/Pagination";
import TableSearch from "@/component/TableSearch";
import Table from "@/component/Table";
import Image from "next/image";
import FormModal from "@/component/FormModal";
import { useEffect, useState } from "react";

const currentUserId = 1; // ganti nanti dari context auth / token

const tukarShiftData = [
    {
        id: 1,
        pengaju: { id: 1, nama: "dr. Ana" },
        targetUser: { id: 2, nama: "Suster Rini" },
        tanggal: "Senin, 2 Juni 2025",
        lokasiShift: "Poli Umum",
        jamMulai: "07:00",
        jamSelesai: "13:00",
        status: "PENDING"
    },
    {
        id: 2,
        pengaju: { id: 3, nama: "Bapak Dedi" },
        targetUser: { id: 1, nama: "dr. Ana" },
        tanggal: "Senin, 2 Juni 2025",
        lokasiShift: "IGD",
        jamMulai: "19:00",
        jamSelesai: "07:00",
        status: "DISETUJUI"
    },
];

const columns = [
    { headers: "Pengaju", accessor: "namaPengaju" },
    { headers: "Dengan", accessor: "namaTarget" },
    { headers: "Tanggal", accessor: "tanggal", className: "hidden md:table-cell" },
    { headers: "Lokasi", accessor: "lokasiShift", className: "hidden md:table-cell" },
    { headers: "Jam Mulai", accessor: "jamMulai", className: "hidden md:table-cell" },
    { headers: "Jam Selesai", accessor: "jamSelesai", className: "hidden md:table-cell" },
    { headers: "Status", accessor: "status" },
    { headers: "Action", accessor: "action" },
];

const TukarShiftPage = () => {
    const [activeTab, setActiveTab] = useState<"masuk" | "pengajuan">("masuk");
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        if (storedRole) {
            setRole(storedRole.toLowerCase());
        }
    }, []);

    if (!role) return null; // atau loading spinner jika mau

    const isAdmin = role === "admin";

    const visibleData = isAdmin
        ? tukarShiftData
        : tukarShiftData.filter(
            item => item.pengaju.id === currentUserId || item.targetUser.id === currentUserId
        );

    const permintaanMasuk = visibleData.filter(item => item.targetUser.id === currentUserId);
    const pengajuanSaya = visibleData.filter(item => item.pengaju.id === currentUserId);

    const dataToShow = isAdmin ? visibleData : activeTab === "masuk" ? permintaanMasuk : pengajuanSaya;

    const renderRow = (item: any) => (
        <tr key={item.id} className="border-b border-gray-500 even:bg-slate-50 text-md hover:bg-gray-50 transition-colors">
            <td className="p-4">{item.pengaju.nama}</td>
            <td>{item.targetUser.nama}</td>
            <td className="hidden md:table-cell">{item.tanggal}</td>
            <td className="hidden md:table-cell">{item.lokasiShift}</td>
            <td className="hidden md:table-cell">{item.jamMulai}</td>
            <td className="hidden md:table-cell">{item.jamSelesai}</td>
            <td>{item.status}</td>
            <td>
                <div className="flex items-center gap-2">
                    <FormModal table="tukarshift" type="update" data={item} />
                    <FormModal table="tukarshift" type="delete" id={item.id} />
                </div>
            </td>
        </tr>
    );

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Permintaan Tukar Shift</h1>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                        {role === "pegawai" && (
                            <FormModal table="tukarshift" type="create" />
                        )}
                    </div>
                </div>
            </div>

            {!isAdmin && (
                <div className="flex gap-4 my-4">
                    <button
                        onClick={() => setActiveTab("masuk")}
                        className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === "masuk" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
                    >
                        Permintaan Masuk
                    </button>
                    <button
                        onClick={() => setActiveTab("pengajuan")}
                        className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === "pengajuan" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
                    >
                        Pengajuan Saya
                    </button>
                </div>
            )}

            <Table columns={columns} renderRow={renderRow} data={dataToShow} />
            <Pagination />
        </div>
    );
};

export default TukarShiftPage;
