import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShiftSchedulingRestrictionsService, ShiftRequest } from '../services/shift-scheduling-restrictions.service';

interface ShiftAssignmentRequest {
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  shiftType: 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA';
  requiredRole?: string;
}

interface BulkShiftValidationRequest {
  shifts: {
    employeeId: number;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    shiftType: 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA';
    requiredRole?: string;
  }[];
}

interface ShiftOptimizationRequest {
  date: string;
  location: string;
  shiftType: 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA';
  requiredRole?: string;
}

@Controller('shift-restrictions')
@UseGuards(JwtAuthGuard)
export class ShiftRestrictionsController {
  constructor(
    private readonly restrictionsService: ShiftSchedulingRestrictionsService
  ) {}

  /**
   * 🔍 VALIDASI SINGLE SHIFT ASSIGNMENT
   * POST /shift-restrictions/validate
   */
  @Post('validate')
  async validateShiftAssignment(@Body() request: ShiftAssignmentRequest) {
    try {
            const shiftRequest: ShiftRequest = {
        employeeId: request.employeeId,
        date: new Date(request.date),
        startTime: request.startTime,
        endTime: request.endTime,
        location: request.location,
        shiftType: request.shiftType,
        requiredRole: request.requiredRole,
      };

      const validation = await this.restrictionsService.validateShiftAssignment(shiftRequest);

      return {
        success: true,
        data: {
          isValid: validation.isValid,
          score: validation.score,
          violations: validation.violations,
          warnings: validation.warnings,
          recommendation: this.getRecommendationMessage(validation)
        },
        message: validation.isValid 
          ? '✅ Shift dapat diassign'
          : `❌ Shift tidak dapat diassign (${validation.violations.length} pelanggaran)`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error validating shift assignment',
        error: error.message
      };
    }
  }

  /**
   * 🔍 VALIDASI BULK SHIFT ASSIGNMENTS
   * POST /shift-restrictions/validate-bulk
   */
  @Post('validate-bulk')
  async validateBulkShifts(@Body() request: BulkShiftValidationRequest) {
    try {
      const results: Array<{
        shiftId: string;
        employeeId: number;
        date: string;
        location: string;
        shiftType: string;
        isValid: boolean;
        score: number;
        violations: string[];
        warnings: string[];
      }> = [];
      let totalValid = 0;
      let totalViolations = 0;

      for (const shift of request.shifts) {
        const shiftRequest = {
          employeeId: shift.employeeId,
          date: new Date(shift.date),
          startTime: shift.startTime,
          endTime: shift.endTime,
          location: shift.location,
          shiftType: shift.shiftType,
          requiredRole: shift.requiredRole,
        };

        const validation = await this.restrictionsService.validateShiftAssignment(shiftRequest);
        
        results.push({
          shiftId: `${shift.employeeId}-${shift.date}-${shift.location}`,
          employeeId: shift.employeeId,
          date: shift.date,
          location: shift.location,
          shiftType: shift.shiftType,
          isValid: validation.isValid,
          score: validation.score,
          violations: validation.violations,
          warnings: validation.warnings,
        });

        if (validation.isValid) totalValid++;
        totalViolations += validation.violations.length;
      }

      return {
        success: true,
        data: {
          summary: {
            totalShifts: request.shifts.length,
            validShifts: totalValid,
            invalidShifts: request.shifts.length - totalValid,
            totalViolations,
            overallCompliance: (totalValid / request.shifts.length) * 100
          },
          details: results
        },
        message: `Validasi selesai: ${totalValid}/${request.shifts.length} shift valid`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error validating bulk shifts',
        error: error.message
      };
    }
  }

  /**
   * 🎯 OPTIMIZED SHIFT ASSIGNMENT - Cari user terbaik
   * POST /shift-restrictions/optimize
   */
  @Post('optimize')
  async optimizeShiftAssignment(@Body() request: ShiftOptimizationRequest) {
    try {
      const shiftRequest = {
        employeeId: 0, // Will be determined by optimization
        date: new Date(request.date),
        startTime: '08:00:00', // Default, will be adjusted
        endTime: '16:00:00',   // Default, will be adjusted
        location: request.location,
        shiftType: request.shiftType,
        requiredRole: request.requiredRole,
      };

      // Adjust times based on shift type
      const shiftTimes = this.getShiftTimes(request.shiftType);
      shiftRequest.startTime = shiftTimes.start;
      shiftRequest.endTime = shiftTimes.end;

      const optimization = await this.restrictionsService.findBestUserForShift(shiftRequest);

      if (!optimization.bestUser) {
        return {
          success: false,
          message: '❌ Tidak ada user yang memenuhi kriteria untuk shift ini',
          data: {
            alternatives: optimization.alternatives.map((alt) => ({
              employeeId: alt.user.id,
              name: `${alt.user.namaDepan} ${alt.user.namaBelakang}`,
              role: alt.user.role,
              score: alt.score,
              issues: alt.issues,
            }))
          }
        };
      }

      return {
        success: true,
        data: {
          recommendedUser: {
            employeeId: optimization.bestUser.id,
            name: `${optimization.bestUser.namaDepan} ${optimization.bestUser.namaBelakang}`,
            role: optimization.bestUser.role,
            email: optimization.bestUser.email,
            score: optimization.score,
          },
          alternatives: optimization.alternatives.slice(0, 3).map((alt) => ({
            employeeId: alt.user.id,
            name: `${alt.user.namaDepan} ${alt.user.namaBelakang}`,
            role: alt.user.role,
            score: alt.score,
            issues: alt.issues,
          })),
          shiftDetails: {
            date: request.date,
            location: request.location,
            shiftType: request.shiftType,
            startTime: shiftTimes.start,
            endTime: shiftTimes.end
          }
        },
        message: `✅ User terbaik ditemukan dengan score ${optimization.score}/100`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error optimizing shift assignment',
        error: error.message
      };
    }
  }

  /**
   * 📊 GET COMPLIANCE REPORT
   * GET /shift-restrictions/compliance-report?startDate=...&endDate=...
   */
  @Get('compliance-report')
  async getComplianceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const report = await this.restrictionsService.getRestrictionsComplianceReport(start, end);

      return {
        success: true,
        data: {
          period: {
            startDate,
            endDate,
            days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          },
          compliance: {
            totalShifts: report.totalShifts,
            compliantShifts: report.compliantShifts,
            complianceRate: report.totalShifts > 0 
              ? ((report.compliantShifts / report.totalShifts) * 100).toFixed(2) + '%'
              : '0%'
          },
          violations: report.violations,
          topViolators: report.topViolators,
          recommendations: report.recommendations
        },
        message: 'Laporan compliance berhasil diambil'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error generating compliance report',
        error: error.message
      };
    }
  }

  /**
   * 📋 GET RESTRICTION RULES INFO
   * GET /shift-restrictions/rules
   */
  @Get('rules')
  async getRestrictionRules() {
    return {
      success: true,
      data: {
        workloadLimits: {
          maxHoursPerWeek: 40,
          maxHoursPerMonth: 160,
          maxShiftsPerMonth: {
            'DOKTER': 18,
            'PERAWAT': 20,
            'STAF': 22,
            'SUPERVISOR': 16,
            'ADMIN': 14
          }
        },
        timeConstraints: {
          minRestHoursBetweenShifts: 8,
          maxConsecutiveDays: 3,
          maxNightShiftsPerWeek: 2,
          minWeekendRestDaysPerMonth: 2
        },
        roleMapping: {
          'DOKTER': ['DOKTER', 'DOKTER_UMUM', 'DOKTER_SPESIALIS'],
          'PERAWAT': ['PERAWAT', 'PERAWAT_SENIOR', 'KEPALA_PERAWAT'],
          'STAF': ['STAF_MEDIS', 'STAF_NON_MEDIS'],
          'SUPERVISOR': ['SUPERVISOR', 'KEPALA_UNIT'],
          'ADMIN': ['ADMIN', 'STAF_ADMINISTRASI']
        },
        locationAccess: {
          'DOKTER': ['ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 'KAMAR_OPERASI'],
          'PERAWAT': ['ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 'RECOVERY_ROOM'],
          'STAF': ['LABORATORIUM', 'FARMASI', 'RADIOLOGI', 'FISIOTERAPI', 'GIZI'],
          'SUPERVISOR': ['ALL_LOCATIONS'],
          'ADMIN': ['FARMASI', 'LABORATORIUM', 'RADIOLOGI']
        }
      },
      message: 'Daftar aturan restriksi penjadwalan'
    };
  }

  /**
   * 🔧 HELPER METHODS
   */
  private getRecommendationMessage(validation: any): string {
    if (validation.isValid) {
      if (validation.score >= 90) return '🟢 Sangat baik - Tidak ada masalah';
      if (validation.score >= 70) return '🟡 Baik - Ada beberapa peringatan minor';
      return '🟠 Cukup - Perhatikan peringatan yang ada';
    }

    if (validation.violations.length === 1) {
      return `🔴 Tidak dapat diassign: ${validation.violations[0]}`;
    }
    
    return `🔴 Tidak dapat diassign: ${validation.violations.length} pelanggaran ditemukan`;
  }

  private getShiftTimes(shiftType: string): { start: string; end: string } {
    const shiftTimes = {
      'PAGI': { start: '07:00:00', end: '15:00:00' },
      'SIANG': { start: '15:00:00', end: '23:00:00' },
      'MALAM': { start: '23:00:00', end: '07:00:00' },
      'ON_CALL': { start: '08:00:00', end: '17:00:00' },
      'JAGA': { start: '17:00:00', end: '08:00:00' }
    };

    return shiftTimes[shiftType] || { start: '08:00:00', end: '16:00:00' };
  }
}
