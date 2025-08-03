import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationIntegrationService } from '../notifikasi/notification-integration.service';
import { WorkloadMonitoringService } from '../services/workload-monitoring.service';
import { 
  SHIFT_TYPE_CONFIGS, 
  ShiftTypeConfig, 
  ShiftSchedule 
} from './shift-type.config';

export interface AutoScheduleRequest {
  userId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  shiftType: string; // GEDUNG_ADMINISTRASI, INSTALASI_GAWAT_DARURAT, etc.
  lokasishift: string;
  priority?: number; // 1-5, higher = more priority
  enforceCapacityLimits?: boolean; // Default: true
  overrideWorkloadLimits?: boolean; // Default: false
}

export interface AutoScheduleResult {
  success: boolean;
  message: string;
  scheduledShifts: any[];
  conflicts: any[];
  capacityBlocked: any[];
  workloadBlocked: any[];
  summary: {
    totalRequested: number;
    totalScheduled: number;
    totalBlocked: number;
    blockedByCapacity: number;
    blockedByWorkload: number;
    blockedByConflict: number;
  };
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflictType?: 'TIME_OVERLAP' | 'CAPACITY_FULL' | 'WORKLOAD_EXCEEDED' | 'CONSECUTIVE_LIMIT';
  message?: string;
  details?: any;
}

@Injectable()
export class AutoSchedulerService {
  private readonly logger = new Logger(AutoSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationIntegrationService,
    private workloadMonitoring: WorkloadMonitoringService,
  ) {}

  /**
   * Auto-schedule shifts with workload and capacity restrictions
   */
  async autoScheduleShifts(request: AutoScheduleRequest): Promise<AutoScheduleResult> {
    try {
      this.logger.log(`Starting enhanced auto-scheduling for user ${request.userId}`);

      // Initialize result tracking
      const result: AutoScheduleResult = {
        success: false,
        message: '',
        scheduledShifts: [],
        conflicts: [],
        capacityBlocked: [],
        workloadBlocked: [],
        summary: {
          totalRequested: 0,
          totalScheduled: 0,
          totalBlocked: 0,
          blockedByCapacity: 0,
          blockedByWorkload: 0,
          blockedByConflict: 0,
        }
      };

      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: request.userId },
        select: {
          id: true,
          namaDepan: true,
          namaBelakang: true,
          telegramChatId: true,
          role: true,
        }
      });

      if (!user) {
        return {
          ...result,
          message: 'User not found'
        };
      }

      // Get shift type configuration
      const shiftConfig = SHIFT_TYPE_CONFIGS[request.shiftType];
      if (!shiftConfig) {
        return {
          ...result,
          message: `Invalid shift type: ${request.shiftType}`
        };
      }

      // Generate date range
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const dateRange = this.generateDateRange(startDate, endDate);

      // Process each date
      for (const date of dateRange) {
        const dayOfWeek = this.getDayOfWeek(date);
        
        // Find applicable shifts for this day
        const applicableShifts = shiftConfig.shifts.filter(shift => 
          shift.days.includes(dayOfWeek)
        );

        for (const shiftSchedule of applicableShifts) {
          result.summary.totalRequested++;

          // Enhanced conflict checking with workload and capacity
          const conflictCheck = await this.checkEnhancedConflicts(
            request.userId,
            date,
            shiftSchedule,
            request.lokasishift,
            request.enforceCapacityLimits !== false,
            request.overrideWorkloadLimits === true
          );

          if (conflictCheck.hasConflict) {
            this.handleConflict(conflictCheck, date, shiftSchedule, result);
            continue;
          }

          // Create shift if no conflicts
          try {
            const shift = await this.createAutoShift(
              request.userId,
              date,
              shiftSchedule,
              request.lokasishift,
              request.shiftType
            );

            result.scheduledShifts.push(shift);
            result.summary.totalScheduled++;

            // Send notification
            await this.sendScheduleNotification(
              request.userId,
              date,
              shiftSchedule,
              request.lokasishift,
              shift.id,
              request.shiftType
            );

          } catch (createError) {
            this.logger.error('Failed to create shift:', createError);
            result.conflicts.push({
              date: date.toISOString().split('T')[0],
              shiftSchedule: shiftSchedule.name,
              conflict: 'Failed to create shift: ' + createError.message,
              type: 'CREATION_ERROR'
            });
            result.summary.totalBlocked++;
            result.summary.blockedByConflict++;
          }
        }
      }

      // Calculate summary
      result.summary.totalBlocked = 
        result.summary.blockedByCapacity + 
        result.summary.blockedByWorkload + 
        result.summary.blockedByConflict;

      // Determine overall success
      result.success = result.summary.totalScheduled > 0;
      result.message = this.generateSummaryMessage(result.summary);

      this.logger.log(`Auto-scheduling completed: ${result.summary.totalScheduled}/${result.summary.totalRequested} shifts scheduled`);

      return result;

    } catch (error) {
      this.logger.error('Error in enhanced auto-scheduling:', error);
      return {
        success: false,
        message: error.message || 'Failed to auto-schedule shifts',
        scheduledShifts: [],
        conflicts: [],
        capacityBlocked: [],
        workloadBlocked: [],
        summary: {
          totalRequested: 0,
          totalScheduled: 0,
          totalBlocked: 0,
          blockedByCapacity: 0,
          blockedByWorkload: 0,
          blockedByConflict: 0,
        }
      };
    }
  }

  /**
   * Enhanced conflict checking with workload and capacity validation
   */
  private async checkEnhancedConflicts(
    userId: number,
    date: Date,
    shiftSchedule: ShiftSchedule,
    location: string,
    enforceCapacityLimits: boolean,
    overrideWorkloadLimits: boolean
  ): Promise<ConflictCheck> {

    // 1. Check basic time conflicts
    const timeConflict = await this.checkTimeConflicts(userId, date, shiftSchedule);
    if (timeConflict.hasConflict) {
      return timeConflict;
    }

    // 2. Check capacity limits (if enforced)
    if (enforceCapacityLimits) {
      const capacityCheck = await this.workloadMonitoring.canAcceptNewShift(location, date);
      if (!capacityCheck.canAccept) {
        return {
          hasConflict: true,
          conflictType: 'CAPACITY_FULL',
          message: capacityCheck.reason || 'Location capacity exceeded',
          details: {
            currentCount: capacityCheck.currentCount,
            maxCapacity: capacityCheck.maxCapacity,
            location
          }
        };
      }
    }

    // 3. Check workload limits (unless overridden)
    if (!overrideWorkloadLimits) {
      const workloadCheck = await this.workloadMonitoring.canUserTakeMoreShifts(userId, date);
      if (!workloadCheck.canTake) {
        return {
          hasConflict: true,
          conflictType: 'WORKLOAD_EXCEEDED',
          message: workloadCheck.reason || 'User workload limit exceeded',
          details: {
            currentShifts: workloadCheck.currentShifts,
            maxShifts: workloadCheck.maxShifts,
            consecutiveDays: workloadCheck.consecutiveDays
          }
        };
      }
    }

    return { hasConflict: false };
  }

  /**
   * Check for time-based conflicts
   */
  private async checkTimeConflicts(
    userId: number,
    date: Date,
    shiftSchedule: ShiftSchedule
  ): Promise<ConflictCheck> {
    
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    // Check for existing shifts on the same day
    const existingShifts = await this.prisma.shift.findMany({
      where: {
        userId,
        tanggal: {
          gte: dateStart,
          lte: dateEnd
        }
      }
    });

    if (existingShifts.length > 0) {
      // Check for time overlap
      const [newStartHour, newStartMinute] = shiftSchedule.startTime.split(':').map(Number);
      const [newEndHour, newEndMinute] = shiftSchedule.endTime.split(':').map(Number);
      
      const newStart = newStartHour * 60 + newStartMinute;
      let newEnd = newEndHour * 60 + newEndMinute;
      
      // Handle overnight shifts
      if (newEnd <= newStart) {
        newEnd += 24 * 60; // Add 24 hours
      }

      for (const existingShift of existingShifts) {
        const existingStart = existingShift.jammulai;
        const existingEnd = existingShift.jamselesai;
        
        const existingStartMinutes = existingStart.getHours() * 60 + existingStart.getMinutes();
        let existingEndMinutes = existingEnd.getHours() * 60 + existingEnd.getMinutes();
        
        // Handle overnight existing shifts
        if (existingEndMinutes <= existingStartMinutes) {
          existingEndMinutes += 24 * 60;
        }

        // Check for overlap
        const hasOverlap = (newStart < existingEndMinutes && newEnd > existingStartMinutes);
        
        if (hasOverlap) {
          return {
            hasConflict: true,
            conflictType: 'TIME_OVERLAP',
            message: `Time overlap with existing shift (${existingStart.toTimeString().substring(0, 5)} - ${existingEnd.toTimeString().substring(0, 5)})`,
            details: {
              existingShiftId: existingShift.id,
              existingStart: existingStart.toTimeString().substring(0, 5),
              existingEnd: existingEnd.toTimeString().substring(0, 5)
            }
          };
        }
      }
    }

    return { hasConflict: false };
  }

  /**
   * Handle conflicts by categorizing them appropriately
   */
  private handleConflict(
    conflictCheck: ConflictCheck,
    date: Date,
    shiftSchedule: ShiftSchedule,
    result: AutoScheduleResult
  ): void {
    
    const conflictRecord = {
      date: date.toISOString().split('T')[0],
      shiftSchedule: shiftSchedule.name,
      conflict: conflictCheck.message,
      type: conflictCheck.conflictType,
      details: conflictCheck.details
    };

    switch (conflictCheck.conflictType) {
      case 'CAPACITY_FULL':
        result.capacityBlocked.push(conflictRecord);
        result.summary.blockedByCapacity++;
        break;
      case 'WORKLOAD_EXCEEDED':
      case 'CONSECUTIVE_LIMIT':
        result.workloadBlocked.push(conflictRecord);
        result.summary.blockedByWorkload++;
        break;
      case 'TIME_OVERLAP':
      default:
        result.conflicts.push(conflictRecord);
        result.summary.blockedByConflict++;
        break;
    }

    result.summary.totalBlocked++;
  }

  /**
   * Create auto-scheduled shift
   */
  private async createAutoShift(
    userId: number,
    date: Date,
    shiftSchedule: ShiftSchedule,
    lokasishift: string,
    shiftType: string
  ) {
    const [startHour, startMinute] = shiftSchedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = shiftSchedule.endTime.split(':').map(Number);

    const jammulai = new Date(date);
    jammulai.setHours(startHour, startMinute, 0, 0);

    const jamselesai = new Date(date);
    jamselesai.setHours(endHour, endMinute, 0, 0);

    // Handle overnight shifts
    if (jamselesai <= jammulai) {
      jamselesai.setDate(jamselesai.getDate() + 1);
    }

    return await this.prisma.shift.create({
      data: {
        userId,
        tanggal: date,
        jammulai,
        jamselesai,
        lokasishift,
        tipeshift: shiftType,
        isAutoAssigned: true,
        notes: `Auto-scheduled ${shiftType} - ${shiftSchedule.name}`,
      },
      include: {
        user: {
          select: {
            namaDepan: true,
            namaBelakang: true,
          }
        }
      }
    });
  }

  /**
   * Send notification for scheduled shift
   */
  private async sendScheduleNotification(
    userId: number,
    date: Date,
    shiftSchedule: ShiftSchedule,
    location: string,
    shiftId: number,
    shiftType: string
  ): Promise<void> {
    if (!this.notificationService) return;

    try {
      await this.notificationService.sendNotification(
        userId,
        'SHIFT_BARU_DITAMBAHKAN',
        '📅 Shift Otomatis Dijadwalkan',
        `Shift otomatis telah dijadwalkan untuk Anda pada ${date.toLocaleDateString('id-ID')} dari ${shiftSchedule.startTime} - ${shiftSchedule.endTime} di ${location}`,
        {
          shiftId,
          autoScheduled: true,
          shiftType,
          date: date.toISOString().split('T')[0],
          startTime: shiftSchedule.startTime,
          endTime: shiftSchedule.endTime,
          location
        }
      );
    } catch (notificationError) {
      this.logger.error('Failed to send schedule notification:', notificationError);
    }
  }

  /**
   * Generate summary message
   */
  private generateSummaryMessage(summary: any): string {
    if (summary.totalScheduled === 0) {
      return `Tidak ada shift yang dapat dijadwalkan. Blocked: ${summary.blockedByCapacity} oleh kapasitas, ${summary.blockedByWorkload} oleh beban kerja, ${summary.blockedByConflict} oleh konflik.`;
    }

    let message = `Berhasil menjadwalkan ${summary.totalScheduled} dari ${summary.totalRequested} shift yang diminta.`;
    
    if (summary.totalBlocked > 0) {
      message += ` Blocked: ${summary.blockedByCapacity} oleh kapasitas lokasi, ${summary.blockedByWorkload} oleh batas beban kerja, ${summary.blockedByConflict} oleh konflik jadwal.`;
    }

    return message;
  }

  /**
   * Generate date range between two dates
   */
  private generateDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Get day of week in format expected by shift configuration
   */
  private getDayOfWeek(date: Date): string {
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    return days[date.getDay()];
  }

  /**
   * Get enhanced scheduling recommendations
   */
  async getSchedulingRecommendations(
    userId: number,
    location: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    userWorkloadStatus: any;
    locationCapacityStatus: any;
    bestDates: string[];
    restrictions: string[];
    alternatives: any[];
  }> {
    
    // Get user workload analysis
    const workloadAnalysis = await this.workloadMonitoring.getWorkloadAnalysis(startDate, endDate);
    const userWorkload = workloadAnalysis.find(w => w.userId === userId);

    // Get location capacity analysis  
    const capacityAnalysis = await this.workloadMonitoring.getLocationCapacityAnalysis();
    const locationCapacity = capacityAnalysis.find(c => c.location === location);

    // Analyze best dates for scheduling
    const dateRange = this.generateDateRange(startDate, endDate);
    const bestDates: string[] = [];
    const restrictions: string[] = [];

    for (const date of dateRange) {
      const capacityCheck = await this.workloadMonitoring.canAcceptNewShift(location, date);
      const workloadCheck = await this.workloadMonitoring.canUserTakeMoreShifts(userId, date);

      if (capacityCheck.canAccept && workloadCheck.canTake) {
        bestDates.push(date.toISOString().split('T')[0]);
      } else {
        if (!capacityCheck.canAccept) {
          restrictions.push(`${date.toISOString().split('T')[0]}: ${capacityCheck.reason}`);
        }
        if (!workloadCheck.canTake) {
          restrictions.push(`${date.toISOString().split('T')[0]}: ${workloadCheck.reason}`);
        }
      }
    }

    // Generate alternatives
    const alternatives: Array<{
      type: string;
      suggestion: string;
      location: string;
      utilizationRate: number;
    }> = [];
    
    if (bestDates.length === 0) {
      // Suggest other locations if current location is full
      const otherLocations = capacityAnalysis
        .filter(c => c.location !== location && c.status === 'AVAILABLE')
        .slice(0, 3);
      
      alternatives.push(...otherLocations.map(loc => ({
        type: 'ALTERNATIVE_LOCATION',
        suggestion: `Coba lokasi ${loc.location} (kapasitas ${loc.utilizationRate}%)`,
        location: loc.location,
        utilizationRate: loc.utilizationRate
      })));
    }

    return {
      userWorkloadStatus: userWorkload,
      locationCapacityStatus: locationCapacity,
      bestDates,
      restrictions,
      alternatives
    };
  }
}
