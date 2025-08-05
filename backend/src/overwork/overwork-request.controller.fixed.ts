import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OverworkRequestService, OverworkRequestData } from './overwork-request.service';
import { ShiftValidationService } from '../services/shift-validation.service';

@Controller('overwork')
@UseGuards(JwtAuthGuard)
export class OverworkRequestController {
  constructor(
    private overworkService: OverworkRequestService,
    private validationService: ShiftValidationService,
  ) {}

  // Check if user can take new shifts
  @Get('eligibility/:userId')
  async checkUserEligibility(@Param('userId') userId: string) {
    const result = await this.validationService.canUserTakeNewShift(parseInt(userId));
    return {
      success: true,
      data: result
    };
  }

  // Create new overwork request
  @Post('request')
  async createOverworkRequest(@Body() data: OverworkRequestData) {
    try {
      const result = await this.overworkService.createOverworkRequest(data);
      return {
        success: true,
        message: 'Overwork request submitted successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create overwork request',
        data: null
      };
    }
  }

  // Get pending requests (for admin)
  @Get('requests/pending')
  async getPendingRequests() {
    try {
      const requests = await this.overworkService.getPendingOverworkRequests();
      return {
        success: true,
        data: requests,
        total: requests.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get pending requests',
        data: []
      };
    }
  }

  // Approve overwork request
  @Put('requests/:requestId/approve')
  async approveRequest(
    @Param('requestId') requestId: string,
    @Body() body: { adminId: number; adminNotes?: string }
  ) {
    try {
      const result = await this.overworkService.approveOverworkRequest(
        parseInt(requestId),
        body.adminId,
        body.adminNotes
      );
      return {
        success: true,
        message: 'Overwork request approved successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to approve request',
        data: null
      };
    }
  }

  // Reject overwork request
  @Put('requests/:requestId/reject')
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Body() body: { adminId: number; rejectionReason: string }
  ) {
    try {
      const result = await this.overworkService.rejectOverworkRequest(
        parseInt(requestId),
        body.adminId,
        body.rejectionReason
      );
      return {
        success: true,
        message: 'Overwork request rejected',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to reject request',
        data: null
      };
    }
  }

  // Get user's overwork history
  @Get('user/:userId/history')
  async getUserHistory(@Param('userId') userId: string) {
    try {
      const history = await this.overworkService.getUserOverworkHistory(parseInt(userId));
      return {
        success: true,
        data: history,
        total: history.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get user history',
        data: []
      };
    }
  }

  // Get workload summary for specific user
  @Get('workload-summary/:userId')
  async getWorkloadSummary(
    @Param('userId') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    try {
      const monthNum = month ? parseInt(month) : undefined;
      const yearNum = year ? parseInt(year) : undefined;
      
      const summary = await this.validationService.getUserWorkloadSummary(
        parseInt(userId),
        monthNum,
        yearNum
      );
      
      return {
        success: true,
        data: summary
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get workload summary',
        data: null
      };
    }
  }

  // Get workload status for all users - simplified for frontend
  @Get('workload-status')
  async getWorkloadStatus(
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    try {
      const monthNum = month ? parseInt(month) : undefined;
      const yearNum = year ? parseInt(year) : undefined;
      
      const workloadData = await this.validationService.getAllUsersWorkloadStatus(monthNum, yearNum);
      
      // Transform data for frontend compatibility
      const transformedData = workloadData.map(user => ({
        userId: user.userId,
        namaDepan: user.namaDepan,
        namaBelakang: user.namaBelakang,
        employeeId: user.employeeId,
        currentShifts: user.workloadSummary.currentShifts,
        maxShifts: user.workloadSummary.maxShifts,
        totalHours: user.workloadSummary.totalHours,
        maxHours: user.workloadSummary.maxHours,
        status: user.workloadSummary.status,
        canTakeMoreShifts: user.workloadSummary.canTakeMoreShifts,
        requiresApproval: user.workloadSummary.requiresApproval,
        isDisabledForShifts: user.workloadSummary.isDisabledForShifts,
        overworkRequestRequired: user.workloadSummary.overworkRequestRequired
      }));

      return transformedData;
    } catch (error) {
      throw new Error(error.message || 'Failed to get workload status');
    }
  }

  // Bulk check multiple users eligibility
  @Post('bulk-eligibility-check')
  async bulkEligibilityCheck(@Body() body: { userIds: number[] }) {
    try {
      const results = await Promise.all(
        body.userIds.map(async (userId) => {
          const eligibility = await this.validationService.canUserTakeNewShift(userId);
          return {
            userId,
            eligibility
          };
        })
      );

      return {
        success: true,
        data: results,
        summary: {
          available: results.filter(r => r.eligibility.canTakeShift && !r.eligibility.needsOverworkRequest).length,
          needsRequest: results.filter(r => r.eligibility.needsOverworkRequest).length,
          disabled: results.filter(r => !r.eligibility.canTakeShift).length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to check bulk eligibility',
        data: []
      };
    }
  }
}
