import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AdminShiftOptimizationService } from './admin-shift-optimization.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Define clean interfaces for TypeScript
interface UserRequest {
  user: {
    role: string;
  };
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

@Controller('admin/shift-optimization')
@UseGuards(JwtAuthGuard)
export class AdminShiftOptimizationController {
  constructor(
    private adminOptimizationService: AdminShiftOptimizationService,
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
    @Body() shiftRequests: ShiftRequestDto[],
  ): Promise<OptimalShiftsResponse> {
    this.checkAdminAccess(req);
    return this.adminOptimizationService.createOptimalShiftAssignments(shiftRequests);
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
}
