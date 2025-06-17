'use client'

import { z } from "zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { joinUrl } from "@/lib/urlUtils";
import { fetchWithAuth, getValidToken } from "@/utils/authUtils";


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

// Define the LokasiShift enum to match Prisma schema
const LokasiShiftEnum = z.enum([
    'POLI_UMUM',
    'POLI_ANAK',
    'POLI_GIGI',
    'IGD',
    'ICU',
    'LABORATORIUM',
    'RADIOLOGI',
    'FARMASI',
    'EMERGENCY_ROOM',
]);

// Define the TipeShift enum to match Prisma schema
const TipeShiftEnum = z.enum([
    'PAGI',
    'SIANG',
    'MALAM',
    'ON_CALL',
    'JAGA',
]);

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
    
    // Watch for changes in the idpegawai field
    const selectedIdPegawai = watch("idpegawai");
    
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
                    if (!apiUrl) apiUrl = 'http://localhost:3004';
                    
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
                    console.warn('API request failed, fetching from mock data:', apiError);
                    
                    // Fallback to mock data
                    const mockResponse = await fetch('/mock-users.json');
                    if (!mockResponse.ok) {
                        throw new Error('Failed to fetch mock users data');
                    }
                    const mockUsersData = await mockResponse.json();
                    setUsers(mockUsersData);
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
            
            
            try {
                // Try to use the real API first
                let apiUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!apiUrl) apiUrl = 'http://localhost:3004';
                
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
                    throw new Error('API request failed');
                }
                
                const result = await response.json();
                console.log('Success from API:', result);
                
                // Call the appropriate callback
                if (type === "create") {
                    onCreate(result);
                } else if (type === "update" && onUpdate) {
                    onUpdate(result);
                }
            } catch (apiError) {
                console.warn('API request failed, using local mock implementation:', apiError);
                
                // Fallback to mock implementation
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                
                // Format date properly for display
                let formattedDate = formData.tanggal;
                let originalDate = formData.tanggal;
                
                // Handle different date formats
                if (formData.tanggal) {
                    try {
                        // For ISO date format (YYYY-MM-DD)
                        if (formData.tanggal.includes('-') && !formData.tanggal.includes('T')) {
                            const [year, month, day] = formData.tanggal.split('-');
                            formattedDate = `${day}/${month}/${year}`;
                            originalDate = formData.tanggal; // Keep original ISO format
                        } 
                        // For ISO datetime format (with T)
                        else if (formData.tanggal.includes('T')) {
                            const date = new Date(formData.tanggal);
                            if (!isNaN(date.getTime())) {
                                const day = date.getDate().toString().padStart(2, '0');
                                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                const year = date.getFullYear();
                                formattedDate = `${day}/${month}/${year}`;
                                originalDate = `${year}-${month}-${day}`;
                            }
                        }
                    } catch (e) {
                        console.error('Error formatting date:', e);
                    }
                }
                
                // Create a new object with formatted data
                const mockResult = {
                    ...formData,
                    id: type === "create" ? Date.now() : data?.id, // Generate a unique ID for new entries
                    tanggal: formattedDate, // Use formatted date for display
                    originalDate: originalDate // Store original date format for editing
                };
                
                console.log('Success from mock:', mockResult);
                
                // Call the appropriate callback
                if (type === "create") {
                    onCreate(mockResult);
                } else if (type === "update" && onUpdate) {
                    onUpdate(mockResult);
                }
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
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">{type === "create" ? "Create" : "Update"} data shift</h1>
            
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{errorMessage}</span>
                </div>
            )}
            
            <span className="text-xs text-gray-400 font-medium">Informasi Pegawai</span>
            <div className="flex justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-500">ID Pegawai (Pilih dari Pengguna Terdaftar)</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
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
                        <p className="text-xs text-red-400">{errors.idpegawai.message?.toString()}</p>
                    )}
                    {selectedUser && (
                        <p className="text-xs text-green-600 mt-1">
                            Pegawai terpilih: {selectedUser.namaDepan} {selectedUser.namaBelakang} (ID: {selectedUser.username})
                        </p>
                    )}
                </div>
                <InputField
                    label="Tanggal Shift"
                    name="tanggal"
                    type="date"
                    register={register}
                    error={errors.tanggal}
                    defaultValue={data?.originalDate || data?.tanggal}
                />
                {(data?.originalDate || data?.tanggal) && (
                    <div className="text-xs text-green-600 mt-1">
                        Format tanggal asli: {data?.originalDate || data?.tanggal}
                    </div>
                )}
            </div>
            <span className="text-xs text-gray-400 font-medium">Informasi Shift</span>
            <div className="flex justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2 w-full md:w-1/3 pb-4">
                    <label className="text-xs text-gray-500">Unit Kerja</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("lokasishift")}
                        defaultValue={data?.lokasishift || ""}
                    >
                        <option value="">-- Pilih Unit --</option>
                        <option value="POLI_UMUM">Poli Umum</option>
                        <option value="POLI_ANAK">Poli Anak</option>
                        <option value="POLI_GIGI">Poli Gigi</option>
                        <option value="IGD">IGD</option>
                        <option value="ICU">ICU</option>
                        <option value="LABORATORIUM">Laboratorium</option>
                        <option value="RADIOLOGI">Radiologi</option>
                        <option value="FARMASI">Farmasi</option>
                        <option value="EMERGENCY_ROOM">Emergency Room</option>
                    </select>
                    {errors.lokasishift && (
                        <p className="text-xs text-red-400">{errors.lokasishift.message?.toString()}</p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/3 pb-4">
                    <label className="text-xs text-gray-500">Tipe Shift</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("tipeshift")}
                        defaultValue={data?.tipeshift || ""}
                    >
                        <option value="">-- Pilih Tipe --</option>
                        <option value="PAGI">Pagi</option>
                        <option value="SIANG">Siang</option>
                        <option value="MALAM">Malam</option>
                        <option value="ON_CALL">On Call</option>
                        <option value="JAGA">Jaga</option>
                    </select>
                    {errors.tipeshift && (
                        <p className="text-xs text-red-400">{errors.tipeshift.message?.toString()}</p>
                    )}
                </div>
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
            
            {/* Success message */}
            {!errorMessage && isSubmitting && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">Menyimpan data...</span>
                </div>
            )}
            <button 
                type="submit"
                disabled={isSubmitting}
                className={`rounded-md text-white p-2 flex items-center justify-center ${
                    isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {type === "create" ? "Creating..." : "Updating..."}
                    </>
                ) : (
                    <>{type === "create" ? "Create" : "Update"}</>
                )}
            </button>
        </form>
    )
}

export default JadwalForm