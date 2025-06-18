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
import { fetchWithAuthAndFallback } from "@/utils/authUtils";

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
  { headers: "Lokasi & Shift", accessor: "lokasishift", className: "table-cell" },
  { headers: "Tanggal", accessor: "tanggal", className: "hidden md:table-cell" },
  { headers: "Jam Mulai", accessor: "jammulai", className: "hidden md:table-cell" },
  { headers: "Jam Selesai", accessor: "jamselesai", className: "hidden md:table-cell" },
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
        
        console.log("Raw localStorage data:", { 
          role: storedRole, 
          idpegawai: storedId,
          nameDepan: storedNameDepan 
        });
        
        // Handle case where idpegawai is not in localStorage
        let userIdentifier = storedId;
        
        if (!userIdentifier && storedNameDepan) {
          // If no idpegawai but we have a name, use default username
          userIdentifier = "jojostaf"; 
          localStorage.setItem("idpegawai", userIdentifier);
          console.log("Set missing idpegawai to:", userIdentifier);
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
        console.error("Error initializing:", err);
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
      
      console.log("Fetching shifts for user:", userIdentifier);
      
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('Using API URL:', apiUrl);
      const url = joinUrl(apiUrl, '/shifts');
      console.log('Full API URL:', url);
      
      // Using fetchWithAuthAndFallback for better error handling
      const data = await fetchWithAuthAndFallback<ShiftData[]>(
        url,
        '/mock-shifts.json'
      );
        
        console.log("Shifts data:", data);
        
        // Determine the data source based on API or mock
        const source = Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('mockData') 
          ? 'Mock Data' 
          : 'Backend API';
        setDataSource(source);
        console.log(`Data source identified: ${source}`);
        
        // Get all shifts if admin, filter by userId if staff
        // Get all shifts if admin, filter by userId if staff
        let userShifts: ShiftData[] = [];
      if (!Array.isArray(data)) {
        userShifts = [];
      } else if (userRole?.toLowerCase() === 'admin') {
        userShifts = data;
        console.log("Admin user, showing all shifts");
      } else {
        // Debug the filtering process
        console.log("Filtering shifts for user:", userIdentifier);
        
        // For testing/debugging, show all shifts in console
        data.forEach((shift: ShiftData) => {
          console.log(`Shift: id=${shift.id}, idpegawai=${shift.idpegawai}`);
        });
        
        // Compare username/idpegawai to find matches, with improved robustness
        userShifts = data.filter((shift: ShiftData) => {
          if (!shift.idpegawai || !userIdentifier) {
            console.log(`Skipping shift ${shift.id}: Missing idpegawai or userIdentifier`);
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
          
          console.log(
            `Checking shift ${shift.id}: ${shift.idpegawai} against ${userIdentifier}: ` + 
            `${isMatch ? "MATCH" : "no match"} ` +
            `(exact: ${exactMatch}, case-insensitive: ${caseInsensitiveMatch}, numericId: ${numericIdMatch})`
          );
          
          return isMatch;
        });
        
        console.log("Filtered shifts for user:", userShifts);
        
        // No longer adding test shift data if no shifts were found
        if (userShifts.length === 0) {
          console.log("No shifts found for user");
        }
      }
      
      // Format dates to be more readable but keep original dates for calendar
      const formattedShifts = userShifts.map((shift: ShiftData) => {
        // First store the original ISO date for calendar processing
        const originalDate = shift.tanggal;
        
        console.log(`Processing shift in jadwalSaya: id=${shift.id}, date=${originalDate}, location=${shift.lokasishift}`);
        
        // Parse the date with timezone handling for consistent results
        let date;
        
        // If the date is in ISO format (YYYY-MM-DD)
        if (originalDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = originalDate.split('-').map(Number);
          // Create date using local timezone
          date = new Date(year, month - 1, day);
          console.log(`Parsed ISO date ${originalDate} to ${date.toString()}`);
        } else {
          // For other formats, use standard parsing
          date = new Date(originalDate);
          console.log(`Parsed date ${originalDate} to ${date.toString()}`);
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
        
        console.log(`Formatted date for shift ${shift.id}: ${formattedDate}, original date: ${originalDate}`);
        
        return {
          ...shift,
          tanggal: formattedDate,
          originalDate: originalDate,
          formattedLokasi: formatLokasiShift(shift.lokasishift)
        };
      });
      
      console.log(`Total formatted shifts: ${formattedShifts.length}`);
      formattedShifts.forEach(shift => {
        console.log(`Shift ID: ${shift.id}, User: ${shift.idpegawai}, Date: ${shift.tanggal}, Original Date: ${shift.originalDate}`);
      });
      
      console.log("Formatted shifts with original dates:", formattedShifts);
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
      className="border-b border-gray-200 even:bg-slate-50 hover:bg-gray-50 transition-colors"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.formattedLokasi || item.lokasishift}</h3>
          <p className="text-xs text-gray-500">{item.tipeshift || "Regular"}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.tanggal}</td>
      <td className="hidden md:table-cell">{item.jammulai}</td>
      <td className="hidden md:table-cell">{item.jamselesai}</td>
      <td className="table-cell md:hidden px-4 py-2">
        <div className="flex flex-col">
          <span>{item.tanggal}</span>
          <span className="text-xs text-gray-500">
            {item.jammulai} - {item.jamselesai}
          </span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="hidden md:block text-lg font-semibold">Jadwal Saya</h1>
          {dataSource !== "Unknown" && (
            <div className="text-xs text-gray-500 mt-1">
              Source: {dataSource}
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          {viewMode === 'table' && (
            <TableSearch 
              placeholder="Cari jadwal..." 
              value={searchValue} 
              onChange={setSearchValue} 
            />
          )}
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1 flex items-center justify-center bg-gray-100 rounded-md hover:bg-gray-200 transition"
              onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
            >
              {viewMode === 'table' ? 'Lihat Kalender' : 'Lihat Tabel'}
            </button>
            {viewMode === 'table' && (
              <>
                <FilterButton 
                  options={filterOptions} 
                  onFilter={handleFilter}
                />
                <SortButton 
                  options={sortOptions} 
                  onSort={handleSort} 
                />
              </>
            )}
          </div>
        </div>
      </div>


      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredShifts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Tidak ada jadwal ditemukan.</div>
      ) : viewMode === 'table' ? (
        <>
          <Table columns={columns} renderRow={renderRow} data={filteredShifts} />
          <Pagination 
            totalItems={filteredShifts.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
          />
        </>
      ) : (
        <div className="h-[600px] mt-4">
          {/* Only render calendar if we're in calendar view */}
          {viewMode === 'calendar' && (
            <Suspense fallback={<div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>}>
              <BigCalendar 
                shifts={memoizedShifts} 
                useDefaultEvents={false} 
                key={`calendar-${memoizedShifts.length}`} // Force re-render when shifts change
              />
            </Suspense>
          )}
        </div>
      )}
    </div>
  );
};

export default JadwalSayaPage;
