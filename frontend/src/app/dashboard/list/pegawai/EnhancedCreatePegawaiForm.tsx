// Enhanced Create Employee Form with Employee ID Integration
'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { pegawaiSchema, PegawaiInputs } from './pegawaiSchema';
import { User, Mail, Lock, Phone, Calendar, MapPin, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Building2, Hash } from 'lucide-react';

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
    tanggalLahir: string;
    jenisKelamin: 'L' | 'P';
    role: 'ADMIN' | 'DOKTER' | 'PERAWAT' | 'STAF' | 'SUPERVISOR';
    status: 'ACTIVE' | 'INACTIVE';
    employeeId?: string;
  };
  onClose: () => void;
  onCreate: (newPegawai: any) => void;
  onUpdate?: (updatedPegawai: any) => void;
};

// Enhanced Employee ID generation based on role
const generateEmployeeId = (role: string, existingEmployeeIds: string[] = []): string => {
  const prefixMap = {
    'ADMIN': 'ADM',
    'DOKTER': 'DOK', 
    'PERAWAT': 'PER',
    'STAF': 'STF',
    'SUPERVISOR': 'SUP'
  };
  
  const prefix = prefixMap[role as keyof typeof prefixMap] || 'STF';
  
  // Find the next available number
  let counter = 1;
  let newEmployeeId: string;
  
  do {
    newEmployeeId = `${prefix}${counter.toString().padStart(3, '0')}`;
    counter++;
  } while (existingEmployeeIds.includes(newEmployeeId) && counter <= 999);
  
  return newEmployeeId;
};

const roleDescriptions = {
  'ADMIN': { icon: '👨‍💼', desc: 'Administrator sistem dengan akses penuh', color: 'from-purple-500 to-purple-600' },
  'DOKTER': { icon: '👨‍⚕️', desc: 'Dokter spesialis dan umum', color: 'from-blue-500 to-blue-600' },
  'PERAWAT': { icon: '👩‍⚕️', desc: 'Perawat pelayanan medis', color: 'from-green-500 to-green-600' },
  'STAF': { icon: '👨‍💻', desc: 'Staf administrasi dan pendukung', color: 'from-gray-500 to-gray-600' },
  'SUPERVISOR': { icon: '👨‍🔧', desc: 'Supervisor pengawas operasional', color: 'from-orange-500 to-orange-600' }
};

export default function EnhancedCreatePegawaiForm({
  type,
  data,
  onClose,
  onCreate,
  onUpdate,
}: PegawaiFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState<string>('');
  const [existingEmployeeIds, setExistingEmployeeIds] = useState<string[]>([]);
  
  const defaultValues: Partial<PegawaiInputs> = React.useMemo(() => {
    if (type === 'update' && data) {
      return {
        username: data.username,
        email: data.email,
        password: '',
        namaDepan: data.namaDepan,
        namaBelakang: data.namaBelakang,
        alamat: data.alamat ?? '',
        noHp: data.noHp,
        tanggalLahir: data.tanggalLahir,
        jenisKelamin: data.jenisKelamin,
        role: data.role,
        status: data.status,
      };
    }
    return {
      jenisKelamin: 'L',
      role: 'STAF',
      status: 'ACTIVE',
    };
  }, [type, data]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<PegawaiInputs>({
    resolver: zodResolver(pegawaiSchema),
    defaultValues,
  });

  const selectedRole = watch('role');
  
  // Fetch existing employee IDs and generate new one
  useEffect(() => {
    const fetchEmployeeIds = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
        const response = await fetch(`${apiUrl}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const users = await response.json();
          const employeeIds = users
            .map((user: any) => user.employeeId || user.username)
            .filter((id: string) => id && id.length > 0);
          setExistingEmployeeIds(employeeIds);
          
          if (type === 'create' && selectedRole) {
            const newId = generateEmployeeId(selectedRole, employeeIds);
            setGeneratedEmployeeId(newId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch employee IDs:', error);
      }
    };
    
    fetchEmployeeIds();
  }, [selectedRole, type]);

  useEffect(() => {
    if (type === 'update' && data) {
      reset(defaultValues);
    }
  }, [type, data, defaultValues, reset]);

  function filterEmptyFields(obj: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Anda belum login.');

      // Enhanced payload with Employee ID integration
      const rawPayload: any = {
        username: generatedEmployeeId || values.username, // Use generated Employee ID as username
        email: values.email,
        ...(values.password ? { password: values.password } : {}),
        namaDepan: values.namaDepan,
        namaBelakang: values.namaBelakang,
        alamat: values.alamat,
        noHp: values.noHp,
        tanggalLahir: values.tanggalLahir,
        jenisKelamin: values.jenisKelamin,
        role: values.role,
        status: values.status,
        employeeId: generatedEmployeeId, // Set the generated Employee ID
      };

      const payload = filterEmptyFields(rawPayload);

      let res: Response;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      
      if (type === 'create') {
        res = await fetch(`${apiUrl}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        if (!data) throw new Error('Tidak ada data untuk update.');
        res = await fetch(`${apiUrl}/users/${data.id}`, {
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
          ? `Pegawai berhasil dibuat dengan Employee ID: ${generatedEmployeeId}`
          : 'Data pegawai berhasil diperbarui'
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
    } finally {
      setIsSubmitting(false);
    }
  });

  const selectedRoleInfo = selectedRole ? roleDescriptions[selectedRole as keyof typeof roleDescriptions] : null;

  return (
    <div className="w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-t-2xl p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {type === 'create' ? 'Tambah Pegawai Baru' : 'Update Data Pegawai'}
            </h2>
            <p className="text-blue-100 mt-1 text-sm">
              {type === 'create' 
                ? 'Sistem akan otomatis generate Employee ID berdasarkan role'
                : 'Perbarui informasi pegawai'
              }
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-b-2xl shadow-xl border-x border-b border-gray-200">
        <div className="p-3 space-y-3">
          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">{errorMessage}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Employee ID Preview for Create Mode */}
          {type === 'create' && generatedEmployeeId && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Employee ID yang akan digenerate:</p>
                  <p className="text-2xl font-bold text-blue-700 font-mono">{generatedEmployeeId}</p>
                  <p className="text-xs text-blue-600 mt-1">ID ini akan menjadi username login pegawai</p>
                </div>
              </div>
            </div>
          )}

          {/* Role Selection with Visual Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800">
              Role & Jabatan <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">-- Pilih Role --</option>
              {Object.entries(roleDescriptions).map(([role, info]) => (
                <option key={role} value={role}>
                  {info.icon} {role} - {info.desc}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.role.message}
              </p>
            )}
            
            {/* Role Preview */}
            {selectedRoleInfo && (
              <div className={`bg-gradient-to-r ${selectedRoleInfo.color} text-white p-3 rounded-lg`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedRoleInfo.icon}</span>
                  <div>
                    <p className="font-semibold">{selectedRole}</p>
                    <p className="text-sm opacity-90">{selectedRoleInfo.desc}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                <User className="inline h-4 w-4 mr-1" />
                Nama Depan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('namaDepan')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Masukkan nama depan"
              />
              {errors.namaDepan && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.namaDepan.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                <User className="inline h-4 w-4 mr-1" />
                Nama Belakang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('namaBelakang')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Masukkan nama belakang"
              />
              {errors.namaBelakang && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.namaBelakang.message}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                <Mail className="inline h-4 w-4 mr-1" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="contoh@email.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                <Phone className="inline h-4 w-4 mr-1" />
                Nomor HP <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('noHp')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="08xxxxxxxxxx"
              />
              {errors.noHp && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.noHp.message}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              <Lock className="inline h-4 w-4 mr-1" />
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Masukkan password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Birth Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                <Calendar className="inline h-4 w-4 mr-1" />
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('tanggalLahir')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {errors.tanggalLahir && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.tanggalLahir.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                {...register('jenisKelamin')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Pilih</option>
                <option value="L">👨 Laki-laki</option>
                <option value="P">👩 Perempuan</option>
              </select>
              {errors.jenisKelamin && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.jenisKelamin.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                <Shield className="inline h-4 w-4 mr-1" />
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="ACTIVE">✅ ACTIVE</option>
                <option value="INACTIVE">❌ INACTIVE</option>
              </select>
              {errors.status && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              <MapPin className="inline h-4 w-4 mr-1" />
              Alamat
            </label>
            <textarea
              {...register('alamat')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              placeholder="Masukkan alamat lengkap..."
            />
            {errors.alamat && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.alamat.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center gap-2 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {type === 'create' ? 'Membuat...' : 'Memperbarui...'}
                </>
              ) : (
                <>
                  {type === 'create' ? '➕ Buat Pegawai' : '💾 Update Data'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
