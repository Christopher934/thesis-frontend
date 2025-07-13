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
    <div className="rbc-event-content">
      <strong>{event.title}</strong>
      {!isMobile && (
        <div style={{ fontSize: '0.8em', opacity: 0.8 }}>
          {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
        </div>
      )}
    </div>
  );
  
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
      <MobileCalendarWrapper className="h-full w-full">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={isMobile ? ['month', 'day'] : ['month', 'week', 'day']} // Limit views on mobile
        view={view}
        onView={handleOnChangeView}
        defaultDate={defaultDate}
        // Remove the fixed date prop to allow natural navigation
        onNavigate={(newDate) => {
          console.log('BigCalendar: Navigating to date:', newDate);
        }}
        style={{ height: isMobile ? "100%" : "98%" }}
        culture="id" // Set calendar to Indonesian locale
        // Mobile-optimized event display
        components={{
          event: EventComponent,
        }}
        // Mobile-friendly date formats
        formats={{
          dayFormat: (date, culture, localizer) => {
            if (isMobile) {
              return localizer?.format(date, 'ddd', culture) || '';
            }
            return localizer?.format(date, 'ddd, D MMM', culture) || '';
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
          dayHeaderFormat: (date, culture, localizer) =>
            localizer?.format(date, isMobile ? 'ddd D/M' : 'dddd, D MMMM YYYY', culture) || '',
          agendaHeaderFormat: ({ start, end }, culture, localizer) => {
            if (isMobile) {
              return `${localizer?.format(start, 'D MMM', culture)} - ${localizer?.format(end, 'D MMM YYYY', culture)}`;
            }
            return `${localizer?.format(start, 'D MMMM', culture)} - ${localizer?.format(end, 'D MMMM YYYY', culture)}`;
          },
        }}
        // Mobile scroll behavior
        popup={!isMobile} // Disable popup on mobile for better touch interaction
        selectable={true}
        // Touch-friendly step and timeslot settings
        step={isMobile ? 60 : 30} // Larger time steps on mobile
        timeslots={isMobile ? 1 : 2} // Fewer timeslots on mobile for better readability
        // Responsive event props
        eventPropGetter={(event) => ({
          style: {
            fontSize: isMobile ? '10px' : '12px',
            padding: isMobile ? '2px 4px' : '4px 6px',
            borderRadius: '4px',
            border: 'none',
            fontWeight: '500',
          },
        })}
        // Mobile-optimized day/date cell props
        dayPropGetter={(date) => ({
          style: {
            minHeight: isMobile ? '35px' : '50px',
          },
        })}
      />
    </MobileCalendarWrapper>
    </>
  );
};

export default BigCalendar;
