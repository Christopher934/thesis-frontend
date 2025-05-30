'use client';

import { useEffect, useState } from "react";
import Pagination from "@/component/Pagination";
import TableSearch from "@/component/TableSearch";
import Table from "@/component/Table";
import Image from "next/image";

const jadwalData = [
  {
    idpegawai: "PEG001",
    tipeshift: "Pagi",
    tanggal: "Senin, 2 Juni 2025",
    lokasishift: "Poli Umum",
    jammulai: "07:00",
    jamselesai: "14:00",
  },
  {
    idpegawai: "PEG002",
    tipeshift: "Siang",
    tanggal: "Senin, 2 Juni 2025",
    lokasishift: "IGD",
    jammulai: "14:00",
    jamselesai: "21:00",
  },
];

const columns = [
  { headers: "Shift", accessor: "tipeshift", className: "table-cell" },
  { headers: "Tanggal", accessor: "tanggal", className: "hidden md:table-cell" },
  { headers: "Jam Mulai", accessor: "jammulai", className: "hidden md:table-cell" },
  { headers: "Jam Selesai", accessor: "jamselesai", className: "hidden md:table-cell" },
];

const JadwalSayaPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedId = localStorage.getItem("idpegawai");
    setRole(storedRole);
    setUserId(storedId);
  }, []);

  const filteredData =
    role === "pegawai"
      ? jadwalData.filter((j) => j.idpegawai === userId)
      : jadwalData;

  const renderRow = (item: any) => (
    <tr
      key={item.idpegawai}
      className="border-b border-gray-200 even:bg-slate-50 hover:bg-gray-50 transition-colors"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.lokasishift}</h3>
          <p className="text-xs text-gray-500">{item.tipeshift}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.tanggal}</td>
      <td className="hidden md:table-cell">{item.jammulai}</td>
      <td className="hidden md:table-cell">{item.jamselesai}</td>
      <td className="table-cell md:hidden px-4 py-2">
        <div className="flex flex-col">
          <span>{item.tanggal}</span>
          <span className="text-xs text-gray-500">
            {item.jammulai} - {item.jamselesai}
          </span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Jadwal Saya</h1>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={filteredData} />
      <Pagination />
    </div>
  );
};

export default JadwalSayaPage;
