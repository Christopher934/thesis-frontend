import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OverworkRequestService, OverworkRequestData } from '../services/overwork-request.service';
import { ShiftValidationService } from '../services/shift-validation.service';

@Controller('overwork')
@UseGuards(JwtAuthGuard)
export class OverworkRequestController {
  constructor(
    private overworkService: OverworkRequestService,
    private validationService: ShiftValidationService,
  ) {}

  // Check if user can take new shifts
  @Get('user/:userId/eligibility')
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
  @Get('admin/pending')
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
  @Put('admin/approve/:requestId')
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
  @Put('admin/reject/:requestId')
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

  // Get all users workload status with overwork eligibility
  @Get('admin/workload-overview')
  async getWorkloadOverview(
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    try {
      const monthNum = month ? parseInt(month) : undefined;
      const yearNum = year ? parseInt(year) : undefined;
      
      const workloadData = await this.validationService.getAllUsersWorkloadStatus(monthNum, yearNum);
      
      // Enhance with overwork eligibility
      const enhancedData = await Promise.all(
        workloadData.map(async (user) => {
          const eligibility = await this.validationService.canUserTakeNewShift(user.userId);
          return {
            ...user,
            eligibility,
            needsOverworkRequest: eligibility.needsOverworkRequest,
            isDisabled: !eligibility.canTakeShift
          };
        })
      );

      return {
        success: true,
        data: enhancedData,
        summary: {
          totalUsers: enhancedData.length,
          availableUsers: enhancedData.filter(u => u.eligibility.canTakeShift && !u.needsOverworkRequest).length,
          nearLimitUsers: enhancedData.filter(u => u.eligibility.canTakeShift && u.workloadSummary.status === 'APPROACHING_LIMIT').length,
          disabledUsers: enhancedData.filter(u => u.isDisabled).length,
          needsOverworkRequest: enhancedData.filter(u => u.needsOverworkRequest).length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get workload overview',
        data: []
      };
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
        message: error.message || 'Failed to check eligibility',
        data: []
      };
    }
  }
}
