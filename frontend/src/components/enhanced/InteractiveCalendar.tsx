'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  Download,
  RotateCcw
} from 'lucide-react';

interface ShiftData {
  id: number;
  nama: string;
  idpegawai: string;
  tanggal: string;
  jammulai: string;
  jamselesai: string;
  lokasishift: string;
  tipeshift?: string;
  status?: string;
  userId?: number;
}

interface InteractiveCalendarProps {
  shifts: ShiftData[];
  onShiftMove?: (shiftId: number, newDate: string) => void;
  onShiftClick?: (shift: ShiftData) => void;
  onDateClick?: (date: string) => void;
  onAddShift?: (date: string) => void;
  readonly?: boolean;
}

const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  shifts,
  onShiftMove,
  onShiftClick,
  onDateClick,
  onAddShift,
  readonly = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedShift, setDraggedShift] = useState<ShiftData | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filterShiftType, setFilterShiftType] = useState<string>('');

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and how many days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Create calendar grid
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date: day,
        dateString,
        isToday: dateString === todayString,
        isPast: new Date(dateString) < new Date(todayString),
        isWeekend: [0, 6].includes(new Date(dateString).getDay())
      });
    }

    return days;
  }, [currentDate, todayString]);

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    const grouped: Record<string, ShiftData[]> = {};
    
    shifts.forEach(shift => {
      const date = shift.tanggal.split('T')[0]; // Handle ISO dates
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      // Apply filter
      if (!filterShiftType || shift.tipeshift === filterShiftType) {
        grouped[date].push(shift);
      }
    });
    
    return grouped;
  }, [shifts, filterShiftType]);

  // Navigation functions
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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, shift: ShiftData) => {
    if (readonly) return;
    
    setDraggedShift(shift);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedShift(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateString: string) => {
    if (readonly || !draggedShift) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(dateString);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, dateString: string) => {
    if (readonly || !draggedShift) return;
    
    e.preventDefault();
    
    if (draggedShift.tanggal.split('T')[0] !== dateString) {
      onShiftMove?.(draggedShift.id, dateString);
    }
    
    setDraggedShift(null);
    setDragOverDate(null);
  };

  // Get shift color based on type
  const getShiftColor = (shiftType: string, isSmall = false) => {
    const colors = {
      'PAGI': {
        bg: 'bg-gradient-to-r from-yellow-200 to-yellow-300',
        text: 'text-yellow-900',
        border: 'border-yellow-400',
        shadow: 'shadow-yellow-200'
      },
      'SIANG': {
        bg: 'bg-gradient-to-r from-orange-200 to-orange-300',
        text: 'text-orange-900',
        border: 'border-orange-400',
        shadow: 'shadow-orange-200'
      },
      'MALAM': {
        bg: 'bg-gradient-to-r from-blue-200 to-blue-400',
        text: 'text-blue-900',
        border: 'border-blue-500',
        shadow: 'shadow-blue-200'
      }
    };

    const color = colors[shiftType as keyof typeof colors] || {
      bg: 'bg-gradient-to-r from-gray-200 to-gray-300',
      text: 'text-gray-900',
      border: 'border-gray-400',
      shadow: 'shadow-gray-200'
    };

    return `${color.bg} ${color.text} ${color.border} ${color.shadow}`;
  };

  // Render shift card
  const renderShiftCard = (shift: ShiftData, isSmall = false) => {
    const cardSize = isSmall ? 'text-xs px-1 py-0.5' : 'text-sm px-2 py-1';
    const isDragging = draggedShift?.id === shift.id;
    
    return (
      <div
        key={shift.id}
        draggable={!readonly}
        onDragStart={(e) => handleDragStart(e, shift)}
        onDragEnd={handleDragEnd}
        onClick={() => onShiftClick?.(shift)}
        className={`
          ${cardSize} mb-1 rounded-md border cursor-pointer
          transform transition-all duration-200 hover:scale-105 hover:shadow-md
          ${getShiftColor(shift.tipeshift || 'DEFAULT', isSmall)}
          ${isDragging ? 'opacity-50 rotate-3' : 'opacity-100'}
          ${readonly ? 'cursor-default' : 'cursor-move hover:shadow-lg'}
        `}
        title={`${shift.nama} - ${shift.jammulai} to ${shift.jamselesai} di ${shift.lokasishift}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{shift.nama}</div>
            {!isSmall && (
              <div className="flex items-center gap-1 mt-0.5 text-xs opacity-80">
                <Clock className="w-3 h-3" />
                <span>{shift.jammulai?.substring(0, 5)}</span>
                <MapPin className="w-3 h-3 ml-1" />
                <span className="truncate">{shift.lokasishift.split('_')[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Unique shift types for filter
  const shiftTypes = useMemo(() => {
    const types = [...new Set(shifts.map(s => s.tipeshift).filter(Boolean))];
    return types.sort();
  }, [shifts]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Calendar Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
                {currentDate.toLocaleDateString('id-ID', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Hari Ini
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Shift Type Filter */}
            <select
              value={filterShiftType}
              onChange={(e) => setFilterShiftType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Shift</option>
              {shiftTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Legend */}
            <div className="hidden lg:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded border border-yellow-400"></div>
                <span>Pagi</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-200 to-orange-300 rounded border border-orange-400"></div>
                <span>Siang</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-200 to-blue-400 rounded border border-blue-500"></div>
                <span>Malam</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, index) => (
            <div 
              key={day} 
              className={`text-center text-sm font-medium py-2 ${
                index === 0 || index === 6 ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((day, index) => {
            if (!day) {
              return <div key={index} className="aspect-square"></div>;
            }

            const dayShifts = shiftsByDate[day.dateString] || [];
            const isSelected = selectedDate === day.dateString;
            const isDragOver = dragOverDate === day.dateString;

            return (
              <div
                key={day.dateString}
                className={`
                  aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all duration-200
                  ${day.isPast ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}
                  ${day.isToday ? 'ring-2 ring-blue-500 border-blue-300 shadow-md' : ''}
                  ${day.isWeekend ? 'bg-red-50' : ''}
                  ${isSelected ? 'ring-2 ring-purple-500 border-purple-300' : ''}
                  ${isDragOver ? 'ring-2 ring-green-500 border-green-300 bg-green-50' : ''}
                  hover:shadow-md hover:border-blue-300
                `}
                onClick={() => {
                  setSelectedDate(day.dateString);
                  onDateClick?.(day.dateString);
                }}
                onDragOver={(e) => handleDragOver(e, day.dateString)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day.dateString)}
              >
                {/* Date Number */}
                <div className={`
                  text-sm font-medium mb-1 flex items-center justify-between
                  ${day.isToday ? 'text-blue-600' : day.isPast ? 'text-gray-400' : 'text-gray-900'}
                `}>
                  <span>{day.date}</span>
                  {dayShifts.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                      {dayShifts.length}
                    </span>
                  )}
                </div>

                {/* Shifts */}
                <div className="space-y-1 overflow-hidden">
                  {dayShifts.slice(0, 3).map(shift => renderShiftCard(shift, true))}
                  {dayShifts.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayShifts.length - 3} lainnya
                    </div>
                  )}
                </div>

                {/* Add Button */}
                {!day.isPast && !readonly && (
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddShift?.(day.dateString);
                      }}
                      className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                      title="Tambah shift"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-sm text-gray-600">
            Total {shifts.length} shift, {Object.keys(shiftsByDate).length} hari aktif
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {!readonly && draggedShift && (
              <div className="flex items-center gap-1 text-blue-600">
                <RotateCcw className="w-3 h-3" />
                <span>Drag & drop untuk memindah shift</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Hari ini</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCalendar;
