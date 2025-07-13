"use client";

import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import { calendarEvents } from '@/lib/data';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/id'; // Import the locale you want to use
import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the wrapper to avoid SSR issues
const MobileCalendarWrapper = dynamic(() => import('./MobileCalendarWrapper'), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-[400px]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
  </div>
});

const localizer = momentLocalizer(moment);

// Interface for shift data from JadwalSaya
interface ShiftData {
  id: number;
  idpegawai?: string; // Optional since backend might not provide this directly
  tipeshift?: string;
  tanggal: string;
  originalDate?: string; // Original date before formatting
  lokasishift: string;
  jammulai: string;
  jamselesai: string;
  nama?: string;
  userId?: number;
  user?: {
    id: number;
    employeeId?: string;
    namaDepan?: string;
    namaBelakang?: string;
    username: string;
  };
}

// Interface for calendar event
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: any;
}

interface BigCalendarProps {
  shifts?: ShiftData[];
  useDefaultEvents?: boolean;
}

const BigCalendar = ({ shifts = [], useDefaultEvents = true }: BigCalendarProps) => {
  console.log('=== BigCalendar Component Render ===');
  console.log('BigCalendar: Received shifts prop:', shifts);
  console.log('BigCalendar: Shifts count:', shifts?.length || 0);
  console.log('BigCalendar: useDefaultEvents:', useDefaultEvents);
  
  // DEBUG: Log each individual shift
  if (shifts && shifts.length > 0) {
    shifts.forEach((shift, index) => {
      console.log(`BigCalendar: Shift ${index + 1}:`, {
        id: shift.id,
        idpegawai: shift.idpegawai,
        userInfo: shift.user,
        userUsername: shift.user?.username,
        tanggal: shift.tanggal,
        originalDate: shift.originalDate,
        lokasishift: shift.lokasishift,
        jammulai: shift.jammulai,
        jamselesai: shift.jamselesai
      });
    });
  }
  
  // Only use actual shifts data - no fallback test data
  const activeShifts = shifts;
  console.log('BigCalendar: Using real shifts data only:', activeShifts.length, 'items');
  // Mobile-responsive view state - default to month on mobile, week on desktop
  const [view, setView] = useState<View>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? Views.MONTH : Views.WEEK;
    }
    return Views.WEEK;
  });
  
  // Track window size for responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile event detail modal state
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Handle event selection for mobile
  const handleSelectEvent = useCallback((event: any) => {
    if (isMobile) {
      setSelectedEvent(event);
      setShowEventModal(true);
    }
  }, [isMobile]);
  
  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };
  
  // Handle window resize for responsive view switching
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-switch to month view on mobile for better UX
      if (mobile && (view === Views.WEEK || view === Views.DAY)) {
        setView(Views.MONTH);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);
  
  // Memoize default events to prevent unnecessary recalculations
  const defaultEvents = useMemo(() => {
    if (!useDefaultEvents) return [];
    
    return calendarEvents.map((event, index) => ({
      ...event,
      id: 10000 + index // Use high numbers to avoid conflicts with real shifts
    }));
  }, [useDefaultEvents]);
  
  // Memoize shift events to only recalculate when shifts change
  const shiftEvents = useMemo(() => {
    if (!activeShifts || activeShifts.length === 0) {
      console.log('BigCalendar: No shifts to process for calendar');
      return [];
    }
    
    console.log('BigCalendar: Processing shifts for calendar:', activeShifts.length, 'shifts');
    console.log('BigCalendar: First shift sample:', activeShifts[0]);
    
    try {
      const processedEvents = activeShifts.map((shift, index) => {
        console.log(`BigCalendar: Processing shift ${index + 1}/${activeShifts.length}:`, {
          id: shift.id,
          tanggal: shift.tanggal,
          originalDate: shift.originalDate,
          lokasishift: shift.lokasishift,
          jammulai: shift.jammulai,
          jamselesai: shift.jamselesai
        });
        
        // Parse date and time - more robust approach
        const dateStr = shift.originalDate || shift.tanggal;
        console.log(`BigCalendar: Processing date string: "${dateStr}" for shift ${shift.id}`);
        let date;
        
        try {
          // Try multiple date formats
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Handle YYYY-MM-DD format (most reliable)
            console.log(`BigCalendar: Parsing ISO date: ${dateStr}`);
            const [year, month, day] = dateStr.split('-').map(Number);
            date = new Date(year, month - 1, day);
            console.log(`BigCalendar: Created date from ISO: ${date.toISOString()}`);
          } else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            // Handle DD/MM/YYYY or D/M/YYYY format
            console.log(`BigCalendar: Parsing DD/MM/YYYY format: ${dateStr}`);
            const [day, month, year] = dateStr.split('/').map(Number);
            date = new Date(year, month - 1, day);
            console.log(`BigCalendar: Created date from DD/MM/YYYY: ${date.toISOString()}`);
          } else if (dateStr.includes(',')) {
            // Handle "Senin, 14 Juli 2025" format
            console.log(`BigCalendar: Parsing Indonesian format: ${dateStr}`);
            // For Indonesian format, let's try to extract the date part
            const parts = dateStr.split(',');
            if (parts.length > 1) {
              const datePart = parts[1].trim(); // "14 Juli 2025"
              const [day, monthName, year] = datePart.split(' ');
              
              // Map Indonesian month names to numbers
              const monthMap: { [key: string]: number } = {
                'januari': 0, 'februari': 1, 'maret': 2, 'april': 3,
                'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7,
                'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
              };
              
              const monthNum = monthMap[monthName.toLowerCase()];
              if (monthNum !== undefined) {
                date = new Date(parseInt(year), monthNum, parseInt(day));
                console.log(`BigCalendar: Created date from Indonesian format: ${date.toISOString()}`);
              } else {
                throw new Error(`Unknown month: ${monthName}`);
              }
            } else {
              throw new Error('Invalid Indonesian date format');
            }
          } else {
            // Fallback to standard Date parsing
            console.log(`BigCalendar: Using fallback parsing for: ${dateStr}`);
            date = new Date(dateStr);
            console.log(`BigCalendar: Created date from fallback: ${date.toISOString()}`);
          }
          
          // Ensure we have a valid date
          if (isNaN(date.getTime())) {
            console.error(`BigCalendar: Invalid date created from "${dateStr}"`);
            // Use today's date as fallback
            date = new Date();
            console.log(`BigCalendar: Using today as fallback: ${date.toISOString()}`);
          }
        } catch (error) {
          console.error(`BigCalendar: Date parsing exception for "${dateStr}":`, error);
          // Use today's date as fallback
          date = new Date();
          console.log(`BigCalendar: Using today as fallback after error: ${date.toISOString()}`);
        }
        
        try {
          // More robust time parsing with better validation
          let startHours = 8, startMinutes = 0; // Default to 8:00 AM
          let endHours = 16, endMinutes = 0;    // Default to 4:00 PM
          
          console.log(`BigCalendar: Parsing times - start: "${shift.jammulai}", end: "${shift.jamselesai}"`);
          
          // Parse start time
          if (shift.jammulai && typeof shift.jammulai === 'string') {
            if (shift.jammulai.includes(':')) {
              const [hours, minutes] = shift.jammulai.split(':').map(Number);
              if (!isNaN(hours) && !isNaN(minutes)) {
                startHours = Math.max(0, Math.min(23, hours));
                startMinutes = Math.max(0, Math.min(59, minutes));
                console.log(`BigCalendar: Parsed start time: ${startHours}:${startMinutes}`);
              } else {
                console.warn(`BigCalendar: Invalid start time format: "${shift.jammulai}"`);
              }
            } else {
              console.warn(`BigCalendar: Start time missing colon: "${shift.jammulai}"`);
            }
          } else {
            console.warn(`BigCalendar: Start time is missing or not string: "${shift.jammulai}"`);
          }
          
          // Parse end time
          if (shift.jamselesai && typeof shift.jamselesai === 'string') {
            if (shift.jamselesai.includes(':')) {
              const [hours, minutes] = shift.jamselesai.split(':').map(Number);
              if (!isNaN(hours) && !isNaN(minutes)) {
                endHours = Math.max(0, Math.min(23, hours));
                endMinutes = Math.max(0, Math.min(59, minutes));
                console.log(`BigCalendar: Parsed end time: ${endHours}:${endMinutes}`);
              } else {
                console.warn(`BigCalendar: Invalid end time format: "${shift.jamselesai}"`);
              }
            } else {
              console.warn(`BigCalendar: End time missing colon: "${shift.jamselesai}"`);
            }
          } else {
            console.warn(`BigCalendar: End time is missing or not string: "${shift.jamselesai}"`);
            // If no end time, make it 8 hours after start time
            endHours = (startHours + 8) % 24;
            endMinutes = startMinutes;
            console.log(`BigCalendar: Using calculated end time: ${endHours}:${endMinutes}`);
          }
          
          console.log(`BigCalendar: Final times - start: ${startHours}:${startMinutes}, end: ${endHours}:${endMinutes}`);
          
          // Create date objects
          const startDate = new Date(date);
          startDate.setHours(startHours, startMinutes, 0, 0);
          
          const endDate = new Date(date);
          endDate.setHours(endHours, endMinutes, 0, 0);
          
          // Handle overnight shifts
          if (endDate <= startDate) {
            console.log(`BigCalendar: Detected overnight shift, adding day to end date`);
            endDate.setDate(endDate.getDate() + 1);
          }
          
          console.log(`BigCalendar: Event dates - start: ${startDate.toISOString()}, end: ${endDate.toISOString()}`);
          
          // Simplified location formatting
          const formatLokasiShift = (lokasi: string) => {
            if (!lokasi) return 'Shift';
            
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
              'FARMASI': 'Farmasi'
            };
            
            const upperLokasi = lokasi.toUpperCase();
            return unitMappings[upperLokasi] || lokasi.replace(/_/g, ' ');
          };
          
          const calendarEvent = {
            id: shift.id,
            title: `${formatLokasiShift(shift.lokasishift)}${shift.tipeshift ? ` (${shift.tipeshift})` : ''}`,
            start: startDate,
            end: endDate,
            allDay: false,
            resource: shift
          };
          
          console.log(`BigCalendar: ✅ Created calendar event:`, {
            id: calendarEvent.id,
            title: calendarEvent.title,
            start: calendarEvent.start.toISOString(),
            end: calendarEvent.end.toISOString()
          });
          
          return calendarEvent;
        } catch (error) {
          console.error('BigCalendar: ❌ Error creating calendar event for shift:', shift, error);
          return null;
        }
      }).filter(Boolean) as CalendarEvent[]; // Remove any null entries from failed parsing
      
      console.log(`BigCalendar: Successfully processed ${processedEvents.length} out of ${activeShifts.length} shifts`);
      return processedEvents;
    } catch (err) {
      console.error('BigCalendar: Error processing shifts for calendar:', err);
      return [];
    }
  }, [activeShifts]);
  
  // Memoize the combined events to avoid unnecessary rerenders
  const events = useMemo(() => {
    console.log('BigCalendar: 📊 Creating final events list');
    console.log('BigCalendar: 📊 Shift events count:', shiftEvents.length);
    console.log('BigCalendar: 📊 Shift events details:', shiftEvents);
    
    // Only use shift events - no default events for production
    const finalEvents = shiftEvents;
    console.log('BigCalendar: 📊 Final events count:', finalEvents.length);
    console.log('BigCalendar: 📊 Final events list:', finalEvents);
    
    return finalEvents;
  }, [shiftEvents]);
  
  // Use a callback for view change to avoid rerender issues
  const handleOnChangeView = useCallback((selectedView: View) => {
    // On mobile, limit to month and day views for better UX
    if (isMobile && selectedView === Views.WEEK) {
      setView(Views.MONTH);
    } else {
      setView(selectedView);
    }
  }, [isMobile]);
  
  // Mobile-optimized event tooltip
  const EventComponent = ({ event }: { event: any }) => (
    <div className="rbc-event-content" style={{ 
      overflow: 'hidden', 
      textOverflow: 'ellipsis', 
      whiteSpace: 'nowrap',
      lineHeight: isMobile ? '1.3' : '1.4',
      fontWeight: '500',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
    }}>
      <strong style={{ 
        fontSize: isMobile ? '11px' : '12px',
        color: 'white',
        fontWeight: '500'
      }}>
        {event.title}
      </strong>
      {!isMobile && (
        <div style={{ 
          fontSize: '10px', 
          opacity: 0.95,
          color: 'white',
          fontWeight: '500',
          textShadow: '0 1px 1px rgba(0, 0, 0, 0.1)'
        }}>
          {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
        </div>
      )}
    </div>
  );
  
  // Custom header component for better date display
  const CustomHeader = ({ date, label }: { date: Date; label: string }) => {
    const isToday = moment(date).isSame(moment(), 'day');
    const dayName = moment(date).format('ddd');
    const dateNum = moment(date).format('D');
    const monthName = moment(date).format('MMM');
    
    return (
      <div className={`custom-header ${isToday ? 'today' : ''}`}>
        <div className="day-name">{dayName}</div>
        <div className="date-info">
          <span className="date-num">{dateNum}</span>
          {!isMobile && <span className="month-name">{monthName}</span>}
        </div>
      </div>
    );
  };
  
  // Calculate default date - use current real date or first event date
  const defaultDate = useMemo(() => {
    console.log('BigCalendar: Calculating default date...');
    console.log('BigCalendar: Events available:', events.length);
    
    // Always use current real date as primary default
    const currentDate = new Date();
    console.log('BigCalendar: Using current real date:', currentDate.toISOString());
    
    // If there are events and they're close to current date, use first event
    if (events.length > 0) {
      const firstEventDate = events[0].start;
      const daysDiff = Math.abs((firstEventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If first event is within 30 days of today, use it
      if (daysDiff <= 30) {
        console.log('BigCalendar: Using first event date (within 30 days):', firstEventDate);
        return firstEventDate;
      }
    }
    
    console.log('BigCalendar: Using current date as default:', currentDate);
    return currentDate;
  }, [events]);
  
  console.log("Default calendar date:", defaultDate);
  console.log("Current view:", view);
  
  // Set up calendar to use Indonesian locale
  moment.locale('id');
  
  return (
    <>
      <MobileCalendarWrapper className={isMobile ? "h-auto max-h-screen overflow-hidden px-1" : "h-full w-full"}>
        {/* Custom CSS untuk styling header tanggal yang lebih jelas */}
        <style jsx global>{`
          /* Base calendar background yang konsisten dengan sistem */
          .rbc-calendar {
            background-color: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          
          /* Header styling with light theme */
          .rbc-header {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
            border-bottom: 1px solid #e2e8f0 !important;
            padding: ${isMobile ? '6px 4px' : '10px 8px'} !important;
            font-weight: 600 !important;
            font-size: ${isMobile ? '11px' : '13px'} !important;
            color: #334155 !important;
            text-align: center !important;
            min-height: ${isMobile ? '40px' : '50px'} !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          /* Custom header styling */
          .custom-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 4px;
            background: white !important;
          }
          
          .custom-header .day-name {
            font-size: ${isMobile ? '9px' : '11px'};
            font-weight: 500;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          
          .custom-header .date-info {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .custom-header .date-num {
            font-size: ${isMobile ? '14px' : '16px'};
            font-weight: 600;
            color: #1e293b;
          }
          
          .custom-header .month-name {
            font-size: ${isMobile ? '9px' : '10px'};
            color: #64748b;
            font-weight: 500;
          }
          
          .custom-header.today {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
            border-radius: 6px;
            margin: 2px;
          }
          
          .custom-header.today .day-name {
            color: #1d4ed8;
            font-weight: 600;
          }
          
          .custom-header.today .date-num {
            color: #1e40af;
            font-weight: 700;
          }
          
          .custom-header.today .month-name {
            color: #1d4ed8;
            font-weight: 600;
          }
          
          /* Month view styling */
          .rbc-month-view {
            background: white !important;
            border: none !important;
          }
          
          .rbc-month-row {
            border-bottom: 1px solid #f1f5f9 !important;
            background: white !important;
          }
          
          .rbc-day-bg {
            background: white !important;
            border-right: 1px solid #f1f5f9 !important;
            border-bottom: 1px solid #f1f5f9 !important;
            position: relative !important;
          }
          
          /* Add subtle background pattern to better distinguish events */
          .rbc-day-bg:nth-child(even) {
            background: #fafbfc !important;
          }
          
          .rbc-off-range-bg {
            background: #f1f5f9 !important;
            color: #94a3b8 !important;
          }
          
          .rbc-today {
            background: #f0f9ff !important;
            border: 2px solid #bfdbfe !important;
            position: relative !important;
          }
          
          .rbc-today::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%);
            pointer-events: none;
          }
          
          .rbc-date-cell {
            padding: ${isMobile ? '4px' : '8px'} !important;
            color: #1e293b !important;
            font-weight: 500 !important;
          }
          
          .rbc-date-cell > a {
            color: #1e293b !important;
            text-decoration: none !important;
          }
          
          .rbc-off-range .rbc-date-cell > a {
            color: #94a3b8 !important;
          }
          
          .rbc-today .rbc-date-cell > a {
            color: #2563eb !important;
            font-weight: 700 !important;
          }
          
          /* Event styling - softer outline */
          .rbc-event {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 6px !important;
            font-weight: 500 !important;
            box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
            min-height: ${isMobile ? '22px' : '24px'} !important;
            padding: ${isMobile ? '3px 6px' : '4px 8px'} !important;
            margin: ${isMobile ? '1px' : '2px'} !important;
            font-size: ${isMobile ? '11px' : '12px'} !important;
            line-height: 1.3 !important;
            text-transform: none !important;
            letter-spacing: normal !important;
            position: relative !important;
            z-index: 5 !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
          }
          
          .rbc-event::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
            border-radius: 5px;
            pointer-events: none;
          }
          
          .rbc-event:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
            border: none !important;
          }
          
          .rbc-event-content {
            color: white !important;
            font-weight: 500 !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
            position: relative !important;
            z-index: 2 !important;
          }
          
          /* Event in today's cell should be highlighted but not overwhelming */
          .rbc-today .rbc-event {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
            border: none !important;
            box-shadow: 0 2px 4px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
          }
          
          .rbc-today .rbc-event:hover {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%) !important;
            border: none !important;
            box-shadow: 0 3px 6px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
          }
          
          .rbc-today .rbc-event:hover {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%) !important;
            border-color: #b91c1c !important;
            box-shadow: 0 3px 6px rgba(220, 38, 38, 0.4) !important;
          }
          
          /* Toolbar styling yang konsisten */
          .rbc-toolbar {
            background: #f8fafc !important;
            padding: ${isMobile ? '8px' : '12px'} !important;
            border-bottom: 1px solid #e2e8f0 !important;
            margin-bottom: 0 !important;
            border-radius: 8px 8px 0 0 !important;
          }
          
          .rbc-toolbar-label {
            color: #1e293b !important;
            font-weight: 600 !important;
            font-size: ${isMobile ? '16px' : '18px'} !important;
          }
          
          .rbc-btn-group button {
            background: white !important;
            border: 1px solid #e2e8f0 !important;
            color: #475569 !important;
            padding: ${isMobile ? '6px 12px' : '8px 16px'} !important;
            font-size: ${isMobile ? '12px' : '14px'} !important;
            border-radius: 6px !important;
            margin: 0 2px !important;
            font-weight: 500 !important;
          }
          
          .rbc-btn-group button:hover {
            background: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
            color: #334155 !important;
          }
          
          .rbc-btn-group button.rbc-active {
            background: #3b82f6 !important;
            border-color: #3b82f6 !important;
            color: white !important;
            font-weight: 600 !important;
          }
          
          .rbc-time-header-content > .rbc-row {
            min-height: ${isMobile ? '50px' : '60px'} !important;
          }
          
          .rbc-time-header-content .rbc-header {
            border-bottom: 2px solid #dee2e6 !important;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          }
          
          /* Styling untuk week view header */
          .rbc-time-view .rbc-header {
            background: linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%) !important;
            font-weight: 600 !important;
            color: #334155 !important;
            border-radius: 4px 4px 0 0 !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            font-size: ${isMobile ? '11px' : '13px'} !important;
            padding: ${isMobile ? '6px 4px' : '8px 6px'} !important;
          }
          
          /* Time view event styling - more compact */
          .rbc-time-view .rbc-event {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
            border: 1px solid #2563eb !important;
            border-radius: 4px !important;
            font-size: ${isMobile ? '10px' : '11px'} !important;
            padding: ${isMobile ? '2px 4px' : '3px 6px'} !important;
            margin: 1px !important;
            font-weight: 500 !important;
            text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1) !important;
            box-shadow: 0 1px 2px rgba(59, 130, 246, 0.2) !important;
          }
          
          .rbc-time-view .rbc-event:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
          }
          
          /* Time gutter styling - perfect center alignment */
          .rbc-time-gutter {
            background: #f8fafc !important;
            border-right: 1px solid #e2e8f0 !important;
            width: ${isMobile ? '50px' : '60px'} !important;
          }
          
          .rbc-time-gutter .rbc-time-slot {
            border-top: 1px solid #f1f5f9 !important;
            font-size: ${isMobile ? '9px' : '10px'} !important;
            color: #64748b !important;
            text-align: center !important;
            padding: 4px 2px !important;
            font-weight: 500 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: ${isMobile ? '40px' : '60px'} !important;
          }
          
          /* Time header perfect centering */
          .rbc-time-header-gutter {
            background: #f8fafc !important;
            border-right: 1px solid #e2e8f0 !important;
            border-bottom: 1px solid #e2e8f0 !important;
            width: ${isMobile ? '50px' : '60px'} !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: ${isMobile ? '11px' : '12px'} !important;
            font-weight: 600 !important;
            color: #334155 !important;
            text-align: center !important;
            padding: 0 !important;
          }
          
          /* Day view specific styling - no border */
          .rbc-day-view .rbc-event {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
            border: none !important;
            border-radius: 6px !important;
            font-size: 12px !important;
            padding: 4px 8px !important;
            margin: 2px !important;
            font-weight: 500 !important;
            text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1) !important;
            box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
            min-height: auto !important;
            line-height: 1.3 !important;
          }
          
          .rbc-day-view .rbc-event-content {
            font-size: 12px !important;
            font-weight: 500 !important;
            padding: 0 !important;
          }
          
          /* Week view specific styling - no border */
          .rbc-week-view .rbc-event {
            font-size: ${isMobile ? '10px' : '11px'} !important;
            padding: ${isMobile ? '2px 4px' : '3px 5px'} !important;
            border-radius: 4px !important;
            border: none !important;
            box-shadow: 0 1px 2px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          }
          
          /* Today highlight for regular headers */
          .rbc-today .rbc-header {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
            color: #1976d2 !important;
            font-weight: 700 !important;
          }
          
          /* Better spacing for mobile */
          @media (max-width: 768px) {
            .rbc-calendar {
              font-size: 12px !important;
              background: white !important;
            }
            
            .rbc-header {
              padding: 6px 3px !important;
              font-size: 10px !important;
              line-height: 1.2 !important;
              min-height: 35px !important;
              text-align: center !important;
              background: white !important;
              border-bottom: 1px solid #e2e8f0 !important;
              color: #475569 !important;
            }
            
            .rbc-date-cell {
              padding: 2px !important;
              font-size: 12px !important;
              min-height: 35px !important;
              color: #1e293b !important;
            }
            
            .rbc-month-view {
              border: none !important;
              background: white !important;
            }
            
            .rbc-month-row {
              border: none !important;
              min-height: 35px !important;
              background: white !important;
            }
            
            .rbc-day-bg {
              border: 1px solid #f1f5f9 !important;
              background: white !important;
            }
            
            .rbc-off-range-bg {
              background: #f8fafc !important;
            }
            
            .rbc-today {
              background: #eff6ff !important;
            }
            
            .rbc-event {
              font-size: 11px !important;
              padding: 3px 6px !important;
              margin: 1px !important;
              border-radius: 4px !important;
              overflow: hidden !important;
              white-space: nowrap !important;
              text-overflow: ellipsis !important;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
              color: white !important;
              border: none !important;
              font-weight: 500 !important;
              text-transform: none !important;
              letter-spacing: normal !important;
              min-height: 22px !important;
              box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
              position: relative !important;
              z-index: 5 !important;
            }
            
            .rbc-event::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
              border-radius: 3px;
              pointer-events: none;
              z-index: 1;
            }
            
            .rbc-today .rbc-event {
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
              border: none !important;
              box-shadow: 0 2px 4px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
            }
            
            /* Mobile time gutter perfect centering */
            .rbc-time-gutter {
              width: 50px !important;
              background: #f8fafc !important;
            }
            
            .rbc-time-gutter .rbc-time-slot {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              text-align: center !important;
              font-size: 9px !important;
              color: #64748b !important;
              font-weight: 500 !important;
              padding: 0 !important;
              min-height: 30px !important;
              border-top: 1px solid #f1f5f9 !important;
            }
            
            .rbc-time-header-gutter {
              width: 50px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              text-align: center !important;
              font-size: 10px !important;
              font-weight: 600 !important;
              color: #334155 !important;
              background: #f8fafc !important;
              border-right: 1px solid #e2e8f0 !important;
              border-bottom: 1px solid #e2e8f0 !important;
              padding: 0 !important;
            }
            
            .rbc-toolbar {
              padding: 8px 4px !important;
              margin-bottom: 8px !important;
              flex-wrap: wrap !important;
              gap: 6px !important;
              background: white !important;
              border-bottom: 1px solid #e2e8f0 !important;
            }
            
            .rbc-toolbar-label {
              font-size: 16px !important;
              font-weight: 600 !important;
              order: 1 !important;
              width: 100% !important;
              text-align: center !important;
              margin-bottom: 8px !important;
              color: #1e293b !important;
            }
            
            .rbc-btn-group {
              order: 2 !important;
            }
            
            .rbc-btn-group button {
              padding: 6px 10px !important;
              font-size: 11px !important;
              margin: 0 1px !important;
              border-radius: 4px !important;
              background: white !important;
              border: 1px solid #e2e8f0 !important;
              color: #475569 !important;
            }
            
            .custom-header .day-name {
              font-size: 8px !important;
              font-weight: 500 !important;
              color: #64748b !important;
            }
            
            .custom-header .date-num {
              font-size: 12px !important;
              font-weight: 600 !important;
              color: #1e293b !important;
            }
          }
          
          /* Tablet optimizations */
          @media (min-width: 769px) and (max-width: 1024px) {
            .rbc-header {
              padding: 8px 4px !important;
              font-size: 12px !important;
            }
            
            .rbc-event {
              font-size: 11px !important;
              padding: 2px 4px !important;
            }
            
            .rbc-toolbar-label {
              font-size: 18px !important;
            }
          }
        `}</style>
        
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={isMobile ? ['month'] : ['month', 'week', 'day']} // Only month view on mobile for better UX
        view={isMobile ? Views.MONTH : view}
        onView={handleOnChangeView}
        onSelectEvent={handleSelectEvent}
        defaultDate={defaultDate}
        // Remove the fixed date prop to allow natural navigation
        onNavigate={(newDate) => {
          console.log('BigCalendar: Navigating to date:', newDate);
        }}
        style={{ 
          height: isMobile ? "400px" : "98%",
          minHeight: isMobile ? "400px" : "500px"
        }}
        culture="id" // Set calendar to Indonesian locale
        // Mobile-optimized event display
        components={{
          event: EventComponent,
          // Use custom header for better date display in week/day view
          timeGutterHeader: () => (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: '600',
              color: '#334155',
              textAlign: 'center',
              padding: 0
            }}>
              Waktu
            </div>
          ),
          // Custom toolbar for mobile
          toolbar: isMobile ? (props) => (
            <div className="flex flex-col gap-3 p-4 bg-white border-b border-gray-200 mb-4">
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => props.onNavigate('PREV')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  ‹ Sebelumnya
                </button>
                <button 
                  onClick={() => props.onNavigate('TODAY')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Hari Ini
                </button>
                <button 
                  onClick={() => props.onNavigate('NEXT')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Selanjutnya ›
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {moment(props.date).format('MMMM YYYY')}
                </h2>
              </div>
            </div>
          ) : undefined,
        }}
        // Mobile-friendly date formats - Enhanced for better visibility
        formats={{
          dayFormat: (date, culture, localizer) => {
            if (isMobile) {
              // Mobile: Show only day abbreviation (Min, Sen, Sel, etc.)
              return localizer?.format(date, 'ddd', culture)?.substring(0, 3) || '';
            }
            // Desktop: Show day abbreviation with date and month
            return `${localizer?.format(date, 'ddd', culture)} ${localizer?.format(date, 'D MMM', culture)}` || '';
          },
          timeGutterFormat: (date) => moment(date).format(isMobile ? 'HH' : 'HH:mm'),
          eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
            if (isMobile) {
              return `${moment(start).format('HH:mm')}`;
            }
            return `${moment(start).format('HH:mm')} – ${moment(end).format('HH:mm')}`;
          },
          monthHeaderFormat: (date, culture, localizer) =>
            localizer?.format(date, isMobile ? 'MMM yyyy' : 'MMMM yyyy', culture) || '',
          dayHeaderFormat: (date, culture, localizer) => {
            if (isMobile) {
              // Mobile: Clear day and date format
              return `${localizer?.format(date, 'dddd', culture)}, ${localizer?.format(date, 'D MMMM', culture)}` || '';
            }
            // Desktop: Full day and date format
            return `${localizer?.format(date, 'dddd', culture)}, ${localizer?.format(date, 'D MMMM YYYY', culture)}` || '';
          },
          agendaHeaderFormat: ({ start, end }, culture, localizer) => {
            if (isMobile) {
              return `${localizer?.format(start, 'D MMM', culture)} - ${localizer?.format(end, 'D MMM YYYY', culture)}`;
            }
            return `${localizer?.format(start, 'D MMMM', culture)} - ${localizer?.format(end, 'D MMMM YYYY', culture)}`;
          },
          // Week view header format - Enhanced for better readability
          dateFormat: (date, culture, localizer) => {
            if (isMobile) {
              return `${localizer?.format(date, 'D', culture)}` || '';
            }
            return `${localizer?.format(date, 'D', culture)}` || '';
          },
        }}
        // Mobile scroll behavior
        popup={false} // Disable popup for better touch interaction
        selectable={true}
        // Touch-friendly step and timeslot settings
        step={isMobile ? 60 : 30} // Larger time steps on mobile
        timeslots={isMobile ? 1 : 2} // Fewer timeslots on mobile for better readability
        // Responsive event props
        eventPropGetter={(event) => ({
          style: {
            fontSize: isMobile ? '11px' : '12px',
            padding: isMobile ? '3px 6px' : '4px 8px',
            borderRadius: isMobile ? '4px' : '6px',
            border: 'none',
            fontWeight: '500',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            lineHeight: isMobile ? '1.3' : '1.4',
            minHeight: isMobile ? '22px' : '24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          },
        })}
        // Mobile-optimized day/date cell props
        dayPropGetter={(date) => ({
          style: {
            minHeight: isMobile ? '35px' : '50px',
            padding: isMobile ? '2px' : '4px',
          },
        })}
        // Show less agenda slots for mobile
        showMultiDayTimes={!isMobile}
      />
      
      {/* Mobile Event Detail Modal */}
      {isMobile && showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm mx-4 p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detail Jadwal</h3>
              <button
                onClick={closeEventModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 block">Kegiatan:</label>
                <p className="text-gray-900 font-medium">{selectedEvent.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 block">Tanggal:</label>
                <p className="text-gray-900">{moment(selectedEvent.start).format('dddd, D MMMM YYYY')}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 block">Waktu:</label>
                <p className="text-gray-900 font-medium">
                  {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                </p>
              </div>
              
              {selectedEvent.resource && (
                <>
                  {selectedEvent.resource.lokasishift && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 block">Lokasi:</label>
                      <p className="text-gray-900">{selectedEvent.resource.lokasishift}</p>
                    </div>
                  )}
                  
                  {selectedEvent.resource.tipeshift && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 block">Tipe Shift:</label>
                      <p className="text-gray-900">{selectedEvent.resource.tipeshift}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="mt-6">
              <button
                onClick={closeEventModal}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileCalendarWrapper>
    </>
  );
};

export default BigCalendar;
