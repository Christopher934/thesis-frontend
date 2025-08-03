import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ShiftRequest {
  employeeId: number;
  date: Date;
  startTime: string;  // Time as HH:MM:SS format
  endTime: string;    // Time as HH:MM:SS format
  location: string;
  shiftType: 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA';
  requiredRole?: string;
}

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  warnings: string[];
  score: number; // 0-100, higher is better
}

interface ShiftAssignmentRule {
  id: string;
  name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  validate: (request: ShiftRequest, context: any) => Promise<{ valid: boolean; message?: string; score?: number }>;
}

@Injectable()
export class ShiftSchedulingRestrictionsService {
  constructor(private prisma: PrismaService) {}

  // 🔒 KONFIGURASI RESTRIKSI UTAMA
  private readonly RESTRICTIONS = {
    // 1. Restriksi Beban Kerja
    WORKLOAD: {
      MAX_HOURS_PER_WEEK: 40,
      MAX_HOURS_PER_MONTH: 160,
      MAX_SHIFTS_PER_MONTH: {
        'DOKTER': 18,
        'PERAWAT': 20,
        'STAF': 22,
        'SUPERVISOR': 16,
        'ADMIN': 14
      }
    },

    // 2. Restriksi Waktu & Jeda
    TIME_CONSTRAINTS: {
      MIN_REST_HOURS_BETWEEN_SHIFTS: 8,
      MAX_CONSECUTIVE_DAYS: 3,
      MAX_NIGHT_SHIFTS_PER_WEEK: 2,
      MIN_WEEKEND_REST_DAYS_PER_MONTH: 2
    },

    // 3. Restriksi Role & Jabatan
    ROLE_MAPPING: {
      'DOKTER': ['DOKTER', 'DOKTER_UMUM', 'DOKTER_SPESIALIS'],
      'PERAWAT': ['PERAWAT', 'PERAWAT_SENIOR', 'KEPALA_PERAWAT'],
      'STAF': ['STAF_MEDIS', 'STAF_NON_MEDIS'],
      'SUPERVISOR': ['SUPERVISOR', 'KEPALA_UNIT'],
      'ADMIN': ['ADMIN', 'STAF_ADMINISTRASI']
    },

    // 4. Restriksi Lokasi per Role
    LOCATION_ACCESS: {
      'DOKTER': ['ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 'KAMAR_OPERASI'],
      'PERAWAT': ['ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 'RECOVERY_ROOM'],
      'STAF': ['LABORATORIUM', 'FARMASI', 'RADIOLOGI', 'FISIOTERAPI', 'GIZI'],
      'SUPERVISOR': ['ALL_LOCATIONS'],
      'ADMIN': ['FARMASI', 'LABORATORIUM', 'RADIOLOGI']
    },

    // 5. Kapasitas per Shift
    SHIFT_REQUIREMENTS: {
      'ICU': { 'PAGI': { DOKTER: 1, PERAWAT: 3 }, 'SIANG': { DOKTER: 1, PERAWAT: 2 }, 'MALAM': { PERAWAT: 2 } },
      'GAWAT_DARURAT': { 'PAGI': { DOKTER: 2, PERAWAT: 4 }, 'SIANG': { DOKTER: 2, PERAWAT: 3 }, 'MALAM': { DOKTER: 1, PERAWAT: 2 } },
      'RAWAT_INAP': { 'PAGI': { PERAWAT: 4 }, 'SIANG': { PERAWAT: 3 }, 'MALAM': { PERAWAT: 2 } },
      'KAMAR_OPERASI': { 'PAGI': { DOKTER: 2, PERAWAT: 4 }, 'SIANG': { DOKTER: 1, PERAWAT: 2 } }
    }
  };

  /**
   * 🔍 VALIDASI UTAMA - Cek semua restriksi sebelum assign shift
   */
  private parseTimeToDate(timeString: string): Date {
    // Parse time string (HH:MM:SS or HH:MM) to today's date with that time
    const [hours, minutes, seconds = '00'] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(parseInt(seconds, 10));
    date.setMilliseconds(0);
    return date;
  }

  async validateShiftAssignment(request: ShiftRequest): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    let totalScore = 100;

    // Get user context
    const user = await this.getUserWithShifts(request.employeeId, request.date);
    if (!user) {
      return {
        isValid: false,
        violations: ['User tidak ditemukan'],
        warnings: [],
        score: 0
      };
    }

    // 1️⃣ RESTRIKSI BEBAN KERJA
    const workloadCheck = await this.validateWorkloadRestrictions(user, request);
    if (!workloadCheck.valid) {
      violations.push(workloadCheck.message!);
      totalScore -= 30;
    }

    // 2️⃣ RESTRIKSI KETERSEDIAAN
    const availabilityCheck = await this.validateAvailability(user, request);
    if (!availabilityCheck.valid) {
      violations.push(availabilityCheck.message!);
      totalScore -= 40;
    }

    // 3️⃣ RESTRIKSI ROLE & JABATAN
    const roleCheck = this.validateRoleRestrictions(user, request);
    if (!roleCheck.valid) {
      violations.push(roleCheck.message!);
      totalScore -= 35;
    }

    // 4️⃣ RESTRIKSI LOKASI
    const locationCheck = this.validateLocationAccess(user, request);
    if (!locationCheck.valid) {
      violations.push(locationCheck.message!);
      totalScore -= 25;
    }

    // 5️⃣ RESTRIKSI DUPLIKASI & KONFLIK WAKTU
    const conflictCheck = await this.validateTimeConflicts(user, request);
    if (!conflictCheck.valid) {
      violations.push(conflictCheck.message!);
      totalScore -= 50;
    }

    // 6️⃣ RESTRIKSI SHIFT BERUNTUN
    const consecutiveCheck = await this.validateConsecutiveShifts(user, request);
    if (!consecutiveCheck.valid) {
      violations.push(consecutiveCheck.message!);
      totalScore -= 20;
    }

    // 7️⃣ RESTRIKSI PEMERATAAN JADWAL
    const fairnessCheck = await this.validateFairness(user, request);
    if (!fairnessCheck.valid) {
      warnings.push(fairnessCheck.message!);
      totalScore -= 10;
    }

    // 8️⃣ RESTRIKSI PREFERENSI PEGAWAI
    const preferenceCheck = await this.validateUserPreferences(user, request);
    if (!preferenceCheck.valid) {
      warnings.push(preferenceCheck.message!);
      totalScore -= 5;
    }

    // 9️⃣ RESTRIKSI JUMLAH PERSONEL PER SHIFT
    const capacityCheck = await this.validateShiftCapacity(request);
    if (!capacityCheck.valid) {
      violations.push(capacityCheck.message!);
      totalScore -= 30;
    }

    // 🔟 RESTRIKSI KEBIJAKAN RUMAH SAKIT
    const policyCheck = this.validateHospitalPolicies(user, request);
    if (!policyCheck.valid) {
      violations.push(policyCheck.message!);
      totalScore -= 15;
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      score: Math.max(0, totalScore)
    };
  }

  /**
   * 1️⃣ VALIDASI BEBAN KERJA
   */
  private async validateWorkloadRestrictions(user: any, request: ShiftRequest): Promise<{ valid: boolean; message?: string }> {
    const role = user.role;
    const maxShiftsPerMonth = this.RESTRICTIONS.WORKLOAD.MAX_SHIFTS_PER_MONTH[role] || 20;
    
    // Hitung shift bulan ini
    const currentMonthShifts = user.shifts.filter(shift => {
      const shiftDate = new Date(shift.tanggal);
      const requestMonth = request.date.getMonth();
      const requestYear = request.date.getFullYear();
      return shiftDate.getMonth() === requestMonth && shiftDate.getFullYear() === requestYear;
    }).length;

    if (currentMonthShifts >= maxShiftsPerMonth) {
      return {
        valid: false,
        message: `❌ BEBAN KERJA: ${user.namaDepan} sudah mencapai batas maksimal ${maxShiftsPerMonth} shift per bulan (saat ini: ${currentMonthShifts})`
      };
    }

    // Hitung jam kerja mingguan
    const weeklyHours = this.calculateWeeklyHours(user.shifts, request.date);
    const shiftHours = this.calculateShiftDuration(
      this.parseTimeToDate(request.startTime), 
      this.parseTimeToDate(request.endTime)
    );
    
    if (weeklyHours + shiftHours > this.RESTRICTIONS.WORKLOAD.MAX_HOURS_PER_WEEK) {
      return {
        valid: false,
        message: `❌ BEBAN KERJA: Jam kerja mingguan akan melebihi ${this.RESTRICTIONS.WORKLOAD.MAX_HOURS_PER_WEEK} jam (${weeklyHours + shiftHours} jam)`
      };
    }

    return { valid: true };
  }

  /**
   * 2️⃣ VALIDASI KETERSEDIAAN
   */
  private async validateAvailability(user: any, request: ShiftRequest): Promise<{ valid: boolean; message?: string }> {
    // Skip leave and preference checking since models are not available yet
    // TODO: Add back when Leave and UserPreference models are ready
    return { valid: true };
  }

  /**
   * 3️⃣ VALIDASI ROLE & JABATAN
   */
  private validateRoleRestrictions(user: any, request: ShiftRequest): { valid: boolean; message?: string } {
    const userRole = user.role;
    const requiredRole = request.requiredRole;

    if (requiredRole && !this.RESTRICTIONS.ROLE_MAPPING[userRole]?.includes(requiredRole)) {
      return {
        valid: false,
        message: `❌ ROLE: ${user.namaDepan} (${userRole}) tidak sesuai untuk shift yang membutuhkan ${requiredRole}`
      };
    }

    return { valid: true };
  }

  /**
   * 4️⃣ VALIDASI AKSES LOKASI
   */
  private validateLocationAccess(user: any, request: ShiftRequest): { valid: boolean; message?: string } {
    const userRole = user.role;
    const allowedLocations = this.RESTRICTIONS.LOCATION_ACCESS[userRole] || [];

    if (!allowedLocations.includes('ALL_LOCATIONS') && !allowedLocations.includes(request.location)) {
      return {
        valid: false,
        message: `❌ LOKASI: ${user.namaDepan} (${userRole}) tidak memiliki akses ke ${request.location}`
      };
    }

    return { valid: true };
  }

  /**
   * 5️⃣ VALIDASI KONFLIK WAKTU
   */
  private async validateTimeConflicts(user: any, request: ShiftRequest): Promise<{ valid: boolean; message?: string }> {
    // Cek duplikasi di hari dan waktu yang sama
    const conflictingShifts = user.shifts.filter(shift => {
      const shiftDate = new Date(shift.tanggal);
      const isSameDay = shiftDate.toDateString() === request.date.toDateString();
      
      if (!isSameDay) return false;

      // Cek overlap waktu
      const existingStart = new Date(shift.jammulai);
      const existingEnd = new Date(shift.jamselesai);
      
      return this.hasTimeOverlap(
        this.parseTimeToDate(request.startTime), 
        this.parseTimeToDate(request.endTime),
        existingStart, 
        existingEnd
      );
    });

    if (conflictingShifts.length > 0) {
      return {
        valid: false,
        message: `❌ KONFLIK WAKTU: ${user.namaDepan} sudah memiliki shift di waktu yang sama`
      };
    }

    // Cek jeda minimum antar shift
    const lastShift = this.getLastShift(user.shifts, request.date);
    if (lastShift) {
      const restHours = this.calculateRestHours(
        new Date(lastShift.jamselesai), 
        this.parseTimeToDate(request.startTime)
      );
      if (restHours < this.RESTRICTIONS.TIME_CONSTRAINTS.MIN_REST_HOURS_BETWEEN_SHIFTS) {
        return {
          valid: false,
          message: `❌ JEDA SHIFT: Jeda istirahat terlalu singkat (${restHours} jam), minimum ${this.RESTRICTIONS.TIME_CONSTRAINTS.MIN_REST_HOURS_BETWEEN_SHIFTS} jam`
        };
      }
    }

    return { valid: true };
  }

  /**
   * 6️⃣ VALIDASI SHIFT BERUNTUN
   */
  private async validateConsecutiveShifts(user: any, request: ShiftRequest): Promise<{ valid: boolean; message?: string }> {
    const consecutiveDays = this.calculateConsecutiveDays(user.shifts, request.date);
    
    if (consecutiveDays >= this.RESTRICTIONS.TIME_CONSTRAINTS.MAX_CONSECUTIVE_DAYS) {
      return {
        valid: false,
        message: `❌ SHIFT BERUNTUN: ${user.namaDepan} sudah bekerja ${consecutiveDays} hari berturut-turut (max: ${this.RESTRICTIONS.TIME_CONSTRAINTS.MAX_CONSECUTIVE_DAYS})`
      };
    }

    // Cek shift malam beruntun
    if (request.shiftType === 'MALAM') {
      const nightShiftsThisWeek = this.countNightShiftsInWeek(user.shifts, request.date);
      if (nightShiftsThisWeek >= this.RESTRICTIONS.TIME_CONSTRAINTS.MAX_NIGHT_SHIFTS_PER_WEEK) {
        return {
          valid: false,
          message: `❌ SHIFT MALAM: ${user.namaDepan} sudah ${nightShiftsThisWeek} shift malam minggu ini (max: ${this.RESTRICTIONS.TIME_CONSTRAINTS.MAX_NIGHT_SHIFTS_PER_WEEK})`
        };
      }
    }

    return { valid: true };
  }

  /**
   * 7️⃣ VALIDASI PEMERATAAN JADWAL
   */
  private async validateFairness(user: any, request: ShiftRequest): Promise<{ valid: boolean; message?: string }> {
    // Hitung rata-rata shift tim
    const teamStats = await this.getTeamShiftStats(user.role, request.date);
    const userShiftCount = user.shifts.length;
    
    if (userShiftCount > teamStats.average * 1.2) {
      return {
        valid: false,
        message: `⚠️ PEMERATAAN: ${user.namaDepan} sudah memiliki shift lebih banyak dari rata-rata tim`
      };
    }

    return { valid: true };
  }

  /**
   * 8️⃣ VALIDASI PREFERENSI PEGAWAI
   */
  private async validateUserPreferences(user: any, request: ShiftRequest): Promise<{ valid: boolean; message?: string }> {
    // Skip UserPreference checking since model is not available yet
    // TODO: Add back when UserPreference model is ready
    return { valid: true };
  }

  /**
   * 9️⃣ VALIDASI KAPASITAS SHIFT
   */
  private async validateShiftCapacity(request: ShiftRequest): Promise<{ valid: boolean; message?: string }> {
    const requirements = this.RESTRICTIONS.SHIFT_REQUIREMENTS[request.location]?.[request.shiftType];
    
    if (!requirements) {
      return { valid: true }; // Tidak ada requirements khusus
    }

    // Hitung current assignment
    const currentAssignments = await this.prisma.shift.findMany({
      where: {
        tanggal: request.date,
        lokasishift: request.location,
        tipeshift: request.shiftType
      },
      include: { user: true }
    });

    // Group by role
    const roleCount = {};
    currentAssignments.forEach(shift => {
      const role = shift.user.role;
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    // Cek apakah masih butuh role ini
    for (const [role, required] of Object.entries(requirements)) {
      const requiredCount = typeof required === 'number' ? required : 0;
      if ((roleCount[role] || 0) >= requiredCount) {
        return {
          valid: false,
          message: `❌ KAPASITAS: Shift ${request.location} - ${request.shiftType} sudah memiliki cukup ${role} (${roleCount[role]}/${requiredCount})`
        };
      }
    }

    return { valid: true };
  }

  /**
   * 🔟 VALIDASI KEBIJAKAN RUMAH SAKIT
   */
  private validateHospitalPolicies(user: any, request: ShiftRequest): { valid: boolean; message?: string } {
    // Minimal 1 hari libur dalam 7 hari
    const weekStart = new Date(request.date);
    weekStart.setDate(weekStart.getDate() - 6);
    
    const weekShifts = user.shifts.filter((shift: any) => {
      const shiftDate = new Date(shift.tanggal);
      return shiftDate >= weekStart && shiftDate <= request.date;
    });

    const uniqueWorkDays = new Set(
      weekShifts.map((shift: any) => new Date(shift.tanggal).toDateString())
    );

    if (uniqueWorkDays.size >= 7) {
      return {
        valid: false,
        message: `❌ KEBIJAKAN: ${user.namaDepan} harus libur minimal 1 hari dalam 7 hari`
      };
    }

    // Cek overtime policy
    const monthlyHours = this.calculateMonthlyHours(user.shifts, request.date);
    const shiftHours = this.calculateShiftDuration(
      this.parseTimeToDate(request.startTime), 
      this.parseTimeToDate(request.endTime)
    );
    
    if (monthlyHours + shiftHours > this.RESTRICTIONS.WORKLOAD.MAX_HOURS_PER_MONTH) {
      return {
        valid: false,
        message: `❌ KEBIJAKAN: Jam kerja bulanan akan melebihi batas ${this.RESTRICTIONS.WORKLOAD.MAX_HOURS_PER_MONTH} jam`
      };
    }

    return { valid: true };
  }

  // 🔧 HELPER FUNCTIONS
  
  private async getUserWithShifts(userId: number, date: Date) {
    // Validate date input
    if (!date || isNaN(date.getTime())) {
      throw new Error(`Invalid date provided: ${date}`);
    }

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Validate computed dates
    if (isNaN(monthStart.getTime()) || isNaN(monthEnd.getTime())) {
      throw new Error(`Failed to compute valid month range for date: ${date}`);
    }

    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }
      }
    });
  }

  private calculateWeeklyHours(shifts: any[], targetDate: Date): number {
    const weekStart = new Date(targetDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.tanggal);
        return shiftDate >= weekStart && shiftDate <= weekEnd;
      })
      .reduce((total, shift) => {
        return total + this.calculateShiftDuration(
          new Date(shift.jammulai), 
          new Date(shift.jamselesai)
        );
      }, 0);
  }

  private calculateMonthlyHours(shifts: any[], targetDate: Date): number {
    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.tanggal);
        return shiftDate.getMonth() === targetDate.getMonth() && 
               shiftDate.getFullYear() === targetDate.getFullYear();
      })
      .reduce((total, shift) => {
        return total + this.calculateShiftDuration(
          new Date(shift.jammulai), 
          new Date(shift.jamselesai)
        );
      }, 0);
  }

  private calculateShiftDuration(startTime: Date, endTime: Date): number {
    let duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (duration < 0) duration += 24; // Handle overnight shifts
    return duration;
  }

  private hasTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && start2 < end1;
  }

  private calculateRestHours(lastShiftEnd: Date, nextShiftStart: Date): number {
    return (nextShiftStart.getTime() - lastShiftEnd.getTime()) / (1000 * 60 * 60);
  }

  private getLastShift(shifts: any[], beforeDate: Date) {
    return shifts
      .filter(shift => new Date(shift.tanggal) < beforeDate)
      .sort((a, b) => new Date(b.jamselesai).getTime() - new Date(a.jamselesai).getTime())[0];
  }

  private calculateConsecutiveDays(shifts: any[], targetDate: Date): number {
    let consecutive = 0;
    let checkDate = new Date(targetDate);
    checkDate.setDate(checkDate.getDate() - 1);

    while (consecutive < 7) {
      const hasShift = shifts.some(shift => {
        const shiftDate = new Date(shift.tanggal);
        return shiftDate.toDateString() === checkDate.toDateString();
      });

      if (hasShift) {
        consecutive++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return consecutive;
  }

  private countNightShiftsInWeek(shifts: any[], targetDate: Date): number {
    const weekStart = new Date(targetDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return shifts.filter(shift => {
      const shiftDate = new Date(shift.tanggal);
      return shiftDate >= weekStart && 
             shiftDate <= weekEnd && 
             shift.tipeshift === 'MALAM';
    }).length;
  }

  private async getTeamShiftStats(role: string, date: Date) {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const teamMembers = await this.prisma.user.findMany({
      where: { role: role as any },
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }
      }
    });

    const totalShifts = teamMembers.reduce((sum, member) => sum + member.shifts.length, 0);
    const average = teamMembers.length > 0 ? totalShifts / teamMembers.length : 0;

    return { total: totalShifts, average, memberCount: teamMembers.length };
  }

  private getDayName(dayIndex: number): string {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex];
  }

  /**
   * 🎯 OPTIMIZED ASSIGNMENT - Cari user terbaik untuk shift
   */
  async findBestUserForShift(request: ShiftRequest): Promise<{
    bestUser: any;
    score: number;
    alternatives: Array<{ user: any; score: number; issues: string[] }>;
  }> {
    // Validate input date
    if (!request.date || isNaN(request.date.getTime())) {
      throw new Error(`Invalid date provided for optimization: ${request.date}`);
    }

    // Get eligible users - filter by required role if specified
    const whereClause: any = {
      status: 'ACTIVE' // Only active users
    };
    
    if (request.requiredRole) {
      whereClause.role = request.requiredRole;
    } else {
      whereClause.role = {
        in: ['DOKTER', 'PERAWAT', 'STAF', 'SUPERVISOR', 'ADMIN'] as any[]
      };
    }

    const eligibleUsers = await this.prisma.user.findMany({
      where: whereClause
    });

    const candidates: Array<{ user: any; score: number; issues: string[] }> = [];

    for (const user of eligibleUsers) {
      try {
        // Validate user data before processing
        if (!user || !user.id) {
          console.warn('Skipping user with invalid data:', user);
          continue;
        }

        console.log(`Optimizing for user ${user.namaDepan} ${user.namaBelakang} (ID: ${user.id})`);
        const testRequest = { ...request, employeeId: user.id };
        const validation = await this.validateShiftAssignment(testRequest);
        
        if (validation.isValid || validation.score > 50) {
          candidates.push({
            user,
            score: validation.score,
            issues: validation.violations.concat(validation.warnings),
          });
        }
      } catch (error) {
        console.error(`Error processing user ${user.namaDepan || 'unknown'} ${user.namaBelakang || ''} (ID: ${user.id || 'unknown'}):`, error);
        // Continue with next user instead of failing completely
        continue;
      }
    }

    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);

    return {
      bestUser: candidates[0]?.user || null,
      score: candidates[0]?.score || 0,
      alternatives: candidates.slice(1, 5)
    };
  }

  // 📋 GET RESTRICTION RULES
  async getRestrictionRules() {
    return {
      workloadLimits: {
        maxHoursPerWeek: this.RESTRICTIONS.WORKLOAD.MAX_HOURS_PER_WEEK,
        maxHoursPerMonth: this.RESTRICTIONS.WORKLOAD.MAX_HOURS_PER_MONTH,
        maxShiftsPerMonth: this.RESTRICTIONS.WORKLOAD.MAX_SHIFTS_PER_MONTH
      },
      timeConstraints: {
        minRestHoursBetweenShifts: this.RESTRICTIONS.TIME_CONSTRAINTS.MIN_REST_HOURS_BETWEEN_SHIFTS,
        maxConsecutiveDays: this.RESTRICTIONS.TIME_CONSTRAINTS.MAX_CONSECUTIVE_DAYS,
        maxNightShiftsPerWeek: this.RESTRICTIONS.TIME_CONSTRAINTS.MAX_NIGHT_SHIFTS_PER_WEEK,
        minWeekendRestDaysPerMonth: this.RESTRICTIONS.TIME_CONSTRAINTS.MIN_WEEKEND_REST_DAYS_PER_MONTH
      },
      roleMapping: this.RESTRICTIONS.ROLE_MAPPING,
      locationAccess: this.RESTRICTIONS.LOCATION_ACCESS
    };
  }

  /**
   * 📊 ANALYTICS - Laporan compliance dan pelanggaran
   */
  async getRestrictionsComplianceReport(startDate: Date, endDate: Date): Promise<{
    totalShifts: number;
    compliantShifts: number;
    violations: Array<{ type: string; count: number; severity: string }>;
    topViolators: Array<{ userId: number; name: string; violationCount: number }>;
    recommendations: string[];
  }> {
    // Implementation for compliance reporting
    // This would analyze historical shift data for compliance
    
    return {
      totalShifts: 0,
      compliantShifts: 0,
      violations: [],
      topViolators: [],
      recommendations: []
    };
  }

  async analyzeTeamWorkload(role?: string) {
    try {
      const users = await this.prisma.user.findMany({
        where: role ? { role: role as any } : {},
        include: {
          shifts: {
            where: {
              tanggal: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          }
        }
      });

      const analysis = users.map(user => {
        const monthlyShifts = user.shifts.length;
        const maxShifts = this.RESTRICTIONS.WORKLOAD.MAX_SHIFTS_PER_MONTH[user.role] || 20;
        const utilizationRate = (monthlyShifts / maxShifts) * 100;
        
        let status = 'NORMAL';
        if (utilizationRate < 50) status = 'UNDERLOADED';
        else if (utilizationRate > 90) status = 'OVERWORKED';
        else if (utilizationRate > 80) status = 'HIGH';

        return {
          userId: user.id,
          employeeId: user.employeeId,
          name: `${user.namaDepan} ${user.namaBelakang}`,
          role: user.role,
          monthlyShifts,
          maxShifts,
          utilizationRate: Math.round(utilizationRate),
          status
        };
      });

      return {
        teamSize: users.length,
        averageUtilization: Math.round(analysis.reduce((sum, u) => sum + u.utilizationRate, 0) / analysis.length),
        overworkedCount: analysis.filter(u => u.status === 'OVERWORKED').length,
        underloadedCount: analysis.filter(u => u.status === 'UNDERLOADED').length,
        users: analysis.sort((a, b) => b.utilizationRate - a.utilizationRate)
      };
    } catch (error) {
      return {
        teamSize: 0,
        averageUtilization: 0,
        overworkedCount: 0,
        underloadedCount: 0,
        users: []
      };
    }
  }
}
