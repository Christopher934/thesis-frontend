export interface ShiftSchedule {
  name: string;
  startTime: string;
  endTime: string;
  days: string[]; // Days of week this shift applies to
  breakTime?: {
    start: string;
    end: string;
  };
}

export interface ShiftTypeConfig {
  type: string;
  description: string;
  installasi: string;
  shifts: ShiftSchedule[];
  hasRotatingBreaks: boolean; // For patient care services
  notes?: string;
}

/**
 * Official RSUD Anugerah Tomohon Shift Type Configurations
 * Based on official hospital regulations
 */
export const SHIFT_TYPE_CONFIGS: Record<string, ShiftTypeConfig> = {
  GEDUNG_ADMINISTRASI: {
    type: 'GEDUNG_ADMINISTRASI',
    description: 'Gedung Administrasi',
    installasi: 'Administrasi',
    hasRotatingBreaks: false,
    shifts: [
      {
        name: 'Reguler Senin-Kamis',
        startTime: '08:00',
        endTime: '17:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'],
        breakTime: {
          start: '12:00',
          end: '13:00'
        }
      },
      {
        name: 'Jumat',
        startTime: '08:00',
        endTime: '11:30',
        days: ['FRIDAY']
      }
    ]
  },

  RAWAT_JALAN: {
    type: 'RAWAT_JALAN',
    description: 'Instalasi Rawat Jalan',
    installasi: 'Rawat Jalan',
    hasRotatingBreaks: true,
    notes: 'Untuk pelayanan langsung pasien, waktu istirahat bergantian',
    shifts: [
      {
        name: 'Senin-Jumat',
        startTime: '08:00',
        endTime: '15:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
      },
      {
        name: 'Sabtu',
        startTime: '08:00',
        endTime: '11:30',
        days: ['SATURDAY']
      }
    ]
  },

  RAWAT_INAP_3_SHIFT: {
    type: 'RAWAT_INAP_3_SHIFT',
    description: 'Instalasi Rawat Inap (3 Shift)',
    installasi: 'Rawat Inap',
    hasRotatingBreaks: true,
    notes: 'Untuk pelayanan langsung pasien, waktu istirahat bergantian',
    shifts: [
      {
        name: 'Shift Pagi',
        startTime: '08:00',
        endTime: '15:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Sore',
        startTime: '15:00',
        endTime: '21:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Malam',
        startTime: '20:00',
        endTime: '08:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }
    ]
  },

  GAWAT_DARURAT_3_SHIFT: {
    type: 'GAWAT_DARURAT_3_SHIFT',
    description: 'Instalasi Gawat Darurat (3 Shift)',
    installasi: 'Gawat Darurat',
    hasRotatingBreaks: true,
    notes: 'Untuk pelayanan langsung pasien, waktu istirahat bergantian',
    shifts: [
      {
        name: 'Shift Pagi',
        startTime: '08:00',
        endTime: '15:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Sore',
        startTime: '15:00',
        endTime: '21:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Malam',
        startTime: '20:00',
        endTime: '08:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }
    ]
  },

  LABORATORIUM_2_SHIFT: {
    type: 'LABORATORIUM_2_SHIFT',
    description: 'Instalasi Laboratorium (2 Shift)',
    installasi: 'Laboratorium',
    hasRotatingBreaks: true,
    notes: 'Untuk pelayanan langsung pasien, waktu istirahat bergantian',
    shifts: [
      {
        name: 'Shift Pagi',
        startTime: '08:00',
        endTime: '17:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Malam',
        startTime: '17:00',
        endTime: '08:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }
    ]
  },

  FARMASI_2_SHIFT: {
    type: 'FARMASI_2_SHIFT',
    description: 'Instalasi Farmasi (2 Shift)',
    installasi: 'Farmasi',
    hasRotatingBreaks: true,
    notes: 'Untuk pelayanan langsung pasien, waktu istirahat bergantian',
    shifts: [
      {
        name: 'Shift Pagi',
        startTime: '08:00',
        endTime: '17:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Malam',
        startTime: '17:00',
        endTime: '08:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }
    ]
  },

  RADIOLOGI_2_SHIFT: {
    type: 'RADIOLOGI_2_SHIFT',
    description: 'Instalasi Radiologi (2 Shift)',
    installasi: 'Radiologi',
    hasRotatingBreaks: true,
    notes: 'Untuk pelayanan langsung pasien, waktu istirahat bergantian',
    shifts: [
      {
        name: 'Shift Pagi',
        startTime: '08:00',
        endTime: '17:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Malam',
        startTime: '17:00',
        endTime: '08:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }
    ]
  },

  GIZI_2_SHIFT: {
    type: 'GIZI_2_SHIFT',
    description: 'Instalasi Gizi (2 Shift)',
    installasi: 'Gizi',
    hasRotatingBreaks: true,
    notes: 'Untuk pelayanan langsung pasien, waktu istirahat bergantian',
    shifts: [
      {
        name: 'Shift Pagi',
        startTime: '08:00',
        endTime: '17:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Malam',
        startTime: '17:00',
        endTime: '08:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }
    ]
  },

  KEAMANAN_2_SHIFT: {
    type: 'KEAMANAN_2_SHIFT',
    description: 'Petugas Keamanan (2 Shift)',
    installasi: 'Keamanan',
    hasRotatingBreaks: true,
    notes: 'Untuk waktu istirahat bergantian',
    shifts: [
      {
        name: 'Shift Pagi',
        startTime: '08:00',
        endTime: '17:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Malam',
        startTime: '17:00',
        endTime: '08:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }
    ]
  },

  LAUNDRY_REGULER: {
    type: 'LAUNDRY_REGULER',
    description: 'Petugas Laundry',
    installasi: 'Laundry',
    hasRotatingBreaks: false,
    shifts: [
      {
        name: 'Senin-Jumat',
        startTime: '08:00',
        endTime: '15:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        breakTime: {
          start: '12:00',
          end: '13:00'
        }
      },
      {
        name: 'Sabtu',
        startTime: '08:00',
        endTime: '11:30',
        days: ['SATURDAY']
      }
    ]
  },

  CLEANING_SERVICE: {
    type: 'CLEANING_SERVICE',
    description: 'Cleaning Service',
    installasi: 'Cleaning Service',
    hasRotatingBreaks: false,
    shifts: [
      {
        name: 'Senin-Jumat',
        startTime: '08:00',
        endTime: '15:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        breakTime: {
          start: '12:00',
          end: '13:00'
        }
      },
      {
        name: 'Sabtu',
        startTime: '08:00',
        endTime: '11:30',
        days: ['SATURDAY']
      }
    ]
  },

  SUPIR_2_SHIFT: {
    type: 'SUPIR_2_SHIFT',
    description: 'Supir (2 Shift)',
    installasi: 'Transportasi',
    hasRotatingBreaks: false,
    shifts: [
      {
        name: 'Shift Pagi',
        startTime: '08:00',
        endTime: '17:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      {
        name: 'Shift Malam',
        startTime: '17:00',
        endTime: '08:00',
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      }
    ]
  }
};

/**
 * Get shift configuration by type
 */
export function getShiftTypeConfig(shiftType: string): ShiftTypeConfig | null {
  return SHIFT_TYPE_CONFIGS[shiftType] || null;
}

/**
 * Get all available shift types
 */
export function getAllShiftTypes(): ShiftTypeConfig[] {
  return Object.values(SHIFT_TYPE_CONFIGS);
}

/**
 * Get shift types by installation
 */
export function getShiftTypesByInstallation(installasi: string): ShiftTypeConfig[] {
  return Object.values(SHIFT_TYPE_CONFIGS).filter(
    config => config.installasi.toLowerCase().includes(installasi.toLowerCase())
  );
}

/**
 * Get shift schedule for specific day and shift type
 */
export function getShiftScheduleForDay(shiftType: string, dayOfWeek: string): ShiftSchedule[] {
  const config = getShiftTypeConfig(shiftType);
  if (!config) return [];
  
  return config.shifts.filter(shift => 
    shift.days.includes(dayOfWeek.toUpperCase())
  );
}

/**
 * Validate if a time falls within shift schedule
 */
export function isTimeInShift(time: string, shiftSchedule: ShiftSchedule): boolean {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(shiftSchedule.startTime);
  const endMinutes = timeToMinutes(shiftSchedule.endTime);
  
  // Handle overnight shifts (end time is next day)
  if (endMinutes < startMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  }
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get working hours for a specific shift type and day
 */
export function getWorkingHoursForDay(shiftType: string, dayOfWeek: string): {
  totalHours: number;
  shifts: Array<{ name: string; hours: number; startTime: string; endTime: string }>;
} {
  const schedules = getShiftScheduleForDay(shiftType, dayOfWeek);
  
  const shifts = schedules.map(schedule => {
    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    
    let totalMinutes: number;
    if (endMinutes < startMinutes) {
      // Overnight shift
      totalMinutes = (24 * 60 - startMinutes) + endMinutes;
    } else {
      totalMinutes = endMinutes - startMinutes;
    }
    
    // Subtract break time if any
    if (schedule.breakTime) {
      const breakStart = timeToMinutes(schedule.breakTime.start);
      const breakEnd = timeToMinutes(schedule.breakTime.end);
      totalMinutes -= (breakEnd - breakStart);
    }
    
    return {
      name: schedule.name,
      hours: totalMinutes / 60,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    };
  });
  
  const totalHours = shifts.reduce((sum, shift) => sum + shift.hours, 0);
  
  return { totalHours, shifts };
}

/**
 * Get schedule for a specific date (considering day of week)
 */
export function getScheduleForDate(shiftType: string, date: Date): ShiftSchedule[] {
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayOfWeek = dayNames[date.getDay()];
  
  return getShiftScheduleForDay(shiftType, dayOfWeek);
}

/**
 * Validate if time fits within a shift type for a specific date
 */
export function validateShiftTime(
  shiftType: string, 
  jammulai: string, 
  jamselesai: string,
  date: Date
): boolean {
  const availableSchedules = getScheduleForDate(shiftType, date);
  
  return availableSchedules.some(schedule => 
    schedule.startTime === jammulai && schedule.endTime === jamselesai
  );
}

/**
 * Get shift options for a specific date and shift type
 */
export function getShiftOptionsForDate(shiftType: string, date: Date): Array<{
  name: string;
  startTime: string;
  endTime: string;
  breakTime?: { start: string; end: string };
}> {
  return getScheduleForDate(shiftType, date);
}
