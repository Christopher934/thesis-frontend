import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LaporanService } from './laporan.service';

@Controller('laporan')
@UseGuards(JwtAuthGuard)
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

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
}
