import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LaporanService } from './laporan.service';
import { WorkloadMonitoringService } from '../services/workload-monitoring.service';

@Controller('laporan')
@UseGuards(JwtAuthGuard)
export class LaporanController {
  constructor(
    private readonly laporanService: LaporanService,
    private readonly workloadMonitoringService: WorkloadMonitoringService
  ) {}

  @Get('absensi')
  async getLaporanAbsensi(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('lokasiShift') lokasiShift?: string,
  ) {
    const filters = {
      startDate,
      endDate,
      userId: userId ? parseInt(userId) : undefined,
      status,
      lokasiShift,
    };
    
    return await this.laporanService.getLaporanAbsensi(filters);
  }

  @Get('shift')
  async getLaporanShift(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('tipeShift') tipeShift?: string,
  ) {
    const filters = {
      startDate,
      endDate,
      userId: userId ? parseInt(userId) : undefined,
      tipeShift,
    };
    
    return await this.laporanService.getLaporanShift(filters);
  }

  @Get('statistik')
  async getStatistik(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = { startDate, endDate };
    return await this.laporanService.getStatistik(filters);
  }

  @Get('ringkasan')
  async getRingkasan(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = { startDate, endDate };
    return await this.laporanService.getRingkasan(filters);
  }

  // NEW: Workload monitoring endpoints
  @Get('workload')
  async getWorkloadAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return await this.workloadMonitoringService.getWorkloadAnalysis(start, end);
  }

  @Get('workload-analysis')
  async getWorkloadAnalysisAlias(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return await this.workloadMonitoringService.getWorkloadAnalysis(start, end);
  }

  @Get('workload/user/:userId')
  async getUserWorkload(
    @Query('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userIdNum = parseInt(userId);
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    const allWorkload = await this.workloadMonitoringService.getWorkloadAnalysis(start, end);
    return allWorkload.find(w => w.userId === userIdNum) || null;
  }

  // NEW: Capacity monitoring endpoints
  @Get('capacity')
  async getLocationCapacityAnalysis() {
    return await this.workloadMonitoringService.getLocationCapacityAnalysis();
  }

  @Get('capacity/location/:location')
  async getLocationCapacity(
    @Query('location') location: string,
    @Query('date') date?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    return await this.workloadMonitoringService.canAcceptNewShift(location, targetDate);
  }

  @Get('capacity/check')
  async checkShiftAvailability(
    @Query('userId') userId: string,
    @Query('location') location: string,
    @Query('date') date: string,
  ) {
    const userIdNum = parseInt(userId);
    const targetDate = new Date(date);
    
    const userCheck = await this.workloadMonitoringService.canUserTakeMoreShifts(userIdNum, targetDate);
    const locationCheck = await this.workloadMonitoringService.canAcceptNewShift(location, targetDate);
    
    return {
      canSchedule: userCheck.canTake && locationCheck.canAccept,
      userCheck,
      locationCheck,
      recommendation: this.generateSchedulingRecommendation(userCheck, locationCheck)
    };
  }

  @Post('export/pdf')
  async exportPDF(
    @Body('type') type: 'absensi' | 'shift' | 'statistik',
    @Body('filters') filters: any,
  ) {
    return await this.laporanService.exportPDF(type, filters);
  }

  @Post('export/excel')
  async exportExcel(
    @Body('type') type: 'absensi' | 'shift' | 'statistik',
    @Body('filters') filters: any,
  ) {
    return await this.laporanService.exportExcel(type, filters);
  }

  private generateSchedulingRecommendation(
    userCheck: { canTake: boolean; reason?: string },
    locationCheck: { canAccept: boolean; reason?: string },
  ): string {
    if (userCheck.canTake && locationCheck.canAccept) {
      return 'Shift dapat dijadwalkan tanpa masalah.';
    }

    const issues: string[] = [];
    if (!userCheck.canTake && userCheck.reason) {
      issues.push(`User: ${userCheck.reason}`);
    }
    if (!locationCheck.canAccept && locationCheck.reason) {
      issues.push(`Lokasi: ${locationCheck.reason}`);
    }

    return `Tidak dapat dijadwalkan. ${issues.join('; ')}`;
  }
}
