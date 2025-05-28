import Pagination from "@/component/Pagination"
import TableSearch from "@/component/TableSearch"
import Table from "@/component/Table"
import Image from "next/image"
import { headers } from "next/headers"

import { jadwalData, role } from '@/lib/data'
import FormModal from "@/component/FormModal"

type Jadwal = {
    idpegawai: string;
    tipeshift: string;
    tanggal: string;
    lokasishift: string;
    jammulai: string;
    jamselesai: string;
    email: string;
}

const columns = [
    { headers: "Shift", accessor: "typeshift", className: "table-cell" },
    { headers: "Tanggal", accessor: "tanggal", className: "hidden md:table-cell" },
    { headers: "Jam Mulai", accessor: "jammulai", className: "hidden md:table-cell" },
    { headers: "Jam Selesai", accessor: "jamselesai", className: "hidden md:table-cell" },
]

const JadwalSayaPage = () => {
    const renderRow = (item: Jadwal) => {
        return (
            <tr key={item.idpegawai} className="border-b items-center border-gray-500 even:bg-slate-50 text-md hover:bg-gray-50 transition-colors">
                <td className="flex items-center gap-4 p-4">
                    <div className="flex flex-col">
                        <h3 className="font-semibold">{item.lokasishift}</h3>
                        <p className="text-xs text-gray-500">{item?.tipeshift}</p>
                    </div>
                </td>
                <td className="hidden md:table-cell">{item.tanggal}</td>
                <td className="hidden md:table-cell">{item.jammulai}</td>
                <td className="hidden md:table-cell">{item.jamselesai}</td>
                <td className="table-cell md:hidden">
                    <div className="flex flex-col">
                        <div >{item.tanggal}</div>
                        <div className="text-xs text-gray-500"> {item.jammulai}-{item.jamselesai}</div>
                    </div>
                </td>

            </tr>
        );
    }
    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Jadwal Saya</h1>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                    </div>
                </div>
            </div>
            {/* List */}
            <Table columns={columns} renderRow={renderRow} data={jadwalData} />
            {/* Pagination */}
            <Pagination />
        </div>
    )
}

export default JadwalSayaPage
