'use client'

import { z } from "zod";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";

const schema = z.object({
    nama: z.string()
        .min(3, { message: 'Username membutuhakn minimal 3 karakter' })
        .max(20, { message: 'Username membutuhkan maksimal 20 karakter' }),
    idpegawai: z.string()
        .email({ message: 'Email tidak valid' }),
    phone: z.number()
        .min(1, { message: 'Nomor handphone dibutuhkan!' }),
    lokasishift: z.string()
        .min(1, { message: 'Nama depan dibutuhkan!' }),

    tanggal: z.date({ message: 'Alamat dibutuhkan!' }),
    jammulai: z.number({ message: 'Alamat dibutuhkan!' }),
    jamselesai: z.number({ message: 'Tanggal lahir dibutuhkan!' }),
});
type Inputs = z.infer<typeof schema>;


const TukarShiftForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
    });
    const onSubmit = handleSubmit(data => { console.log(data) });
    return (
        < form action="" className="flex flex-col gap-4" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">{type === "create" ? "Create" : "Update"} data shift</h1>
            <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
            <div className="flex justify-between gap-4 flex-wrap">
                <InputField
                    label="Nama Pegawai"
                    name="nama"
                    register={register}
                    error={errors.nama}
                    defaultValue={data?.nama}
                />
                <InputField
                    label="ID Pegawai"
                    name="idpegawai"
                    register={register}
                    error={errors.idpegawai}
                    defaultValue={data?.idpegawai}
                />
                <InputField
                    label="Tanggal Shift"
                    name="tanggal"
                    type="date"
                    register={register}
                    error={errors.tanggal}
                    defaultValue={data?.tanggal}
                />
            </div>
            <span className="text-xs text-gray-400 font-medium">Personal Information</span>
            <div className="flex justify-between gap-4 flex-wrap">
                <InputField
                    label="Unit Kerja"
                    name="lokasishift"
                    register={register}
                    error={errors.lokasishift}
                    defaultValue={data?.lokasishift}
                />
                <InputField
                    label="Jam Mulai"
                    name="jammulai"
                    type="time"
                    register={register}
                    error={errors.jammulai}
                    defaultValue={data?.jammulai}
                />
                <InputField
                    label="Jam Selesai"
                    name="jamselesai"
                    type="time"
                    register={register}
                    error={errors.jamselesai}
                    defaultValue={data?.jamselesai}
                />
            </div>
            <button className="bg-blue-400 rounded-md text-white p-2">{type === "create" ? "Create" : "Update"}</button>
        </form>
    )
}

export default TukarShiftForm