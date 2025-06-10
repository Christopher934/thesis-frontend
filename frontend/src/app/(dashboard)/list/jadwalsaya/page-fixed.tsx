'use client';

import { useEffect, useState } from "react";
import Pagination from "@/component/Pagination";
import TableSearch from "@/component/TableSearch";
import Table from "@/component/Table";
import Image from "next/image";

// Interface for shift data
interface ShiftData {
  id: number;
  idpegawai: string;
  tipeshift?: string;
  tipeEnum?: string;
  tanggal: string;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

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
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("Fetching shifts for user:", userIdentifier);
      
      const response = await fetch("http://localhost:3004/shifts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Shifts from API:", data);
      
      // Get all shifts if admin, filter by userId if staff
      let userShifts;
      if (!Array.isArray(data)) {
        console.error("API returned non-array data:", data);
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
        
        // Compare username/idpegawai to find matches, case insensitive
        userShifts = data.filter((shift: ShiftData) => {
          if (!shift.idpegawai || !userIdentifier) return false;
          
          // First do an exact match check (case-sensitive)
          const exactMatch = shift.idpegawai === userIdentifier;
          
          // Then try case-insensitive if exact match fails
          const caseInsensitiveMatch = !exactMatch && 
                                      shift.idpegawai.toLowerCase() === userIdentifier.toLowerCase();
          
          const isMatch = exactMatch || caseInsensitiveMatch;
          
          console.log(`Checking ${shift.idpegawai} against ${userIdentifier}: ${isMatch ? "MATCH" : "no match"}`);
          return isMatch;
        });
        
        console.log("Filtered shifts for user:", userShifts);
        
        // No longer adding test shift data
        // Only use actual shifts assigned to the user
        if (userShifts.length === 0) {
          console.log("No shifts found for user");
        }
      }
      
      // Format dates to be more readable and enhance shift data display
      const formattedShifts = userShifts.map((shift: ShiftData) => {
        const date = new Date(shift.tanggal);
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
          // Use formatted location name
          formattedLokasi: formatLokasiShift(shift.lokasishift)
        };
      });
      
      console.log("Formatted shifts:", formattedShifts);
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
        <h1 className="hidden md:block text-lg font-semibold">Jadwal Saya</h1>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <TableSearch 
            placeholder="Cari jadwal..." 
            value={searchValue} 
            onChange={setSearchValue} 
          />
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>


      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : shifts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Tidak ada jadwal ditemukan.</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={shifts} />
      )}
      
      <Pagination 
        totalItems={shifts.length} 
        itemsPerPage={itemsPerPage} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
};

export default JadwalSayaPage;
