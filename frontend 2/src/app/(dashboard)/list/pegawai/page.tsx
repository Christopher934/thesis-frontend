'use client'

import { useState, useEffect } from "react"
import Pagination from "@/component/Pagination"
import TableSearch from "@/component/TableSearch"
import Table from "@/component/Table"
import Image from "next/image"
import FormModal from "@/component/FormModal"

// Dummy data pegawai (nanti bisa di-fetch dari API)
const dummyPegawaiData = [
  {
    nama: "dr. Ana Sulistyo",
    idpegawai: "PEG001",
    nomorhandphone: "081234567890",
    jabatan: "Dokter Umum",
    unitkerja: "Poli Umum",
    status: "Aktif",
    email: "ana.sulistyo@rsud.co.id",
  },
  {
    nama: "Suster Rini Wijaya",
    idpegawai: "PEG002",
    nomorhandphone: "082112345678",
    jabatan: "Perawat",
    unitkerja: "IGD",
    status: "Aktif",
    email: "rini.wijaya@rsud.co.id",
  },
]

// Simulasikan role (harusnya dari auth context atau session)
const currentRole = "admin" // bisa juga "pegawai"

const PegawaiListPage = () => {
  const [pegawai, setPegawai] = useState(dummyPegawaiData)

  const columns = [
    { headers: "Nama", accessor: "nama" },
    { headers: "ID Pegawai", accessor: "idpegawai", className: "hidden md:table-cell" },
    { headers: "Nomor Handphone", accessor: "nomorhandphone", className: "hidden md:table-cell" },
    { headers: "Jabatan", accessor: "jabatan", className: "hidden md:table-cell" },
    { headers: "Unit Kerja", accessor: "unitkerja", className: "hidden md:table-cell" },
    { headers: "Status", accessor: "status", className: "hidden md:table-cell" },
    ...(currentRole === "admin" ? [{ headers: "Action", accessor: "action" }] : []),
  ]

  const renderRow = (item: any) => (
    <tr key={item.idpegawai} className="border-b border-gray-500 even:bg-slate-50 text-md hover:bg-gray-50 transition-colors">
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.nama}</h3>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.idpegawai}</td>
      <td className="hidden md:table-cell">{item.nomorhandphone}</td>
      <td className="hidden md:table-cell">{item.jabatan}</td>
      <td className="hidden md:table-cell">{item.unitkerja}</td>
      <td className="hidden md:table-cell">{item.status}</td>
      {currentRole === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal table="pegawai" type="update" data={item} />
            <FormModal table="pegawai" type="delete" id={item.idpegawai} />
          </div>
        </td>
      )}
    </tr>
  )

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Semua Pegawai</h1>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {currentRole === "admin" && (
              <FormModal table="pegawai" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* Table */}
      <Table columns={columns} renderRow={renderRow} data={pegawai} />
      <Pagination />
    </div>
  )
}

export default PegawaiListPage
