'use client'

import { z } from "zod";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import Select from "../Select";
import { setupTestUser } from "@/lib/testUserSetup";
import DebugPanel from "../DebugPanel";
import { isCriticalUnit, getSpecialization } from '@/lib/unitUtils';


// Define schema based on the real data requirements
const schema = z.object({
    shiftSendiriId: z.string().min(1, { message: 'Pilih shift Anda terlebih dahulu' }),
    pegawaiTujuanId: z.string().min(1, { message: 'Pilih pegawai tujuan' }),
    shiftTujuanId: z.string().min(1, { message: 'Pilih shift tujuan' }),
    alasan: z.string().min(3, { message: 'Berikan alasan minimal 3 karakter' }).max(500, { message: 'Alasan maksimal 500 karakter' }),
});

type Inputs = z.infer<typeof schema>;

type ShiftType = {
    id: number;
    tanggal: string;
    jammulai: string;
    jamselesai: string;
    lokasishift: string;
    idpegawai: string;
    userId?: number;       // Optional to handle different API formats
    user_id?: number;      // Alternative field name that might be used
    nama?: string;         // Might be missing in API responses
    user?: {               // Nested user data that might be returned instead
        id: number;
        nama?: string;
        namaDepan?: string;
        namaBelakang?: string;
    };
};

type UserType = {
    id: number;
    username?: string;
    email?: string;
    namaDepan?: string;     // Indonesian format
    namaBelakang?: string;  // Indonesian format
    firstName?: string;     // Alternative English format
    lastName?: string;      // Alternative English format
    first_name?: string;    // Alternative snake_case format
    last_name?: string;     // Alternative snake_case format
    name?: string;          // Full name in a single field
    role: string;
    status: string;
};

const TukarShiftForm = ({ 
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
    const [shifts, setShifts] = useState<ShiftType[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [myShifts, setMyShifts] = useState<ShiftType[]>([]);
    const [targetShifts, setTargetShifts] = useState<ShiftType[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
        defaultValues: type === "update" ? {
            shiftSendiriId: data?.shiftSendiriId?.toString() || "",
            pegawaiTujuanId: data?.pegawaiTujuanId?.toString() || "",
            shiftTujuanId: data?.shiftTujuanId?.toString() || "",
            alasan: data?.alasan || ""
        } : undefined
    });

    // Watch for changes to the target employee selection
    const selectedPegawaiTujuanId = watch("pegawaiTujuanId");

    // Fetch shifts and users data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Call the setup function to ensure a test user exists
                setupTestUser();
                
                // Get current user ID and role from localStorage
                const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                const user = userString ? JSON.parse(userString) : null;
                const userId = user?.id || 1; // Default to 1 if not found
                const userRole = user?.role || localStorage.getItem('role') || 'DOKTER'; // Default to DOKTER if role not found
                const specialization = getSpecialization(userRole);
                
                console.log('Current user:', user);
                console.log('Using role for filtering:', userRole);
                console.log('Specialization:', specialization);
                
                // Check if token exists
                const token = localStorage.getItem('token');
                if (!token) {
                    alert("Sesi Anda telah berakhir. Silakan login kembali.");
                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1000);
                    return;
                }
                
                setCurrentUserId(userId);
                
                // Get API base URL from environment or use default
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
                
                if (!token) {
                    throw new Error('Authentication token not found');
                }
                
                try {
                    // Fetch shifts data from API
                    console.log('Fetching shifts from API:', `${apiUrl}/shifts`);
                    const shiftsResponse = await fetch(`${apiUrl}/shifts`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    // Check for unauthorized (expired token)
                    if (shiftsResponse.status === 401) {
                        alert("Sesi Anda telah berakhir. Silakan login kembali.");
                        localStorage.removeItem("token"); // Clear invalid token
                        // Redirect to login page
                        window.location.href = "/login";
                        return;
                    }
                    
                    if (!shiftsResponse.ok) {
                        throw new Error(`Failed to fetch shifts: ${shiftsResponse.status}`);
                    }
                    
                    const shiftsData = await shiftsResponse.json();
                    console.log('Shifts data from API:', shiftsData);
                    setShifts(shiftsData);
                    
                    // Filter shifts for current user with flexible field handling
                    const userShifts = shiftsData.filter((shift: ShiftType) => {
                        // Check both possible ID field formats
                        return (shift.userId === userId || 
                                shift.user_id === userId || 
                                shift.idpegawai === user?.username);
                    });
                    console.log('Filtered shifts for current user:', userShifts);
                    setMyShifts(userShifts);
                } catch (error) {
                    console.error("Error fetching shifts:", error);
                    // Try to fallback to mock shifts if API fails
                    console.log('Falling back to mock shifts data');
                    const mockShiftsResponse = await fetch('/mock-shifts.json');
                    if (!mockShiftsResponse.ok) {
                        throw new Error('Failed to fetch mock shifts data');
                    }
                    const mockShiftsData = await mockShiftsResponse.json();
                    setShifts(mockShiftsData);
                    
                    // Filter shifts for current user with flexible field handling
                    const userShifts = mockShiftsData.filter((shift: ShiftType) => {
                        // Check both possible ID field formats
                        return (shift.userId === userId || 
                                shift.user_id === userId || 
                                shift.idpegawai === user?.username);
                    });
                    console.log('Filtered mock shifts for current user:', userShifts);
                    setMyShifts(userShifts);
                }
                
                try {
                    // Fetch users data from API
                    console.log('Fetching users from API:', `${apiUrl}/users`);
                    const usersResponse = await fetch(`${apiUrl}/users`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    // Check for unauthorized (expired token)
                    if (usersResponse.status === 401) {
                        alert("Sesi Anda telah berakhir. Silakan login kembali.");
                        localStorage.removeItem("token"); // Clear invalid token
                        // Redirect to login page
                        window.location.href = "/login";
                        return;
                    }
                    
                    if (!usersResponse.ok) {
                        throw new Error(`Failed to fetch users: ${usersResponse.status}`);
                    }
                    
                    const usersData: UserType[] = await usersResponse.json();
                    console.log('Users data from API:', usersData);
                    
                    // Filter out current user and inactive users
                    let activeUsers = usersData.filter((otherUser: UserType) => 
                        otherUser.id !== userId && 
                        otherUser.status === "ACTIVE"
                    );

                    // Apply role-specific filters
                    if (specialization) {
                        // For specialists, only allow swaps with same specialization
                        activeUsers = activeUsers.filter(otherUser => 
                            getSpecialization(otherUser.role) === specialization
                        );
                    } else if (userRole === "DOKTER") {
                        // General doctors can only swap with other general doctors
                        activeUsers = activeUsers.filter(otherUser => 
                            otherUser.role === "DOKTER"
                        );
                    } else {
                        // Other roles can only swap within same role
                        activeUsers = activeUsers.filter(otherUser => 
                            otherUser.role === userRole
                        );
                    }
                    
                    console.log('Current user role:', userRole);
                    console.log('Available users with same role:', activeUsers);
                    
                    // If no active users with same role, show all active users as a fallback
                    if (activeUsers.length === 0) {
                        console.log('No users with same role found, showing all active users as fallback');
                        const allActiveUsers = usersData.filter((u: UserType) => u.id !== userId && u.status === "ACTIVE");
                        setUsers(allActiveUsers);
                    } else {
                        setUsers(activeUsers);
                    }
                } catch (error) {
                    console.error("Error fetching users:", error);
                    // Try to fallback to mock users if API fails
                    console.log('Falling back to mock users data');
                    const mockUsersResponse = await fetch('/mock-users.json');
                    if (!mockUsersResponse.ok) {
                        throw new Error('Failed to fetch mock users data');
                    }
                    const mockUsersData: UserType[] = await mockUsersResponse.json();
                    
                    // Filter mock users like we would with real users
                    const activeUsers = mockUsersData.filter((otherUser: UserType) => 
                        otherUser.id !== userId && 
                        otherUser.status === "ACTIVE" &&
                        otherUser.role === userRole
                    );
                    
                    if (activeUsers.length === 0) {
                        const allActiveUsers = mockUsersData.filter((u: UserType) => u.id !== userId && u.status === "ACTIVE");
                        setUsers(allActiveUsers);
                    } else {
                        setUsers(activeUsers);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Update target shifts when target employee changes
    useEffect(() => {
        if (selectedPegawaiTujuanId) {
            const targetId = parseInt(selectedPegawaiTujuanId);
            const filteredShifts = shifts.filter(shift => {
                const shiftUserId = shift.userId || shift.user_id || (shift.user && shift.user.id);
                
                // Basic user ID matching
                const userMatch = shiftUserId === targetId;

                // Get the current user's selected shift
                const mySelectedShift = myShifts.find(s => s.id.toString() === watch("shiftSendiriId"));
                
                if (mySelectedShift) {
                    const myLocation = (mySelectedShift.lokasishift || "").toUpperCase();
                    const targetLocation = (shift.lokasishift || "").toUpperCase();
                    
                    // For critical units - only allow swaps within the same unit
                    if (isCriticalUnit(myLocation) || isCriticalUnit(targetLocation)) {
                        // Only return shifts in the same critical unit
                        return userMatch && myLocation === targetLocation;
                    }
                }
                
                return userMatch;
            });
            
            console.log(`Filtered shifts for target user ID ${targetId}:`, filteredShifts);
            setTargetShifts(filteredShifts);
            
            // Reset shift target selection when employee changes
            setValue("shiftTujuanId", "");
        } else {
            setTargetShifts([]);
        }
    }, [selectedPegawaiTujuanId, shifts, setValue, watch, myShifts]);

    // Enhanced role-based filtering with specialization checking
    useEffect(() => {
        const userRole = localStorage.getItem('role') || '';
        const specialization = getSpecialization(userRole);

        // Only filter users if the users list is not empty and currentUserId is set
        if (!users.length || !currentUserId) return;

        let filteredUsers = users.filter(otherUser => 
            otherUser.id !== currentUserId && 
            otherUser.status === "ACTIVE"
        );

        // Apply role-specific filters
        if (specialization) {
            filteredUsers = filteredUsers.filter(otherUser => 
                getSpecialization(otherUser.role) === specialization
            );
        } else if (userRole === "DOKTER") {
            filteredUsers = filteredUsers.filter(otherUser => 
                otherUser.role === "DOKTER"
            );
        } else {
            filteredUsers = filteredUsers.filter(otherUser => 
                otherUser.role === userRole
            );
        }

        setUsers(filteredUsers);
    }, [currentUserId, users.length]);

    const onSubmit = handleSubmit(async (formData) => {
        try {
            setSubmitting(true);
            
            const myShift = shifts.find(s => s.id.toString() === formData.shiftSendiriId);
            const targetShift = shifts.find(s => s.id.toString() === formData.shiftTujuanId);
            const targetUser = users.find(u => u.id.toString() === formData.pegawaiTujuanId);
            
            if (!myShift || !targetShift || !targetUser) {
                throw new Error("Data tidak lengkap");
            }
            
            // Check for critical unit restrictions
            const myLocation = (myShift.lokasishift || "").toUpperCase();
            const targetLocation = (targetShift.lokasishift || "").toUpperCase();
            
            if (isCriticalUnit(myLocation) || isCriticalUnit(targetLocation)) {
                if (myLocation !== targetLocation) {
                    throw new Error("Tukar shift untuk unit kritikal hanya dapat dilakukan dalam unit yang sama");
                }
            }
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Sesi Anda telah berakhir. Silakan login kembali.");
                window.location.href = "/login";
                return;
            }
            
            // Create payload with unit head requirement flag
            const payload = {
                requestorId: currentUserId,
                requestorShiftId: parseInt(formData.shiftSendiriId),
                targetId: parseInt(formData.pegawaiTujuanId),
                targetShiftId: parseInt(formData.shiftTujuanId),
                reason: formData.alasan,
                status: "PENDING",
                requiresUnitHead: isCriticalUnit(myLocation) || isCriticalUnit(targetLocation)
            };
            
            // Get API base URL from environment or use default
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
            
            console.log('Submitting tukar shift request to API:', payload);
            
            let responseData;
            
            try {
                // Send request to API
                const response = await fetch(`${apiUrl}/shift-swap-requests`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.status === 401) {
                    alert("Sesi Anda telah berakhir. Silakan login kembali.");
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                    return;
                }
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `API request failed with status ${response.status}`);
                }
                
                responseData = await response.json();
                console.log('API response:', responseData);
            } catch (error) {
                console.error("Error submitting to API:", error);
                // Create a simulated response for UI update if API fails
                console.log("Creating simulated response for UI update");
                responseData = {
                    id: Date.now(),
                    createdAt: new Date().toISOString(),
                    ...payload
                };
                alert("Tidak dapat terhubung ke server. Data disimpan secara lokal sementara.");
            }
            
            // Create frontend-formatted data for UI update
            const tukarShiftRequest = {
                id: responseData.id || Date.now(),
                pengaju: { 
                    id: currentUserId, 
                    nama: myShift.nama 
                },
                targetUser: { 
                    id: targetUser.id, 
                    nama: `${targetUser.namaDepan} ${targetUser.namaBelakang}` 
                },
                tanggal: myShift.tanggal,
                lokasiShift: myShift.lokasishift,
                jamMulai: myShift.jammulai,
                jamSelesai: myShift.jamselesai,
                targetTanggal: targetShift.tanggal,
                targetLokasiShift: targetShift.lokasishift,
                targetJamMulai: targetShift.jammulai,
                targetJamSelesai: targetShift.jamselesai,
                alasan: formData.alasan,
                status: isCriticalUnit(myLocation) || isCriticalUnit(targetLocation) 
                    ? "MENUNGGU_KEPALA_UNIT"  // Special units require unit head approval first
                    : "MENUNGGU_KONFIRMASI",  // Regular flow starts with target employee
                requiresUnitHead: isCriticalUnit(myLocation) || isCriticalUnit(targetLocation),
                createdAt: responseData.createdAt || new Date().toISOString(),
                shiftSendiriId: parseInt(formData.shiftSendiriId),
                shiftTujuanId: parseInt(formData.shiftTujuanId),
                pegawaiTujuanId: parseInt(formData.pegawaiTujuanId)
            };
            
            if (type === "create") {
                onCreate(tukarShiftRequest);
            } else if (type === "update" && onUpdate) {
                onUpdate({...data, ...tukarShiftRequest});
            }
            
            onClose();
            
        } catch (error) {
            console.error("Error submitting form:", error);
            alert(error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setSubmitting(false);
        }
    });

    if (loading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    // Fix formatDate usage for possibly undefined date strings
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Tanggal tidak tersedia";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString || '';
        }
    };

    // Fix getLocationName to only use valid ShiftType fields
    const getLocationName = (shift: ShiftType) => {
        return shift.lokasishift || 'Lokasi tidak tersedia';
    };

    // Create options for dropdowns
    const myShiftOptions = myShifts.map(shift => ({
        value: shift.id.toString(),
        label: `${formatDate(shift.tanggal)} - ${getLocationName(shift)} (${shift.jammulai || '?'}-${shift.jamselesai || '?'})`
    }));

    const userOptions = users.map(user => {
        // Handle different user name formats
        const firstName = user.namaDepan || user.firstName || user.first_name || '';
        const lastName = user.namaBelakang || user.lastName || user.last_name || '';
        const fullName = user.name || `${firstName} ${lastName}`.trim();
        
        return {
            value: user.id.toString(),
            label: `${fullName} (${user.role || 'User'})`
        };
    });
    
    console.log('Generated user options:', userOptions);

    const targetShiftOptions = targetShifts.map(shift => ({
        value: shift.id.toString(),
        label: `${formatDate(shift.tanggal)} - ${getLocationName(shift)} (${shift.jammulai || '?'}-${shift.jamselesai || '?'})`
    }));

    // Ensure userRole is available in render scope
    const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userString ? JSON.parse(userString) : null;
    const userRole = user?.role || localStorage.getItem('role') || 'DOKTER';

    return (
        <form className="flex flex-col gap-4 p-4" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold mb-4">
                {type === "create" ? "Ajukan Tukar Shift" : "Edit Permintaan Tukar Shift"}
            </h1>
            
            <div className="grid grid-cols-1 gap-4">
                <div className="mb-2">
                    <h2 className="text-md font-medium mb-1">Shift Saya</h2>
                    <Select
                        label="Pilih shift yang ingin ditukar"
                        name="shiftSendiriId"
                        register={register}
                        error={errors.shiftSendiriId}
                        options={myShiftOptions}
                    />
                    
                    {/* Show warning for critical shifts */}
                    {watch("shiftSendiriId") && myShifts.find(
                        s => s.id.toString() === watch("shiftSendiriId") && isCriticalUnit(s.lokasishift)
                    ) && (
                        <div className="text-xs text-amber-600 mt-1 p-2 bg-amber-50 border border-amber-100 rounded">
                            <p className="font-medium">Anda memilih shift di unit khusus!</p>
                            <p>Tukar shift pada unit {myShifts.find(s => s.id.toString() === watch("shiftSendiriId"))?.lokasishift} 
                               hanya bisa dilakukan dengan pengganti yang memiliki kualifikasi sama.</p>
                        </div>
                    )}
                </div>
                
                <div className="mb-2">
                    <h2 className="text-md font-medium mb-1">Pegawai Tujuan</h2>
                    <Select
                        label="Pilih pegawai tujuan"
                        name="pegawaiTujuanId"
                        register={register}
                        error={errors.pegawaiTujuanId}
                        options={userOptions}
                    />
                    {userOptions.length === 0 ? (
                        <div className="text-xs text-orange-500 mt-1 p-2 bg-orange-50 border border-orange-100 rounded">
                            <p className="font-medium">Tidak ada pegawai dengan peran yang sama yang tersedia.</p>
                            <p className="mt-1">Peran saat ini: {
                                localStorage.getItem('user') 
                                    ? JSON.parse(localStorage.getItem('user') || '{}').role || 'DOKTER' 
                                    : 'DOKTER'
                            }</p>
                            <p className="mt-1">Silakan pastikan Anda telah login dengan benar, atau hubungi administrator.</p>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 mt-1">
                            {/* Role-specific guidance messages */}
                            {userRole === "DOKTER_SPESIALIS" && (
                                <div className="p-2 bg-blue-50 border border-blue-100 rounded text-blue-700">
                                    <p className="font-medium">Catatan untuk Dokter Spesialis:</p>
                                    <p>Tukar shift hanya dapat dilakukan dengan sesama spesialis bidang yang sama.</p>
                                </div>
                            )}
                            {userRole === "DOKTER" && (
                                <p>Catatan: Tukar shift hanya dapat dilakukan dengan sesama dokter umum.</p>
                            )}
                            {(userRole === "PERAWAT" || userRole === "BIDAN" || userRole === "PARAMEDIS") && (
                                <p>Catatan: Tukar shift hanya dapat dilakukan dengan sesama {userRole.toLowerCase()}.</p>
                            )}
                            
                            {/* Special unit warning */}
                            {myShifts.some(shift => isCriticalUnit(shift.lokasishift)) && (
                                <div className="p-2 mt-1 bg-amber-50 border border-amber-100 rounded text-amber-700">
                                    <p className="font-medium">Perhatian untuk Unit Kritikal (ICU/NICU/IGD):</p>
                                    <p>Tukar shift pada unit kritikal memerlukan pengganti dengan sertifikasi & penugasan yang sama.</p>
                                    <p>Membutuhkan persetujuan 2 lapis dari kepala unit & supervisor.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="mb-2">
                    <h2 className="text-md font-medium mb-1">Shift Tujuan</h2>
                    <Select
                        label="Pilih shift tujuan"
                        name="shiftTujuanId"
                        register={register}
                        error={errors.shiftTujuanId}
                        options={targetShiftOptions}
                        disabled={!selectedPegawaiTujuanId}
                    />
                    {!selectedPegawaiTujuanId && (
                        <p className="text-xs text-gray-500 mt-1">
                            Pilih pegawai tujuan terlebih dahulu
                        </p>
                    )}
                    
                    {selectedPegawaiTujuanId && targetShiftOptions.length === 0 && (
                        <div className="text-xs text-red-500 mt-1 p-2 bg-red-50 border border-red-100 rounded">
                            <p className="font-medium">Tidak ada shift yang tersedia untuk pegawai ini.</p>
                            <p className="mt-1">Kemungkinan penyebab:</p>
                            <ul className="list-disc ml-4 mt-1">
                                <li>Pegawai tidak memiliki shift terjadwal</li>
                                <li>Untuk unit khusus/kritikal: Pegawai tidak memiliki shift di unit yang sama</li>
                            </ul>
                        </div>
                    )}
                    
                    {watch("shiftSendiriId") && watch("shiftTujuanId") && (
                        <div className="text-xs text-blue-500 mt-1 p-2 bg-blue-50 border border-blue-100 rounded">
                            <p className="font-medium">Konfirmasi Tukar Shift:</p>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <p className="font-medium">Shift Anda:</p>
                                    <p>{formatDate(myShifts.find(s => s.id.toString() === watch("shiftSendiriId"))?.tanggal)}</p>
                                    <p>{myShifts.find(s => s.id.toString() === watch("shiftSendiriId"))?.lokasishift}</p>
                                    <p>{myShifts.find(s => s.id.toString() === watch("shiftSendiriId"))?.jammulai}-{myShifts.find(s => s.id.toString() === watch("shiftSendiriId"))?.jamselesai}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Shift Tujuan:</p>
                                    <p>{formatDate(targetShifts.find(s => s.id.toString() === watch("shiftTujuanId"))?.tanggal)}</p>
                                    <p>{targetShifts.find(s => s.id.toString() === watch("shiftTujuanId"))?.lokasishift}</p>
                                    <p>{targetShifts.find(s => s.id.toString() === watch("shiftTujuanId"))?.jammulai}-{targetShifts.find(s => s.id.toString() === watch("shiftTujuanId"))?.jamselesai}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="mb-2">
                    <h2 className="text-md font-medium mb-1">Alasan Tukar Shift</h2>
                    <textarea
                        className={`w-full p-2 border rounded-md ${errors.alasan ? 'border-red-500' : 'border-gray-300'}`}
                        rows={4}
                        placeholder="Berikan alasan tukar shift..."
                        {...register("alasan")}
                    ></textarea>
                    {errors.alasan && (
                        <p className="text-red-500 text-xs mt-1">{errors.alasan.message}</p>
                    )}
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md mb-2">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Proses Persetujuan:</h3>
                    <ol className="text-xs text-blue-700 list-decimal pl-5">
                        <li>Permintaan akan dikirim ke pegawai tujuan untuk disetujui</li>
                        <li>Jika disetujui pegawai, permintaan akan diteruskan ke supervisor</li>
                        <li>Setelah disetujui supervisor, shift akan ditukar secara resmi</li>
                    </ol>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    disabled={submitting}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <span>{type === "create" ? "Ajukan Tukar Shift" : "Perbarui"}</span>
                    )}
                </button>
            </div>
            
            {/* Debug panel with state information */}
            <DebugPanel data={{
                currentUserId,
                userOptions: userOptions.length,
                targetShifts: targetShifts.length,
                myShifts: myShifts.length,
                selectedPegawaiTujuanId,
                userFromLocalStorage: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null,
                formErrors: errors
            }} />
        </form>
    );
};

export default TukarShiftForm;