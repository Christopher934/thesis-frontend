'use client';

// Force dynamic rendering for real-time schedule data
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import Pagination from "@/components/common/Pagination";
import TableSearch from "@/components/common/TableSearch";
import Table from "@/components/common/Table";
import FilterButton from "@/components/common/FilterButton";
import SortButton from "@/components/common/SortButton";
import { joinUrl } from "@/lib/urlUtils";
import { PageHeader, PrimaryButton, ContentCard } from "@/components/ui";

// Dynamic import to prevent hydration issues and optimization
const BigCalendar = lazy(() => import("@/components/common/BigCalendar"));

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
  const itemsPerPage = 10;
  
  const memoizedShifts = useMemo(() => shifts, [shifts]);
  
  const filterOptions = [
    { label: "Semua", value: "" },
    { label: "Tipe: Pagi", value: "PAGI" },
    { label: "Tipe: Siang", value: "SIANG" },
    { label: "Tipe: Malam", value: "MALAM" },
    { label: "Tipe: On Call", value: "ON_CALL" },
    { label: "Tipe: Jaga", value: "JAGA" },
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

  useEffect(() => {
    async function initialize() {
      try {
        const storedRole = localStorage.getItem("role");
        const storedId = localStorage.getItem("idpegawai");
        const storedNameDepan = localStorage.getItem("nameDepan");
        
        let userIdentifier = storedId;
        
        if (!userIdentifier && storedNameDepan) {
          userIdentifier = "jojostaf"; 
          localStorage.setItem("idpegawai", userIdentifier);
        }
        
        setRole(storedRole);
        setUserId(userIdentifier);
        
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

  async function fetchShifts(userIdentifier: string, userRole: string | null) {
    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      const url = joinUrl(apiUrl, '/shifts');
      
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
      setDataSource('Backend API');
        
      let userShifts: ShiftData[] = [];
      if (!Array.isArray(data)) {
        userShifts = [];
      } else if (userRole?.toLowerCase() === 'admin') {
        userShifts = data;
      } else {
        userShifts = data.filter((shift: ShiftData) => {
          if (!shift.idpegawai || !userIdentifier) {
            return false;
          }
          
          const exactMatch = shift.idpegawai === userIdentifier;
          const caseInsensitiveMatch = !exactMatch && 
                                      shift.idpegawai.toLowerCase() === userIdentifier.toLowerCase();
          
          const storedNumericId = localStorage.getItem("userId");
          const numericIdMatch = storedNumericId && 
                                shift.userId && 
                                shift.userId.toString() === storedNumericId;
          
          const isMatch = exactMatch || caseInsensitiveMatch || numericIdMatch;
          
          return isMatch;
        });
      }
      
      const formattedShifts = userShifts.map((shift: ShiftData) => {
        const originalDate = shift.tanggal;
        let date;
        
        if (originalDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = originalDate.split('-').map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(originalDate);
        }
        
        const formattedDate = date.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const formatLokasiShift = (lokasi: string) => {
          if (!lokasi) return '-';
          
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
      className="group border-b last:border-b-0 border-gray-100 hover:bg-gray-50 transition-all duration-200"
    >
      <td className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors leading-tight">
                {item.formattedLokasi || item.lokasishift || "Unit tidak tersedia"}
              </h3>
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                  {item.tipeshift || "Tidak Ada Tipe"}
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
                <span className="font-medium">{item.tanggal}</span>
              </div>
            </div>
            <div className="flex items-center justify-center text-sm">
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{item.jammulai}</span>
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{item.jamselesai}</span>
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
              <PrimaryButton onClick={() => window.location.reload()}>
                Muat Ulang
              </PrimaryButton>
            </div>
          </ContentCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {filteredShifts.length === 0 ? (
          <ContentCard>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-3 bg-gray-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Jadwal</h3>
              <p className="text-gray-600 text-center mb-4">
                {searchValue || filterValue 
                  ? "Tidak ada jadwal yang sesuai dengan pencarian Anda. Coba ubah kata kunci atau filter."
                  : "Jadwal shift Anda belum tersedia. Hubungi admin untuk informasi lebih lanjut."
                }
              </p>
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
            </div>
          </ContentCard>
        ) : viewMode === 'table' ? (
          <ContentCard padding="none">
            <div className="overflow-x-auto">
              <Table 
                columns={columns} 
                renderRow={renderRow}
                data={filteredShifts} 
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <Pagination 
                totalItems={filteredShifts.length} 
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
