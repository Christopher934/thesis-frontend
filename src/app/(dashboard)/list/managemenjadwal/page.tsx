import FormModal from "@/component/FormModal"
import Pagination from "@/component/Pagination"
import Table from "@/component/Table"
import TableSearch from "@/component/TableSearch"
import { jadwalData, role } from "@/lib/data"
import Image from "next/image"

const columns = [
    { headers: "Nama", accessor: "nama" },
    { headers: "ID Pegawai", accessor: "nomorhandphone", className: "hidden md:table-cell" },
    { headers: "Tanggal", accessor: "jabatan", className: "hidden md:table-cell" },
    { headers: "Unit Kerja", accessor: "unitkerja", className: "hidden md:table-cell" },
    { headers: "Jam Mulai", accessor: "status", className: "hidden md:table-cell" },
    { headers: "Jam Selesai", accessor: "status", className: "hidden md:table-cell" },
    { headers: "Action", accessor: "action" },

]

type Jadwal = {
    nama: string;
    idpegawai: string;
    nomorhandphone: string;
    tanggal: string;
    lokasishift: string;
    jammulai: string;
    jamselesai: string;
}

const ManagemenJadwalPage = () => {
    const renderRow = (item: Jadwal) => {
        return (
            <tr key={item.idpegawai} className="border-b border-gray-500 even:bg-slate-50 text-md hover:bg-gray-50 transition-colors">
                <td className="flex items-center gap-4 p-4">
                    <div className="flex flex-col">
                        <h3 className="font-semibold">{item.nama}</h3>
                        <p className="text-xs text-gray-500">{item?.nomorhandphone}</p>
                    </div>
                </td>
                <td className="hidden md:table-cell">{item.idpegawai}</td>
                <td className="hidden md:table-cell">{item.tanggal}</td>
                <td className="hidden md:table-cell">{item.lokasishift}</td>
                <td className="hidden md:table-cell">{item.jammulai}</td>
                <td className="hidden md:table-cell">{item.jamselesai}</td>
                <td>
                    <div className="flex items-center gap-2">
                        {role === "admin" && (
                            <>
                                <FormModal table="jadwal" type="update" data={item} />
                                <FormModal table="jadwal" type="delete" id={item.idpegawai} />
                            </>
                        )}
                    </div>
                </td>
            </tr>
        );
    }
    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Managemen Jadwal</h1>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                        {role === "admin" && (
                            <FormModal table="jadwal" type="create" />
                        )}
                    </div>
                </div>
            </div>
            {/* List */}
            <Table columns={columns} data={jadwalData} renderRow={renderRow} />
            {/* Pagination */}
            <Pagination />
        </div>
    )
}

export default ManagemenJadwalPage