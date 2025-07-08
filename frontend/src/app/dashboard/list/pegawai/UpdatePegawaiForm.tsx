// src/app/(dashboard)/list/pegawai/UpdatePegawaiForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import InputField from '@/components/common/InputField';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const updateSchema = z.object({
  username: z.string().min(3, { message: 'Username minimal 3 karakter' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().optional(),
  firstname: z.string().min(1, { message: 'Nama depan dibutuhkan' }),
  lastname: z.string().min(1, { message: 'Nama belakang dibutuhkan' }),
  alamat: z.string().min(1, { message: 'Alamat dibutuhkan' }),
  phone: z.string().min(1, { message: 'Nomor handphone dibutuhkan' }),
  tanggallahir: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Tanggal lahir tidak valid' }),
  kelamin: z.enum(
    ['Laki-laki', 'Perempuan'],
    {
      required_error: 'Jenis kelamin dibutuhkan',
      invalid_type_error: 'Nilai harus "Laki-laki" atau "Perempuan"',
    }
  ),
  status: z.enum(
    ['ACTIVE', 'INACTIVE'],
    {
      required_error: 'Status dibutuhkan',
      invalid_type_error: 'Nilai harus "ACTIVE" atau "INACTIVE"',
    }
  ),
});

type UpdateInputs = z.infer<typeof updateSchema>;

type UpdatePegawaiFormProps = {
  data: {
    id: number;
    username: string;
    email: string;
    firstname: string;
    lastname: string;
    alamat: string;
    phone: string;
    tanggallahir: string; // "YYYY-MM-DD"
    kelamin: 'Laki-laki' | 'Perempuan';
    status: 'ACTIVE' | 'INACTIVE';
  };
  onClose: () => void;
  onUpdated: (updatedData: any) => void;
};

export default function UpdatePegawaiForm({
  data,
  onClose,
  onUpdated,
}: UpdatePegawaiFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateInputs>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      username: data.username,
      email: data.email,
      password: '',
      firstname: data.firstname,
      lastname: data.lastname,
      alamat: data.alamat,
      phone: data.phone,
      tanggallahir: data.tanggallahir,
      kelamin: data.kelamin,
      status: data.status,
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset form bila data berubah (misal setelah fetch/update)
  useEffect(() => {
    reset({
      username: data.username,
      email: data.email,
      password: '',
      firstname: data.firstname,
      lastname: data.lastname,
      alamat: data.alamat,
      phone: data.phone,
      tanggallahir: data.tanggallahir,
      kelamin: data.kelamin,
      status: data.status,
    });
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Anda belum login.');

      const payload: any = {
        username: values.username,
        email: values.email,
        namaDepan: values.firstname,
        namaBelakang: values.lastname,
        alamat: values.alamat,
        noHp: values.phone,
        jenisKelamin: values.kelamin === 'Laki-laki' ? 'L' : 'P',
        tanggalLahir: values.tanggallahir,
        status: values.status,
      };
      if (values.password) {
        payload.password = values.password;
      }

      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      console.log('Using API URL:', apiUrl);
      const res = await fetch(apiUrl + '/users/' + data.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error((errJson as any).message || 'Gagal update pegawai');
      }

      const updatedPegawai = await res.json();
      onUpdated(updatedPegawai);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi Kesalahan.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Update Pegawai</h2>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-2 rounded">{errorMsg}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Username"
          name="username"
          register={register}
          error={errors.username}
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          register={register}
          error={errors.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors.password}
        />
        <InputField
          label="Nama Depan"
          name="firstname"
          register={register}
          error={errors.firstname}
        />
        <InputField
          label="Nama Belakang"
          name="lastname"
          register={register}
          error={errors.lastname}
        />
        <InputField
          label="Nomor Handphone"
          name="phone"
          register={register}
          error={errors.phone}
        />

        <div>
          <InputField
            label="Alamat"
            name="alamat"
            register={register}
            error={errors.alamat}
            as="textarea"
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1">Jenis Kelamin</label>
          <select
            {...register('kelamin')}
            className="w-full border rounded px-2 py-1"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          {errors.kelamin && (
            <p className="text-xs text-red-500">{errors.kelamin.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1">Tanggal Lahir</label>
          <input
            type="date"
            {...register('tanggallahir')}
            className="w-full border rounded px-2 py-1"
          />
          {errors.tanggallahir && (
            <p className="text-xs text-red-500">
              {errors.tanggallahir.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1">Status</label>
          <select
            {...register('status')}
            className="w-full border rounded px-2 py-1"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          {errors.status && (
            <p className="text-xs text-red-500">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Updating...' : 'Update'}
        </button>
      </div>
    </form>
  );
}
