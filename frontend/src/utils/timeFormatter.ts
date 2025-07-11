/**
 * Time formatting utilities for the hospital management system
 */

/**
 * Format time from DateTime string to HH:mm format
 * @param timeString - DateTime string from backend
 * @returns Formatted time string in HH:mm format
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Format time range from DateTime strings to HH:mm - HH:mm format
 * @param startTime - Start DateTime string from backend
 * @param endTime - End DateTime string from backend
 * @returns Formatted time range string in HH:mm - HH:mm format
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/**
 * Format date and time range for display
 * @param date - Date string
 * @param startTime - Start DateTime string
 * @param endTime - End DateTime string
 * @returns Formatted string like "12 Jul 2025 • 08:00 - 16:00"
 */
export const formatDateTimeRange = (date: string, startTime: string, endTime: string): string => {
  const formattedDate = new Date(date).toLocaleDateString('id-ID');
  const timeRange = formatTimeRange(startTime, endTime);
  return `${formattedDate} • ${timeRange}`;
};
