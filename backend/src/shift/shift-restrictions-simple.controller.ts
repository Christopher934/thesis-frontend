import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShiftSchedulingRestrictionsService } from '../services/shift-scheduling-restrictions.service';

interface ShiftAssignmentRequest {
  // Frontend format
  employeeId?: number;
  date?: string;
  shiftType?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  requiredRole?: string;
  
  // Legacy format for backward compatibility
  userId?: number;
  tanggal?: string;
  jammulai?: string;
  jamselesai?: string;
  lokasishift?: string;
  tipeshift?: 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA';
}

interface OptimizationRequest {
  tanggal: string;           // API field
  jammulai: string;          // API field
  jamselesai: string;        // API field  
  lokasishift: string;       // API field
  tipeshift: 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA'; // API field
  requiredRole?: string;
}

@Controller('shift-restrictions')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
export class ShiftRestrictionsController {
  constructor(
    private readonly restrictionsService: ShiftSchedulingRestrictionsService
  ) {}

  /**
   * 🔍 VALIDASI SINGLE SHIFT ASSIGNMENT
   */
  @Post('validate')
  async validateShiftAssignment(@Body() request: ShiftAssignmentRequest) {
    try {
      console.log('Received validation request:', JSON.stringify(request, null, 2));
      
      // Support both frontend and legacy format
      const userId = request.employeeId || request.userId;
      const date = request.date || request.tanggal;
      const shiftType = request.shiftType || request.tipeshift;
      const location = request.location || request.lokasishift;
      const startTime = request.startTime || request.jammulai;
      const endTime = request.endTime || request.jamselesai;

      console.log('Parsed values:', { userId, date, shiftType, location, startTime, endTime });

      // Validate required fields
      if (!userId) {
        throw new Error('employeeId or userId is required');
      }
      if (!date) {
        throw new Error('date or tanggal is required');
      }
      if (!shiftType) {
        throw new Error('shiftType or tipeshift is required');
      }
      if (!location) {
        throw new Error('location or lokasishift is required');
      }
      if (!startTime) {
        throw new Error('startTime or jammulai is required');
      }
      if (!endTime) {
        throw new Error('endTime or jamselesai is required');
      }

      // Transform request format to match service interface
      const shiftRequest = {
        employeeId: userId,
        date: new Date(date),
        startTime: startTime,
        endTime: endTime,
        location: location,
        shiftType: shiftType as 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA',
        requiredRole: request.requiredRole,
      };

      console.log('Final shift request:', JSON.stringify(shiftRequest, null, 2));

      const validation = await this.restrictionsService.validateShiftAssignment(shiftRequest);

      return {
        success: true,
        data: validation,
        message: validation.isValid
          ? `✅ Shift dapat diassign (score: ${validation.score}/100)`
          : `❌ Shift tidak dapat diassign (score: ${validation.score}/100)`,
      };
    } catch (error: any) {
      console.error('Validation error:', error);
      return {
        success: false,
        message: 'Error validating shift assignment',
        error: error.message,
      };
    }
  }

  /**
   * 🎯 OPTIMASI PENCARIAN USER TERBAIK
   */
  @Post('optimize')
  async optimizeShiftAssignment(@Body() request: OptimizationRequest) {
    try {
      const shiftRequest = {
        employeeId: 0,  // Not needed for optimization
        date: new Date(request.tanggal),
        startTime: `${request.jammulai}:00`,
        endTime: `${request.jamselesai}:00`,
        location: request.lokasishift,
        shiftType: request.tipeshift,
        requiredRole: request.requiredRole
      };

      const optimization = await this.restrictionsService.findBestUserForShift(shiftRequest);

      if (!optimization.bestUser) {
        return {
          success: false,
          message: '❌ Tidak ada user yang cocok untuk shift ini',
          data: {
            alternatives: optimization.alternatives.slice(0, 5).map((alt: any) => ({
              userId: alt.user?.id,
              name: `${alt.user?.namaDepan || 'Unknown'} ${alt.user?.namaBelakang || ''}`,
              role: alt.user?.role,
              score: alt.score,
              issues: alt.issues
            }))
          }
        };
      }

      return {
        success: true,
        data: {
          bestUser: {
            userId: optimization.bestUser.id,
            name: `${optimization.bestUser.namaDepan} ${optimization.bestUser.namaBelakang}`,
            role: optimization.bestUser.role,
            score: optimization.score,
            workloadStatus: optimization.bestUser.workloadStatus
          },
          alternatives: optimization.alternatives.slice(0, 3).map((alt: any) => ({
            userId: alt.user?.id,
            name: `${alt.user?.namaDepan || 'Unknown'} ${alt.user?.namaBelakang || ''}`,
            role: alt.user?.role,
            score: alt.score,
            issues: alt.issues
          })),
          shiftDetails: {
            date: request.tanggal,
            location: request.lokasishift,
            shiftType: request.tipeshift,
            startTime: request.jammulai,
            endTime: request.jamselesai
          }
        },
        message: `✅ User terbaik ditemukan dengan score ${optimization.score}/100`
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Error optimizing shift assignment',
        error: error.message
      };
    }
  }

  /**
   * 📋 DAPATKAN SEMUA ATURAN RESTRIKSI
   */
  @Get('rules')
  async getRestrictionRules() {
    try {
      const rules = await this.restrictionsService.getRestrictionRules();
      
      return {
        success: true,
        data: rules,
        message: 'Daftar aturan restriksi penjadwalan'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Error retrieving restriction rules',
        error: error.message
      };
    }
  }

  /**
   * 📈 ANALISIS WORKLOAD TEAM
   */
  @Get('workload-analysis')
  async getWorkloadAnalysis(@Query('role') role?: string) {
    try {
      const analysis = await this.restrictionsService.analyzeTeamWorkload(role);
      
      return {
        success: true,
        data: analysis,
        message: `Analisis workload${role ? ` untuk role ${role}` : ' semua team'}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Error analyzing workload',
        error: error.message
      };
    }
  }

  /**
   * 🔄 BULK VALIDATION UNTUK MULTIPLE SHIFTS
   */
  @Post('bulk-validate')
  async bulkValidateShifts(@Body() request: { shifts: ShiftAssignmentRequest[] }) {
    try {
      const results: Array<{ request: any; validation: any }> = [];
      
      for (const shiftReq of request.shifts) {
        if (!shiftReq.tanggal || !shiftReq.jammulai || !shiftReq.jamselesai) {
          results.push({
            request: shiftReq,
            validation: {
              isValid: false,
              violations: ['Data shift tidak lengkap'],
              details: { category: 'VALIDATION_ERROR' },
            },
          });
          continue;
        }

        const shiftRequest = {
          employeeId: shiftReq.userId || 0,
          date: new Date(shiftReq.tanggal),
          startTime: `${shiftReq.jammulai}:00`,
          endTime: `${shiftReq.jamselesai}:00`,
          location: shiftReq.lokasishift || '',
          shiftType: shiftReq.tipeshift || 'PAGI',
          requiredRole: shiftReq.requiredRole,
        };

        const validation = await this.restrictionsService.validateShiftAssignment(shiftRequest);
        results.push({
          request: shiftReq,
          validation
        });
      }

      const validCount = results.filter(r => r.validation.isValid).length;
      
      return {
        success: true,
        data: {
          results,
          summary: {
            total: results.length,
            valid: validCount,
            invalid: results.length - validCount,
            successRate: ((validCount / results.length) * 100).toFixed(1) + '%'
          }
        },
        message: `Bulk validation completed: ${validCount}/${results.length} shifts valid`
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Error in bulk validation',
        error: error.message
      };
    }
  }
}
