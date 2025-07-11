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

      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Update Data Pegawai</h2>
              <p className="text-gray-500 text-sm mt-1">Perbarui informasi pegawai</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800 text-sm">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              label="Password (kosongkan jika tidak ingin diubah)"
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Jenis Kelamin
              </label>
              <select
                {...register('kelamin')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              {errors.kelamin && (
                <p className="text-red-600 text-sm">{errors.kelamin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Lahir
              </label>
              <input
                type="date"
                {...register('tanggallahir')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {errors.tanggallahir && (
                <p className="text-red-600 text-sm">{errors.tanggallahir.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              {errors.status && (
                <p className="text-red-600 text-sm">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <InputField
              label="Alamat"
              name="alamat"
              register={register}
              error={errors.alamat}
              as="textarea"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Memperbarui...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
