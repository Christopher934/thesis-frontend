"use client";

import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import { calendarEvents } from '@/lib/data';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/id'; // Import the locale you want to use
import { useState, useEffect, useMemo, useCallback } from 'react';

const localizer = momentLocalizer(moment);

// Interface for shift data from JadwalSaya
interface ShiftData {
  id: number;
  idpegawai: string;
  tipeshift?: string;
  tanggal: string;
  originalDate?: string; // Original date before formatting
  lokasishift: string;
  jammulai: string;
  jamselesai: string;
  nama?: string;
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
  const [view, setView] = useState<View>(Views.WEEK);
  
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
    if (!shifts || shifts.length === 0) {
      console.log('No shifts to process for calendar');
      return [];
    }
    
    console.log('Processing shifts for calendar:', shifts);
    try {
      return shifts.map(shift => {
        // Parse date and time
        const dateStr = shift.originalDate || shift.tanggal;
        console.log(`Processing shift date: ${dateStr} for ${shift.lokasishift}`);
        let date;
        
        try {
          // Handle different date formats (formatted or ISO)
          if (dateStr.includes(',')) {
            // If it's already formatted as "Day, DD Month YYYY"
            // Extract just the date part
            console.log(`Parsing formatted date: ${dateStr}`);
            const parts = dateStr.split(',')[1].trim().split(' ');
            console.log(`Date parts:`, parts);
            const day = parseInt(parts[0]);
            const month = moment().locale('id').month(parts[1]).month();
            const year = parseInt(parts[2]);
            date = new Date(year, month, day);
            console.log(`Created date: ${date.toISOString()}`);
          } else {
            // If it's ISO format like "2025-06-07"
            console.log(`Parsing ISO date: ${dateStr}`);
            
            // Check if we need to adjust for timezone issues
            if (dateStr.length === 10 && dateStr.includes('-')) {
              // Handle YYYY-MM-DD format with timezone consideration
              const [year, month, day] = dateStr.split('-').map(Number);
              // Create date using UTC to avoid timezone issues
              date = new Date(Date.UTC(year, month - 1, day));
              console.log(`Created UTC date for ${dateStr}: ${date.toISOString()}`);
            } else {
              // Fall back to standard date parsing
              date = new Date(dateStr);
              console.log(`Created date: ${date.toISOString()}`);
            }
          }
          
          // Ensure we have a valid date
          if (isNaN(date.getTime())) {
            // Fallback to today if date is invalid
            date = new Date();
            console.error(
              `Date parsing error: "${dateStr}" produced an invalid date. ` +
              `Format should be YYYY-MM-DD or a standard date string. ` +
              `Falling back to current date.`
            );
          }
        } catch (error) {
          // Fallback to today if date parsing fails
          date = new Date();
          console.error(
            `Date parsing exception for "${dateStr}": ${error instanceof Error ? error.message : String(error)}. ` +
            `Check that your date is in a valid format (YYYY-MM-DD recommended). ` +
            `Falling back to current date.`
          );
        }
        
        try {
          // Parse start time with validation
          let startHours = 0, startMinutes = 0;
          if (shift.jammulai && shift.jammulai.includes(':')) {
            [startHours, startMinutes] = shift.jammulai.split(':').map(Number);
            
            // Validate hour and minute values
            if (isNaN(startHours) || startHours < 0 || startHours > 23) {
              console.error(`Invalid start hour value: ${startHours} in "${shift.jammulai}". Setting to 0.`);
              startHours = 0;
            }
            
            if (isNaN(startMinutes) || startMinutes < 0 || startMinutes > 59) {
              console.error(`Invalid start minute value: ${startMinutes} in "${shift.jammulai}". Setting to 0.`);
              startMinutes = 0;
            }
          } else {
            console.error(`Invalid or missing start time format: "${shift.jammulai}". Expected format: "HH:MM". Using 00:00.`);
          }
          
          console.log(`Time info - start: ${startHours}:${startMinutes}`);
          
          // Create new date objects to avoid modifying the original date
          const startDate = new Date(date);
          // Ensure we're setting hours correctly
          startDate.setHours(startHours, startMinutes, 0, 0);
          console.log(`Shift start date: ${startDate.toISOString()}, ${startDate.toString()}`);
          
          // Parse end time with validation
          let endHours = 0, endMinutes = 0;
          if (shift.jamselesai && shift.jamselesai.includes(':')) {
            [endHours, endMinutes] = shift.jamselesai.split(':').map(Number);
            
            // Validate hour and minute values
            if (isNaN(endHours) || endHours < 0 || endHours > 23) {
              console.error(`Invalid end hour value: ${endHours} in "${shift.jamselesai}". Setting to ${startHours + 1}.`);
              endHours = startHours + 1;
            }
            
            if (isNaN(endMinutes) || endMinutes < 0 || endMinutes > 59) {
              console.error(`Invalid end minute value: ${endMinutes} in "${shift.jamselesai}". Setting to ${startMinutes}.`);
              endMinutes = startMinutes;
            }
          } else {
            console.error(`Invalid or missing end time format: "${shift.jamselesai}". Expected format: "HH:MM". Using start time + 1 hour.`);
            endHours = startHours + 1;
            endMinutes = startMinutes;
          }
          
          console.log(`Time info - end: ${endHours}:${endMinutes}`);
          
          const endDate = new Date(date);
          // Ensure we're setting hours correctly
          endDate.setHours(endHours, endMinutes, 0, 0);
          console.log(`Shift end date: ${endDate.toISOString()}, ${endDate.toString()}`);
          
          // Ensure end time is after start time
          if (endDate <= startDate) {
            console.log("End time is before or equal to start time, adding 1 hour");
            endDate.setHours(endDate.getHours() + 1);
            console.log(`Adjusted end date: ${endDate.toISOString()}`);
          }
          
          // Format the location name for better display
          const formatLokasiShift = (lokasi: string) => {
            // Replace underscores with spaces and capitalize each word
            if (!lokasi) return 'Shift';
            
            return lokasi
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
          };
          
          return {
            id: shift.id,
            title: `${formatLokasiShift(shift.lokasishift)} ${shift.tipeshift ? `(${shift.tipeshift})` : ''}`,
            start: startDate,
            end: endDate,
            allDay: false,
            resource: shift
          };
        } catch (error) {
          console.error('Error creating calendar event:', error);
          return null;
        }
      }).filter(Boolean) as CalendarEvent[]; // Remove any null entries from failed parsing
    } catch (err) {
      console.error('Error processing shifts for calendar:', err);
      return [];
    }
  }, [shifts]);
  
  // Memoize the combined events to avoid unnecessary rerenders
  const events = useMemo(() => {
    console.log('Final calendar events:', shiftEvents);
    if (useDefaultEvents) {
      return [...shiftEvents, ...defaultEvents];
    }
    return shiftEvents;
  }, [shiftEvents, defaultEvents, useDefaultEvents]);
  
  // Use a callback for view change to avoid rerender issues
  const handleOnChangeView = useCallback((selectedView: View) => {
    setView(selectedView);
  }, []);
  
  // Calculate default date - if we have events, use the date of the first event
  const defaultDate = useMemo(() => {
    // For testing purposes - hard-code to June 7, 2025
    const targetDate = new Date(2025, 5, 7); // Month is 0-indexed, so 5 = June
    
    if (events.length > 0) {
      // Use the event date but ensure month is correct by comparing
      const firstEventDate = events[0].start;
      // Check if the month is correct, if not use our target date
      if (firstEventDate.getMonth() !== targetDate.getMonth()) {
        console.log("Event date month incorrect, using default June date");
        return targetDate;
      }
      return firstEventDate;
    }
    
    // If no events, set to June 7, 2025 for testing/demo purposes
    return targetDate;
  }, [events]);
  
  console.log("Default calendar date:", defaultDate);
  console.log("Current view:", view);
  
  // Set up calendar to use Indonesian locale
  moment.locale('id');
  
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={['month', 'week', 'day']}
      view={view}
      onView={handleOnChangeView}
      defaultDate={defaultDate}
      date={defaultDate} // Explicitly set current date to control displayed month
      style={{ height: "98%" }}
      culture="id" // Set calendar to Indonesian locale
      formats={{
        dayFormat: (date, culture, localizer) =>
          localizer?.format(date, 'ddd, D MMM', culture) || '',
        timeGutterFormat: (date) => moment(date).format('HH:mm'),
        eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
          `${moment(start).format('HH:mm')} – ${moment(end).format('HH:mm')}`,
        monthHeaderFormat: (date, culture, localizer) =>
          localizer?.format(date, 'MMMM yyyy', culture) || '', // Format for month header
      }}
    />
  );
};

export default BigCalendar;
