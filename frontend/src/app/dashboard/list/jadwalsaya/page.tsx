'use client';

// Force dynamic rendering for real-time schedule data
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import Link from "next/link";
import Pagination from "@/components/common/Pagination";
import TableSearch from "@/components/common/TableSearch";
import Table from "@/components/common/Table";
import FilterButton from "@/components/common/FilterButton";
import SortButton from "@/components/common/SortButton";
import { joinUrl } from "@/lib/urlUtils";
import { PageHeader, PrimaryButton, ContentCard } from "@/components/ui";
import { textFormatter } from "@/lib/textFormatter";

// Dynamic import to prevent hydration issues and optimization
const BigCalendar = lazy(() => import("@/components/common/BigCalendar"));

// Utility function to format time from backend timestamp
const formatTime = (timeString: string): string => {
  if (!timeString) return '--:--';
  
  console.log('formatTime: Input:', timeString);
  
  try {
    // If it's already in HH:MM format, return as is
    if (timeString.match(/^\d{1,2}:\d{2}$/)) {
      console.log('formatTime: Already HH:MM format');
      return timeString;
    }
    
    // If it's a full timestamp (1970-01-01T07:00:00.000Z), extract time
    if (timeString.includes('T') && timeString.includes('Z')) {
      console.log('formatTime: Processing ISO timestamp');
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        // Use local time instead of UTC to preserve the intended time
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const result = `${hours}:${minutes}`;
        console.log('formatTime: Extracted time from ISO (local time):', result);
        return result;
      }
    }
    
    // If it's Date object toString format
    if (timeString.includes('GMT') || timeString.includes('UTC')) {
      console.log('formatTime: Processing Date string');
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const result = `${hours}:${minutes}`;
        console.log('formatTime: Extracted time from Date:', result);
        return result;
      }
    }
    
    // If it's just time part like "07:00:00.000Z" or "07:00:00"
    if (timeString.includes(':')) {
      console.log('formatTime: Processing time with colons');
      const timePart = timeString.split('T')[1] || timeString;
      const cleanTime = timePart.replace('Z', '').split('.')[0]; // Remove Z and milliseconds
      const [hours, minutes] = cleanTime.split(':');
      if (hours && minutes) {
        const result = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        console.log('formatTime: Extracted time from colon format:', result);
        return result;
      }
    }
    
    // Try to parse as Date directly
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const result = `${hours}:${minutes}`;
      console.log('formatTime: Parsed as Date object:', result);
      return result;
    }
    
    // Fallback
    console.warn('formatTime: Unable to parse time, using original:', timeString);
    return timeString; // Return original if can't parse
  } catch (error) {
    console.error('formatTime: Error formatting time:', error);
    return '--:--';
  }
};

// Utility function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '--';
  
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // If it's already formatted, return as is
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Interface for shift data
interface ShiftData {
  id: number;
  idpegawai: string;
  userId?: number;
  tipeshift?: string;
  tipeEnum?: string;
  tanggal: string;
  originalDate?: string;
  lokasishift: string;
  lokasiEnum?: string;
  jammulai: string;
  jamselesai: string;
  nama?: string;
  formattedLokasi?: string;
}

const columns = [
  { headers: "Jadwal Shift", accessor: "lokasishift", className: "table-cell" },
  { headers: "Tanggal", accessor: "tanggal", className: "hidden lg:table-cell" },
  { headers: "Jam Mulai", accessor: "jammulai", className: "hidden lg:table-cell" },
  { headers: "Jam Selesai", accessor: "jamselesai", className: "hidden lg:table-cell" },
];

const JadwalSayaPage = () => {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [userIdValue, setUserId] = useState<string | null>(null);
  const [roleValue, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [dataSource, setDataSource] = useState<string>("Unknown");
  const [filterValue, setFilterValue] = useState<string>("");
  const [sortValue, setSortValue] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [workloadStatus, setWorkloadStatus] = useState<any>(null);
  const [showOverworkWarning, setShowOverworkWarning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');
  const itemsPerPage = 10;
  
  const filteredShifts = useMemo(() => {
    if (!shifts.length) return [];
    
    let filtered = [...shifts];
    
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(item => 
        (item.formattedLokasi?.toLowerCase().includes(searchLower) || 
         item.lokasishift?.toLowerCase().includes(searchLower) ||
         item.tipeshift?.toLowerCase().includes(searchLower) ||
         item.tanggal.toLowerCase().includes(searchLower))
      );
    }
    
    if (filterValue) {
      filtered = filtered.filter(item => item.tipeshift === filterValue);
    }
    
    if (sortValue) {
      filtered.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortValue) {
          case "tanggal":
            valueA = a.originalDate || a.tanggal;
            valueB = b.originalDate || b.tanggal;
            break;
          case "lokasishift":
            valueA = a.formattedLokasi || a.lokasishift;
            valueB = b.formattedLokasi || b.lokasishift;
            break;
          case "jammulai":
            valueA = a.jammulai;
            valueB = b.jammulai;
            break;
          default:
            return 0;
        }
        
        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
    
    return filtered;
  }, [shifts, searchValue, filterValue, sortValue, sortDirection]);

  // Fungsi untuk dapatkan tanggal hari ini (format YYYY-MM-DD) dengan timezone lokal
  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    console.log('getToday: Current date (local timezone):', today);
    console.log('getToday: Current timestamp:', now.getTime());
    console.log('getToday: Current date object:', now);
    
    return today;
  };
  const todayDate = getToday();

  // Filter shift sesuai tab aktif
  const filteredByTab = useMemo(() => {
    return filteredShifts.filter((item) => {
      // item.originalDate harus format YYYY-MM-DD
      if (!item.originalDate) return false;
      
      console.log('Filter debug:');
      console.log('- Item date:', item.originalDate);
      console.log('- Today date:', todayDate);
      console.log('- Active tab:', activeTab);
      
      if (activeTab === 'today') {
        const isToday = item.originalDate === todayDate;
        console.log('- Is today?', isToday);
        return isToday;
      }
      if (activeTab === 'upcoming') {
        const isUpcoming = item.originalDate > todayDate;
        console.log('- Is upcoming?', isUpcoming);
        return isUpcoming;
      }
      if (activeTab === 'past') {
        const isPast = item.originalDate < todayDate;
        console.log('- Is past?', isPast);
        return isPast;
      }
      return true;
    });
  }, [filteredShifts, activeTab, todayDate]);

  // Memoized shifts for calendar - use all shifts regardless of tab filter
  const memoizedShifts = useMemo(() => {
    console.log('JadwalSaya: Memoizing shifts for calendar');
    console.log('JadwalSaya: activeTab:', activeTab);
    console.log('JadwalSaya: All shifts count:', shifts.length);
    console.log('JadwalSaya: Filtered by tab count:', filteredByTab.length);
    
    // For calendar view, show all shifts regardless of tab, but check for duplicates
    console.log('JadwalSaya: 🔍 Checking for duplicate shifts...');
    
    // Remove any potential duplicates based on ID
    const uniqueShifts = shifts.filter((shift, index, self) => 
      index === self.findIndex((s) => s.id === shift.id)
    );
    
    if (uniqueShifts.length !== shifts.length) {
      console.warn('JadwalSaya: ⚠️ Found and removed', shifts.length - uniqueShifts.length, 'duplicate shifts');
    }
    
    console.log('JadwalSaya: Using', uniqueShifts.length, 'unique shifts for calendar');
    console.log('JadwalSaya: Sample shift for calendar:', uniqueShifts[0]);
    
    return uniqueShifts;
  }, [shifts, filteredByTab, activeTab]);

  const filterOptions = [
    { label: "Semua", value: "" },
    { label: "Tipe: PAGI", value: "PAGI" },
    { label: "Tipe: SIANG", value: "SIANG" },
    { label: "Tipe: MALAM", value: "MALAM" },
    { label: "Tipe: ON CALL", value: "ON_CALL" },
    { label: "Tipe: JAGA", value: "JAGA" },
  ];

  const sortOptions = [
    { label: "Tanggal", value: "tanggal" },
    { label: "Unit Kerja", value: "lokasishift" },
    { label: "Jam Mulai", value: "jammulai" },
  ];

  const handleFilter = (value: string) => {
    setFilterValue(value);
  };

  const handleSort = (value: string, direction: "asc" | "desc") => {
    setSortValue(value);
    setSortDirection(direction);
  };

  useEffect(() => {
    async function initialize() {
      try {
        console.log('JadwalSaya: Initializing...');
        
        const storedRole = localStorage.getItem("role");
        const storedId = localStorage.getItem("idpegawai");
        const storedNameDepan = localStorage.getItem("nameDepan");
        
        console.log('JadwalSaya: Retrieved from localStorage:', {
          role: storedRole,
          idpegawai: storedId,
          nameDepan: storedNameDepan
        });
        
        let userIdentifier = storedId;
        
        if (!userIdentifier && storedNameDepan) {
          userIdentifier = "jojostaf"; 
          localStorage.setItem("idpegawai", userIdentifier);
          console.log('JadwalSaya: Set fallback userIdentifier:', userIdentifier);
        }
        
        setRole(storedRole);
        setUserId(userIdentifier);
        
        if (userIdentifier) {
          await fetchShifts(userIdentifier, storedRole);
        } else {
          console.warn('JadwalSaya: No user identifier found');
          setLoading(false);
          setError("User ID not found. Please log out and log in again.");
        }
      } catch (err) {
        console.error('JadwalSaya: Initialize error:', err);
        setLoading(false);
        setError("Failed to initialize: " + (err instanceof Error ? err.message : String(err)));
      }
    }
    
    initialize();
  }, []);

  async function fetchShifts(userIdentifier: string, userRole: string | null) {
    try {
      console.log('JadwalSaya: Starting fetchShifts...');
      console.log('JadwalSaya: userIdentifier:', userIdentifier);
      console.log('JadwalSaya: userRole:', userRole);
      
      setLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('JadwalSaya: No token found in localStorage');
        throw new Error("Authentication token not found");
      }
      console.log('JadwalSaya: Token found, length:', token.length);
      
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = joinUrl(apiUrl, '/shifts');
      console.log('JadwalSaya: API URL:', url);

      // Check workload status for overwork warning
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        try {
          const workloadResponse = await fetch(`${apiUrl}/overwork/user/${user.id}/eligibility`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (workloadResponse.ok) {
            const workloadResult = await workloadResponse.json();
            if (workloadResult.success) {
              setWorkloadStatus(workloadResult.data);
              // Show warning if user needs overwork request or approaching limit
              const needsWarning = workloadResult.data.needsOverworkRequest || 
                                 (workloadResult.data.currentShifts / workloadResult.data.maxShifts) >= 0.8;
              setShowOverworkWarning(needsWarning);
            }
          }
        } catch (workloadError) {
          console.warn('Failed to fetch workload status:', workloadError);
        }
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('JadwalSaya: API response status:', response.status);
      console.log('JadwalSaya: API response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('JadwalSaya: API error response:', errorText);
        throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('JadwalSaya: Raw API data:', data);
      console.log('JadwalSaya: API data type:', Array.isArray(data) ? 'array' : typeof data);
      console.log('JadwalSaya: API data length:', Array.isArray(data) ? data.length : 'not array');
      
      // DEBUG: Log first shift to see time format
      if (Array.isArray(data) && data.length > 0) {
        console.log('JadwalSaya: 🔍 First shift data structure:', data[0]);
        console.log('JadwalSaya: 🕐 Time format check:', {
          jammulai: data[0].jammulai,
          jamselesai: data[0].jamselesai,
          jammulaiType: typeof data[0].jammulai,
          jamselesaiType: typeof data[0].jamselesai
        });
      }
      
      setDataSource('Backend API');
        
      let userShifts: ShiftData[] = [];
      if (!Array.isArray(data)) {
        console.warn('JadwalSaya: API data is not an array, setting empty shifts');
        userShifts = [];
      } else if (userRole?.toLowerCase() === 'admin') {
        console.log('JadwalSaya: User is admin, using all shifts');
        userShifts = data;
      } else {
        console.log('JadwalSaya: Filtering shifts for non-admin user');
        // Ambil userId numeric dari localStorage (hasil login)
        const storedNumericId = localStorage.getItem("userId");
        console.log('JadwalSaya: storedNumericId:', storedNumericId);
        console.log('JadwalSaya: userIdentifier:', userIdentifier);
        
        userShifts = data.filter((shift: ShiftData) => {
          console.log('JadwalSaya: Checking shift:', {
            shiftId: shift.id,
            shiftUserId: shift.userId,
            shiftIdpegawai: shift.idpegawai
          });
          
          // Jika ada userId di data shift dan di localStorage, gunakan itu
          if (shift.userId && storedNumericId) {
            const match = shift.userId.toString() === storedNumericId;
            console.log(`JadwalSaya: userId match (${shift.userId} === ${storedNumericId}):`, match);
            return match;
          }
          // Jika tidak ada userId, fallback ke idpegawai/username
          if (shift.idpegawai && userIdentifier) {
            const exactMatch = shift.idpegawai === userIdentifier;
            const caseInsensitiveMatch = !exactMatch && shift.idpegawai.toLowerCase() === userIdentifier.toLowerCase();
            console.log(`JadwalSaya: idpegawai match (${shift.idpegawai} === ${userIdentifier}):`, exactMatch || caseInsensitiveMatch);
            return exactMatch || caseInsensitiveMatch;
          }
          console.log('JadwalSaya: No match for shift');
          return false;
        });
        
        console.log('JadwalSaya: Filtered userShifts count:', userShifts.length);
      }
      
      const formattedShifts = userShifts.map((shift: ShiftData) => {
        console.log('JadwalSaya: Processing raw shift data:', shift);
        
        const originalDate = shift.tanggal;
        let date;
        let normalizedDate; // Format YYYY-MM-DD untuk konsistensi
        
        if (originalDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = originalDate.split('-').map(Number);
          date = new Date(year, month - 1, day);
          normalizedDate = originalDate; // Sudah format YYYY-MM-DD
        } else {
          date = new Date(originalDate);
          normalizedDate = date.toISOString().slice(0, 10); // Convert ke YYYY-MM-DD
        }
        
        console.log('JadwalSaya: Date processing:');
        console.log('- Original date:', originalDate);
        console.log('- Normalized date:', normalizedDate);
        console.log('- Date object:', date);
        
        const formattedDate = date.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const formatLokasiShift = (lokasi: string) => {
          return textFormatter.formatLokasiShift(lokasi);
        };
        
        const processedShift = {
          ...shift,
          tanggal: formattedDate,
          originalDate: normalizedDate, // Gunakan format yang sudah di-normalize
          formattedLokasi: formatLokasiShift(shift.lokasishift),
          tipeshift: textFormatter.formatTipeShift(shift.tipeshift || '')
        };
        
        console.log('JadwalSaya: Processed shift data:', processedShift);
        return processedShift;
      });
      
      console.log('JadwalSaya: Total formatted shifts:', formattedShifts.length);
      console.log('JadwalSaya: Sample formatted shift:', formattedShifts[0]);
      
      if (formattedShifts.length === 0) {
        console.warn('JadwalSaya: No shifts found for user after filtering');
        setError(`No shifts found for user ${userIdentifier}. Please contact admin or add some shifts first.`);
      }
      
      setShifts(formattedShifts);
    } catch (err: any) {
      console.error("Error fetching shifts:", err);
      setError(`Failed to load shifts: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  const renderRow = (item: ShiftData) => (
    <tr
      key={item.id}
      className="group border-b last:border-b-0 border-gray-100 hover:bg-gray-50 transition-all duration-200"
    >
      <td className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="font-semibold text-gray-900 text-base group-hover:text-hospitalBlue transition-colors leading-tight">
                {item.formattedLokasi || item.lokasishift || "Unit tidak tersedia"}
              </h3>
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 uppercase tracking-wide">
                  {item.tipeshift || "REGULAR"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="lg:hidden space-y-2">
            <div className="flex items-center justify-center text-sm">
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{formatDate(item.tanggal)}</span>
              </div>
            </div>
            <div className="flex items-center justify-center text-sm">
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{formatTime(item.jammulai)}</span>
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{formatTime(item.jamselesai)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
      
      <td className="hidden lg:table-cell px-6 py-5 text-gray-700 font-medium whitespace-nowrap text-left">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(item.tanggal)}
        </div>
      </td>
      <td className="hidden lg:table-cell px-6 py-5 text-gray-700 font-medium whitespace-nowrap text-left">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-mono">{formatTime(item.jammulai)}</span>
        </div>
      </td>
      <td className="hidden lg:table-cell px-6 py-5 text-gray-700 font-medium whitespace-nowrap text-left">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-mono">{formatTime(item.jamselesai)}</span>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ContentCard>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Memuat jadwal Anda...</p>
            </div>
          </ContentCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader title="Jadwal Saya" description="Lihat dan kelola jadwal shift Anda" />
          <ContentCard>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-3 bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
              <p className="text-gray-600 text-center mb-4">{error}</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <PrimaryButton onClick={() => window.location.reload()}>
                  Muat Ulang
                </PrimaryButton>
                <button 
                  onClick={() => window.location.href = '/sign-in'}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Login Ulang
                </button>
                <button 
                  onClick={() => window.location.href = '/auth-debug'}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                >
                  Debug Info
                </button>
              </div>
              
              {error.includes('Authentication') && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Tip:</strong> Sepertinya ada masalah autentikasi. Coba login ulang atau periksa debug info.
                  </p>
                </div>
              )}
            </div>
          </ContentCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Telegram Bot Setup Guidance */}
        <div className="mb-8 p-5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10V7a5 5 0 0110 0v3" /></svg>
              <span className="font-semibold text-blue-900 text-lg">Aktifkan Notifikasi Telegram</span>
            </div>
            <ol className="list-decimal list-inside text-blue-900 text-sm space-y-1">
              <li>Klik <b>Buka Bot Telegram</b> di samping atau <a href="https://t.me/rsud_anugerah_notif_bot" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">link ini</a>.</li>
              <li>Kirim perintah <code className="bg-blue-100 px-1 rounded">/start</code> ke bot.</li>
              <li>Kirim perintah <code className="bg-blue-100 px-1 rounded">/myid</code> ke bot untuk mendapatkan <b>Chat ID</b> Anda.</li>
              <li>Buka halaman <b>Profil</b> dan tempel Chat ID pada kolom Telegram, lalu simpan.</li>
              <li>Setelah tersimpan, Anda bisa klik <b>Test Notifikasi</b> di halaman profil untuk memastikan notifikasi aktif.</li>
            </ol>
            <div className="mt-2 text-xs text-blue-700">Notifikasi shift, cuti, dan pengumuman penting akan dikirim ke Telegram Anda.</div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <a href="https://t.me/rsud_anugerah_notif_bot" target="_blank" rel="noopener noreferrer">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-2 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10V7a5 5 0 0110 0v3" /></svg>
                Buka Bot Telegram
              </button>
            </a>
            <span className="text-xs text-blue-700">@rsud_anugerah_notif_bot</span>
          </div>
        </div>

        <PageHeader 
          title="Jadwal Saya"
          description="Lihat dan kelola jadwal shift Anda"
          action={
            <div className="flex items-center gap-3">
              {viewMode === 'table' && (
                <div className="w-64">
                  <TableSearch 
                    placeholder="Cari berdasarkan unit kerja, tanggal, atau tipe shift..." 
                    value={searchValue} 
                    onChange={setSearchValue} 
                  />
                </div>
              )}
              
              <PrimaryButton
                onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
                icon={
                  viewMode === 'table' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )
                }
              >
                {viewMode === 'table' ? 'Kalender' : 'Tabel'}
              </PrimaryButton>

              {viewMode === 'table' && (
                <div className="flex items-center gap-2">
                  <FilterButton 
                    options={filterOptions} 
                    onFilter={handleFilter}
                  />
                  <SortButton 
                    options={sortOptions} 
                    onSort={handleSort} 
                  />
                </div>
              )}
            </div>
          }
        />

        {/* Workload Warning Banner */}
        {showOverworkWarning && workloadStatus && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Peringatan Beban Kerja
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {workloadStatus.needsOverworkRequest
                      ? `Anda sudah mencapai batas maksimal shift (${workloadStatus.currentShifts}/${workloadStatus.maxShifts}). Untuk mengambil shift tambahan, silakan ajukan overwork request.`
                      : `Anda sudah mengambil ${workloadStatus.currentShifts} dari ${workloadStatus.maxShifts} shift maksimal bulan ini. Pertimbangkan beban kerja Anda sebelum mengambil shift tambahan.`
                    }
                  </p>
                </div>
                {workloadStatus.needsOverworkRequest && (
                  <div className="mt-3">
                    <Link 
                      href="/dashboard/list/overwork-request"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Ajukan Overwork Request
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab untuk filter jadwal */}
        <div className="mb-4 flex gap-2">
          <button
            className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition-all ${activeTab === 'today' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 bg-gray-100'}`}
            onClick={() => setActiveTab('today')}
          >
            Jadwal Hari Ini
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition-all ${activeTab === 'upcoming' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 bg-gray-100'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Jadwal Mendatang
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition-all ${activeTab === 'past' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 bg-gray-100'}`}
            onClick={() => setActiveTab('past')}
          >
            Jadwal Lewat
          </button>
        </div>

        {filteredByTab.length === 0 ? (
          <ContentCard>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-3 bg-gray-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {shifts.length === 0 ? 'Belum Ada Jadwal' : `Tidak Ada Jadwal untuk Tab "${activeTab === 'today' ? 'Hari Ini' : activeTab === 'upcoming' ? 'Mendatang' : 'Lewat'}"`}
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {shifts.length === 0 
                  ? "Jadwal shift Anda belum tersedia. Hubungi admin untuk informasi lebih lanjut."
                  : searchValue || filterValue 
                    ? "Tidak ada jadwal yang sesuai dengan pencarian Anda. Coba ubah kata kunci atau filter."
                    : `Tidak ada jadwal untuk kategori ${activeTab === 'today' ? 'hari ini' : activeTab === 'upcoming' ? 'mendatang' : 'yang telah lewat'}. Coba pilih tab lain.`
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {(searchValue || filterValue) && (
                  <PrimaryButton
                    variant="outline"
                    onClick={() => {
                      setSearchValue('');
                      setFilterValue('');
                    }}
                  >
                    Hapus Filter
                  </PrimaryButton>
                )}
                
                {shifts.length === 0 && (
                  <>
                    <button 
                      onClick={() => window.location.href = '/auth-debug'}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      Cek Status Login
                    </button>
                    <PrimaryButton onClick={() => window.location.reload()}>
                      Muat Ulang Data
                    </PrimaryButton>
                  </>
                )}
                
                {shifts.length > 0 && activeTab !== 'upcoming' && (
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                  >
                    Lihat Jadwal Mendatang
                  </button>
                )}
              </div>
            </div>
          </ContentCard>
        ) : viewMode === 'table' ? (
          <ContentCard padding="none">
            <div className="overflow-x-auto">
              <Table 
                columns={columns} 
                renderRow={renderRow}
                data={filteredByTab} 
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <Pagination 
                totalItems={filteredByTab.length} 
                itemsPerPage={itemsPerPage} 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </ContentCard>
        ) : (
          <ContentCard padding="none">
            <div className="h-[600px]">
              <Suspense fallback={
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              }>
                <BigCalendar 
                  shifts={memoizedShifts} 
                  useDefaultEvents={false} 
                  key={`calendar-${memoizedShifts.length}`}
                />
              </Suspense>
            </div>
          </ContentCard>
        )}
      </div>
    </div>
  );
};

export default JadwalSayaPage;
