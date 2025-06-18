// src/app/(dashboard)/list/pegawai/CreatePegawaiForm.tsx
'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import InputField from '@/component/InputField';
import { pegawaiSchema, PegawaiInputs } from './pegawaiSchema';

type PegawaiFormProps = {
  type: 'create' | 'update';
  data?: {
    id: number;
    username: string;
    email: string;
    namaDepan: string;
    namaBelakang: string;
    alamat?: string;
    noHp: string;
    tanggalLahir: string;      // YYYY-MM-DD
    jenisKelamin: 'L' | 'P';
    role: 'ADMIN' | 'DOKTER' | 'PERAWAT' | 'STAF' | 'SUPERVISOR';
    status: 'ACTIVE' | 'INACTIVE';
  };
  onClose: () => void;
  onCreate: (newPegawai: any) => void;
  onUpdate?: (updatedPegawai: any) => void;
};

export default function CreatePegawaiForm({
  type,
  data,
  onClose,
  onCreate,
  onUpdate,
}: PegawaiFormProps) {
  // 1) Build defaultValues for “update” mode:
  const defaultValues: Partial<PegawaiInputs> = React.useMemo(() => {
    if (type === 'update' && data) {
      return {
        username: data.username,
        email: data.email,
        password: '',  // always blank on update
        namaDepan: data.namaDepan,
        namaBelakang: data.namaBelakang,
        alamat: data.alamat ?? '',
        noHp: data.noHp,
        tanggalLahir: data.tanggalLahir,   // “YYYY-MM-DD”
        jenisKelamin: data.jenisKelamin,   // “L” or “P”
        role: data.role,                   // e.g. “STAF”
        status: data.status,               // “ACTIVE” or “INACTIVE”
      };
    }
    // default for “create”:
    return {
      jenisKelamin: 'L',
      role: 'STAF',
      status: 'ACTIVE',
    };
  }, [type, data]);

  // 2) useForm + zodResolver:
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PegawaiInputs>({
    resolver: zodResolver(pegawaiSchema),
    defaultValues,
  });

  // 3) If “update” and data changes, reset to the new defaultValues:
  useEffect(() => {
    if (type === 'update' && data) {
      reset(defaultValues);
    }
  }, [type, data, defaultValues, reset]);

  // 4) onSubmit sends exactly the DTO shape:
  const onSubmit = handleSubmit(async (values) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Anda belum login.');

      // Build payload that matches CreateUserDto exactly:
      const payload: any = {
        username: values.username,
        email: values.email,
        ...(values.password ? { password: values.password } : {}),
        namaDepan: values.namaDepan,
        namaBelakang: values.namaBelakang,
        alamat: values.alamat,
        noHp: values.noHp,
        tanggalLahir: values.tanggalLahir,   // "YYYY-MM-DD"
        jenisKelamin: values.jenisKelamin,   // "L" or "P"
        role: values.role,                   // "ADMIN"|"DOKTER"|"PERAWAT"|"STAF"|"SUPERVISOR"
        status: values.status,               // "ACTIVE"|"INACTIVE"
      };

      let res: Response;
      if (type === 'create') {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log('Using API URL:', apiUrl);
        res = await fetch(apiUrl + '/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        if (!data) throw new Error('Tidak ada data untuk update.');
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log('Using API URL:', apiUrl);
        res = await fetch(apiUrl + '/users/' + data.id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error((errJson as any).message || 'Permintaan gagal');
      }

      const result = await res.json();
      if (type === 'create') {
        onCreate(result);
      } else {
        onUpdate && onUpdate(result);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Terjadi kesalahan.');
    }
  });

  // 5) Render the form. Notice that “name” on each field exactly matches the Zod schema keys:
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        {type === 'create' ? 'Create Data Pegawai' : 'Update Data Pegawai'}
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Row 1: username | email | password */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {/* Row 2: namaDepan | namaBelakang | noHp */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Nama Depan"
            name="namaDepan"
            register={register}
            error={errors.namaDepan}
          />
          <InputField
            label="Nama Belakang"
            name="namaBelakang"
            register={register}
            error={errors.namaBelakang}
          />
          <InputField
            label="Nomor HP"
            name="noHp"
            type="tel"
            register={register}
            error={errors.noHp}
          />
        </div>

        {/* Row 3: alamat textarea */}
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

        {/* Row 4: tanggalLahir | jenisKelamin | role | status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* tanggalLahir */}
          <div className="flex flex-col">
            <label className="block text-xs text-gray-500 font-medium mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              {...register('tanggalLahir')}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.tanggalLahir && (
              <p className="text-xs text-red-400">
                {errors.tanggalLahir.message}
              </p>
            )}
          </div>

          {/* jenisKelamin */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-medium mb-1">
              Jenis Kelamin
            </label>
            <select
              {...register('jenisKelamin')}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            {errors.jenisKelamin && (
              <p className="text-xs text-red-400">
                {errors.jenisKelamin.message}
              </p>
            )}
          </div>

          {/* role */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-medium mb-1">Role</label>
            <select
              {...register('role')}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="DOKTER">DOKTER</option>
              <option value="PERAWAT">PERAWAT</option>
              <option value="STAF">STAF</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-400">{errors.role.message}</p>
            )}
          </div>

          {/* status */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-medium mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            {errors.status && (
              <p className="text-xs text-red-400">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Row 5: Cancel + Submit */}
        <div className="pt-4 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting
              ? type === 'create'
                ? 'Creating...'
                : 'Updating...'
              : type === 'create'
              ? 'Create'
              : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
