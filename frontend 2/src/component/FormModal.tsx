'use client';
import Image from "next/image";
import { useState } from "react";
import PegawaiForm from "./forms/PegawaiForm";
import JadwalForm from "./forms/JadwalForm";
import TukarShiftForm from "./forms/TukarShiftForm";

const forms: { [key: string]: (type: "create" | "update", data?: any) => JSX.Element; } = {
    pegawai: (type, data) => <PegawaiForm type={type} data={data} />,
    tukarshift: (type, data) => <TukarShiftForm type={type} data={data} />,
    jadwal: (type, data) => <JadwalForm type={type} data={data} />, // Assuming JadwalForm is similar to PegawaiForm
}

const FormModal = ({ table, type, data, id }: {
    table: "pegawai" | "jadwal" | "tukarshift";
    type: "create" | "update" | "delete";
    data?: any;
    id?: string;
}) => {
    const size = type === "create" ? "w-8 h-8" : "w-7 h-7"
    const bgColor = type === "create" ? "bg-gray-100" : type === "update" ? "bg-yellow-500" : "bg-red-500";
    const [open, setOpen] = useState(false);

    const Form = () => {
        return type === "delete" && id ? (
            <form action="" className="flex flex-col items-center p-4 gap-4">
                <span className="text-center font-medium">Data pada {table} akan hilang secara permanen. Yakin ingin menghapus?</span>
                <button className="bg-red-700 text-white py-2 px-2 rounded-md border-none w-max self-center">Delete</button>
            </form>
        ) : type === "create" || type === "update" ? (
            forms[table](type, data) // Render the appropriate form based on the table type
        ) : "Form not found";
    };
    return (
        <>
            <button onClick={() => setOpen(true)} className={`${size} flex items-center justify-center rounded-full ${bgColor}`}>
                <Image src={`/${type}.png`} alt="" width={16} height={16} />
            </button>
            {open && (
                <div className="w-screen h-screen absolute top-0 left-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
                        <Form />
                        <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpen(false)}>
                            <Image src="/close.png" alt="" width={14} height={14} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default FormModal