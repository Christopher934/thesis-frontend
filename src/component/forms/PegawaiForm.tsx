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
    phone: z.number()
        .min(1, { message: 'Nomor handphone dibutuhkan!' }),
    firstname: z.string()
        .min(1, { message: 'Nama depan dibutuhkan!' }),

    lastname: z.string()
        .min(1, { message: 'Nama belakang dibutuhkan!' }),
    alamat: z.string()
        .min(1, { message: 'Alamat dibutuhkan!' }),
    tanggallahir: z.date({ message: 'Tanggal lahir dibutuhkan!' }),
    kelamin: z.enum(['Laki-laki', 'Perempuan'], { message: 'Jenis kelamin dibutuhkan!' }),
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
        < form action="" className="flex flex-col gap-4" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">{type === "create" ? "Create" : "Update"} data pegawai</h1>
            <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
            <div className="flex justify-between gap-4 flex-wrap">
                <InputField
                    label="Username"
                    name="username"
                    register={register}
                    error={errors.username}
                    defaultValue={data?.username}
                />
                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email}
                    defaultValue={data?.email}
                />
                <InputField
                    label="Password"
                    name="password"
                    type="password"
                    register={register}
                    error={errors.password}
                    defaultValue={data?.password}
                />
            </div>
            <span className="text-xs text-gray-400 font-medium">Personal Information</span>
            <div className="flex justify-between gap-4 flex-wrap">
                <InputField
                    label="Nama Depan"
                    name="firstname"
                    register={register}
                    error={errors.firstname}
                    defaultValue={data?.firstname}
                />
                <InputField
                    label="Nama Belakang"
                    name="lastname"
                    register={register}
                    error={errors.lastname}
                    defaultValue={data?.lastname}
                />
                <InputField
                    label="Nomor Handphone"
                    name="phone"
                    register={register}
                    error={errors.phone}
                    defaultValue={data?.nomorhandphone}
                />
                <InputField
                    label="Alamat"
                    name="alamat"
                    register={register}
                    error={errors.alamat}
                    defaultValue={data?.alamat}
                />
                <InputField
                    label="Tanggal Lahir"
                    type="date"
                    name="tanggallahir"
                    register={register}
                    error={errors.tanggallahir}
                    defaultValue={data?.tanggallahir}
                />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-1/4 pb-4">
                <label className="text-xs text-gray-500">L/P</label>
                <select
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                    {...register("kelamin")}
                    defaultValue={data?.kelamin}
                >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                </select>
                {errors.kelamin && (
                    <p className="text-xs text-red-400">{errors.kelamin.message?.toString()}</p>
                )}
            </div>
            <button className="bg-blue-400 rounded-md text-white p-2">{type === "create" ? "Create" : "Update"}</button>
        </form>
    )
}

export default PegawaiForm