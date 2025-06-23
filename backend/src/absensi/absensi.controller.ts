import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AbsensiService } from './absensi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAbsensiDto, UpdateAbsensiDto, AbsensiQueryDto } from './dto/absensi.dto';

@Controller('absensi')
@UseGuards(JwtAuthGuard)
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  @Post('masuk')
  async absenMasuk(@Request() req, @Body() createAbsensiDto: CreateAbsensiDto) {
    return this.absensiService.absenMasuk(req.user.userId, createAbsensiDto);
  }

  @Patch('keluar/:id')
  async absenKeluar(@Param('id') id: string, @Body() updateAbsensiDto: UpdateAbsensiDto) {
    return this.absensiService.absenKeluar(+id, updateAbsensiDto);
  }

  @Get('my-attendance')
  async getMyAttendance(@Request() req, @Query() query: AbsensiQueryDto) {
    return this.absensiService.getUserAttendance(req.user.userId, query);
  }

  @Get('today/:userId')
  async getTodayAttendanceForUser(@Param('userId') userId: string) {
    return this.absensiService.getTodayAttendance(+userId);
  }

  @Get('today')
  async getTodayAttendance(@Request() req) {
    return this.absensiService.getTodayAttendance(req.user.userId);
  }

  @Get('dashboard-stats')
  async getDashboardStats(@Request() req) {
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPERVISOR') {
      return this.absensiService.getAdminDashboardStats();
    }
    return this.absensiService.getUserDashboardStats(req.user.userId);
  }

  @Get('all')
  async getAllAttendance(@Request() req, @Query() query: AbsensiQueryDto) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERVISOR') {
      throw new Error('Unauthorized');
    }
    return this.absensiService.getAllAttendance(query);
  }

  @Patch('verify/:id')
  async verifyAttendance(@Request() req, @Param('id') id: string, @Body() updateData: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERVISOR') {
      throw new Error('Unauthorized');
    }
    return this.absensiService.verifyAttendance(+id, updateData);
  }

  @Get('reports/monthly')
  async getMonthlyReport(@Request() req, @Query() query: any) {
    return this.absensiService.getMonthlyReport(query);
  }

  @Get('reports/stats')
  async getAttendanceStats(@Request() req, @Query() query: any) {
    return this.absensiService.getAttendanceStats(query);
  }
}
