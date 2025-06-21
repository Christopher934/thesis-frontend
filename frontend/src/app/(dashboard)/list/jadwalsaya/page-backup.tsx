'use client';

// Force dynamic rendering for real-time schedule data
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import Pagination from "@/component/Pagination";
import TableSearch from "@/component/TableSearch";
import Table from "@/component/Table";
import FilterButton from "@/component/FilterButton";
import SortButton from "@/component/SortButton";
import { joinUrl } from "@/lib/urlUtils";
import { PageHeader, PrimaryButton, ContentCard, Tabs } from "@/components/ui";

// Dynamic import to prevent hydration issues and optimization
const BigCalendar = lazy(() => import("@/component/BigCalendar"));

// Interface for shift data
interface ShiftData {
  id: number;
  idpegawai: string;
  userId?: number;      // Added userId property to fix type errors
  tipeshift?: string;
  tipeEnum?: string;
  tanggal: string;
  originalDate?: string; // Original date for calendar view
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
  // We need to declare the shifts state
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  // Fix duplicate userId declaration - removing the first one
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
  const itemsPerPage = 10;
  
  // Memoize the shifts data for calendar to avoid unnecessary recalculations
  const memoizedShifts = useMemo(() => shifts, [shifts]);
  
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
    { label: "Unit Kerja", value: "lokasishift" },
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
  
  const filteredShifts = useMemo(() => {
    // Handle empty shifts array case
    if (!shifts.length) return [];
    
    let filtered = [...shifts];
    
    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(item => 
        (item.formattedLokasi?.toLowerCase().includes(searchLower) || 
         item.lokasishift?.toLowerCase().includes(searchLower) ||
         item.tipeshift?.toLowerCase().includes(searchLower) ||
         item.tanggal.toLowerCase().includes(searchLower))
      );
    }
    
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
            // For dates, use originalDate if available for proper comparison
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

  // Load user info and fetch shifts when component mounts
  useEffect(() => {
    async function initialize() {
      try {
        // First, get user info from localStorage
        const storedRole = localStorage.getItem("role");
        const storedId = localStorage.getItem("idpegawai");
        const storedNameDepan = localStorage.getItem("nameDepan");
        
        // Handle case where idpegawai is not in localStorage
        let userIdentifier = storedId;
        
        if (!userIdentifier && storedNameDepan) {
          // If no idpegawai but we have a name, use default username
          userIdentifier = "jojostaf"; 
          localStorage.setItem("idpegawai", userIdentifier);
        }
        
        // Update state with user info
        setRole(storedRole);
        setUserId(userIdentifier);
        
        // Then fetch shifts if we have user ID
        if (userIdentifier) {
          await fetchShifts(userIdentifier, storedRole);
        } else {
          setLoading(false);
          setError("User ID not found. Please log out and log in again.");
        }
      } catch (err) {
        setLoading(false);
        setError("Failed to initialize: " + (err instanceof Error ? err.message : String(err)));
      }
    }
    
    initialize();
  }, []);

  // Function to fetch shifts for a user
  async function fetchShifts(userIdentifier: string, userRole: string | null) {
    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = joinUrl(apiUrl, '/shifts');
      
      // Direct fetch to the backend API
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Set data source
      setDataSource('Backend API');
        
      // Get all shifts if admin, filter by userId if staff
      let userShifts: ShiftData[] = [];
      if (!Array.isArray(data)) {
        userShifts = [];
      } else if (userRole?.toLowerCase() === 'admin') {
        userShifts = data;
      } else {
        // Compare username/idpegawai to find matches, with improved robustness
        userShifts = data.filter((shift: ShiftData) => {
          if (!shift.idpegawai || !userIdentifier) {
            return false;
          }
          
          // First do an exact match check (case-sensitive)
          const exactMatch = shift.idpegawai === userIdentifier;
          
          // Then try case-insensitive match
          const caseInsensitiveMatch = !exactMatch && 
                                      shift.idpegawai.toLowerCase() === userIdentifier.toLowerCase();
          
          // Also check if the shift's userId matches any numeric ID stored in localStorage
          const storedNumericId = localStorage.getItem("userId");
          const numericIdMatch = storedNumericId && 
                                shift.userId && 
                                shift.userId.toString() === storedNumericId;
          
          const isMatch = exactMatch || caseInsensitiveMatch || numericIdMatch;
          
          return isMatch;
        });
        
        // No longer adding test shift data if no shifts were found
        if (userShifts.length === 0) {
          // console.log("No shifts found for user");
        }
      }
      
      // Format dates to be more readable but keep original dates for calendar
      const formattedShifts = userShifts.map((shift: ShiftData) => {
        // First store the original ISO date for calendar processing
        const originalDate = shift.tanggal;
        
        // Parse the date with timezone handling for consistent results
        let date;
        
        // If the date is in ISO format (YYYY-MM-DD)
        if (originalDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = originalDate.split('-').map(Number);
          // Create date using local timezone
          date = new Date(year, month - 1, day);
        } else {
          // For other formats, use standard parsing
          date = new Date(originalDate);
        }
        
        // Format the date for display in the table
        const formattedDate = date.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        // Format location name for better display
        const formatLokasiShift = (lokasi: string) => {
          if (!lokasi) return '-';
          
          // Replace underscores with spaces and capitalize each word
          return lokasi
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        };
        
        return {
          ...shift,
          tanggal: formattedDate,
          originalDate: originalDate,
          formattedLokasi: formatLokasiShift(shift.lokasishift)
        };
      });
      
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
      className="group border-b last:border-b-0 border-gray-100 hover:bg-pink-50/50 transition-all duration-200"
    >
      <td className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col space-y-3">
          {/* Unit kerja dan tipe shift */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-pink-600 transition-colors leading-tight">
                {item.formattedLokasi || item.lokasishift || "Unit tidak tersedia"}
              </h3>
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-200">
                  {item.tipeshift || "Tidak ada tipe"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Informasi tambahan untuk mobile/tablet */}
          <div className="lg:hidden space-y-3">
            <div className="flex items-center justify-center text-sm">
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{item.tanggal}</span>
              </div>
            </div>
            <div className="flex items-center justify-center text-sm">
              <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-2 rounded-lg border border-pink-100">
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">{item.jammulai}</span>
                </div>
                <div className="w-8 h-px bg-gradient-to-r from-pink-300 to-purple-300"></div>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">{item.jamselesai}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
      
      {/* Desktop columns */}
      <td className="hidden lg:table-cell px-6 py-5 text-gray-700 font-medium whitespace-nowrap text-left">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {item.tanggal}
        </div>
      </td>
      <td className="hidden lg:table-cell px-6 py-5 text-gray-700 font-medium whitespace-nowrap text-left">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {item.jammulai}
        </div>
      </td>
      <td className="hidden lg:table-cell px-6 py-5 text-gray-700 font-medium whitespace-nowrap text-left">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {item.jamselesai}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-100">
      {/* Modern header with glassmorphism */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between py-3 sm:py-4 gap-3 sm:gap-4">
            {/* Title section */}
            <div className="flex items-center gap-4 text-center lg:text-left w-full lg:w-auto">
              <div className="w-full lg:w-auto">
                <h1 className="text-xl sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Jadwal Saya</h1>
              </div>
            </div>

            {/* Controls section */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {viewMode === 'table' && (
                <div className="w-full sm:w-64 lg:w-72">
                  <TableSearch 
                    placeholder="Cari berdasarkan unit kerja, tanggal, atau tipe shift..." 
                    value={searchValue} 
                    onChange={setSearchValue} 
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center lg:justify-start">
                {/* View toggle button */}
                <button 
                  className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-200 text-xs sm:text-sm"
                  onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
                  type="button"
                >
                  {viewMode === 'table' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Kalender</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Tabel</span>
                    </>
                  )}
                </button>

                {/* Filter and sort buttons for table view */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animate-reverse"></div>
            </div>
            <p className="mt-6 text-lg font-semibold text-gray-700">Memuat jadwal Anda...</p>
            <p className="mt-2 text-sm text-gray-500">Mohon tunggu sebentar</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-red-100 rounded-full mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 text-center max-w-md">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-6 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-gray-100 rounded-full mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Jadwal</h3>
            <p className="text-gray-600 text-center max-w-md">
              {searchValue || filterValue 
                ? "Tidak ada jadwal yang sesuai dengan pencarian Anda. Coba ubah kata kunci atau filter."
                : "Jadwal shift Anda belum tersedia. Hubungi admin untuk informasi lebih lanjut."
              }
            </p>
            {(searchValue || filterValue) && (
              <button 
                onClick={() => {
                  setSearchValue('');
                  setFilterValue('');
                }}
                className="mt-6 px-6 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors"
              >
                Hapus Filter
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table 
                columns={columns} 
                renderRow={renderRow}
                data={filteredShifts} 
              />
            </div>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50">
              <Pagination 
                totalItems={filteredShifts.length} 
                itemsPerPage={itemsPerPage} 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="h-[700px] md:h-[700px] sm:h-[500px] xs:h-[400px]">
              {viewMode === 'calendar' && (
                <Suspense fallback={
                  <div className="flex justify-center items-center h-full">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                }>
                  <BigCalendar 
                    shifts={memoizedShifts} 
                    useDefaultEvents={false} 
                    key={`calendar-${memoizedShifts.length}`}
                  />
                </Suspense>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalSayaPage;
