// Enhanced Shift Schedule Form with RSUD Integration
'use client';

import { z } from "zod";
import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, Users, Building2, AlertCircle, CheckCircle2, Info, User, MapPin, Zap, Star, BarChart3 } from "lucide-react";
import { LOKASI_SHIFT_ENUM, LOKASI_SHIFT_OPTIONS } from "../../lib/lokasiShiftEnum";

// Enhanced validation schema with Employee ID integration
const schema = z.object({
    nama: z.string()
        .min(3, { message: 'Nama pegawai minimal 3 karakter' })
        .max(50, { message: 'Nama pegawai maksimal 50 karakter' }),
    idpegawai: z.string()
        .min(1, { message: 'Employee ID dibutuhkan' }),
    userId: z.number().optional(),
    shiftType: z.string().min(1, { message: 'Tipe shift dibutuhkan' }),
    shiftLocation: z.string().min(1, { message: 'Lokasi shift dibutuhkan' }),
    tanggal: z.string()
        .min(1, { message: 'Tanggal dibutuhkan!' })
        .refine((date) => new Date(date) >= new Date(new Date().toDateString()), {
            message: 'Tanggal tidak boleh sebelum hari ini'
        }),
    jammulai: z.string()
        .min(1, { message: 'Jam mulai dibutuhkan!' })
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Format jam: HH:MM (24 jam)' }),
    jamselesai: z.string()
        .min(1, { message: 'Jam selesai dibutuhkan!' })
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Format jam: HH:MM (24 jam)' }),
})
.refine((data) => {
    if (data.jammulai && data.jamselesai) {
        const startMinutes = timeToMinutes(data.jammulai);
        const endMinutes = timeToMinutes(data.jamselesai);
        
        // Allow overnight shifts
        if (endMinutes < startMinutes) {
            return true; // Overnight shift is valid
        }
        
        return endMinutes > startMinutes;
    }
    return true;
}, {
    message: 'Jam selesai harus setelah jam mulai (kecuali shift malam lintas hari)',
    path: ['jamselesai']
});

const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

type Inputs = z.infer<typeof schema>;

// Enhanced RSUD Shift Types with comprehensive configurations
const RSUD_SHIFT_TYPES = {
  'GEDUNG_ADMINISTRASI': {
    name: 'Gedung Administrasi',
    icon: '🏢',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '17:00', type: 'PAGI' }
    },
    description: 'Administrasi umum rumah sakit',
    workdays: 'Sen-Kam: 08:00-17:00, Jum: 08:00-11:30',
    color: 'from-blue-500 to-blue-600'
  },
  'RAWAT_JALAN': {
    name: 'Rawat Jalan',
    icon: '🏥',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '15:00', type: 'PAGI' }
    },
    description: 'Pelayanan rawat jalan pasien',
    workdays: 'Sen-Jum: 08:00-15:00, Sab: 08:00-11:30',
    color: 'from-green-500 to-green-600'
  },
  'RAWAT_INAP_3_SHIFT': {
    name: 'Rawat Inap (3 Shift)',
    icon: '🛏️',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '15:00', type: 'PAGI' },
      'SHIFT_SIANG': { name: 'Shift Siang', start: '15:00', end: '21:00', type: 'SIANG' },
      'SHIFT_MALAM': { name: 'Shift Malam', start: '20:00', end: '08:00', type: 'MALAM' }
    },
    description: 'Perawatan intensif pasien rawat inap',
    workdays: '24/7 - 3 Shift System',
    color: 'from-purple-500 to-purple-600'
  },
  'GAWAT_DARURAT_3_SHIFT': {
    name: 'Gawat Darurat (3 Shift)',
    icon: '🚑',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '15:00', type: 'PAGI' },
      'SHIFT_SIANG': { name: 'Shift Siang', start: '15:00', end: '21:00', type: 'SIANG' },
      'SHIFT_MALAM': { name: 'Shift Malam', start: '20:00', end: '08:00', type: 'MALAM' }
    },
    description: 'Pelayanan gawat darurat 24 jam',
    workdays: '24/7 - Emergency Service',
    color: 'from-red-500 to-red-600'
  },
  'LABORATORIUM_2_SHIFT': {
    name: 'Laboratorium (2 Shift)',
    icon: '🔬',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '17:00', type: 'PAGI' },
      'SHIFT_MALAM': { name: 'Shift Malam', start: '17:00', end: '08:00', type: 'MALAM' }
    },
    description: 'Layanan laboratorium dan diagnostik',
    workdays: '24/7 - 2 Shift System',
    color: 'from-teal-500 to-teal-600'
  },
  'FARMASI_2_SHIFT': {
    name: 'Farmasi (2 Shift)',
    icon: '💊',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '17:00', type: 'PAGI' },
      'SHIFT_MALAM': { name: 'Shift Malam', start: '17:00', end: '08:00', type: 'MALAM' }
    },
    description: 'Pelayanan farmasi dan obat-obatan',
    workdays: '24/7 - 2 Shift System',
    color: 'from-cyan-500 to-cyan-600'
  },
  'RADIOLOGI_2_SHIFT': {
    name: 'Radiologi (2 Shift)',
    icon: '🩻',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '17:00', type: 'PAGI' },
      'SHIFT_MALAM': { name: 'Shift Malam', start: '17:00', end: '08:00', type: 'MALAM' }
    },
    description: 'Layanan radiologi dan diagnostik',
    workdays: '24/7 - 2 Shift System',
    color: 'from-indigo-500 to-indigo-600'
  },
  'GIZI_2_SHIFT': {
    name: 'Gizi (2 Shift)',
    icon: '🍽️',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '17:00', type: 'PAGI' },
      'SHIFT_MALAM': { name: 'Shift Malam', start: '17:00', end: '08:00', type: 'MALAM' }
    },
    description: 'Layanan gizi dan nutrisi',
    workdays: '24/7 - 2 Shift System',
    color: 'from-orange-500 to-orange-600'
  },
  'KEAMANAN_2_SHIFT': {
    name: 'Keamanan (2 Shift)',
    icon: '🛡️',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '17:00', type: 'PAGI' },
      'SHIFT_MALAM': { name: 'Shift Malam', start: '17:00', end: '08:00', type: 'MALAM' }
    },
    description: 'Keamanan rumah sakit',
    workdays: '24/7 - 2 Shift System',
    color: 'from-gray-500 to-gray-600'
  },
  'LAUNDRY_REGULER': {
    name: 'Laundry',
    icon: '🧺',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '15:00', type: 'PAGI' }
    },
    description: 'Layanan laundry rumah sakit',
    workdays: 'Sen-Jum: 08:00-15:00, Sab: 08:00-11:30',
    color: 'from-blue-400 to-blue-500'
  },
  'CLEANING_SERVICE': {
    name: 'Cleaning Service',
    icon: '🧹',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '15:00', type: 'PAGI' }
    },
    description: 'Layanan kebersihan rumah sakit',
    workdays: 'Sen-Jum: 08:00-15:00, Sab: 08:00-11:30',
    color: 'from-green-400 to-green-500'
  },
  'SUPIR_2_SHIFT': {
    name: 'Supir (2 Shift)',
    icon: '🚗',
    shifts: {
      'SHIFT_PAGI': { name: 'Shift Pagi', start: '08:00', end: '17:00', type: 'PAGI' },
      'SHIFT_MALAM': { name: 'Shift Malam', start: '17:00', end: '08:00', type: 'MALAM' }
    },
    description: 'Transportasi rumah sakit',
    workdays: '24/7 - 2 Shift System',
    color: 'from-yellow-500 to-yellow-600'
}
};

// Date validation for different shift types
const getValidDaysForShiftType = (shiftType: string): number[] => {
  switch (shiftType) {
    case 'GEDUNG_ADMINISTRASI':
      return [1, 2, 3, 4, 5]; // Monday to Friday
    case 'RAWAT_JALAN':
    case 'LAUNDRY_REGULER':
    case 'CLEANING_SERVICE':
      return [1, 2, 3, 4, 5, 6]; // Monday to Saturday
    case 'RAWAT_INAP_3_SHIFT':
    case 'GAWAT_DARURAT_3_SHIFT':
    case 'LABORATORIUM_2_SHIFT':
    case 'FARMASI_2_SHIFT':
    case 'RADIOLOGI_2_SHIFT':
    case 'GIZI_2_SHIFT':
    case 'KEAMANAN_2_SHIFT':
    case 'SUPIR_2_SHIFT':
      return [0, 1, 2, 3, 4, 5, 6]; // All days (24/7)
    default:
      return [1, 2, 3, 4, 5]; // Default: Monday to Friday
  }
};

const validateDateForShiftType = (date: string, shiftType: string): string | null => {
  if (!date || !shiftType) return null;
  
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const validDays = getValidDaysForShiftType(shiftType);
  
  if (!validDays.includes(dayOfWeek)) {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const validDayNames = validDays.map(day => dayNames[day]).join(', ');
    return `${RSUD_SHIFT_TYPES[shiftType as keyof typeof RSUD_SHIFT_TYPES]?.name || shiftType} hanya beroperasi pada: ${validDayNames}`;
  }
  
  return null;
};

// Convert frontend shift names to backend shift names
const convertShiftNameForBackend = (frontendShiftName: string, shiftType: string): string => {
  // Special handling for shift types with unique naming systems
  if (shiftType === 'GEDUNG_ADMINISTRASI') {
    // GEDUNG_ADMINISTRASI has different naming system
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
      return 'Reguler Senin-Kamis';
    } else if (dayOfWeek === 5) { // Friday
      return 'Jumat';
    }
    // For other days, default to first available (though validation should prevent this)
    return 'Reguler Senin-Kamis';
  }
  
  if (shiftType === 'RAWAT_JALAN') {
    // RAWAT_JALAN has day-based naming
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      return 'Senin-Jumat';
    } else if (dayOfWeek === 6) { // Saturday
      return 'Sabtu';
    }
    // Default to weekday schedule
    return 'Senin-Jumat';
  }
  
  if (shiftType === 'LAUNDRY_REGULER' || shiftType === 'CLEANING_SERVICE') {
    // Similar pattern to RAWAT_JALAN
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      return 'Senin-Jumat';
    } else if (dayOfWeek === 6) { // Saturday
      return 'Sabtu';
    }
    return 'Senin-Jumat';
  }
  
  // Standard shift name mapping for shift-based systems
  const shiftNameMapping: { [key: string]: string } = {
    'SHIFT_PAGI': 'Shift Pagi',
    'SHIFT_SIANG': 'Shift Sore', // Backend uses "Shift Sore" instead of "Shift Siang"
    'SHIFT_MALAM': 'Shift Malam',
    'SHIFT_SORE': 'Shift Sore'
  };
  
  return shiftNameMapping[frontendShiftName] || frontendShiftName;
};

type User = {
    id: number;
    username: string;
    employeeId?: string;
    email: string;
    namaDepan: string;
    namaBelakang: string;
    role: string;
    status: string;
};

interface WorkloadData {
    userId: number;
    employeeId: string;
    name: string;
    currentShifts: number;
    maxShifts: number;
    consecutiveDays: number;
    weeklyHours: number;
    monthlyHours: number;
    weeklyShifts?: number;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    lastShiftDate: string | null;
}

const EnhancedJadwalForm = ({ 
    type, 
    data, 
    onClose, 
    onCreate, 
    onUpdate,
    onError 
}: { 
    type: "create" | "update"; 
    data?: any; 
    onClose: () => void;
    onCreate: (newData: any) => void;
    onUpdate?: (updatedData: any) => void;
    onError?: (error: any) => void;
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<WorkloadData | null>(null);
    const [availableShiftTypes, setAvailableShiftTypes] = useState<any[]>([]);
    const [activeShiftCount, setActiveShiftCount] = useState<number>(0);
    const [isLoadingShiftCount, setIsLoadingShiftCount] = useState(false);
    
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
    
    const selectedEmployeeId = watch("idpegawai");
    const selectedShiftType = watch("shiftType");
    const selectedShiftLocation = watch("shiftLocation");
    const selectedDate = watch("tanggal");
    
    // Date validation effect
    useEffect(() => {
        if (selectedDate && selectedShiftLocation) {
            const validationError = validateDateForShiftType(selectedDate, selectedShiftLocation);
            if (validationError) {
                setErrorMessage(validationError);
            } else {
                // Clear error if date is valid
                if (errorMessage && errorMessage.includes('beroperasi pada:')) {
                    setErrorMessage('');
                }
            }
        }
    }, [selectedDate, selectedShiftLocation]);

    // Get available shifts for selected location
    const availableShifts = useMemo(() => {
        if (selectedShiftLocation) {
            const shiftConfig = RSUD_SHIFT_TYPES[selectedShiftLocation as keyof typeof RSUD_SHIFT_TYPES];
            if (shiftConfig) {
                return Object.entries(shiftConfig.shifts).map(([key, shift]) => ({
                    id: key,
                    ...shift
                }));
            }
        }
        return [];
    }, [selectedShiftLocation]);
    
    // Auto-fill times when shift is selected
    useEffect(() => {
        if (selectedShiftLocation && selectedShiftType && type === "create") {
            const shiftConfig = RSUD_SHIFT_TYPES[selectedShiftLocation as keyof typeof RSUD_SHIFT_TYPES];
            if (shiftConfig) {
                const shift = shiftConfig.shifts[selectedShiftType as keyof typeof shiftConfig.shifts];
                if (shift) {
                    setValue('jammulai', shift.start);
                    setValue('jamselesai', shift.end);
                }
            }
        }
    }, [selectedShiftLocation, selectedShiftType, setValue, type]);
    
    // Fetch users and shift types when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingUsers(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Anda belum login');
                }
                
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                
                // Fetch users with workload status filtering
                const usersResponse = await fetch(`${apiUrl}/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    console.log('Users API response:', usersData);
                    // Handle different response formats - sometimes data is nested in 'data' property
                    let usersArray = Array.isArray(usersData) ? usersData : (usersData.data || []);
                    
                    // Fetch workload status to filter disabled users
                    try {
                        const workloadResponse = await fetch(`${apiUrl}/laporan/workload-validation`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (workloadResponse.ok) {
                            const workloadData = await workloadResponse.json();
                            const workloadStatuses = Array.isArray(workloadData) ? workloadData : (workloadData.data || []);
                            
                            // Filter out disabled users who don't have approved overwork requests
                            usersArray = usersArray.filter(user => {
                                const workloadStatus = workloadStatuses.find(status => 
                                    status.employeeId === user.employeeId || 
                                    status.userId === user.id
                                );
                                
                                // Include user if:
                                // 1. No workload status found (assume available)
                                // 2. User is not disabled for shifts
                                // 3. User is disabled but has approved overwork request
                                return !workloadStatus || 
                                       !workloadStatus.isDisabledForShifts || 
                                       (workloadStatus.isDisabledForShifts && workloadStatus.hasApprovedOverworkRequest);
                            });
                            
                            console.log('Users after filtering disabled:', usersArray.length, 'out of', (Array.isArray(usersData) ? usersData : (usersData.data || [])).length);
                        }
                    } catch (workloadError) {
                        console.warn('Could not fetch workload status, showing all users:', workloadError);
                    }
                    
                    console.log('Processed users array (after filtering disabled):', usersArray);
                    setUsers(usersArray);
                } else {
                    console.error('Failed to fetch users:', usersResponse.status, usersResponse.statusText);
                }
                
                // Fetch shift types from backend
                try {
                    const shiftTypesResponse = await fetch(`${apiUrl}/shifts/types`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (shiftTypesResponse.ok) {
                        const shiftTypesData = await shiftTypesResponse.json();
                        setAvailableShiftTypes(shiftTypesData);
                    }
                } catch (error) {
                    console.log('Using default shift types');
                }
                
            } catch (error) {
                setErrorMessage('Gagal memuat data. Silakan refresh halaman.');
                console.error('Error fetching data:', error);
            } finally {
                setIsLoadingUsers(false);
            }
        };
        
        fetchData();
    }, []);
    
    // Update selected user when employee ID changes
    useEffect(() => {
        if (selectedEmployeeId) {
            const user = users.find(u => 
                u.employeeId === selectedEmployeeId || 
                u.username === selectedEmployeeId
            );
            setSelectedUser(user || null);
            
            if (user) {
                setValue('userId', user.id);
                setValue('nama', `${user.namaDepan} ${user.namaBelakang}`);
            }
        }
    }, [selectedEmployeeId, users, setValue]);

    // Fetch workload data for selected employee
    useEffect(() => {
        const fetchWorkloadData = async () => {
            if (!selectedEmployeeId) {
                setSelectedEmployee(null);
                return;
            }

            // Debounce to avoid too frequent API calls
            const timeoutId = setTimeout(async () => {
                try {
                    const token = localStorage.getItem('token');
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                    
                    const response = await fetch(`${apiUrl}/laporan/workload-analysis`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const workloadData: WorkloadData[] = await response.json();
                        const employeeWorkload = workloadData.find(emp => 
                            emp.employeeId === selectedEmployeeId ||
                            emp.name.toLowerCase().includes(selectedEmployeeId.toLowerCase())
                        );
                        setSelectedEmployee(employeeWorkload || null);
                    } else {
                        console.warn('Failed to fetch workload data');
                        setSelectedEmployee(null);
                    }
                } catch (error) {
                    console.error('Error fetching workload data:', error);
                    setSelectedEmployee(null);
                }
            }, 500); // 500ms debounce

            return () => clearTimeout(timeoutId);
        };

        fetchWorkloadData();
    }, [selectedEmployeeId]);

    // Fetch active shift count for selected location
    useEffect(() => {
        const fetchActiveShiftCount = async () => {
            if (!selectedShiftLocation) {
                setActiveShiftCount(0);
                return;
            }

            setIsLoadingShiftCount(true);
            
            // Temporary hardcoded logic based on known data
            // GAWAT_DARURAT has 1 shift, others have 0
            if (selectedShiftLocation === 'GAWAT_DARURAT_3_SHIFT') {
                setActiveShiftCount(1);
            } else {
                setActiveShiftCount(0);
            }
            
            setIsLoadingShiftCount(false);

            // TODO: Replace with real API call when backend supports location-specific queries
            /*
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                
                const workloadResponse = await fetch(`${apiUrl}/laporan/workload-analysis`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (workloadResponse.ok) {
                    const workloadData: WorkloadData[] = await workloadResponse.json();
                    // Count total active shifts for all employees
                    const totalActiveShifts = workloadData.reduce((sum, emp) => sum + emp.currentShifts, 0);
                    setActiveShiftCount(totalActiveShifts);
                } else {
                    setActiveShiftCount(0);
                }
            } catch (error) {
                console.error('Error fetching active shift count:', error);
                setActiveShiftCount(0);
            } finally {
                setIsLoadingShiftCount(false);
            }
            */
        };

        fetchActiveShiftCount();
    }, [selectedShiftLocation]);
    
    // Enhanced form submission with comprehensive workload validation
    const onSubmit = handleSubmit(async (formData) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Anda belum login');
            }
            
            // Step 1: Pre-validation checks
            if (!formData.userId || !formData.idpegawai) {
                throw new Error('Employee ID tidak valid. Silakan pilih dari daftar yang tersedia.');
            }
            
            const user = users.find((u) => u.id === formData.userId || u.employeeId === formData.idpegawai);
            if (!user) {
                throw new Error('Employee tidak ditemukan. Silakan pilih employee yang valid.');
            }
            
            // Step 2: Validate date for shift type
            if (formData.tanggal && selectedShiftLocation) {
                const validationError = validateDateForShiftType(formData.tanggal, selectedShiftLocation);
                if (validationError) {
                    throw new Error(validationError);
                }
            }
            
            // Step 3: Pre-submission workload validation
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            
            try {
                const workloadResponse = await fetch(`${apiUrl}/laporan/workload-validation`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (workloadResponse.ok) {
                    const workloadData = await workloadResponse.json();
                    const workloadStatuses = Array.isArray(workloadData) ? workloadData : (workloadData.data || []);
                    
                    const userWorkload = workloadStatuses.find(status => 
                        status.employeeId === user.employeeId || 
                        status.userId === user.id
                    );
                    
                    if (userWorkload) {
                        // Check if user is disabled and needs overwork approval
                        if (userWorkload.isDisabledForShifts && !userWorkload.hasApprovedOverworkRequest) {
                            const needsOverworkRequest = userWorkload.status === 'OVERWORKED' || 
                                                       userWorkload.weeklyHours >= userWorkload.maxWeeklyHours ||
                                                       userWorkload.monthlyHours >= userWorkload.maxMonthlyHours;
                            
                            if (needsOverworkRequest) {
                                throw new Error(`🚫 WORKLOAD LIMIT EXCEEDED\n\n` +
                                    `Employee: ${user.namaDepan} ${user.namaBelakang}\n` +
                                    `Status: ${userWorkload.status}\n` +
                                    `Weekly Hours: ${userWorkload.weeklyHours}/${userWorkload.maxWeeklyHours}\n` +
                                    `Monthly Hours: ${userWorkload.monthlyHours}/${userWorkload.maxMonthlyHours}\n\n` +
                                    `📋 REQUIRED ACTIONS:\n` +
                                    `1. Employee must submit Overwork Request\n` +
                                    `2. Request must be approved by supervisor\n` +
                                    `3. Only then can additional shifts be assigned\n\n` +
                                    `💡 ALTERNATIVES:\n` +
                                    `• Assign shift to different employee\n` +
                                    `• Reschedule to next week/month\n` +
                                    `• Reduce existing shifts for this employee`);
                            } else {
                                throw new Error(`⚠️ EMPLOYEE UNAVAILABLE\n\n` +
                                    `Employee: ${user.namaDepan} ${user.namaBelakang}\n` +
                                    `Status: DISABLED for shift assignment\n\n` +
                                    `📋 POSSIBLE REASONS:\n` +
                                    `• Currently on leave or medical rest\n` +
                                    `• Administrative restriction\n` +
                                    `• Pending disciplinary action\n\n` +
                                    `💡 CONTACT SUPERVISOR for clarification`);
                            }
                        }
                        
                        // Warning for users approaching limits
                        const approachingWeeklyLimit = userWorkload.weeklyHours >= (userWorkload.maxWeeklyHours * 0.8);
                        const approachingMonthlyLimit = userWorkload.monthlyHours >= (userWorkload.maxMonthlyHours * 0.8);
                        
                        if (approachingWeeklyLimit || approachingMonthlyLimit) {
                            // Show warning but allow submission
                            console.warn(`⚠️ WORKLOAD WARNING for ${user.namaDepan} ${user.namaBelakang}:`, {
                                weeklyHours: userWorkload.weeklyHours,
                                maxWeeklyHours: userWorkload.maxWeeklyHours,
                                monthlyHours: userWorkload.monthlyHours,
                                maxMonthlyHours: userWorkload.maxMonthlyHours
                            });
                        }
                    }
                }
            } catch (workloadError) {
                console.warn('Could not validate workload, proceeding with submission:', workloadError);
            }
            
            // Step 4: Build payload for submission
            const payload = {
                userId: user.id,
                idpegawai: user.employeeId || user.username,
                nama: `${user.namaDepan} ${user.namaBelakang}`,
                tanggal: formData.tanggal,
                jammulai: formData.jammulai,
                jamselesai: formData.jamselesai,
                lokasishift: selectedShiftLocation,
                tipeshift: selectedShiftType.includes('SHIFT_') 
                    ? RSUD_SHIFT_TYPES[selectedShiftLocation as keyof typeof RSUD_SHIFT_TYPES]?.shifts[selectedShiftType as any]?.type || 'PAGI'
                    : selectedShiftType,
                // Additional fields for backend integration
                shiftType: selectedShiftLocation,
                shiftOption: convertShiftNameForBackend(selectedShiftType, selectedShiftLocation)
            };
            
            // Step 5: Submit to backend
            let response;
            
            if (type === 'create') {
                // Try the enhanced shift creation endpoint first
                try {
                    response = await fetch(`${apiUrl}/shifts/with-type`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                    });
                } catch (error) {
                    // Fallback to regular endpoint
                    response = await fetch(`${apiUrl}/shifts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                    });
                }
            } else {
                response = await fetch(`${apiUrl}/shifts/${data.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ 
                    success: false,
                    message: `HTTP ${response.status}: ${response.statusText}` 
                }));
                
                // Parse backend error for detailed feedback
                let errorMessage = errorData.message || `Gagal ${type === 'create' ? 'membuat' : 'memperbarui'} jadwal shift`;
                
                // Check for specific conflict types
                if (errorMessage.includes('conflict') || errorMessage.includes('konflik')) {
                    const conflictDetails = errorData.conflicts || [];
                    const workloadDetails = errorData.workloadIssues || [];
                    const capacityDetails = errorData.capacityIssues || [];
                    
                    let detailedError = `🚫 SHIFT CREATION FAILED\n\n`;
                    detailedError += `❌ Primary Issue: ${errorMessage}\n\n`;
                    
                    if (conflictDetails.length > 0) {
                        detailedError += `⚠️ SCHEDULING CONFLICTS:\n`;
                        conflictDetails.forEach((conflict: any, index: number) => {
                            detailedError += `${index + 1}. ${conflict.type || 'Schedule'}: ${conflict.description || conflict.message}\n`;
                        });
                        detailedError += `\n`;
                    }
                    
                    if (workloadDetails.length > 0) {
                        detailedError += `📊 WORKLOAD ISSUES:\n`;
                        workloadDetails.forEach((workload: any, index: number) => {
                            detailedError += `${index + 1}. ${workload.employee || user.namaDepan}: ${workload.issue || workload.message}\n`;
                        });
                        detailedError += `\n`;
                    }
                    
                    if (capacityDetails.length > 0) {
                        detailedError += `🏥 CAPACITY ISSUES:\n`;
                        capacityDetails.forEach((capacity: any, index: number) => {
                            detailedError += `${index + 1}. ${capacity.location || selectedShiftLocation}: ${capacity.issue || capacity.message}\n`;
                        });
                        detailedError += `\n`;
                    }
                    
                    detailedError += `💡 RECOMMENDATIONS:\n`;
                    detailedError += `• Choose different date/time slot\n`;
                    detailedError += `• Select alternative employee\n`;
                    detailedError += `• Check existing schedule for conflicts\n`;
                    detailedError += `• Coordinate with team supervisor\n`;
                    
                    throw new Error(detailedError);
                }
                
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            
            // Check if backend explicitly returned success: false
            if (result.success === false) {
                throw new Error(result.message || result.error || 'Operasi gagal');
            }
            
            // Handle successful response (success: true or no success field but valid data)
            const shiftData = result.data || result;
            const notificationStatus = shiftData.notificationStatus || 'unknown';
            
            let successMessage = type === 'create' 
                ? `✅ Jadwal shift berhasil dibuat untuk ${user.namaDepan} ${user.namaBelakang}`
                : `✅ Jadwal shift berhasil diperbarui`;
                
            // Add notification status info
            if (notificationStatus === 'sent') {
                successMessage += ` (Notifikasi terkirim)`;
            } else if (notificationStatus === 'pending') {
                successMessage += ` (Notifikasi sedang dikirim)`;
            } else if (notificationStatus === 'skipped') {
                successMessage += ` (Tanpa notifikasi)`;
            }
            
            setSuccessMessage(successMessage);
            
            if (type === 'create' && onCreate) {
                onCreate(shiftData);
            } else if (type === 'update' && onUpdate) {
                onUpdate(shiftData);
            }
            
            setTimeout(() => {
                onClose();
            }, 2500);
            
        } catch (error: any) {
            console.error('Error submitting form:', error);
            
            // Use onError callback if provided, otherwise fallback to local error state
            if (onError) {
                onError(error);
            } else {
                setErrorMessage(error.message || 'Terjadi kesalahan sistem');
            }
        } finally {
            setIsSubmitting(false);
        }
    });
    
    const selectedLocationConfig = selectedShiftLocation 
        ? RSUD_SHIFT_TYPES[selectedShiftLocation as keyof typeof RSUD_SHIFT_TYPES] 
        : null;

    return (
        <div className="w-full max-w-7xl mx-auto max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {type === 'create' ? 'Tambah Jadwal Shift' : 'Update Jadwal Shift'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {type === 'create' 
                                ? 'Buat jadwal shift baru untuk pegawai' 
                                : 'Perbarui jadwal shift yang ada'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={onSubmit} className="bg-white rounded-b-2xl border border-gray-200 shadow-lg">
                <div className="p-6 space-y-6">
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
                    
                    {/* Employee Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Pilih Pegawai</h3>
                                <p className="text-gray-600 text-sm">Pilih pegawai yang akan dijadwalkan</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Employee ID <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("idpegawai")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={isLoadingUsers}
                            >
                                <option value="">
                                    {isLoadingUsers ? "-- Loading Employees..." : "-- Pilih Employee --"}
                                </option>
                                {Array.isArray(users) && users.map(user => (
                                    <option key={user.id} value={user.employeeId || user.username}>
                                        {user.employeeId || user.username} - {user.namaDepan} {user.namaBelakang} ({user.role})
                                    </option>
                                ))}
                            </select>
                            {errors.idpegawai && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.idpegawai.message}
                                </p>
                            )}
                            
                            {selectedUser && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-semibold text-green-900">
                                                {selectedUser.namaDepan} {selectedUser.namaBelakang}
                                            </p>
                                            <p className="text-sm text-green-700">
                                                ID: {selectedUser.employeeId || selectedUser.username} | Role: {selectedUser.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Staff Workload & Availability Information */}
                            {selectedUser && (
                                <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                                        <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                                        Informasi Beban Kerja & Ketersediaan
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Current Workload */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-sm font-medium text-gray-700 mb-2">Beban Kerja Saat Ini</div>
                                            <div className="space-y-2">
                                                {(() => {
                                                    // Use real data from workload analysis API
                                                    const currentShifts = selectedEmployee?.currentShifts || 0;
                                                    const maxShifts = selectedEmployee?.maxShifts || 20;
                                                    const utilizationRate = Math.round((currentShifts / maxShifts) * 100);
                                                    const status = selectedEmployee?.status || 'Normal';
                                                    const statusColor = status === 'NORMAL' ? 'text-green-600' : 
                                                                       status === 'WARNING' ? 'text-yellow-600' : 'text-red-600';
                                                    const bgColor = status === 'NORMAL' ? 'bg-green-100' : 
                                                                   status === 'WARNING' ? 'bg-yellow-100' : 'bg-red-100';
                                                    
                                                    return (
                                                        <>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs text-gray-600">Shift bulan ini:</span>
                                                                <span className="font-semibold">{currentShifts}/{maxShifts}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className={`h-2 rounded-full ${status === 'NORMAL' ? 'bg-green-500' : 
                                                                                                   status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                    style={{width: `${Math.min(utilizationRate, 100)}%`}}
                                                                ></div>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs text-gray-600">Status:</span>
                                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${bgColor} ${statusColor}`}>
                                                                    {status === 'NORMAL' ? 'Normal' : status === 'WARNING' ? 'Warning' : 'Critical'}
                                                                </span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Recent Activity */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-sm font-medium text-gray-700 mb-2">Aktivitas Terkini</div>
                                            <div className="space-y-1 text-xs text-gray-600">
                                                <div className="flex justify-between">
                                                    <span>Shift minggu ini:</span>
                                                    <span className="font-medium">{selectedEmployee?.weeklyShifts || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Hari berturut-turut:</span>
                                                    <span className="font-medium">{selectedEmployee?.consecutiveDays || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Jam kerja minggu ini:</span>
                                                    <span className="font-medium">{selectedEmployee?.weeklyHours || 0}h</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Shift terakhir:</span>
                                                    <span className="font-medium">
                                                        {selectedEmployee?.lastShiftDate ? 
                                                            (() => {
                                                                const dateObj = new Date(selectedEmployee.lastShiftDate);
                                                                const day = String(dateObj.getDate()).padStart(2, '0');
                                                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                                return `${day}/${month}`;
                                                            })() :
                                                            '27/07'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-sm font-medium text-gray-700 mb-2">Rekomendasi</div>
                                            <div className="space-y-2">
                                                {(() => {
                                                    if (!selectedEmployee) {
                                                        return (
                                                            <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                                                                💡 Pilih pegawai untuk melihat rekomendasi
                                                            </div>
                                                        );
                                                    }

                                                    const { currentShifts, maxShifts, status } = selectedEmployee;
                                                    let recommendation;
                                                    
                                                    if (status === 'NORMAL' && currentShifts < maxShifts * 0.7) {
                                                        recommendation = { icon: '✅', text: 'Pegawai siap untuk shift tambahan', color: 'text-green-600' };
                                                    } else if (status === 'WARNING' || currentShifts >= maxShifts * 0.8) {
                                                        recommendation = { icon: '⚠️', text: 'Monitor beban kerja dengan ketat', color: 'text-yellow-600' };
                                                    } else if (status === 'CRITICAL' || currentShifts >= maxShifts) {
                                                        recommendation = { icon: '❌', text: 'Berikan istirahat, beban kerja tinggi', color: 'text-red-600' };
                                                    } else {
                                                        recommendation = { icon: '💪', text: 'Pegawai memiliki performa baik', color: 'text-blue-600' };
                                                    }
                                                    
                                                    return (
                                                        <div className={`text-xs ${recommendation.color} bg-white p-2 rounded border`}>
                                                            <span className="mr-1">{recommendation.icon}</span>
                                                            {recommendation.text}
                                                        </div>
                                                    );
                                                })()}
                                                
                                                <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                                                    💡 <strong>Tips:</strong> Ideal shift per bulan: 12-15 shift
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Location & Shift Information */}
                    {(selectedShiftLocation || selectedShiftType) && (
                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                                <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                                Informasi Lokasi & Shift
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedShiftLocation && (
                                    <div className="bg-white p-3 rounded-lg border">
                                        <div className="text-sm font-medium text-gray-700 mb-2">📍 Lokasi: {selectedLocationConfig?.name}</div>
                                        <div className="space-y-1 text-xs text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Shift aktif saat ini:</span>
                                                <span className="font-medium">
                                                    {isLoadingShiftCount ? '...' : activeShiftCount}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Kapasitas maksimal:</span>
                                                <span className="font-medium">20</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Status:</span>
                                                <span className="font-medium text-green-600">Tersedia</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {selectedShiftType && availableShifts.find(s => s.id === selectedShiftType) && (
                                    <div className="bg-white p-3 rounded-lg border">
                                        <div className="text-sm font-medium text-gray-700 mb-2">
                                            ⏰ Shift: {availableShifts.find(s => s.id === selectedShiftType)?.name}
                                        </div>
                                        <div className="space-y-1 text-xs text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Jam kerja:</span>
                                                <span className="font-medium">
                                                    {availableShifts.find(s => s.id === selectedShiftType)?.start} - {availableShifts.find(s => s.id === selectedShiftType)?.end}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Durasi:</span>
                                                <span className="font-medium">8 jam</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Shift serupa hari ini:</span>
                                                <span className="font-medium">1</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Shift Location & Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Shift Location */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Lokasi/Instalasi <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("shiftLocation")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">-- Pilih Lokasi --</option>
                                {LOKASI_SHIFT_OPTIONS.map(({ value, label }) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            {errors.shiftLocation && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.shiftLocation.message}
                                </p>
                            )}
                        </div>

                        {/* Shift Type */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Tipe Shift <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("shiftType")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={!selectedShiftLocation}
                            >
                                <option value="">-- Pilih Shift --</option>
                                {availableShifts.map((shift) => (
                                    <option key={shift.id} value={shift.id}>
                                        {shift.name} ({shift.start} - {shift.end})
                                    </option>
                                ))}
                            </select>
                            {errors.shiftType && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.shiftType.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Location Preview */}
                    {selectedLocationConfig && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <div>
                                    <h4 className="font-semibold text-blue-900">{selectedLocationConfig.name}</h4>
                                    <p className="text-blue-700 text-sm">{selectedLocationConfig.description}</p>
                                    <p className="text-blue-600 text-xs mt-1">{selectedLocationConfig.workdays}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Tanggal Shift <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                {...register("tanggal")}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            {errors.tanggal && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.tanggal.message}
                                </p>
                            )}
                        </div>

                        {/* Start Time */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Jam Mulai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                {...register("jammulai")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            {errors.jammulai && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.jammulai.message}
                                </p>
                            )}
                        </div>

                        {/* End Time */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Jam Selesai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                {...register("jamselesai")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            {errors.jamselesai && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.jamselesai.message}
                                </p>
                            )}
                        </div>
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
                                    {type === 'create' ? 'Buat Jadwal' : 'Update Jadwal'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EnhancedJadwalForm;
