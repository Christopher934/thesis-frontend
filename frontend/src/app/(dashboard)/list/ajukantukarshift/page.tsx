'use client';

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Pagination from "@/component/Pagination";
import TableSearch from "@/component/TableSearch";
import Table from "@/component/Table";
import FormModal from "@/component/FormModal";
import FilterButton from "@/component/FilterButton";
import SortButton from "@/component/SortButton";
import Link from "next/link";

// TypeScript interfaces
interface User {
  id: number;
  nama: string;
}

interface TukarShift {
  id: number;
  pengaju: User;
  targetUser: User;
  tanggal: string;
  lokasiShift: string;
  jamMulai: string;
  jamSelesai: string;
  status: string;
  alasan: string;
  createdAt: string;
  shiftSendiriId: number;
  shiftTujuanId: number;
  targetTanggal: string;
  targetLokasiShift: string;
  targetJamMulai: string;
  targetJamSelesai: string;
}

import { isCriticalUnit } from '@/lib/unitUtils';

// Tukar Shift Status Constants
const STATUS = {
  PENDING: "MENUNGGU_KONFIRMASI",
  REJECTED_BY_TARGET: "DITOLAK_PEGAWAI",
  APPROVED_BY_TARGET: "MENUNGGU_SUPERVISOR",
  WAITING_UNIT_HEAD: "MENUNGGU_KEPALA_UNIT",
  REJECTED_BY_UNIT_HEAD: "DITOLAK_KEPALA_UNIT",
  REJECTED_BY_SUPERVISOR: "DITOLAK_SUPERVISOR",
  APPROVED: "DISETUJUI"
};

// Color mapping for status badges
const statusColors = {
  [STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [STATUS.REJECTED_BY_TARGET]: "bg-red-100 text-red-800",
  [STATUS.APPROVED_BY_TARGET]: "bg-blue-100 text-blue-800",
  [STATUS.WAITING_UNIT_HEAD]: "bg-purple-100 text-purple-800",
  [STATUS.REJECTED_BY_UNIT_HEAD]: "bg-red-100 text-red-800",
  [STATUS.REJECTED_BY_SUPERVISOR]: "bg-red-100 text-red-800",
  [STATUS.APPROVED]: "bg-green-100 text-green-800"
};

// Enhanced column definitions
const columns = [
  { headers: "Pengaju", accessor: "namaPengaju" },
  { headers: "Dengan", accessor: "namaTarget" },
  { headers: "Tanggal", accessor: "tanggal", className: "hidden md:table-cell" },
  { headers: "Lokasi", accessor: "lokasiShift", className: "hidden md:table-cell" },
  { headers: "Jam Shift", accessor: "jamShift", className: "hidden md:table-cell" },
  { headers: "Status", accessor: "status" },
  { headers: "Action", accessor: "action" }
];

// Component
const TukarShiftPage = () => {
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"masuk" | "pengajuan">("masuk");
  const [role, setRole] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [tukarShiftItems, setTukarShiftItems] = useState<TukarShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Get user info and role on component mount
  useEffect(() => {
    // Get role from localStorage
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole.toLowerCase());
    }

    // Get user ID from localStorage
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.id) {
          setCurrentUserId(user.id);
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
      }
    }
    // Only fetch data if not already loading (avoid infinite loop)
    if (!loading) {
      fetchTukarShiftData();
    }
  }, []);
  
  // Function to fetch tukar shift data from API with improved error handling
  const fetchTukarShiftData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = checkAuthToken();
      if (!token) return;
      
      // Get API base URL from environment or use default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      
      console.log('Fetching tukar shift data from API:', `${apiUrl}/shift-swap-requests`);
          try {
            const response = await fetch(`${apiUrl}/shift-swap-requests`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            // Check for unauthorized (expired token)
            if (response.status === 401) {
              console.error("Unauthorized access - token may have expired");
              localStorage.removeItem("token"); // Clear invalid token
              setError("Sesi Anda telah berakhir. Silakan login kembali.");
              setTimeout(() => {
                window.location.href = "/login";
              }, 2000);
              return;
            }
            if (response.status === 404) {
              // No data found, treat as empty
              setTukarShiftItems([]);
              setLoading(false);
              return;
            }
            if (!response.ok) {
              throw new Error(`Failed to fetch tukar shift data: ${response.status}`);
            }
            
            // Try to parse the response as JSON
            let data;
            try {
              data = await response.json();
            } catch (jsonError) {
              console.error("Error parsing JSON response:", jsonError);
              throw new Error("Format data dari server tidak valid");
            }
            
            console.log('Tukar shift data from API:', data);
            
            if (Array.isArray(data) && data.length > 0) {
              // Map API data to match the format expected by the component
              const formattedData = data.map(item => {
                // Extract user data with various possible formats
                const extractUserName = (user: any, userId: number | string) => {
                  if (!user) return 'Unknown';
                  
                  // Handle nested user object
                  if (user.namaDepan || user.firstName || user.first_name) {
                    const firstName = user.namaDepan || user.firstName || user.first_name || '';
                    const lastName = user.namaBelakang || user.lastName || user.last_name || '';
                    return `${firstName} ${lastName}`.trim();
                  }
                  
                  // Handle full name in a single field
                  if (user.nama || user.name || user.full_name) {
                    return user.nama || user.name || user.full_name;
                  }
                  
                  // Handle requestorName or targetName fields
                  if (item.requestorName && userId === item.requestorId) {
                    return item.requestorName;
                  }
                  
                  if (item.targetName && userId === item.targetId) {
                    return item.targetName;
                  }
                  
                  return 'Unknown';
                };
                
                // Get requestor data
                const requestorId = item.requestorId || item.fromUserId || item.pengajuId;
                const requestorUser = item.requestor || item.fromUser || item.pengaju;
                const requestorName = extractUserName(requestorUser, requestorId);
                
                // Get target data
                const targetId = item.targetId || item.toUserId || item.tujuanId;
                const targetUser = item.target || item.toUser || item.tujuan;
                const targetName = extractUserName(targetUser, targetId);
                
                // Get shift data with different possible field names
                const getShiftData = (shift: any) => {
                  if (!shift) return { tanggal: '', lokasi: '', jamMulai: '', jamSelesai: '' };
                  return {
                    tanggal: shift.tanggal || shift.date || shift.shiftDate || '',
                    lokasi: shift.lokasishift || shift.lokasi || shift.location || '',
                    jamMulai: shift.jammulai || shift.jamMulai || shift.startTime || '',
                    jamSelesai: shift.jamselesai || shift.jamSelesai || shift.endTime || ''
                  };
                };
                
                const requestorShift = getShiftData(item.requestorShift || item.fromShift || item.shiftSendiri);
                const targetShift = getShiftData(item.targetShift || item.toShift || item.shiftTujuan);
                
                return {
                  id: item.id,
                  pengaju: { 
                    id: requestorId, 
                    nama: requestorName
                  },
                  targetUser: { 
                    id: targetId, 
                    nama: targetName
                  },
                  tanggal: formatDate(requestorShift.tanggal),
                  lokasiShift: requestorShift.lokasi,
                  jamMulai: requestorShift.jamMulai,
                  jamSelesai: requestorShift.jamSelesai,
                  status: mapStatusFromAPI(item.status),
                  alasan: item.reason || item.alasan || '',
                  createdAt: item.createdAt || item.created_at || new Date().toISOString(),
                  shiftSendiriId: item.requestorShiftId || item.fromShiftId || item.shiftSendiriId,
                  shiftTujuanId: item.targetShiftId || item.toShiftId || item.shiftTujuanId,
                  targetTanggal: formatDate(targetShift.tanggal),
                  targetLokasiShift: targetShift.lokasi,
                  targetJamMulai: targetShift.jamMulai,
                  targetJamSelesai: targetShift.jamSelesai
                };
              });
              
              setTukarShiftItems(formattedData);
              return; // Exit early since we successfully processed the data
            } else {
              // If no data or not an array, continue to fallback
              console.log('No tukar shift data found or invalid data format');
              throw new Error('No valid data returned from API');
            }
          } catch (apiError) {
            console.error("API error:", apiError);
            throw apiError; // Re-throw to be caught by the outer catch block
          }
      
    } catch (error) {
      console.error("Error fetching tukar shift data:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      // Fallback to mock data if API fails
      console.log('Falling back to mock data');
      setTukarShiftItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to check authentication token
  const checkAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi Anda telah berakhir. Silakan login kembali.");
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return null;
    }
    return token;
  };

  // Helper function to map API status to frontend status
  const mapStatusFromAPI = (apiStatus: string): string => {
    if (!apiStatus) return STATUS.PENDING;
    
    // Convert to uppercase and normalize
    const normalizedStatus = apiStatus.toUpperCase()
      .replace(/[-_\s]/g, '_')  // Replace hyphens, underscores, spaces with underscore
      .replace(/[^\w]/g, '');   // Remove any non-word characters
    
    const statusMapping: Record<string, string> = {
      // Main standard statuses
      'PENDING': STATUS.PENDING,
      'APPROVED_BY_TARGET': STATUS.APPROVED_BY_TARGET,
      'REJECTED_BY_TARGET': STATUS.REJECTED_BY_TARGET,
      'WAITING_UNIT_HEAD': STATUS.WAITING_UNIT_HEAD,
      'REJECTED_BY_UNIT_HEAD': STATUS.REJECTED_BY_UNIT_HEAD,
      'APPROVED': STATUS.APPROVED,
      'REJECTED_BY_SUPERVISOR': STATUS.REJECTED_BY_SUPERVISOR,
      
      // Alternative wordings that might be used
      'MENUNGGU': STATUS.PENDING,
      'MENUNGGU_KONFIRMASI': STATUS.PENDING,
      'DISETUJUI_PEGAWAI': STATUS.APPROVED_BY_TARGET,
      'MENUNGGU_SUPERVISOR': STATUS.APPROVED_BY_TARGET,
      'DITOLAK_PEGAWAI': STATUS.REJECTED_BY_TARGET,
      'MENUNGGU_KEPALA_UNIT': STATUS.WAITING_UNIT_HEAD,
      'DITOLAK_KEPALA_UNIT': STATUS.REJECTED_BY_UNIT_HEAD,
      'DISETUJUI': STATUS.APPROVED,
      'DITOLAK_SUPERVISOR': STATUS.REJECTED_BY_SUPERVISOR,
      
      // Shorter variants
      'WAITING': STATUS.PENDING,
      'APPROVED_TARGET': STATUS.APPROVED_BY_TARGET, 
      'REJECTED_TARGET': STATUS.REJECTED_BY_TARGET,
      'REJECTED_SUPERVISOR': STATUS.REJECTED_BY_SUPERVISOR
    };
    
    // Try to match with normalized status first
    if (statusMapping[normalizedStatus]) {
      return statusMapping[normalizedStatus];
    }
    
    // Fallback: try to find partial matches
    for (const [key, value] of Object.entries(statusMapping)) {
      if (normalizedStatus.includes(key)) {
        return value;
      }
    }
    
    console.warn(`Unknown status value: ${apiStatus}, defaulting to PENDING`);
    return STATUS.PENDING;
  };
  
  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Tanggal tidak tersedia";
    
    try {
      // Check if date is already in display format (e.g., "Senin, 2 Juni 2025")
      if (dateString.includes(',') && dateString.includes(' ')) {
        return dateString;
      }
      
      // Try to parse the date
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format: ${dateString}`);
        return dateString;
      }
      
      return date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error("Error formatting date:", error, "Original value:", dateString);
      return dateString || "Tanggal tidak tersedia";
    }
  };

  // Data filtering based on role
  const roleBasedData = useMemo(() => {
    const isSupervisor = role === "supervisor";
    const isUnitHead = role === "unit_head";
    const isAdmin = role === "admin";
    
    // If admin, show all requests
    // If supervisor, show all requests that need supervisor approval or have been processed by supervisor
    // If unit head, show all requests that need unit head approval or have been processed by unit head
    // Otherwise filter based on current user involvement
    let visibleData;
    
    if (isAdmin) {
      visibleData = tukarShiftItems;
    } else if (isSupervisor) {
      visibleData = tukarShiftItems.filter(
        item => item.status === STATUS.APPROVED_BY_TARGET || 
               item.status === STATUS.WAITING_UNIT_HEAD ||
               item.status === STATUS.REJECTED_BY_SUPERVISOR || 
               item.status === STATUS.APPROVED
      );
    } else if (isUnitHead) {
      visibleData = tukarShiftItems.filter(
        item => item.status === STATUS.WAITING_UNIT_HEAD || 
               item.status === STATUS.REJECTED_BY_UNIT_HEAD ||
               item.status === STATUS.APPROVED
      );
    } else {
      visibleData = tukarShiftItems.filter(
        item => item.pengaju.id === currentUserId || item.targetUser.id === currentUserId
      );
    }
  
    // Requests coming in to the current user
    const permintaanMasuk = visibleData.filter(item => item.targetUser.id === currentUserId);
    
    // Requests sent by the current user
    const pengajuanSaya = visibleData.filter(item => item.pengaju.id === currentUserId);
    
    return { isAdmin, isSupervisor, isUnitHead, visibleData, permintaanMasuk, pengajuanSaya };
  }, [role, tukarShiftItems, currentUserId]);
  
  const { isAdmin, isSupervisor, isUnitHead, visibleData, permintaanMasuk, pengajuanSaya } = roleBasedData;

  // Enhanced filter options
  const filterOptions = [
    { label: "Semua Status", value: "" },
    { label: "Menunggu Konfirmasi", value: STATUS.PENDING },
    { label: "Menunggu Supervisor", value: STATUS.APPROVED_BY_TARGET },
    { label: "Menunggu Kepala Unit", value: STATUS.WAITING_UNIT_HEAD },
    { label: "Disetujui", value: STATUS.APPROVED },
    { label: "Ditolak Pegawai", value: STATUS.REJECTED_BY_TARGET },
    { label: "Ditolak Kepala Unit", value: STATUS.REJECTED_BY_UNIT_HEAD },
    { label: "Ditolak Supervisor", value: STATUS.REJECTED_BY_SUPERVISOR },
  ];

  // Sort options
  const sortOptions = [
    { label: "Tanggal Pengajuan", value: "createdAt" },
    { label: "Tanggal Shift", value: "tanggal" },
    { label: "Nama Pengaju", value: "namaPengaju" },
    { label: "Lokasi", value: "lokasiShift" },
  ];

  // Handle filtering
  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle sorting
  const handleSort = (value: string, direction: "asc" | "desc") => {
    setSortValue(value);
    setSortDirection(direction);
  };

  // Handle action based on role and status
  const handleAction = async (item: any, action: "approve" | "reject") => {
    try {
      // Get the token
      const token = checkAuthToken();
      if (!token) return;
      
      // Clone the data to avoid direct state mutation
      const updatedItems = [...tukarShiftItems];
      const itemIndex = updatedItems.findIndex(i => i.id === item.id);
      
      if (itemIndex === -1) {
        console.error(`Item with ID ${item.id} not found in state`);
        alert("Data tidak ditemukan. Silakan refresh halaman.");
        return;
      }
      
      // Determine new status based on role and action
      let newStatus = item.status;
      
      // Current user is the target employee
      if (item.targetUser.id === currentUserId) {
        newStatus = action === "approve" 
          ? STATUS.APPROVED_BY_TARGET 
          : STATUS.REJECTED_BY_TARGET;
      }        // Current user is a unit head and the request is waiting for unit head approval
      else if (role === "unit_head" && item.status === STATUS.APPROVED_BY_TARGET) {
        // Check if the shift is in a critical unit
        const isInCriticalUnit = isCriticalUnit(item.lokasiShift);
          
        if (isInCriticalUnit) {
          newStatus = action === "approve" 
            ? STATUS.WAITING_UNIT_HEAD  // First set to waiting for unit head
            : STATUS.REJECTED_BY_UNIT_HEAD;
        } else {
          // For non-critical units, skip unit head approval
          newStatus = action === "approve" 
            ? STATUS.APPROVED 
            : STATUS.REJECTED_BY_SUPERVISOR;
        }
      }
      // Current user is a unit head and the request is waiting for unit head approval
      else if (role === "unit_head" && item.status === STATUS.WAITING_UNIT_HEAD) {
        newStatus = action === "approve" 
          ? STATUS.APPROVED 
          : STATUS.REJECTED_BY_UNIT_HEAD;
      }
      // Current user is a supervisor and the request is waiting for supervisor approval
      else if (isSupervisor && item.status === STATUS.APPROVED_BY_TARGET) {
        // Check if the shift is in a critical unit
        const isInCriticalUnit = isCriticalUnit(item.lokasiShift);
          
        if (isInCriticalUnit) {
          newStatus = action === "approve" 
            ? STATUS.WAITING_UNIT_HEAD  // For critical units, route to unit head
            : STATUS.REJECTED_BY_SUPERVISOR;
        } else {
          newStatus = action === "approve" 
            ? STATUS.APPROVED 
            : STATUS.REJECTED_BY_SUPERVISOR;
        }
      }
      // Current user is a supervisor and the request has unit head approval
      else if (isSupervisor && item.status === STATUS.WAITING_UNIT_HEAD) {
        newStatus = action === "approve" 
          ? STATUS.APPROVED 
          : STATUS.REJECTED_BY_SUPERVISOR;
      }
      
      // Get API base URL from environment or use default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      
      // Map frontend status back to API status
      const apiStatus = (() => {
        switch (newStatus) {
          case STATUS.PENDING: return 'PENDING';
          case STATUS.APPROVED_BY_TARGET: return 'APPROVED_BY_TARGET';
          case STATUS.REJECTED_BY_TARGET: return 'REJECTED_BY_TARGET';
          case STATUS.WAITING_UNIT_HEAD: return 'WAITING_UNIT_HEAD';
          case STATUS.REJECTED_BY_UNIT_HEAD: return 'REJECTED_BY_UNIT_HEAD';
          case STATUS.APPROVED: return 'APPROVED';
          case STATUS.REJECTED_BY_SUPERVISOR: return 'REJECTED_BY_SUPERVISOR';
          default: return 'PENDING';
        }
      })();
      
      console.log(`Updating tukar shift request ${item.id} to status: ${apiStatus}`);
      
      try {
        // Send update to API
        const response = await fetch(`${apiUrl}/shift-swap-requests/${item.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: apiStatus })
        });
        
        // Check for unauthorized (expired token)
        if (response.status === 401) {
          alert("Sesi Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token"); // Clear invalid token
          // Redirect to login page
          window.location.href = "/login";
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `Status kode: ${response.status}`;
          throw new Error(`Gagal memperbarui status: ${errorMessage}`);
        }
        
        // Try to get response data
        let responseData = {};
        try {
          responseData = await response.json();
          console.log('API response data:', responseData);
        } catch (jsonError) {
          console.warn('Could not parse response as JSON:', jsonError);
        }
        
        // Update local state after successful API call
        updatedItems[itemIndex].status = newStatus;
        setTukarShiftItems(updatedItems);
        
        // Show success message
        alert('Status permintaan tukar shift berhasil diperbarui');
        
        // Refresh the data from API
        fetchTukarShiftData();
      } catch (apiError) {
        console.error("Error updating status via API:", apiError);
        
        // Update local state even if API fails to keep UI responsive
        updatedItems[itemIndex].status = newStatus;
        setTukarShiftItems(updatedItems);
        
        // Notify user about partial success
        alert('Status diperbarui di tampilan, tetapi gagal menyimpan ke server. Silakan refresh halaman untuk sinkronisasi data terbaru.');
      }
    } catch (error) {
      console.error("Error updating tukar shift status:", error);
      alert("Gagal memperbarui status. Silakan coba lagi.");
    }
  };

  // Handle form submission success
  const handleCreated = (newData: any) => {
    // Add the new request to the list
    setTukarShiftItems(prev => [newData, ...prev]);
    // Refresh data from server
    fetchTukarShiftData();
  };

  // Handle form update success
  const handleUpdated = (updatedData: any) => {
    // Update the existing request
    setTukarShiftItems(prev => 
      prev.map(item => item.id === updatedData.id ? updatedData : item)
    );
    // Refresh data from server
    fetchTukarShiftData();
  };

  // Handle delete success
  const handleDeleted = async (deletedId: string) => {
    try {
      const token = checkAuthToken();
      if (!token) return;
      
      // Verify item exists before attempting to delete
      const itemToDelete = tukarShiftItems.find(item => item.id.toString() === deletedId);
      if (!itemToDelete) {
        console.error(`Item with ID ${deletedId} not found in state`);
        alert("Data tidak ditemukan. Silakan refresh halaman.");
        return;
      }
      
      // Get API base URL from environment or use default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      
      try {
        // Delete from API
        const response = await fetch(`${apiUrl}/shift-swap-requests/${deletedId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Check for unauthorized (expired token)
        if (response.status === 401) {
          alert("Sesi Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token"); // Clear invalid token
          // Redirect to login page
          window.location.href = "/login";
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `Status kode: ${response.status}`;
          throw new Error(`Gagal menghapus: ${errorMessage}`);
        }
        
        // Remove from state
        setTukarShiftItems(prev => 
          prev.filter(item => item.id.toString() !== deletedId)
        );
        
        // Show success message
        alert('Permintaan tukar shift berhasil dihapus');
        
        // Refresh data from server
        fetchTukarShiftData();
      } catch (apiError) {
        console.error("Error deleting via API:", apiError);
        
        // Check if it's a 404 error (item not found)
        if (apiError instanceof Error && apiError.message.includes('404')) {
          console.log('Item not found in API, removing from local state only');
          // Remove from local state if it doesn't exist on server
          setTukarShiftItems(prev => 
            prev.filter(item => item.id.toString() !== deletedId)
          );
          alert('Permintaan dihapus dari tampilan. Item mungkin sudah dihapus sebelumnya di server.');
          return;
        }
        
        // For other errors, remove from local state even if API fails
        setTukarShiftItems(prev => 
          prev.filter(item => item.id.toString() !== deletedId)
        );
        
        // Notify user
        alert('Permintaan dihapus dari tampilan, tetapi gagal menghapus di server. Silakan refresh halaman untuk sinkronisasi data terbaru.');
      }
    } catch (error) {
      console.error("Error deleting tukar shift request:", error);
      alert("Gagal menghapus permintaan tukar shift. Silakan coba lagi.");
    }
  };

  // Filter and sort data for display
  const dataToShow = useMemo(() => {
    // Base data selection based on role and active tab
    const baseData = isAdmin || isSupervisor 
      ? visibleData 
      : activeTab === "masuk" ? permintaanMasuk : pengajuanSaya;
    
    let filtered = [...baseData];
    
    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(item => 
        item.pengaju.nama.toLowerCase().includes(searchLower) ||
        item.targetUser.nama.toLowerCase().includes(searchLower) ||
        item.lokasiShift.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (filterValue) {
      filtered = filtered.filter(item => item.status === filterValue);
    }
    
    // Apply sorting
    if (sortValue) {
      filtered.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortValue) {
          case "createdAt":
            valueA = new Date(a.createdAt).getTime();
            valueB = new Date(b.createdAt).getTime();
            break;
          case "tanggal":
            valueA = a.tanggal;
            valueB = b.tanggal;
            break;
          case "namaPengaju":
            valueA = a.pengaju.nama;
            valueB = b.pengaju.nama;
            break;
          case "lokasiShift":
            valueA = a.lokasiShift;
            valueB = b.lokasiShift;
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
  }, [
    isAdmin, isSupervisor, visibleData, permintaanMasuk, 
    pengajuanSaya, activeTab, searchValue, filterValue, 
    sortValue, sortDirection
  ]);

  // Get display name for status
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case STATUS.PENDING:
        return "Menunggu Konfirmasi";
      case STATUS.REJECTED_BY_TARGET:
        return "Ditolak Pegawai";
      case STATUS.APPROVED_BY_TARGET:
        return "Menunggu Supervisor";
      case STATUS.WAITING_UNIT_HEAD:
        return "Menunggu Kepala Unit";
      case STATUS.REJECTED_BY_UNIT_HEAD:
        return "Ditolak Kepala Unit";
      case STATUS.REJECTED_BY_SUPERVISOR:
        return "Ditolak Supervisor";
      case STATUS.APPROVED:
        return "Disetujui";
      default:
        return status;
    }
  };

  // Render table rows with enhanced styling and action buttons
  const renderRow = (item: any) => {
    // Determine if current user can take action on this item
    const canApprove = 
      // Target user can approve a pending request
      (item.targetUser.id === currentUserId && item.status === STATUS.PENDING) ||
      // Supervisor can approve a request that's been approved by target
      (isSupervisor && (item.status === STATUS.APPROVED_BY_TARGET || item.status === STATUS.WAITING_UNIT_HEAD)) ||
      // Unit head can approve a request that's been waiting for unit head approval
      (isUnitHead && item.status === STATUS.WAITING_UNIT_HEAD);
    
    // Get the appropriate CSS class for the status badge
    const statusClass = statusColors[item.status] || "bg-gray-100 text-gray-800";

    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 transition-colors">
        <td className="py-3 px-4">{item.pengaju.nama}</td>
        <td className="py-3 px-4">{item.targetUser.nama}</td>
        <td className="py-3 px-4 hidden md:table-cell">{item.tanggal}</td>
        <td className="py-3 px-4 hidden md:table-cell">{item.lokasiShift}</td>
        <td className="py-3 px-4 hidden md:table-cell">{`${item.jamMulai}-${item.jamSelesai}`}</td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
            {getStatusDisplay(item.status)}
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {/* View details button - always visible */}
            <button 
              onClick={() => {}}
              className="p-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              title="Lihat Detail"
            >
              <Image src="/view.png" alt="View" width={16} height={16} />
            </button>
            
            {/* Action buttons based on status and user role */}
            {canApprove && (
              <>
                <button
                  onClick={() => handleAction(item, "approve")}
                  className="p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                  title="Setujui"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => handleAction(item, "reject")}
                  className="p-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                  title="Tolak"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Edit button - only visible to the request creator if status is PENDING */}
            {item.pengaju.id === currentUserId && item.status === STATUS.PENDING && (
              <FormModal 
                table="tukarshift" 
                type="update" 
                data={item} 
                onCreated={handleCreated}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            )}
            
            {/* Delete button - only visible to the request creator if status is PENDING or REJECTED */}
            {item.pengaju.id === currentUserId && 
             (item.status === STATUS.PENDING || 
              item.status === STATUS.REJECTED_BY_TARGET || 
              item.status === STATUS.REJECTED_BY_SUPERVISOR) && (
              <FormModal 
                table="tukarshift" 
                type="delete" 
                id={item.id.toString()} 
                nameLabel={`tukar shift dengan ${item.targetUser.nama}`}
                onCreated={handleCreated}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">Permintaan Tukar Shift</h1>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <TableSearch 
            placeholder="Cari permintaan..."
            value={searchValue}
            onChange={setSearchValue}
          />
          <div className="flex items-center gap-2 self-end">
            <FilterButton 
              options={filterOptions}
              onFilter={handleFilter}
            />
            <SortButton 
              options={sortOptions}
              onSort={handleSort}
            />
            
            {/* Show Add button for regular staff, not for supervisors/admins */}
            {!isAdmin && !isSupervisor && (
              <FormModal 
                table="tukarshift" 
                type="create"
                onCreated={handleCreated}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            )}
          </div>
        </div>
      </div>

      {/* Flow diagram as a helpful guide */}
      <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm">
        <div className="flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium text-blue-800 mb-1">Alur Tukar Shift:</p>
            <ol className="list-decimal list-inside text-blue-700 ml-1 space-y-1">
              <li>Pegawai mengajukan permintaan tukar shift dengan pegawai lain yang memiliki peran yang sama</li>
              <li>Pegawai target menyetujui/menolak permintaan</li>
              <li>Jika disetujui, supervisor memberikan persetujuan</li>
              <li>Untuk unit kritikal (ICU/NICU/IGD), persetujuan tambahan dari kepala unit diperlukan</li>
              <li>Jika semua disetujui, sistem memperbarui jadwal shift</li>
            </ol>
            <p className="text-blue-700 italic mt-2 text-xs">Catatan: Tukar shift hanya dapat dilakukan dengan pegawai yang memiliki peran yang sama (misalnya, dokter dengan dokter, perawat dengan perawat).</p>
          </div>
        </div>
      </div>

      {/* Tab navigation - only for regular staff */}
      {!isAdmin && !isSupervisor && (
        <div className="flex gap-4 my-4">
          <button
            onClick={() => setActiveTab("masuk")}
            className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === "masuk" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            Permintaan Masuk
          </button>
          <button
            onClick={() => setActiveTab("pengajuan")}
            className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === "pengajuan" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            Pengajuan Saya
          </button>
        </div>
      )}

      {/* Special supervisor header */}
      {isSupervisor && (
        <div className="mb-4 p-3 bg-purple-50 rounded-md border border-purple-100">
          <h2 className="text-purple-800 font-medium">Mode Supervisor</h2>
          <p className="text-sm text-purple-700">Anda dapat menyetujui atau menolak permintaan tukar shift yang telah disetujui oleh pegawai.</p>
        </div>
      )}

      {/* Special unit head header */}
      {isUnitHead && (
        <div className="mb-4 p-3 bg-teal-50 rounded-md border border-teal-100">
          <h2 className="text-teal-800 font-medium">Mode Kepala Unit</h2>
          <p className="text-sm text-teal-700">Anda dapat menyetujui atau menolak permintaan tukar shift untuk unit kritikal (ICU/NICU/IGD) yang memerlukan persetujuan tambahan.</p>
        </div>
      )}

      {/* Render empty state when no data */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-500">Sedang memuat data tukar shift...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Terjadi kesalahan</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => fetchTukarShiftData()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Coba Lagi
          </button>
        </div>
      ) : dataToShow.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Image src="/calendar.png" alt="Calendar" width={32} height={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak ada permintaan tukar shift</h3>
          <p className="text-gray-500 mb-4">
            {!isAdmin && !isSupervisor && activeTab === "masuk" 
              ? "Belum ada permintaan tukar shift yang masuk."
              : !isAdmin && !isSupervisor && activeTab === "pengajuan"
              ? "Anda belum mengajukan permintaan tukar shift."
              : "Belum ada permintaan tukar shift yang perlu ditinjau."}
          </p>
          
          {!isAdmin && !isSupervisor && (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Ajukan Tukar Shift
            </button>
          )}
        </div>
      ) : (
        <>
          <Table 
            columns={columns} 
            renderRow={renderRow} 
            data={dataToShow.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )} 
          />
          <Pagination 
            totalItems={dataToShow.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      
      {/* Modal for quick creation without clicking the icon */}
      <FormModal
        table="tukarshift"
        type="create"
        renderTrigger={false}
        initialOpen={open}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
        onAfterClose={() => setOpen(false)}
      />
    </div>
  );
};

export default TukarShiftPage;
