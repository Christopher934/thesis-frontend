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
  'ADMIN': { desc: 'Administrator sistem dengan akses penuh', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  'DOKTER': { desc: 'Dokter spesialis dan umum', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  'PERAWAT': { desc: 'Perawat pelayanan medis', color: 'bg-green-50 text-green-800 border-green-200' },
  'STAF': { desc: 'Staf administrasi dan pendukung', color: 'bg-gray-50 text-gray-800 border-gray-200' },
  'SUPERVISOR': { desc: 'Supervisor pengawas operasional', color: 'bg-orange-50 text-orange-800 border-orange-200' }
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
      username: '', // Auto-generated, tidak perlu validasi strict
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
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const result = await response.json();
          const users = result.data || []; // API returns { data: users[], meta: {...} }
          const employeeIds = users
            .map((user: any) => user.employeeId || user.username)
            .filter((id: string) => id && id.length > 0);
          setExistingEmployeeIds(employeeIds);
          
          if (type === 'create' && selectedRole) {
            const newId = generateEmployeeId(selectedRole, employeeIds);
            setGeneratedEmployeeId(newId);
            // Update form value for username to prevent validation error
            setValue('username', newId);
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
    console.log('🚀 Form submission started with values:', values);
    console.log('🔑 Generated Employee ID:', generatedEmployeeId);
    
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Anda belum login.');

      // Enhanced payload with Employee ID integration
      const rawPayload: any = {
        username: generatedEmployeeId || `user_${Date.now()}`, // Use generated Employee ID as username or fallback
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
      console.log('📦 Final payload to send:', payload);

      let res: Response;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      if (type === 'create') {
        console.log(`🌐 Making POST request to: ${apiUrl}/users`);
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
        console.error('❌ API Error Response:', errJson);
        throw new Error((errJson as any).message || 'Permintaan gagal');
      }

      const result = await res.json();
      console.log('✅ API Success Response:', result);
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
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {type === 'create' ? 'Tambah Pegawai Baru' : 'Update Data Pegawai'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {type === 'create' 
                  ? 'Sistem akan otomatis generate Employee ID berdasarkan role'
                  : 'Perbarui informasi pegawai'
                }
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => {
          console.log('📝 Form onSubmit event triggered');
          onSubmit(e);
        }} className="p-6 space-y-6">
          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{errorMessage}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-800 text-sm">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Employee ID Preview for Create Mode */}
          {type === 'create' && generatedEmployeeId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Employee ID yang akan digenerate:</p>
                  <p className="text-xl font-bold text-blue-700 font-mono">{generatedEmployeeId}</p>
                  <p className="text-xs text-blue-600 mt-1">ID ini akan menjadi username login pegawai</p>
                </div>
              </div>
            </div>
          )}

          {/* Role Selection with Visual Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Role & Jabatan <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">-- Pilih Role --</option>
              {Object.entries(roleDescriptions).map(([role, info]) => (
                <option key={role} value={role}>
                  {role} - {info.desc}
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
              <div className={`border rounded-lg p-3 ${selectedRoleInfo.color}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-current/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedRole}</p>
                    <p className="text-sm opacity-80">{selectedRoleInfo.desc}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">
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
            <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">
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
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.jenisKelamin.message}
                </p>
              )}
            </div>

            {/* Status */}
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
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
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
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                console.log('🖱️ Submit button clicked');
                console.log('📋 Form errors:', errors);
                console.log('🔍 Error details:', JSON.stringify(errors, null, 2));
                console.log('⏳ Is submitting:', isSubmitting);
                
                // Also try to validate manually
                const currentValues = watch();
                console.log('📊 Current form values:', currentValues);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
