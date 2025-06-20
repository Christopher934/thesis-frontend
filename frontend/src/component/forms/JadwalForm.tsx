'use client'

import { z } from "zod";
import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { joinUrl } from "@/lib/urlUtils";
import { Calendar, Clock, Users, Building2, AlertCircle, CheckCircle2 } from "lucide-react";


// Type for User data 
type User = {
    id: number;
    username: string;
    email: string;
    namaDepan: string;
    namaBelakang: string;
    role: string;
    status: string;
    jenisKelamin?: string;
}

// Define the LokasiShift enum to match updated RSUD Prisma schema
const LokasiShiftEnum = z.enum([
    'GEDUNG_ADMINISTRASI',
    'RAWAT_JALAN',
    'RAWAT_INAP',
    'GAWAT_DARURAT',
    'LABORATORIUM',
    'FARMASI',
    'RADIOLOGI',
    'GIZI',
    'KEAMANAN',
    'LAUNDRY',
    'CLEANING_SERVICE',
    'SUPIR',
    'ICU',
    'NICU',
]);

// Define the TipeShift enum to match Prisma schema
const TipeShiftEnum = z.enum([
    'PAGI',
    'SIANG',
    'MALAM',
    'ON_CALL',
    'JAGA',
]);

// Helper function to format location names
const formatLokasiShift = (lokasi: string): string => {
  const lokasiMapping: { [key: string]: string } = {
    'GEDUNG_ADMINISTRASI': 'Gedung Administrasi',
    'RAWAT_JALAN': 'Rawat Jalan',
    'RAWAT_INAP': 'Rawat Inap',
    'GAWAT_DARURAT': 'Gawat Darurat',
    'LABORATORIUM': 'Laboratorium',
    'FARMASI': 'Farmasi',
    'RADIOLOGI': 'Radiologi',
    'GIZI': 'Gizi',
    'KEAMANAN': 'Keamanan',
    'LAUNDRY': 'Laundry',
    'CLEANING_SERVICE': 'Cleaning Service',
    'SUPIR': 'Supir',
    'ICU': 'ICU',
    'NICU': 'NICU',
  };
  return lokasiMapping[lokasi] || lokasi;
};

// RSUD Department configurations with suggested times
const DEPARTMENT_CONFIGS = {
  'GEDUNG_ADMINISTRASI': {
    name: 'Gedung Administrasi',
    icon: '🏢',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '17:00' },
    },
    workdays: 'Sen-Kam: 08:00-17:00, Jum: 08:00-11:30'
  },
  'RAWAT_JALAN': {
    name: 'Rawat Jalan',
    icon: '🏥',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '15:00' },
    },
    workdays: 'Sen-Jum: 08:00-15:00, Sab: 08:00-11:30'
  },
  'RAWAT_INAP': {
    name: 'Rawat Inap',
    icon: '🛏️',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '15:00' },
      'SIANG': { start: '15:00', end: '21:00' },
      'MALAM': { start: '20:00', end: '08:00' },
    },
    workdays: '3 Shift - 24/7'
  },
  'GAWAT_DARURAT': {
    name: 'Gawat Darurat',
    icon: '🚑',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '15:00' },
      'SIANG': { start: '15:00', end: '21:00' },
      'MALAM': { start: '20:00', end: '08:00' },
    },
    workdays: '3 Shift - 24/7'
  },
  'LABORATORIUM': {
    name: 'Laboratorium',
    icon: '🔬',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '17:00' },
      'MALAM': { start: '17:00', end: '08:00' },
    },
    workdays: '2 Shift - 24/7'
  },
  'FARMASI': {
    name: 'Farmasi',
    icon: '💊',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '17:00' },
      'MALAM': { start: '17:00', end: '08:00' },
    },
    workdays: '2 Shift - 24/7'
  },
  'RADIOLOGI': {
    name: 'Radiologi',
    icon: '📷',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '17:00' },
      'MALAM': { start: '17:00', end: '08:00' },
    },
    workdays: '2 Shift - 24/7'
  },
  'GIZI': {
    name: 'Gizi',
    icon: '🍽️',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '17:00' },
      'MALAM': { start: '17:00', end: '08:00' },
    },
    workdays: '2 Shift - 24/7'
  },
  'KEAMANAN': {
    name: 'Keamanan',
    icon: '🛡️',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '17:00' },
      'MALAM': { start: '17:00', end: '08:00' },
    },
    workdays: '2 Shift - 24/7'
  },
  'LAUNDRY': {
    name: 'Laundry',
    icon: '🧺',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '15:00' },
    },
    workdays: 'Sen-Jum: 08:00-15:00, Sab: 08:00-11:30'
  },
  'CLEANING_SERVICE': {
    name: 'Cleaning Service',
    icon: '🧹',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '15:00' },
    },
    workdays: 'Sen-Jum: 08:00-15:00, Sab: 08:00-11:30'
  },
  'SUPIR': {
    name: 'Supir',
    icon: '🚗',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '17:00' },
      'MALAM': { start: '17:00', end: '08:00' },
    },
    workdays: '2 Shift - 24/7'
  },
  'ICU': {
    name: 'ICU',
    icon: '⚕️',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '15:00' },
      'SIANG': { start: '15:00', end: '21:00' },
      'MALAM': { start: '20:00', end: '08:00' },
    },
    workdays: '3 Shift - 24/7'
  },
  'NICU': {
    name: 'NICU',
    icon: '👶',
    suggestedTimes: {
      'PAGI': { start: '08:00', end: '15:00' },
      'SIANG': { start: '15:00', end: '21:00' },
      'MALAM': { start: '20:00', end: '08:00' },
    },
    workdays: '3 Shift - 24/7'
  },
};

const schema = z.object({
    nama: z.string()
        .min(3, { message: 'Nama pegawai minimal 3 karakter' })
        .max(50, { message: 'Nama pegawai maksimal 50 karakter' }),
    idpegawai: z.string()
        .min(3, { message: 'ID pegawai dibutuhkan' }),
    userId: z.number().optional(),
    lokasishift: LokasiShiftEnum,
    tipeshift: TipeShiftEnum,
    tanggal: z.string()
        .min(1, { message: 'Tanggal dibutuhkan!' }),
    jammulai: z.string()
        .min(1, { message: 'Jam mulai dibutuhkan!' }),
    jamselesai: z.string()
        .min(1, { message: 'Jam selesai dibutuhkan!' }),
});
type Inputs = z.infer<typeof schema>;


const JadwalForm = ({ 
    type, 
    data, 
    onClose, 
    onCreate, 
    onUpdate 
}: { 
    type: "create" | "update"; 
    data?: any; 
    onClose: () => void;
    onCreate: (newData: any) => void;
    onUpdate?: (updatedData: any) => void;
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
        defaultValues: data || {}
    });
    
    // Watch for changes in form fields
    const selectedIdPegawai = watch("idpegawai");
    const selectedLokasiShift = watch("lokasishift");
    const selectedTipeShift = watch("tipeshift");
    
    // Get suggested times based on location and shift type
    const suggestedTimes = useMemo(() => {
        if (selectedLokasiShift && selectedTipeShift) {
            const config = DEPARTMENT_CONFIGS[selectedLokasiShift as keyof typeof DEPARTMENT_CONFIGS];
            if (config && config.suggestedTimes[selectedTipeShift as keyof typeof config.suggestedTimes]) {
                return config.suggestedTimes[selectedTipeShift as keyof typeof config.suggestedTimes];
            }
        }
        return null;
    }, [selectedLokasiShift, selectedTipeShift]);
    
    // Auto-fill times when suggested times are available
    useEffect(() => {
        if (suggestedTimes && type === "create") {
            setValue('jammulai', suggestedTimes.start);
            setValue('jamselesai', suggestedTimes.end);
        }
    }, [suggestedTimes, setValue, type]);
    
    // Get available shift types for selected location
    const availableShiftTypes = useMemo(() => {
        if (selectedLokasiShift) {
            const config = DEPARTMENT_CONFIGS[selectedLokasiShift as keyof typeof DEPARTMENT_CONFIGS];
            if (config) {
                return Object.keys(config.suggestedTimes);
            }
        }
        return ['PAGI', 'SIANG', 'MALAM', 'ON_CALL', 'JAGA'];
    }, [selectedLokasiShift]);
    
    // Fetch users when component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Anda belum login');
                }
                
                try {
                    // Try to fetch from the API server first
                    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
                    if (!apiUrl) apiUrl = 'http://localhost:3001';
                    
                    console.log('Using API URL for fetching users:', apiUrl);
                    const url = joinUrl(apiUrl, '/users');
                    const response = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error('API request failed');
                    }
                    
                    const usersData = await response.json();
                    setUsers(usersData);
                } catch (apiError) {
                    console.error('Error fetching users from API:', apiError);
                    setErrorMessage('Failed to load user data from backend');
                }
            } catch (error: any) {
                console.error('Error fetching users:', error);
                setErrorMessage('Failed to load user data: ' + error.message);
            }
        };
        
        fetchUsers();
    }, []);
    
    // Validate and update form when user is selected
    useEffect(() => {
        if (!selectedIdPegawai) {
            setSelectedUser(null);
            setValue('nama', '');
            setValue('userId', undefined);
            return;
        }
        
        // Find the user in our local state
        const user = users.find(u => u.username === selectedIdPegawai);
        if (user) {
            console.log(`User found: ${user.namaDepan} ${user.namaBelakang} (${user.username})`);
            setSelectedUser(user);
            setValue('nama', `${user.namaDepan} ${user.namaBelakang}`);
            setValue('userId', user.id);
        } else {
            console.log(`No user found with ID ${selectedIdPegawai}`);
            setErrorMessage('ID Pegawai tidak valid. Silakan pilih dari daftar yang tersedia.');
            setValue('nama', '');
            setValue('userId', undefined);
            setSelectedUser(null);
        }
    }, [selectedIdPegawai, users, setValue]);
    
    // Always set default values if we have data
    useEffect(() => {
        if (data && data.idpegawai) {
            setValue('idpegawai', data.idpegawai);
            setValue('nama', data.nama);
            setValue('userId', data.userId);        }
    }, [data, setValue]);
    
    const onSubmit = handleSubmit(async (formData) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        
        try {
            // Log form data before submission for debugging
            console.log('Submitting jadwal form data:', formData);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Anda belum login');
            }
            
            // Make sure we have a valid userId from a registered user
            if (!formData.userId || !formData.idpegawai) {
                throw new Error('ID Pegawai tidak valid. Silakan pilih dari daftar yang tersedia.');
            }
            
            // Double-check that the user exists in our local data
            const user = users.find(u => 
                (u.id === formData.userId) || 
                (u.username === formData.idpegawai)
            );
            
            if (!user) {
                throw new Error('ID Pegawai tidak valid. Silakan pilih dari daftar yang tersedia.');
            }
            
            // Always use the validated user information
            formData.userId = user.id;
            formData.idpegawai = user.username;
            formData.nama = `${user.namaDepan} ${user.namaBelakang}`;
            console.log(`User validated for form submission: ${user.namaDepan} ${user.namaBelakang} (${user.username})`);
            
            
            // Use the real API
            let apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) apiUrl = 'http://localhost:3001';
            
            console.log('Using API URL for shifts:', apiUrl);
            const endpoint = type === "create" 
                ? joinUrl(apiUrl, '/shifts')
                : joinUrl(apiUrl, '/shifts/' + data?.id);
                
            const method = type === "create" ? 'POST' : 'PUT';
            
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API request failed: ${response.status} ${errorData}`);
            }
            
            const result = await response.json();
            console.log('Success from API:', result);
            
            // Call the appropriate callback
            if (type === "create") {
                onCreate(result);
            } else if (type === "update" && onUpdate) {
                onUpdate(result);
            }
            
            // Reset form after successful submission if creating new
            if (type === "create") {
                reset();
            }
            
            // Close the modal
            onClose();
            
        } catch (error: any) {
            console.error('Error:', error);
            setErrorMessage(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    });
    return (
        <div className="w-full max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold mb-1">
                            {type === "create" ? "Tambah Jadwal Shift Baru" : "Edit Jadwal Shift"}
                        </h1>
                        <p className="text-blue-100 text-xs md:text-sm leading-relaxed">
                            {type === "create" 
                                ? "Buat jadwal shift baru untuk pegawai RSUD Anugerah Tomohon" 
                                : "Perbarui informasi jadwal shift pegawai"
                            }
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={onSubmit} className="bg-white rounded-b-2xl shadow-2xl border border-gray-100">
                <div className="p-5 space-y-6">
                    {/* Error Message */}
                    {errorMessage && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <div className="p-1 bg-red-100 rounded-lg mr-2">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                </div>
                                <span className="text-red-800 font-medium text-xs md:text-sm">{errorMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <div className="p-1 bg-green-100 rounded-lg mr-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="text-green-800 font-medium text-xs md:text-sm">{successMessage}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Employee Information Section */}
                    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-gray-900">Informasi Pegawai</h2>
                                <p className="text-gray-600 text-xs md:text-sm">Data pegawai yang akan dijadwalkan</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs md:text-sm font-semibold text-gray-800">
                                    ID Pegawai *
                                </label>
                                <select
                                    className={`w-full px-3 py-2 text-xs md:text-sm border rounded-lg bg-white transition-all duration-200 shadow-sm ${
                                        errors.idpegawai 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                    } focus:ring-2 focus:outline-none hover:border-gray-400`}
                                    {...register("idpegawai")}
                                    defaultValue={data?.idpegawai || ""}
                                >
                                    <option value="">-- Pilih Pegawai --</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.username}>
                                            {user.username} - {user.namaDepan} {user.namaBelakang} ({user.role})
                                        </option>
                                    ))}
                                </select>
                                {errors.idpegawai && (
                                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{errors.idpegawai.message?.toString()}</span>
                                    </p>
                                )}
                                {selectedUser && (
                                    <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
                                        <p className="text-xs text-green-800 font-medium flex items-start gap-2">
                                            <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="break-words">
                                                Pegawai terpilih: <strong className="break-words">{selectedUser.namaDepan} {selectedUser.namaBelakang}</strong> 
                                                <br />
                                                <span className="text-green-700">(ID: {selectedUser.username})</span>
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-xs md:text-sm font-semibold text-gray-800">
                                    Tanggal Shift *
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className={`w-full px-3 py-2 text-xs md:text-sm border rounded-lg bg-white transition-all duration-200 shadow-sm ${
                                            errors.tanggal 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                        } focus:ring-2 focus:outline-none hover:border-gray-400`}
                                        {...register("tanggal")}
                                        defaultValue={data?.originalDate || data?.tanggal}
                                    />
                                    <Calendar className="absolute right-2 top-2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.tanggal && (
                                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{errors.tanggal.message?.toString()}</span>
                                    </p>
                                )}
                                {(data?.originalDate || data?.tanggal) && (
                                    <p className="mt-1 text-xs text-green-600 font-medium truncate">
                                        Format tanggal asli: {data?.originalDate || data?.tanggal}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shift Information Section */}
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-gray-900">Informasi Shift</h2>
                                <p className="text-gray-600 text-xs md:text-sm">Detail lokasi dan waktu kerja</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Location Selection */}
                            <div className="space-y-2">
                                <label className="block text-xs md:text-sm font-semibold text-gray-800">
                                    Unit Kerja *
                                </label>
                                <select
                                    className={`w-full px-3 py-2 text-xs md:text-sm border rounded-lg bg-white transition-all duration-200 shadow-sm ${
                                        errors.lokasishift 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                    } focus:ring-2 focus:outline-none hover:border-gray-400`}
                                    {...register("lokasishift")}
                                    defaultValue={data?.lokasishift || ""}
                                >
                                    <option value="">-- Pilih Unit Kerja --</option>
                                    {Object.entries(DEPARTMENT_CONFIGS).map(([key, config]) => (
                                        <option key={key} value={key}>
                                            {config.icon} {config.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.lokasishift && (
                                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{errors.lokasishift.message?.toString()}</span>
                                    </p>
                                )}
                                {selectedLokasiShift && (
                                    <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                                        <p className="text-xs text-blue-800 font-medium flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                            <span className="truncate">
                                                {DEPARTMENT_CONFIGS[selectedLokasiShift as keyof typeof DEPARTMENT_CONFIGS]?.workdays}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Shift Type Selection */}
                            <div className="space-y-2">
                                <label className="block text-xs md:text-sm font-semibold text-gray-800">
                                    Tipe Shift *
                                </label>
                                <select
                                    className={`w-full px-3 py-2 text-xs md:text-sm border rounded-lg bg-white transition-all duration-200 shadow-sm ${
                                        errors.tipeshift 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                    } focus:ring-2 focus:outline-none hover:border-gray-400`}
                                    {...register("tipeshift")}
                                    defaultValue={data?.tipeshift || ""}
                                >
                                    <option value="">-- Pilih Tipe Shift --</option>
                                    {availableShiftTypes.map(shiftType => (
                                        <option key={shiftType} value={shiftType}>
                                            {shiftType === 'PAGI' ? '🌅 Pagi' :
                                             shiftType === 'SIANG' ? '☀️ Siang' :
                                             shiftType === 'MALAM' ? '🌙 Malam' :
                                             shiftType === 'ON_CALL' ? '📞 On Call' :
                                             shiftType === 'JAGA' ? '🛡️ Jaga' : shiftType}
                                        </option>
                                    ))}
                                </select>
                                {errors.tipeshift && (
                                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{errors.tipeshift.message?.toString()}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <label className="block text-xs md:text-sm font-semibold text-gray-800">
                                    Jam Mulai *
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        className={`w-full px-3 py-2 text-xs md:text-sm border rounded-lg bg-white transition-all duration-200 shadow-sm ${
                                            errors.jammulai 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                        } focus:ring-2 focus:outline-none hover:border-gray-400`}
                                        {...register("jammulai")}
                                        defaultValue={data?.jammulai}
                                    />
                                    <Clock className="absolute right-2 top-2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.jammulai && (
                                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{errors.jammulai.message?.toString()}</span>
                                    </p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-xs md:text-sm font-semibold text-gray-800">
                                    Jam Selesai *
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        className={`w-full px-3 py-2 text-xs md:text-sm border rounded-lg bg-white transition-all duration-200 shadow-sm ${
                                            errors.jamselesai 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                        } focus:ring-2 focus:outline-none hover:border-gray-400`}
                                        {...register("jamselesai")}
                                        defaultValue={data?.jamselesai}
                                    />
                                    <Clock className="absolute right-2 top-2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.jamselesai && (
                                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{errors.jamselesai.message?.toString()}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Suggested Times */}
                        {suggestedTimes && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-md shadow-sm">
                                        <Clock className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-yellow-800 block">
                                            💡 Waktu yang disarankan
                                        </span>
                                        <span className="text-xs font-medium text-yellow-700 truncate block">
                                            {suggestedTimes.start} - {suggestedTimes.end}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {isSubmitting && (
                        <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                                <span className="text-blue-700 font-semibold text-sm">
                                    {type === "create" ? "Menyimpan jadwal..." : "Memperbarui jadwal..."}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 rounded-b-2xl flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2 text-white font-semibold text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md ${
                            isSubmitting 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900'
                        }`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                {type === "create" ? "Menyimpan..." : "Memperbarui..."}
                            </div>
                        ) : (
                            <>{type === "create" ? "💾 Simpan Jadwal" : "✏️ Update Jadwal"}</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default JadwalForm