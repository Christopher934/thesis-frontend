'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, Eye, Users, Clock, MapPin } from 'lucide-react';
import WorkloadCounterWidget from '@/components/WorkloadCounterWidget';
import DayShiftModal from '@/components/DayShiftModal';

interface Shift {
  id: number;
  idpegawai?: string;
  nama: string;
  tanggal: string;
  lokasishift: string;
  jammulai: string;
  jamselesai: string;
  tipeshift: string;
  userId?: number;
  user?: any;
  originalDate?: string;
}

interface MonthlyViewProps {
  shifts: Shift[];
  onShiftClick?: (shift: Shift) => void;
  showWorkloadCounters?: boolean;
}

const MonthlyScheduleView: React.FC<MonthlyViewProps> = ({ 
  shifts, 
  onShiftClick,
  showWorkloadCounters = true
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedShiftType, setSelectedShiftType] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get unique employees, locations, and shift types
  const employees = [...new Set(shifts.filter(s => s.nama).map(s => s.nama))].sort();
  const locations = [...new Set(shifts.filter(s => s.lokasishift).map(s => s.lokasishift))].sort();
  const shiftTypes = [...new Set(shifts.filter(s => s.tipeshift).map(s => s.tipeshift))].filter(Boolean).sort();

  // Filter shifts based on current month and filters
  const filteredShifts = shifts.filter(shift => {
    // Parse tanggal with better handling
    let shiftDate;
    try {
      // Handle different date formats
      if (shift.tanggal.includes('/')) {
        // Format DD/MM/YYYY or MM/DD/YYYY
        const parts = shift.tanggal.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format for Indonesian locale
          const [day, month, year] = parts;
          shiftDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          shiftDate = new Date(shift.tanggal);
        }
      } else {
        // ISO format or other standard format
        shiftDate = new Date(shift.tanggal);
      }
      
      // Validate date
      if (isNaN(shiftDate.getTime())) {
        console.warn('Invalid date:', shift.tanggal);
        return false;
      }
    } catch (error) {
      console.warn('Error parsing date:', shift.tanggal, error);
      return false;
    }
    
    const monthMatch = shiftDate.getMonth() === currentDate.getMonth() && 
                      shiftDate.getFullYear() === currentDate.getFullYear();
    
    const employeeMatch = !selectedEmployee || shift.nama === selectedEmployee;
    const locationMatch = !selectedLocation || shift.lokasishift === selectedLocation;
    const shiftTypeMatch = !selectedShiftType || shift.tipeshift === selectedShiftType;
    
    return monthMatch && employeeMatch && locationMatch && shiftTypeMatch;
  });

  // Get calendar days for the current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredShifts.filter(shift => {
      let shiftDate;
      try {
        // Handle different date formats
        if (shift.tanggal.includes('/')) {
          const parts = shift.tanggal.split('/');
          if (parts.length === 3) {
            // Assume DD/MM/YYYY format
            const [day, month, year] = parts;
            shiftDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            shiftDate = new Date(shift.tanggal);
          }
        } else {
          shiftDate = new Date(shift.tanggal);
        }
        
        if (isNaN(shiftDate.getTime())) {
          return false;
        }
        
        return shiftDate.toISOString().split('T')[0] === dateStr;
      } catch (error) {
        console.warn('Error parsing shift date:', shift.tanggal, error);
        return false;
      }
    });
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Handle date click to show modal
  const handleDateClick = (date: Date) => {
    const shiftsForDate = getShiftsForDate(date);
    if (shiftsForDate.length > 0) {
      setSelectedDate(date);
      setShowDayModal(true);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = filteredShifts.map(shift => ({
      Tanggal: shift.tanggal,
      Nama: shift.nama,
      'ID Pegawai': shift.idpegawai,
      Lokasi: shift.lokasishift,
      'Jam Mulai': shift.jammulai,
      'Jam Selesai': shift.jamselesai,
      'Tipe Shift': shift.tipeshift
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `jadwal-${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const calendarDays = getCalendarDays();

  const getShiftTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pagi': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'siang': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'malam': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Jadwal Bulanan - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-1" />
              {viewMode === 'calendar' ? 'Kalender' : 'Daftar'}
            </button>
          </div>
          
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="h-4 w-4 inline mr-1" />
            Pegawai
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Pegawai</option>
            {employees.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="h-4 w-4 inline mr-1" />
            Lokasi
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Lokasi</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="h-4 w-4 inline mr-1" />
            Tipe Shift
          </label>
          <select
            value={selectedShiftType}
            onChange={(e) => setSelectedShiftType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Tipe</option>
            {shiftTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedEmployee('');
              setSelectedLocation('');
              setSelectedShiftType('');
            }}
            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Filter className="h-4 w-4 inline mr-1" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-lg font-semibold text-blue-700">{filteredShifts.length}</div>
          <div className="text-sm text-blue-600">Total Shift</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-lg font-semibold text-green-700">
            {[...new Set(filteredShifts.map(s => s.nama))].length}
          </div>
          <div className="text-sm text-green-600">Pegawai Aktif</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-lg font-semibold text-purple-700">
            {[...new Set(filteredShifts.map(s => s.lokasishift))].length}
          </div>
          <div className="text-sm text-purple-600">Lokasi Aktif</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-lg font-semibold text-orange-700">
            {Math.round(filteredShifts.length / calendarDays.filter(d => d !== null).length * 100) / 100}
          </div>
          <div className="text-sm text-orange-600">Rata-rata/Hari</div>
        </div>
      </div>

      {/* Workload Counter */}
      {showWorkloadCounters && (
        <div className="mb-6">
          <WorkloadCounterWidget compact={true} showDetails={true} />
        </div>
      )}

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50 border">
              {day}
            </div>
          ))}
          
          {/* Calendar cells */}
          {calendarDays.map((date, index) => {
            const shiftsForDate = date ? getShiftsForDate(date) : [];
            const hasShifts = shiftsForDate.length > 0;
            
            return (
              <div 
                key={index} 
                className={`min-h-[120px] border border-gray-200 p-1 ${
                  hasShifts ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''
                }`}
                onClick={() => date && hasShifts && handleDateClick(date)}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      hasShifts ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {shiftsForDate.slice(0, 3).map((shift, shiftIndex) => (
                        <div
                          key={shiftIndex}
                          className={`text-xs p-1 rounded transition-opacity ${getShiftTypeColor(shift.tipeshift)}`}
                          title={`${shift.nama} - ${shift.lokasishift} (${shift.jammulai}-${shift.jamselesai})`}
                        >
                          <div className="font-medium truncate">{shift.nama}</div>
                          <div className="truncate">{shift.jammulai}-{shift.jamselesai}</div>
                        </div>
                      ))}
                      {shiftsForDate.length > 3 && (
                        <div className="text-xs text-blue-600 text-center font-medium">
                          +{shiftsForDate.length - 3} lainnya
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredShifts
            .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
            .map((shift, index) => (
              <div
                key={index}
                onClick={() => onShiftClick?.(shift)}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(shift.tanggal).toLocaleDateString('id-ID', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{shift.nama}</div>
                    <div className="text-sm text-gray-500">
                      {shift.idpegawai ? shift.idpegawai : 'ID tidak tersedia'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{shift.lokasishift}</div>
                    <div className="text-sm text-gray-500">{shift.jammulai} - {shift.jamselesai}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getShiftTypeColor(shift.tipeshift)}`}>
                  {shift.tipeshift}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Day Shift Modal */}
      <DayShiftModal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        date={selectedDate}
        shifts={selectedDate ? getShiftsForDate(selectedDate) : []}
        onShiftClick={onShiftClick}
      />
    </div>
  );
};

export default MonthlyScheduleView;
