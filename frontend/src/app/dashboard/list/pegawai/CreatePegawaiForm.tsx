// src/app/(dashboard)/list/pegawai/CreatePegawaiForm.tsx
'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import InputField from '@/components/common/InputField';
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
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
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

  // Utility to remove empty optional fields from payload
  function filterEmptyFields(obj: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
  }

  // onSubmit sends exactly the DTO shape:
  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Anda belum login.');

      // Build payload that matches CreateUserDto exactly:
      const rawPayload: any = {
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
      // Remove empty optional fields
      const payload = filterEmptyFields(rawPayload);

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
      setSuccessMessage(
        type === 'create' 
          ? 'Pegawai berhasil dibuat!' 
          : 'Data pegawai berhasil diperbarui!'
      );
      
      if (type === 'create') {
        onCreate(result);
      } else {
        onUpdate && onUpdate(result);
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem');
    }
  });

  // 5) Render the form. Notice that “name” on each field exactly matches the Zod schema keys:
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {type === 'create' ? 'Tambah Data Pegawai' : 'Update Data Pegawai'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {type === 'create' 
                  ? 'Masukkan informasi pegawai baru' 
                  : 'Perbarui informasi pegawai'
                }
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800 text-sm">{errorMessage}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 text-sm">{successMessage}</span>
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
              label={type === 'create' ? 'Password' : 'Password (kosongkan jika tidak ingin diubah)'}
              name="password"
              type="password"
              register={register}
              error={errors.password}
            />
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
              register={register}
              error={errors.noHp}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                {...register('jenisKelamin')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Pilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              {errors.jenisKelamin && (
                <p className="text-red-600 text-sm">{errors.jenisKelamin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('tanggalLahir')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {errors.tanggalLahir && (
                <p className="text-red-600 text-sm">{errors.tanggalLahir.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                {...register('role')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">-- Pilih Role --</option>
                <option value="ADMIN">ADMIN</option>
                <option value="DOKTER">DOKTER</option>
                <option value="PERAWAT">PERAWAT</option>
                <option value="STAF">STAF</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
              </select>
              {errors.role && (
                <p className="text-red-600 text-sm">{errors.role.message}</p>
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
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  {type === 'create' ? 'Membuat...' : 'Memperbarui...'}
                </>
              ) : (
                <>
                  {type === 'create' ? 'Buat Pegawai' : 'Update Data'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
