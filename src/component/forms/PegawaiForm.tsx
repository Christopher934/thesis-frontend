'use client'

import { z } from "zod";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";

const schema = z.object({
    username: z.string()
        .min(3, { message: 'Username membutuhakn minimal 3 karakter' })
        .max(20, { message: 'Username membutuhkan maksimal 20 karakter' }),
    email: z.string()
        .email({ message: 'Email tidak valid' }),
    password: z.string()
        .min(8, { message: 'Password membutuhkan minimal 8 karakter' }),
    nomorhandphone: z.string()
        .min(1, { message: 'Nomor handphone dibutuhkan!' }),
    firstname: z.string()
        .min(1, { message: 'Nama depan dibutuhkan!' }),

    lastname: z.string()
        .min(1, { message: 'Nama belakang dibutuhkan!' }),
    alamat: z.string()
        .min(1, { message: 'Alamat dibutuhkan!' }),
    tanggalLahir: z.date({ message: 'Tanggal lahir dibutuhkan!' }),
    kelamin: z.enum(['Laki-laki', 'Perempuan'], { message: 'Jenis kelamin dibutuhkan!' }),
    age: z.number().min(10),
});
type Inputs = z.infer<typeof schema>;

const PegawaiForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
    });
    const onSubmit = handleSubmit(data => { console.log(data) });
    return (
        < form action="" className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">Tambah data pegawai</h1>
            <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
            <InputField
                label="Username"
                name="username"
                register={register}
                error={errors.username}
                defaultValue={data?.username}
            />
            <span className="text-xs text-gray-400 font-medium">Personal Information</span>
            <button className="bg-blue-400 rounded-md text-white p-2">{type === "create" ? "Create" : "Update"}</button>
        </form>
    )
}

export default PegawaiForm