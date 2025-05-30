'use client';
import Pagination from "@/component/Pagination";
import TableSearch from "@/component/TableSearch";
import Table from "@/component/Table";
import Image from "next/image";
import { useState } from "react";

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
                <td className="hidden md:table-cell">{item.status}</td>
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
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/filter.png" alt="filter" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/sort.png" alt="sort" width={14} height={14} />
                        </button>

                    </div>
                </div>
            </div>

            <div className="mt-4">
                <Table columns={columns} renderRow={renderRow} data={laporanData} />
            </div>

            <Pagination />
        </div>
    );
};

export default LaporanPage;
