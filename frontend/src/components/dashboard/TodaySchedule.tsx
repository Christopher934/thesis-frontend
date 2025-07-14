'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

// Helper function to format time
const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // If already in HH:MM format, return as is
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // If in HH:MM:SS format, extract HH:MM
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
    return timeString.substring(0, 5);
  }
  
  // Handle DateTime format from Prisma or ISO string
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      // If can't parse as date, might be just time string
      return timeString;
    }
    
    // Convert to Indonesian timezone and get time
    const indonesianTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return indonesianTime.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

interface TodayScheduleItem {
  id: string;
  time: string;
  location: string;
  type: string;
  status: 'upcoming' | 'current' | 'completed';
  duration?: string;
}

interface ShiftData {
  id: number;
  tanggal: string;
  jammulai: string;
  jamselesai: string;
  lokasishift: string;
  tipeshift: string;
  nama?: string;
  userId?: number;
  idpegawai?: string;
}

interface TodayScheduleProps {
  userRole?: string;
  userId?: string;
}

const TodaySchedule: React.FC<TodayScheduleProps> = ({ userRole, userId }) => {
  const [schedule, setSchedule] = useState<TodayScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch today's shifts
  const fetchTodaySchedule = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/shifts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }

      const allShifts: ShiftData[] = await response.json();
      
      // Debug: Log the structure of received data
      console.log('TodaySchedule: Received shifts:', allShifts);
      if (allShifts.length > 0) {
        console.log('TodaySchedule: First shift sample:', allShifts[0]);
        console.log('TodaySchedule: First shift time data:', {
          jammulai: allShifts[0].jammulai,
          jamselesai: allShifts[0].jamselesai,
          tanggal: allShifts[0].tanggal
        });
      }
      
      // Get today's date in YYYY-MM-DD format - adjusted for Indonesian timezone
      const today = new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).toISOString().split('T')[0];
      
      console.log('TodaySchedule: Today date:', today);
      
      // Get current user's ID from localStorage if not provided
      const currentUserId = userId || localStorage.getItem('userId');
      const currentUserRole = userRole || localStorage.getItem('role');
      
      // Filter shifts for today
      let todayShifts = allShifts.filter(shift => {
        const shiftDate = shift.tanggal.split('T')[0]; // Handle both date formats
        return shiftDate === today;
      });

      // If not admin, filter by user
      if (currentUserRole?.toLowerCase() !== 'admin' && currentUserId) {
        todayShifts = todayShifts.filter(shift => 
          shift.userId?.toString() === currentUserId ||
          shift.idpegawai === localStorage.getItem('username')
        );
      }

      // Convert to TodayScheduleItem format
      const formattedSchedule: TodayScheduleItem[] = todayShifts.map(shift => {
        // Parse time properly from backend format
        const parseShiftTime = (timeString: string, baseDate: string): Date => {
          if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
            // If it's a simple time format like "08:00" or "08:00:00"
            return new Date(`${baseDate}T${timeString.split(':').slice(0, 2).join(':')}`);
          } else {
            // If it's a full DateTime, extract just the time part
            const time = new Date(timeString);
            const hours = time.getUTCHours().toString().padStart(2, '0');
            const minutes = time.getUTCMinutes().toString().padStart(2, '0');
            return new Date(`${baseDate}T${hours}:${minutes}`);
          }
        };
        
        const startTime = parseShiftTime(shift.jammulai, today);
        const endTime = parseShiftTime(shift.jamselesai, today);
        // Use Indonesian timezone (GMT+7)
        const now = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
        
        // Determine status based on current time
        let status: 'upcoming' | 'current' | 'completed';
        if (now < startTime) {
          status = 'upcoming';
        } else if (now >= startTime && now <= endTime) {
          status = 'current';
        } else {
          status = 'completed';
        }

        // Calculate duration
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = Math.round(durationMs / (1000 * 60 * 60));

        // Format location
        const formatLocation = (location: string) => {
          if (!location) return '-';
          
          // Handle specific unit mappings first
          const unitMappings: { [key: string]: string } = {
            'RAWAT_INAP_3_SHIFT': 'Rawat Inap',
            'RAWAT_INAP': 'Rawat Inap',
            'RAWAT_JALAN': 'Rawat Jalan',
            'UGD': 'UGD',
            'ICU': 'ICU',
            'EMERGENCY': 'Emergency',
            'KAMAR_OPERASI': 'Kamar Operasi',
            'LABORATORIUM': 'Laboratorium',
            'RADIOLOGI': 'Radiologi',
            'FARMASI': 'Farmasi',
            'GIZI': 'Gizi',
            'FISIOTERAPI': 'Fisioterapi',
            'HEMODIALISA': 'Hemodialisa',
            'NICU': 'NICU',
            'PICU': 'PICU'
          };
          
          // Check if we have a direct mapping
          const upperLocation = location.toUpperCase();
          if (unitMappings[upperLocation]) {
            return unitMappings[upperLocation];
          }
          
          // For other cases, process the string
          let formatted = location
            .split('_')
            .map(word => {
              // Skip numbers and "SHIFT" word
              if (/^\d+$/.test(word) || word.toUpperCase() === 'SHIFT') {
                return null;
              }
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .filter(word => word !== null)
            .join(' ');
          
          // Clean up any remaining shift references
          formatted = formatted.replace(/\s*\d+\s*(Shift|shift)/gi, '');
          
          // Clean up any trailing spaces and multiple spaces
          return formatted.replace(/\s+/g, ' ').trim();
        };

        return {
          id: shift.id.toString(),
          time: formatTime(shift.jammulai),
          location: formatLocation(shift.lokasishift),
          type: `Shift ${shift.tipeshift}`,
          status,
          duration: `${durationHours} jam`
        };
      });

      setSchedule(formattedSchedule);
    } catch (err: any) {
      console.error('Error fetching today schedule:', err);
      setError(err.message);
      // Fallback to mock data in case of error
      const fallbackData: TodayScheduleItem[] = [
        {
          id: '1',
          time: '06:00',
          location: 'IGD',
          type: 'Shift Pagi',
          status: 'completed',
          duration: '8 jam'
        },
        {
          id: '2',
          time: '14:00',
          location: 'ICU',
          type: 'Shift Siang',
          status: 'current',
          duration: '8 jam'
        },
        {
          id: '3',
          time: '18:00',
          location: 'Ruang Meeting',
          type: 'Briefing Tim',
          status: 'upcoming',
          duration: '1 jam'
        },
        {
          id: '4',
          time: '22:00',
          location: 'Rawat Inap',
          type: 'Shift Malam',
          status: 'upcoming',
          duration: '8 jam'
        }
      ];
      setSchedule(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    fetchTodaySchedule();
    
    // Refresh every 5 minutes to update status
    const interval = setInterval(fetchTodaySchedule, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userId, userRole, fetchTodaySchedule]);

  const getStatusColor = (status: TodayScheduleItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'current':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'upcoming':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: TodayScheduleItem['status']) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'current':
        return 'Sedang Berlangsung';
      case 'upcoming':
        return 'Akan Datang';
      default:
        return 'Tidak Diketahui';
    }
  };

  const getCurrentTime = () => {
    // Use Indonesian timezone (GMT+7)
    const now = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
    return now.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getCurrentDate = () => {
    // Use Indonesian timezone (GMT+7)
    const now = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
    return now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Jadwal Hari Ini</h2>
          <p className="text-sm text-gray-500 mt-1">{getCurrentDate()}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-hospitalBlue">{getCurrentTime()}</div>
          <p className="text-xs text-gray-500">Waktu Sekarang</p>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500 text-sm">Memuat jadwal hari ini...</p>
          </div>
        ) : error && schedule.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-red-500 text-sm mb-2">Gagal memuat jadwal</p>
            <p className="text-gray-400 text-xs">{error}</p>
            <button 
              onClick={fetchTodaySchedule}
              className="text-hospitalBlue text-sm mt-2 hover:text-hospitalBlue/80"
            >
              Coba Lagi
            </button>
          </div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Tidak ada jadwal hari ini</p>
            <a 
              href="/dashboard/list/jadwalsaya" 
              className="text-hospitalBlue text-sm mt-2 hover:text-hospitalBlue/80 inline-block"
            >
              Lihat Semua Jadwal
            </a>
          </div>
        ) : (
          schedule.map((item, index) => (
            <div 
              key={item.id} 
              className={`
                flex items-center gap-4 p-4 rounded-lg border transition-all duration-200
                ${getStatusColor(item.status)}
                ${item.status === 'current' ? 'ring-2 ring-blue-200' : ''}
              `}
            >
              <div className="flex-shrink-0">
                <div className="flex flex-col items-center">
                  <Clock className="w-5 h-5 mb-1" />
                  <span className="text-sm font-bold">{formatTime(item.time)}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{item.type}</h3>
                  <span className={`
                    text-xs px-2 py-1 rounded-full border
                    ${getStatusColor(item.status)}
                  `}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{item.location}</span>
                  </div>
                  {item.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {item.status === 'current' && (
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {schedule.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Total: {schedule.length} aktivitas
              </span>
            </div>
            <a 
              href="/dashboard/list/jadwalsaya" 
              className="text-hospitalBlue hover:text-hospitalBlue/80"
            >
              Lihat Semua Jadwal
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaySchedule;
