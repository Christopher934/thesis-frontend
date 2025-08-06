import { Controller, Get, Post, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { AdminShiftOptimizationService, SchedulingResult } from './admin-shift-optimization.service';
import { AdminMonitoringService } from './admin-monitoring.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Define clean interfaces for TypeScript
interface UserRequest {
  user: {
    role: string;
  };
}

interface CreateOptimalShiftsDto {
  startDate: string;
  endDate: string;
  schedulingType: 'daily' | 'weekly' | 'monthly';
}

interface ShiftRequestDto {
  date: string;
  location: string;
  shiftType: 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA';
  requiredCount: number;
  preferredRoles?: string[];
  skillRequirements?: string[];
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

interface AdminDashboardResponse {
  workloadAlerts: any[];
  locationCapacity: any[];
  shiftDistribution: any[];
  upcomingConflicts: any[];
  summary: any;
}

interface WorkloadAlertsResponse {
  alerts: any[];
  summary: any;
}

interface LocationCapacityResponse {
  capacity: any;
  suggestions: string[];
}

interface OptimalShiftsResponse {
  assignments: any[];
  conflicts: any[];
  workloadAlerts: any[];
  locationCapacityStatus: any[];
  fulfillmentRate: number;
  recommendations: string[];
}

interface WeeklyScheduleRequest {
  startDate: string;
  locations: string[];
  shiftPattern?: {
    [location: string]: {
      PAGI?: number;
      SIANG?: number; 
      MALAM?: number;
    };
  };
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

interface MonthlyScheduleRequest {
  year: number;
  month: number;
  locations: string[];
  averageStaffPerShift?: {
    [location: string]: number;
  };
  workloadLimits?: {
    maxShiftsPerPerson: number;
    maxConsecutiveDays: number;
  };
}

@Controller('admin/shift-optimization')
@UseGuards(JwtAuthGuard)
export class AdminShiftOptimizationController {
  constructor(
    private adminOptimizationService: AdminShiftOptimizationService,
    private adminMonitoringService: AdminMonitoringService,
  ) {}

  private checkAdminAccess(req: UserRequest): void {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERVISOR') {
      throw new Error('Unauthorized: Admin access required');
    }
  }

  /**
   * Get comprehensive admin dashboard
   */
  @Get('dashboard')
  async getAdminDashboard(@Req() req: UserRequest): Promise<AdminDashboardResponse> {
    this.checkAdminAccess(req);
    return this.adminOptimizationService.getAdminDashboard();
  }

  /**
   * Get workload alerts for employee monitoring
   */
  @Get('workload-alerts')
  async getWorkloadAlerts(
    @Req() req: UserRequest,
    @Query('severity') severity?: 'NORMAL' | 'HIGH' | 'OVERWORKED' | 'CRITICAL',
  ): Promise<WorkloadAlertsResponse> {
    this.checkAdminAccess(req);

    const dashboard = await this.adminOptimizationService.getAdminDashboard();
    
    if (severity) {
      const filteredAlerts = dashboard.workloadAlerts.filter(
        (alert: any) => alert.status === severity,
      );
      return {
        alerts: filteredAlerts,
        summary: dashboard.summary,
      };
    }
    
    return {
      alerts: dashboard.workloadAlerts,
      summary: dashboard.summary,
    };
  }

  /**
   * Create optimal shift assignments using Hybrid Algorithm
   */
  @Post('create-optimal-shifts')
  async createOptimalShifts(
    @Req() req: UserRequest,
    @Body() createShiftsDto: CreateOptimalShiftsDto,
  ): Promise<OptimalShiftsResponse> {
    try {
      console.log('🔍 Admin Optimization - Received request:', JSON.stringify(createShiftsDto, null, 2));
      this.checkAdminAccess(req);
      
      console.log('✅ Admin access verified');
      
      // Generate shift requests based on date range and scheduling type
      const shiftRequests = this.generateShiftRequests(createShiftsDto);
      console.log('📅 Generated shift requests:', shiftRequests.length);
      
      const result = await this.adminOptimizationService.createOptimalShiftAssignments(shiftRequests);
      console.log('✅ Optimization completed successfully');
      
      return result;
    } catch (error) {
      console.error('❌ Admin Optimization Error:', error);
      throw error;
    }
  }

  private generateShiftRequests(dto: CreateOptimalShiftsDto): ShiftRequestDto[] {
    const requests: ShiftRequestDto[] = [];
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    
    // Define available locations (matching Prisma enum)
    const locations = ['ICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RADIOLOGI', 'LABORATORIUM', 'FARMASI'];
    const shiftTypes = ['PAGI', 'SIANG', 'MALAM'] as const;
    
    // Generate requests for each day in range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      // For each date, create requests for different locations and shifts
      locations.forEach(location => {
        shiftTypes.forEach(shiftType => {
          requests.push({
            date: dateStr,
            location,
            shiftType,
            requiredCount: 2, // Default requirement
            priority: 'NORMAL',
            preferredRoles: ['STAF', 'PERAWAT'],
          });
        });
      });
    }
    
    return requests;
  }

  /**
   * Check location capacity for specific date/location
   */
  @Get('location-capacity')
  async checkLocationCapacity(
    @Req() req: UserRequest,
    @Query('location') location: string,
    @Query('date') date: string,
  ): Promise<LocationCapacityResponse> {
    this.checkAdminAccess(req);

    const request: ShiftRequestDto = {
      date,
      location,
      shiftType: 'PAGI',
      requiredCount: 1,
      priority: 'NORMAL',
    };

    const result = await this.adminOptimizationService.createOptimalShiftAssignments([request]);
    
    return {
      capacity: result.locationCapacityStatus[0] || null,
      suggestions: result.recommendations || [],
    };
  }

  /**
   * Get report of overworked employees
   */
  @Get('overworked-report')
  async getOverworkedReport(@Req() req: UserRequest): Promise<any> {
    this.checkAdminAccess(req);

    const dashboard = await this.adminOptimizationService.getAdminDashboard();
    const overworkedEmployees = dashboard.workloadAlerts.filter(
      (alert: any) => alert.status === 'OVERWORKED' || alert.status === 'CRITICAL',
    );

    return {
      totalOverworked: overworkedEmployees.length,
      criticalCases: overworkedEmployees.filter((e: any) => e.status === 'CRITICAL').length,
      employees: overworkedEmployees,
      recommendations: this.generateSimpleRecommendations(overworkedEmployees),
      statistics: {
        averageShifts: overworkedEmployees.length > 0 
          ? overworkedEmployees.reduce((sum: number, emp: any) => sum + emp.currentShifts, 0) / overworkedEmployees.length
          : 0,
        maxConsecutiveDays: overworkedEmployees.length > 0
          ? Math.max(...overworkedEmployees.map((emp: any) => emp.consecutiveDays))
          : 0,
        affectedDepartments: [...new Set(overworkedEmployees.map((emp: any) => emp.role))],
      },
    };
  }

  /**
   * Generate capacity analysis
   */
  @Get('capacity-analysis')
  async getCapacityAnalysis(
    @Req() req: UserRequest,
    @Query('days') days: string = '7',
  ): Promise<any> {
    this.checkAdminAccess(req);

    const dashboard = await this.adminOptimizationService.getAdminDashboard();
    
    const suggestions = dashboard.locationCapacity
      .filter((loc: any) => loc.utilization > 90)
      .map((loc: any) => ({
        location: loc.location,
        message: `${loc.location} is at ${loc.utilization.toFixed(1)}% capacity - consider redistribution`,
        severity: loc.utilization > 95 ? 'CRITICAL' : 'HIGH',
      }));

    return {
      capacityStatus: dashboard.locationCapacity,
      highUtilization: suggestions,
      recommendations: suggestions.length > 0 
        ? ['Consider redistributing staff from high-utilization areas']
        : ['Capacity levels are within normal ranges'],
    };
  }

  private generateSimpleRecommendations(overworkedEmployees: any[]): string[] {
    const recommendations: string[] = [];

    if (overworkedEmployees.length > 0) {
      recommendations.push(
        `${overworkedEmployees.length} employees need workload redistribution`,
      );
    }

    const criticalCases = overworkedEmployees.filter((e: any) => e.status === 'CRITICAL');
    if (criticalCases.length > 0) {
      recommendations.push(
        `${criticalCases.length} employees need immediate rest periods`,
      );
    }

    return recommendations;
  }

  /**
   * Enhanced monitoring endpoints
   */
  
  // Get enhanced admin dashboard with monitoring features
  @Get('dashboard/enhanced')
  async getEnhancedDashboard(@Req() req: UserRequest) {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      return await this.adminMonitoringService.getEnhancedDashboard();
    } catch (error) {
      console.error('Enhanced dashboard error:', error);
      throw new Error('Failed to get enhanced dashboard');
    }
  }

  // Get user shift statistics for monitoring
  @Get('monitoring/users')
  async getUserStatistics(@Req() req: UserRequest, @Query('userId') userId?: string) {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      return await this.adminMonitoringService.getUserMonitoringStats();
    } catch (error) {
      console.error('User statistics error:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  // Get location capacity monitoring
  @Get('monitoring/locations')
  async getLocationCapacity(@Req() req: UserRequest) {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      return await this.adminMonitoringService.getLocationCapacityOverview();
    } catch (error) {
      console.error('Location capacity error:', error);
      throw new Error('Failed to get location capacity');
    }
  }

  // Update user statistics after shift changes
  @Post('monitoring/users/:userId/update')
  async updateUserStats(@Param('userId') userId: string, @Body() shiftData: any, @Req() req: UserRequest) {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const userIdNum = parseInt(userId);
      await this.adminMonitoringService.updateUserMonitoring(userIdNum);
      return { success: true, message: 'User statistics updated successfully' };
    } catch (error) {
      console.error('Update user stats error:', error);
      throw new Error('Failed to update user statistics');
    }
  }

  /**
   * AUTO SCHEDULE FOR WEEKLY AND MONTHLY PERIODS
   */

  // Generate weekly schedule automatically
  @Post('create-weekly-schedule')
  async createWeeklySchedule(@Body() request: WeeklyScheduleRequest, @Req() req: UserRequest) {
    this.checkAdminAccess(req);

    try {
      console.log('📅 Creating weekly schedule:', request);
      const result = await this.adminOptimizationService.createWeeklySchedule(request);
      return {
        success: true,
        weeklySchedule: result,
        message: `Generated ${result.totalShifts} shifts for week starting ${request.startDate}`
      };
    } catch (error) {
      console.error('Weekly schedule creation error:', error);
      throw new Error('Failed to create weekly schedule');
    }
  }

  // Generate monthly schedule automatically  
  @Post('create-monthly-schedule')
  async createMonthlySchedule(
    @Body() request: MonthlyScheduleRequest,
    @Req() req: UserRequest,
  ): Promise<{
    success: boolean;
    monthlySchedule: SchedulingResult;
    message: string;
    notification?: {
      type: 'success' | 'warning' | 'error' | 'info';
      title: string;
      message: string;
      actions?: Array<{
        label: string;
        action: string;
        style: 'primary' | 'secondary' | 'danger';
      }>;
      details?: any;
      errorBreakdown?: Array<{
        type: string;
        count: number;
        severity: string;
        message: string;
      }>;
    };
  }> {
    this.checkAdminAccess(req);

    try {
      console.log('📅 Creating monthly schedule:', request);
      const result =
        await this.adminOptimizationService.createMonthlySchedule(request);
      
      // Generate detailed notification with error breakdown
      const notification =
        await this.adminOptimizationService.getSchedulingNotification(result);
      
      return {
        success: result.success,
        monthlySchedule: result,
        message: notification.message,
        notification,
      };
    } catch (error) {
      console.error('Monthly schedule creation error:', error);
      throw new Error('Failed to create monthly schedule');
    }
  }

  // Get weekly schedule template suggestions
  @Get('weekly-template/:startDate')
  async getWeeklyTemplate(@Param('startDate') startDate: string, @Req() req: UserRequest) {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const template = await this.adminOptimizationService.generateWeeklyTemplate(startDate);
      return { success: true, template };
    } catch (error) {
      console.error('Weekly template error:', error);
      throw new Error('Failed to generate weekly template');
    }
  }

  // Get monthly schedule template suggestions
  @Get('monthly-template/:year/:month')
  async getMonthlyTemplate(@Param('year') year: string, @Param('month') month: string, @Req() req: UserRequest) {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const template = await this.adminOptimizationService.generateMonthlyTemplate(parseInt(year), parseInt(month));
      return { success: true, template };
    } catch (error) {
      console.error('Monthly template error:', error);
      throw new Error('Failed to generate monthly template');
    }
  }

  /**
   * TEST ENDPOINT: Test enhanced algorithm without authentication (development only)
   */
  @Post('test-enhanced-algorithm')
  async testEnhancedAlgorithm(
    @Body() testDto: { shiftRequests: ShiftRequestDto[] }
  ): Promise<any> {
    try {
      console.log('🧪 TEST ENDPOINT: Testing enhanced algorithm...');
      console.log('📋 Received test requests:', JSON.stringify(testDto, null, 2));
      
      const result = await this.adminOptimizationService.createOptimalShiftAssignments(testDto.shiftRequests);
      
      console.log('✅ Test completed successfully');
      return {
        success: true,
        ...result,
        testMode: true,
        message: 'Enhanced algorithm test completed'
      };
    } catch (error) {
      console.error('❌ Test failed:', error);
      return {
        success: false,
        error: error.message,
        testMode: true,
        message: 'Enhanced algorithm test failed'
      };
    }
  }
}
