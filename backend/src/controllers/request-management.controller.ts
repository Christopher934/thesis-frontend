import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestManagementService } from '../services/request-management.service';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestManagementController {
  constructor(private requestService: RequestManagementService) {}

  // Overtime Request Endpoints
  @Post('overtime')
  async createOvertimeRequest(@Body() data: any) {
    return await this.requestService.createOvertimeRequest(data);
  }

  @Put('overtime/:id/approve')
  async approveOvertimeRequest(
    @Param('id') id: string,
    @Body() body: { reviewerId: number; approvedHours?: number; reviewerNotes?: string }
  ) {
    return await this.requestService.approveOvertimeRequest(
      parseInt(id),
      body.reviewerId,
      body.reviewerNotes,
    );
  }

  @Put('overtime/:id/reject')
  async rejectOvertimeRequest(
    @Param('id') id: string,
    @Body() body: { reviewerId: number; reviewerNotes: string }
  ) {
    return await this.requestService.rejectOvertimeRequest(
      parseInt(id),
      body.reviewerId,
      body.reviewerNotes,
    );
  }

  @Get('overtime')
  async getOvertimeRequests(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return await this.requestService.getOvertimeRequests(
      userId ? parseInt(userId) : undefined,
      status as any,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  // Leave Request Endpoints
  @Post('leave')
  async createLeaveRequest(@Body() data: any) {
    return await this.requestService.createLeaveRequest(data);
  }

  @Put('leave/:id/approve')
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body() body: { reviewerId: number; reviewerNotes?: string }
  ) {
    return await this.requestService.approveLeaveRequest(
      parseInt(id),
      body.reviewerId,
      body.reviewerNotes,
    );
  }

  @Put('leave/:id/reject')
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body() body: { reviewerId: number; reviewerNotes: string }
  ) {
    return await this.requestService.rejectLeaveRequest(
      parseInt(id),
      body.reviewerId,
      body.reviewerNotes,
    );
  }

  @Get('leave')
  async getLeaveRequests(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return await this.requestService.getLeaveRequests(
      userId ? parseInt(userId) : undefined,
      status as any,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  // Dashboard Stats
  @Get('stats')
  async getRequestStats() {
    return await this.requestService.getRequestStatistics();
  }
}

// Simple validation service for now
@Controller('validation')
@UseGuards(JwtAuthGuard)
export class ValidationController {
  @Post('shift')
  async validateShift(@Body() data: any) {
    // Basic validation logic
    const conflicts: any[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for basic conflicts
    if (!data.userId || !data.tanggal || !data.shiftType) {
      conflicts.push({
        type: 'MISSING_DATA',
        message: 'Data tidak lengkap untuk validasi',
        conflictingShifts: [],
        severity: 'HIGH'
      });
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings,
      suggestions: conflicts.length > 0 ? ['Lengkapi data yang diperlukan'] : []
    };
  }
}
