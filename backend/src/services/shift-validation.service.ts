import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Shift, TipeShift } from '@prisma/client';

export interface ShiftConflict {
  type: 'OVERLAP' | 'TOO_CLOSE' | 'DOUBLE_BOOKING' | 'WORKLOAD_EXCEEDED';
  message: string;
  conflictingShifts: any[];
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: ShiftConflict[];
  warnings: string[];
  suggestions: string[];
}

@Injectable()
export class ShiftValidationService {
  constructor(private prisma: PrismaService) {}

  async validateShiftAssignment(
    userId: number,
    tanggal: Date,
    shiftType: TipeShift,
    lokasi: string,
    excludeShiftId?: number,
  ): Promise<ValidationResult> {
    const conflicts: ShiftConflict[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      // 1. Cek konflik waktu (overlap)
      const timeConflicts = await this.checkTimeConflicts(
        userId, tanggal, shiftType, excludeShiftId
      );
      conflicts.push(...timeConflicts);

      // 2. Cek shift berturut-turut (terlalu dekat)
      const proximityConflicts = await this.checkShiftProximity(
        userId, tanggal, shiftType, excludeShiftId
      );
      conflicts.push(...proximityConflicts);

      // 3. Cek double booking
      const doubleBooking = await this.checkDoubleBooking(
        userId, tanggal, shiftType, excludeShiftId
      );
      conflicts.push(...doubleBooking);

      // 4. Cek beban kerja berlebihan
      const workloadCheck = await this.checkWorkloadLimits(
        userId, tanggal, excludeShiftId
      );
      conflicts.push(...workloadCheck.conflicts);
      warnings.push(...workloadCheck.warnings);

      // 5. Generate suggestions
      if (conflicts.length > 0) {
        suggestions.push(...this.generateSuggestions(conflicts, tanggal, shiftType));
      }

      return {
        isValid: conflicts.filter(c => c.severity === 'HIGH').length === 0,
        conflicts,
        warnings,
        suggestions
      };

    } catch (error) {
      console.error('Error validating shift assignment:', error);
      return {
        isValid: false,
        conflicts: [{
          type: 'DOUBLE_BOOKING',
          message: 'Terjadi kesalahan saat validasi jadwal',
          conflictingShifts: [],
          severity: 'HIGH'
        }],
        warnings: ['Tidak dapat memvalidasi jadwal dengan sempurna'],
        suggestions: ['Coba lagi atau hubungi administrator']
      };
    }
  }

  private async checkTimeConflicts(
    userId: number,
    tanggal: Date,
    shiftType: TipeShift,
    excludeShiftId?: number,
  ): Promise<ShiftConflict[]> {
    const conflicts: ShiftConflict[] = [];
    
    // Get shift time ranges
    const shiftTimes = this.getShiftTimeRanges();
    const currentShiftTime = shiftTimes[shiftType];
    
    if (!currentShiftTime) return conflicts;

    // Check for overlapping shifts on the same day
    const whereClause: any = {
      userId,
      tanggal: {
        gte: new Date(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate()),
        lt: new Date(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate() + 1)
      }
    };

    if (excludeShiftId) {
      whereClause.id = { not: excludeShiftId };
    }

    const existingShifts = await this.prisma.shift.findMany({
      where: whereClause,
      include: {
        user: {
          select: { namaDepan: true, namaBelakang: true }
        }
      }
    });

    for (const shift of existingShifts) {
      const existingShiftType = shift.tipeEnum || shift.tipeshift as TipeShift;
      if (!existingShiftType) continue;

      const existingShiftTime = shiftTimes[existingShiftType];
      if (!existingShiftTime) continue;

      // Check for time overlap
      if (this.isTimeOverlap(currentShiftTime, existingShiftTime)) {
        conflicts.push({
          type: 'OVERLAP',
          message: `Konflik waktu dengan shift ${existingShiftType} yang sudah ada`,
          conflictingShifts: [shift],
          severity: 'HIGH'
        });
      }
    }

    return conflicts;
  }

  private async checkShiftProximity(
    userId: number,
    tanggal: Date,
    shiftType: TipeShift,
    excludeShiftId?: number,
  ): Promise<ShiftConflict[]> {
    const conflicts: ShiftConflict[] = [];
    
    // Check shifts 1 day before and after
    const dayBefore = new Date(tanggal);
    dayBefore.setDate(dayBefore.getDate() - 1);
    
    const dayAfter = new Date(tanggal);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const whereClause: any = {
      userId,
      tanggal: {
        gte: dayBefore,
        lte: dayAfter
      }
    };

    if (excludeShiftId) {
      whereClause.id = { not: excludeShiftId };
    }

    const nearbyShifts = await this.prisma.shift.findMany({
      where: whereClause,
      include: {
        user: {
          select: { namaDepan: true, namaBelakang: true }
        }
      }
    });

    for (const shift of nearbyShifts) {
      const existingShiftType = shift.tipeEnum || shift.tipeshift as TipeShift;
      if (existingShiftType && this.isTooClose(shift.tanggal, existingShiftType, tanggal, shiftType)) {
        conflicts.push({
          type: 'TOO_CLOSE',
          message: `Shift terlalu dekat dengan shift ${existingShiftType} pada ${shift.tanggal.toLocaleDateString()}`,
          conflictingShifts: [shift],
          severity: 'MEDIUM',
        });
      }
    }

    return conflicts;
  }

  private async checkDoubleBooking(
    userId: number,
    tanggal: Date,
    shiftType: TipeShift,
    excludeShiftId?: number,
  ): Promise<ShiftConflict[]> {
    const conflicts: ShiftConflict[] = [];

    const whereClause: any = {
      userId,
      tanggal,
      shiftType
    };

    if (excludeShiftId) {
      whereClause.id = { not: excludeShiftId };
    }

    const existingShift = await this.prisma.shift.findFirst({
      where: whereClause,
      include: {
        user: {
          select: { namaDepan: true, namaBelakang: true }
        }
      }
    });

    if (existingShift) {
      conflicts.push({
        type: 'DOUBLE_BOOKING',
        message: `Pegawai sudah memiliki shift ${shiftType} pada tanggal yang sama`,
        conflictingShifts: [existingShift],
        severity: 'HIGH'
      });
    }

    return conflicts;
  }

  private async checkWorkloadLimits(
    userId: number,
    tanggal: Date,
    excludeShiftId?: number,
  ): Promise<{ conflicts: ShiftConflict[], warnings: string[] }> {
    const conflicts: ShiftConflict[] = [];
    const warnings: string[] = [];

    // Get user's monthly limit (default 160 hours = 20 shifts of 8 hours)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        maxShiftsPerMonth: true,
        namaDepan: true,
        namaBelakang: true,
        workloadStatus: true
      }
    });

    if (!user) {
      conflicts.push({
        type: 'WORKLOAD_EXCEEDED',
        message: 'User tidak ditemukan',
        conflictingShifts: [],
        severity: 'HIGH'
      });
      return { conflicts, warnings };
    }

    const maxShiftsPerMonth = user.maxShiftsPerMonth || 20; // Default 160 hours / 8 hours per shift
    const maxHoursPerMonth = maxShiftsPerMonth * 8;

    // Check weekly workload (max 6 shifts per week)
    const weekStart = new Date(tanggal);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const whereClause: any = {
      userId,
      tanggal: {
        gte: weekStart,
        lte: weekEnd
      }
    };

    if (excludeShiftId) {
      whereClause.id = { not: excludeShiftId };
    }

    const weeklyShifts = await this.prisma.shift.count({
      where: whereClause
    });

    if (weeklyShifts >= 6) {
      conflicts.push({
        type: 'WORKLOAD_EXCEEDED',
        message: `${user.namaDepan} ${user.namaBelakang} sudah memiliki ${weeklyShifts} shift minggu ini (maksimal 6)`,
        conflictingShifts: [],
        severity: 'HIGH'
      });
    } else if (weeklyShifts >= 5) {
      warnings.push(`${user.namaDepan} akan memiliki ${weeklyShifts + 1} shift minggu ini (mendekati batas maksimal)`);
    }

    // Check monthly workload with custom limits
    const monthStart = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
    const monthEnd = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 0);

    const monthlyWhereClause: any = {
      userId,
      tanggal: {
        gte: monthStart,
        lte: monthEnd
      }
    };

    if (excludeShiftId) {
      monthlyWhereClause.id = { not: excludeShiftId };
    }

    // Get monthly shifts including overtime hours
    const monthlyShifts = await this.prisma.shift.findMany({
      where: monthlyWhereClause,
      select: {
        id: true,
        overtimeHours: true,
        tanggal: true
      }
    });

    const totalRegularShifts = monthlyShifts.length;
    const totalOvertimeHours = monthlyShifts.reduce((sum, shift) => sum + (shift.overtimeHours || 0), 0);
    const totalHours = (totalRegularShifts * 8) + totalOvertimeHours;

    // Check if user has reached monthly limit
    if (totalRegularShifts >= maxShiftsPerMonth) {
      // User has reached limit - completely disable normal shift assignment
      conflicts.push({
        type: 'WORKLOAD_EXCEEDED',
        message: `🚫 ${user.namaDepan} ${user.namaBelakang} sudah mencapai batas maksimal ${maxShiftsPerMonth} shift bulan ini (${totalHours}/${maxHoursPerMonth} jam). Status: TIDAK DAPAT MENAMBAH JADWAL LAGI. Untuk tambah jadwal, harus buat Overwork Request ke Admin.`,
        conflictingShifts: [],
        severity: 'HIGH'
      });

      // Update user status to indicate they've reached limit and are disabled
      await this.updateUserWorkloadStatus(userId, 'OVERWORKED');
      
      // Update user to be temporarily disabled for shift assignment
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          workloadStatus: 'OVERWORKED',
          // Add custom note indicating user needs overwork request
          status: 'ACTIVE' // Keep active but workload is overworked
        }
      });

      warnings.push(`⚠️  ${user.namaDepan} memerlukan OVERWORK REQUEST untuk menambah jadwal lebih lanjut`);
      
    } else if (totalRegularShifts >= (maxShiftsPerMonth * 0.9)) {
      // Warning when approaching 90% of limit
      const remainingShifts = maxShiftsPerMonth - totalRegularShifts;
      warnings.push(`${user.namaDepan} mendekati batas maksimal: ${remainingShifts} shift tersisa bulan ini`);
    }

    return { conflicts, warnings };
  }

  private getShiftTimeRanges() {
    return {
      PAGI: { start: '06:00', end: '14:00' },
      SIANG: { start: '14:00', end: '22:00' },
      MALAM: { start: '22:00', end: '06:00' }
    };
  }

  private isTimeOverlap(time1: { start: string, end: string }, time2: { start: string, end: string }): boolean {
    // Handle overnight shifts (like night shift 22:00-06:00)
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1 = parseTime(time1.start);
    const end1 = parseTime(time1.end);
    const start2 = parseTime(time2.start);
    const end2 = parseTime(time2.end);

    // Handle overnight shifts
    if (end1 < start1) { // time1 is overnight
      if (end2 < start2) { // time2 is also overnight
        return true; // Both overnight, definitely overlap
      } else {
        return start2 < end1 || end2 > start1;
      }
    } else if (end2 < start2) { // time2 is overnight
      return start1 < end2 || end1 > start2;
    } else {
      // Normal case: both shifts are within the same day
      return Math.max(start1, start2) < Math.min(end1, end2);
    }
  }

  private isTooClose(date1: Date, shift1: TipeShift, date2: Date, shift2: TipeShift): boolean {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Check if shifts are within 8 hours of each other
    if (hoursDiff < 24) {
      const shiftTimes = this.getShiftTimeRanges();
      const time1 = shiftTimes[shift1];
      const time2 = shiftTimes[shift2];

      if (time1 && time2) {
        // Night shift followed by morning shift is problematic
        if (shift1 === 'MALAM' && shift2 === 'PAGI' && hoursDiff < 24) {
          return true;
        }
        // Evening shift followed by morning shift needs at least 8 hours rest
        if (shift1 === 'SIANG' && shift2 === 'PAGI' && hoursDiff < 16) {
          return true;
        }
      }
    }

    return false;
  }

  private generateSuggestions(conflicts: ShiftConflict[], tanggal: Date, shiftType: TipeShift): string[] {
    const suggestions: string[] = [];

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'OVERLAP':
          suggestions.push('Pilih shift type yang berbeda atau tanggal yang berbeda');
          break;
        case 'TOO_CLOSE':
          suggestions.push('Berikan jeda minimal 8 jam antara dua shift');
          break;
        case 'DOUBLE_BOOKING':
          suggestions.push('Pilih pegawai lain atau ubah tanggal/shift type');
          break;
        case 'WORKLOAD_EXCEEDED':
          suggestions.push('Pertimbangkan untuk membagi beban kerja dengan pegawai lain');
          break;
      }
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }

  // Check if user can be assigned new shifts
  async canUserTakeNewShift(userId: number): Promise<{
    canTakeShift: boolean;
    reason: string;
    currentShifts: number;
    maxShifts: number;
    needsOverworkRequest: boolean;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        maxShiftsPerMonth: true,
        workloadStatus: true,
        namaDepan: true,
        namaBelakang: true,
        status: true
      }
    });

    if (!user) {
      return {
        canTakeShift: false,
        reason: 'User tidak ditemukan',
        currentShifts: 0,
        maxShifts: 0,
        needsOverworkRequest: false
      };
    }

    if (user.status !== 'ACTIVE') {
      return {
        canTakeShift: false,
        reason: 'User tidak aktif',
        currentShifts: 0,
        maxShifts: user.maxShiftsPerMonth || 20,
        needsOverworkRequest: false
      };
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentShifts = await this.prisma.shift.count({
      where: {
        userId,
        tanggal: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });

    const maxShifts = user.maxShiftsPerMonth || 20;

    if (currentShifts >= maxShifts) {
      return {
        canTakeShift: false,
        reason: `🚫 ${user.namaDepan} sudah mencapai batas maksimal ${maxShifts} shift bulan ini. TIDAK DAPAT MENAMBAH JADWAL LAGI tanpa Overwork Request.`,
        currentShifts,
        maxShifts,
        needsOverworkRequest: true
      };
    }

    if (currentShifts >= (maxShifts * 0.9)) {
      return {
        canTakeShift: true,
        reason: `⚠️  ${user.namaDepan} mendekati batas maksimal (${currentShifts}/${maxShifts}). Sisa ${maxShifts - currentShifts} shift.`,
        currentShifts,
        maxShifts,
        needsOverworkRequest: false
      };
    }

    return {
      canTakeShift: true,
      reason: `✅ ${user.namaDepan} masih bisa menambah shift (${currentShifts}/${maxShifts})`,
      currentShifts,
      maxShifts,
      needsOverworkRequest: false
    };
  }

  // Helper methods for workload management
  private checkOvertimeEligibility(
    userId: number,
    tanggal: Date,
  ): boolean {
    // TODO: Check overtime eligibility when OvertimeRequest model is available
    // For now, return false as a safe default
    console.log(`Checking overtime eligibility for user ${userId} on ${tanggal}`);
    return false;
  }

  private async updateUserWorkloadStatus(
    userId: number,
    status: 'NORMAL' | 'HIGH' | 'OVERWORKED',
  ): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { workloadStatus: status },
      });
    } catch (error) {
      console.error('Error updating user workload status:', error);
    }
  }

  // Get user workload summary
  async getUserWorkloadSummary(
    userId: number,
    month?: number,
    year?: number,
  ): Promise<{
    currentShifts: number;
    maxShifts: number;
    totalHours: number;
    maxHours: number;
    overtimeHours: number;
    status: 'AVAILABLE' | 'APPROACHING_LIMIT' | 'AT_LIMIT' | 'OVERWORKED' | 'DISABLED';
    canTakeMoreShifts: boolean;
    requiresApproval: boolean;
    isDisabledForShifts: boolean;
    overworkRequestRequired: boolean;
  }> {
    const now = new Date();
    const targetMonth = month ?? now.getMonth();
    const targetYear = year ?? now.getFullYear();

    const monthStart = new Date(targetYear, targetMonth, 1);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0);

    // Get user limits
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        maxShiftsPerMonth: true,
        workloadStatus: true,
        namaDepan: true,
        namaBelakang: true,
        status: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const maxShifts = user.maxShiftsPerMonth || 20;
    const maxHours = maxShifts * 8;

    // Get monthly shifts
    const monthlyShifts = await this.prisma.shift.findMany({
      where: {
        userId,
        tanggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        id: true,
        overtimeHours: true,
        tanggal: true,
      },
    });

    const currentShifts = monthlyShifts.length;
    const overtimeHours = monthlyShifts.reduce(
      (sum, shift) => sum + (shift.overtimeHours || 0),
      0,
    );
    const totalHours = currentShifts * 8 + overtimeHours;

    let status: 'AVAILABLE' | 'APPROACHING_LIMIT' | 'AT_LIMIT' | 'OVERWORKED' | 'DISABLED';
    let canTakeMoreShifts = true;
    let requiresApproval = false;
    let isDisabledForShifts = false;
    let overworkRequestRequired = false;

    // User is inactive
    if (user.status !== 'ACTIVE') {
      status = 'DISABLED';
      canTakeMoreShifts = false;
      isDisabledForShifts = true;
    }
    // User has reached maximum limit - COMPLETELY DISABLED for new shifts
    else if (currentShifts >= maxShifts) {
      status = 'DISABLED';
      canTakeMoreShifts = false;
      requiresApproval = false; // No approval can help, need overwork request
      isDisabledForShifts = true;
      overworkRequestRequired = true;
    }
    // User is approaching limit - still can take shifts but with warning
    else if (currentShifts >= maxShifts * 0.9) {
      status = 'APPROACHING_LIMIT';
      canTakeMoreShifts = true;
      requiresApproval = false;
    }
    // User is available for more shifts
    else {
      status = 'AVAILABLE';
      canTakeMoreShifts = true;
      requiresApproval = false;
    }

    return {
      currentShifts,
      maxShifts,
      totalHours,
      maxHours,
      overtimeHours,
      status,
      canTakeMoreShifts,
      requiresApproval,
      isDisabledForShifts,
      overworkRequestRequired,
    };
  }

  // Get all users with workload status
  async getAllUsersWorkloadStatus(
    month?: number,
    year?: number,
  ): Promise<
    Array<{
      userId: number;
      namaDepan: string;
      namaBelakang: string;
      employeeId: string;
      workloadSummary: any;
    }>
  > {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        namaDepan: true,
        namaBelakang: true,
        employeeId: true,
      },
    });

    const results: Array<{
      userId: number;
      namaDepan: string;
      namaBelakang: string;
      employeeId: string;
      workloadSummary: any;
    }> = [];
    for (const user of users) {
      const workloadSummary = await this.getUserWorkloadSummary(
        user.id,
        month,
        year,
      );
      results.push({
        userId: user.id,
        namaDepan: user.namaDepan,
        namaBelakang: user.namaBelakang,
        employeeId: user.employeeId,
        workloadSummary,
      });
    }

    return results;
  }

  // Helper method to get weekly shifts for a user
  async getUserWeeklyShifts(userId: number, date: Date = new Date()): Promise<number> {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Saturday

    return await this.prisma.shift.count({
      where: {
        userId,
        tanggal: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    });
  }

  // Helper method to get daily shifts for a user
  async getUserDailyShifts(userId: number, date: Date = new Date()): Promise<number> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return await this.prisma.shift.count({
      where: {
        userId,
        tanggal: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });
  }
}
