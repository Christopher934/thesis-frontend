// File: src/app/(dashboard)/dashboard/pegawai/page.tsx
'use client';

// Force dynamic rendering for real-time employee dashboard data
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import nextDynamic from 'next/dynamic';
import withAuth from '@/lib/withAuth';
import FilterButton from '@/components/common/FilterButton';
import SortButton from '@/components/common/SortButton';
import { getApiUrl } from '@/config/api';
import Image from 'next/image';

// Load komponen yang butuh browser-only (mis. FullCalendar) tanpa SSR
const BigCalendar = nextDynamic(
  () => import('@/components/common/BigCalendar'),
  { ssr: false }
);

const EventCalendar = nextDynamic(
  () => import('@/components/common/EventCalendar'),
  { ssr: false }
);

const Announcements = nextDynamic(
  () => import('@/components/common/Announcement'),
  { ssr: false }
);

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
}

function PegawaiPage() {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const [sortValue, setSortValue] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Filter options untuk tipe shift
  const filterOptions = [
    { label: "Semua", value: "" },
    { label: "Tipe: Pagi", value: "PAGI" },
    { label: "Tipe: Siang", value: "SIANG" },
    { label: "Tipe: Malam", value: "MALAM" },
    { label: "Tipe: On Call", value: "ON_CALL" },
    { label: "Tipe: Jaga", value: "JAGA" },
  ];

  // Sort options
  const sortOptions = [
    { label: "Tanggal", value: "tanggal" },
    { label: "Lokasi", value: "lokasishift" },
    { label: "Jam Mulai", value: "jammulai" },
  ];

  // Handle filtering
  const handleFilter = (value: string) => {
    setFilterValue(value);
  };

  // Handle sorting
  const handleSort = (value: string, direction: "asc" | "desc") => {
    setSortValue(value);
    setSortDirection(direction);
  };
  
  // Filtered and sorted shifts
  const filteredShifts = useMemo(() => {
    let filtered = [...shifts];
    
    // Apply tipeshift filter
    if (filterValue) {
      filtered = filtered.filter(item => item.tipeshift === filterValue);
    }
    
    // Apply sorting
    if (sortValue) {
      filtered.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortValue) {
          case "tanggal":
            valueA = a.tanggal;
            valueB = b.tanggal;
            break;
          case "lokasishift":
            valueA = a.lokasishift;
            valueB = b.lokasishift;
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
  }, [shifts, filterValue, sortValue, sortDirection]);
  
  // Memoize shifts to prevent unnecessary re-renders
  const memoizedShifts = useMemo(() => filteredShifts, [filteredShifts]);
  
  // Fetch shifts for the current user when the component mounts
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userIdentifier = localStorage.getItem("idpegawai");
        
        if (!token) {
          throw new Error("Authentication token not found");
        }
        
        if (!userIdentifier) {
          throw new Error("User ID not found");
        }
        
        console.log("Fetching shifts for user:", userIdentifier);
        
        // Get the API URL from our configuration
        const apiUrl = getApiUrl();
        console.log('Using API URL:', apiUrl);
        
        // Direct fetch to the backend API
        const response = await fetch(`${apiUrl}/shifts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
        }
        
        const allShifts = await response.json();
        
        // Filter shifts for the current user
        const userShifts = allShifts.filter((shift: ShiftData) => {
          if (!shift.idpegawai || !userIdentifier) return false;
          
          // Check for exact match or case-insensitive match
          const exactMatch = shift.idpegawai === userIdentifier;
          const caseInsensitiveMatch = !exactMatch && 
                                      shift.idpegawai.toLowerCase() === userIdentifier.toLowerCase();
          
          return exactMatch || caseInsensitiveMatch;
        });
        
        console.log("User shifts found:", userShifts.length);
        setShifts(userShifts);
      } catch (err) {
        console.error("Error in shift data retrieval process:", err);
        setError(err instanceof Error ? err.message : 'An error occurred while retrieving shift data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShifts();
  }, []);
  
  return (
    <div className="p-4 flex flex-col xl:flex-row gap-6">
      {/* LEFT: Kalender penuh */}
      <div className="w-full xl:w-2/3 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-semibold">Jadwal Saya</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <FilterButton 
              options={filterOptions} 
              onFilter={handleFilter}
            />
            <SortButton 
              options={sortOptions} 
              onSort={handleSort} 
            />
          </div>
        </div>
        <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <BigCalendar 
              shifts={memoizedShifts}
              useDefaultEvents={false}
              key={`calendar-${memoizedShifts.length}`}
            />
          )}
        </div>
      </div>

      {/* RIGHT: Event & Pengumuman */}
      <aside className="w-full xl:w-1/3 flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-medium mb-2">Event Mendatang</h3>
          <EventCalendar />
        </div>
      </aside>
    </div>
  );
}

// Hanya user dengan role DOKTER, PERAWAT, atau STAF yang bisa akses
export default withAuth(PegawaiPage, ['DOKTER', 'PERAWAT', 'STAF']);
