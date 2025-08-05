import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WorkloadData {
  userId: number;
  employeeId: string;
  name: string;
  currentShifts: number;
  maxShifts: number;
  consecutiveDays: number;
  maxConsecutiveDays: number;
  utilizationRate: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  recommendation: string;
  locations: string[];
  lastShiftDate: string | null;
  weeklyHours: number;
  monthlyHours: number;
}

export interface LocationCapacity {
  location: string;
  currentOccupancy: number;
  maxCapacity: number;
  utilizationRate: number;
  status: 'AVAILABLE' | 'FULL' | 'OVERBOOKED';
  dailyBreakdown: {
    date: string;
    shifts: number;
    capacity: number;
  }[];
}

@Injectable()
export class WorkloadMonitoringService {
  constructor(private prisma: PrismaService) {}

  // Configuration constants
  private readonly DEFAULT_MAX_SHIFTS_PER_MONTH = 20;
  private readonly DEFAULT_MAX_CONSECUTIVE_DAYS = 5;
  private readonly DEFAULT_MAX_HOURS_PER_WEEK = 48;

  // Location capacity configurations
  private readonly LOCATION_CAPACITIES = {
    'ICU': 15,
    'NICU': 12,
    'GAWAT_DARURAT': 20,
    'RAWAT_INAP': 25,
    'RAWAT_JALAN': 15,
    'LABORATORIUM': 8,
    'FARMASI': 6,
    'RADIOLOGI': 6,
    'HEMODIALISA': 4,
    'FISIOTERAPI': 4,
    'KAMAR_OPERASI': 12,
    'RECOVERY_ROOM': 8,
    'EMERGENCY_ROOM': 18,
    'GIZI': 6,
    'KEAMANAN': 8,
    'LAUNDRY': 4,
    'CLEANING_SERVICE': 6
  };

  /**
   * Get comprehensive workload data for all employees
   */
  async getWorkloadAnalysis(
    startDate?: Date,
    endDate?: Date
  ): Promise<WorkloadData[]> {
    const now = new Date();
    const monthStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all users with their shifts in the specified period
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          in: ['DOKTER', 'PERAWAT', 'STAF', 'SUPERVISOR']
        }
      },
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          orderBy: {
            tanggal: 'desc'
          }
        }
      }
    });

    const workloadData: WorkloadData[] = [];

    for (const user of users) {
      const analysis = await this.analyzeUserWorkload(user, monthStart, monthEnd);
      workloadData.push(analysis);
    }

    // Sort by status priority (CRITICAL first)
    return workloadData.sort((a, b) => {
      const statusPriority = { 'CRITICAL': 3, 'WARNING': 2, 'NORMAL': 1 };
      return statusPriority[b.status] - statusPriority[a.status];
    });
  }

  /**
   * Analyze workload for a specific user
   */
  private async analyzeUserWorkload(
    user: any,
    monthStart: Date,
    monthEnd: Date
  ): Promise<WorkloadData> {
    const shifts = user.shifts || [];
    const currentShifts = shifts.length;
    
    // Calculate consecutive working days
    const consecutiveDays = await this.calculateConsecutiveDays(user.id);
    
    // Calculate weekly and monthly hours
    const { weeklyHours, monthlyHours } = this.calculateWorkingHours(shifts);
    
    // Get unique locations with proper type casting
    const locationStrings = shifts.map(shift => String(shift?.lokasishift || ''));
    const locations = [...new Set(locationStrings)].filter((loc: string) => loc.trim() !== '') as string[];
    
    // Determine max limits based on role
    const maxShifts = this.getMaxShiftsForRole(user.role);
    const maxConsecutiveDays = this.DEFAULT_MAX_CONSECUTIVE_DAYS;
    
    // Calculate utilization rate
    const utilizationRate = Math.round((currentShifts / maxShifts) * 100);
    
    // Determine status and recommendation
    const { status, recommendation } = this.determineWorkloadStatus(
      currentShifts,
      maxShifts,
      consecutiveDays,
      maxConsecutiveDays,
      weeklyHours,
      monthlyHours
    );
    
    // Get last shift date
    const lastShiftDate = shifts.length > 0 
      ? shifts[0].tanggal.toISOString().split('T')[0] 
      : null;

    return {
      userId: user.id,
      employeeId: user.employeeId || user.username,
      name: `${user.namaDepan} ${user.namaBelakang}`,
      currentShifts,
      maxShifts,
      consecutiveDays,
      maxConsecutiveDays,
      utilizationRate,
      status,
      recommendation,
      locations,
      lastShiftDate,
      weeklyHours,
      monthlyHours
    };
  }

  /**
   * Calculate consecutive working days for a user
   */
  private async calculateConsecutiveDays(userId: number): Promise<number> {
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentShifts = await this.prisma.shift.findMany({
      where: {
        userId,
        tanggal: {
          gte: last7Days,
          lte: today
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    if (recentShifts.length === 0) return 0;

    let consecutiveDays = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);

    // Count backwards from today
    for (let i = 0; i < 7; i++) {
      const hasShift = recentShifts.some(shift => {
        const shiftDate = new Date(shift.tanggal);
        shiftDate.setHours(0, 0, 0, 0);
        return shiftDate.getTime() === currentDate.getTime();
      });

      if (hasShift) {
        consecutiveDays++;
      } else {
        break; // Stop counting if there's a gap
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return consecutiveDays;
  }

  /**
   * Calculate working hours from shifts
   */
  private calculateWorkingHours(shifts: any[]): { weeklyHours: number; monthlyHours: number } {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let weeklyHours = 0;
    let monthlyHours = 0;

    for (const shift of shifts) {
      const jamMulai = new Date(shift.jammulai);
      const jamSelesai = new Date(shift.jamselesai);
      
      let shiftHours = (jamSelesai.getTime() - jamMulai.getTime()) / (1000 * 60 * 60);
      
      // Handle overnight shifts
      if (shiftHours < 0) {
        shiftHours += 24;
      }

      monthlyHours += shiftHours;

      // Check if shift is within last week
      if (shift.tanggal >= weekStart) {
        weeklyHours += shiftHours;
      }
    }

    return {
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      monthlyHours: Math.round(monthlyHours * 10) / 10
    };
  }

  /**
   * Get maximum shifts allowed per month for a role
   */
  private getMaxShiftsForRole(role: string): number {
    const roleMaxShifts = {
      'DOKTER': 18,      // Doctors: fewer shifts due to higher responsibility
      'PERAWAT': 20,     // Nurses: standard shifts
      'STAF': 22,        // Staff: slightly more shifts possible
      'SUPERVISOR': 16   // Supervisors: fewer due to administrative duties
    };

    return roleMaxShifts[role] || this.DEFAULT_MAX_SHIFTS_PER_MONTH;
  }

  /**
   * Determine workload status and provide recommendation
   */
  private determineWorkloadStatus(
    currentShifts: number,
    maxShifts: number,
    consecutiveDays: number,
    maxConsecutiveDays: number,
    weeklyHours: number,
    monthlyHours: number
  ): { status: 'NORMAL' | 'WARNING' | 'CRITICAL'; recommendation: string } {
    
    // Critical conditions
    if (currentShifts > maxShifts) {
      return {
        status: 'CRITICAL',
        recommendation: 'Segera berikan istirahat! Pegawai melebihi batas maksimal shift bulanan.'
      };
    }

    if (consecutiveDays >= maxConsecutiveDays) {
      return {
        status: 'CRITICAL',
        recommendation: 'Berikan hari libur segera! Pegawai bekerja berturut-turut terlalu lama.'
      };
    }

    if (weeklyHours > this.DEFAULT_MAX_HOURS_PER_WEEK) {
      return {
        status: 'CRITICAL',
        recommendation: 'Jam kerja mingguan melebihi batas. Kurangi shift untuk minggu ini.'
      };
    }

    // Warning conditions
    if (currentShifts > maxShifts * 0.85) {
      return {
        status: 'WARNING',
        recommendation: 'Monitor ketat. Pegawai mendekati batas maksimal shift bulanan.'
      };
    }

    if (consecutiveDays >= maxConsecutiveDays - 1) {
      return {
        status: 'WARNING',
        recommendation: 'Rencanakan hari libur. Pegawai bekerja berturut-turut cukup lama.'
      };
    }

    if (weeklyHours > this.DEFAULT_MAX_HOURS_PER_WEEK * 0.9) {
      return {
        status: 'WARNING',
        recommendation: 'Jam kerja mingguan tinggi. Monitor dan batasi shift tambahan.'
      };
    }

    // Normal condition
    return {
      status: 'NORMAL',
      recommendation: 'Beban kerja dalam batas normal. Lanjutkan monitoring rutin.'
    };
  }

  /**
   * Get location capacity analysis
   */
  async getLocationCapacityAnalysis(): Promise<LocationCapacity[]> {
    const capacityData: LocationCapacity[] = [];
    
    // Get next 3 days for analysis
    const today = new Date();
    const analysisEndDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    for (const [location, maxCapacity] of Object.entries(this.LOCATION_CAPACITIES)) {
      const dailyBreakdown: Array<{ date: string; shifts: number; capacity: number }> = [];
      let totalCurrentOccupancy = 0;

      // Analyze each day
      for (let i = 0; i < 3; i++) {
        const analysisDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStart = new Date(analysisDate);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(analysisDate);
        dateEnd.setHours(23, 59, 59, 999);

        const shiftsCount = await this.prisma.shift.count({
          where: {
            lokasishift: location,
            tanggal: {
              gte: dateStart,
              lte: dateEnd
            }
          }
        });

        dailyBreakdown.push({
          date: analysisDate.toISOString().split('T')[0],
          shifts: shiftsCount,
          capacity: maxCapacity
        });

        if (i === 0) { // Today's occupancy
          totalCurrentOccupancy = shiftsCount;
        }
      }

      const utilizationRate = Math.round((totalCurrentOccupancy / maxCapacity) * 100);
      
      let status: 'AVAILABLE' | 'FULL' | 'OVERBOOKED';
      if (totalCurrentOccupancy > maxCapacity) {
        status = 'OVERBOOKED';
      } else if (totalCurrentOccupancy === maxCapacity) {
        status = 'FULL';
      } else {
        status = 'AVAILABLE';
      }

      capacityData.push({
        location,
        currentOccupancy: totalCurrentOccupancy,
        maxCapacity,
        utilizationRate,
        status,
        dailyBreakdown
      });
    }

    return capacityData.sort((a, b) => b.utilizationRate - a.utilizationRate);
  }

  /**
   * Check if a location can accept new shifts for a specific date
   */
  async canAcceptNewShift(location: string, date: Date): Promise<{
    canAccept: boolean;
    currentCount: number;
    maxCapacity: number;
    reason?: string;
  }> {
    const maxCapacity = this.LOCATION_CAPACITIES[location];
    
    if (!maxCapacity) {
      return {
        canAccept: true,
        currentCount: 0,
        maxCapacity: 0,
        reason: 'Location tidak terdefinisi dalam sistem kapasitas'
      };
    }

    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const currentCount = await this.prisma.shift.count({
      where: {
        lokasishift: location,
        tanggal: {
          gte: dateStart,
          lte: dateEnd
        }
      }
    });

    const canAccept = currentCount < maxCapacity;

    return {
      canAccept,
      currentCount,
      maxCapacity,
      reason: canAccept 
        ? undefined 
        : `Kapasitas lokasi ${location} sudah penuh (${currentCount}/${maxCapacity})`
    };
  }

  /**
   * Check if user can be assigned more shifts
   */
  async canUserTakeMoreShifts(userId: number, targetDate: Date): Promise<{
    canTake: boolean;
    reason?: string;
    currentShifts: number;
    maxShifts: number;
    consecutiveDays: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            }
          }
        }
      }
    });

    if (!user) {
      return {
        canTake: false,
        reason: 'User tidak ditemukan',
        currentShifts: 0,
        maxShifts: 0,
        consecutiveDays: 0
      };
    }

    const currentShifts = user.shifts.length;
    const maxShifts = this.getMaxShiftsForRole(user.role);
    const consecutiveDays = await this.calculateConsecutiveDays(userId);

    // Check monthly limit
    if (currentShifts >= maxShifts) {
      return {
        canTake: false,
        reason: `User sudah mencapai batas maksimal shift bulanan (${currentShifts}/${maxShifts})`,
        currentShifts,
        maxShifts,
        consecutiveDays
      };
    }

    // Check consecutive days limit
    if (consecutiveDays >= this.DEFAULT_MAX_CONSECUTIVE_DAYS) {
      return {
        canTake: false,
        reason: `User sudah bekerja ${consecutiveDays} hari berturut-turut (max: ${this.DEFAULT_MAX_CONSECUTIVE_DAYS})`,
        currentShifts,
        maxShifts,
        consecutiveDays
      };
    }

    // Check if user already has shift on target date
    const targetDateStart = new Date(targetDate);
    targetDateStart.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    const existingShift = await this.prisma.shift.findFirst({
      where: {
        userId,
        tanggal: {
          gte: targetDateStart,
          lte: targetDateEnd
        }
      }
    });

    if (existingShift) {
      return {
        canTake: false,
        reason: `User sudah memiliki shift pada tanggal ${targetDate.toISOString().split('T')[0]}`,
        currentShifts,
        maxShifts,
        consecutiveDays
      };
    }

    return {
      canTake: true,
      currentShifts,
      maxShifts,
      consecutiveDays
    };
  }
}
