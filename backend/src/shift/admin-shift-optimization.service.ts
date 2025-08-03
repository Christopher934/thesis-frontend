import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ShiftCreationRequest {
  date: string;
  location: string;
  shiftType: 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA';
  requiredCount: number;
  preferredRoles?: string[];
  skillRequirements?: string[];
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

interface ShiftAssignment {
  userId: number;
  shiftDetails: ShiftCreationRequest;
  score: number;
  reason: string;
}

interface WorkloadAlert {
  userId: number;
  employeeId: string;
  name: string;
  role: string;
  currentShifts: number;
  consecutiveDays: number;
  status: 'NORMAL' | 'HIGH' | 'OVERWORKED' | 'CRITICAL';
  recommendation: string;
}

// Additional interfaces for weekly/monthly scheduling
interface WeeklyScheduleStats {
  totalShifts: number;
  successfulAssignments: number;
  conflicts: SchedulingConflict[];
  recommendations: string[];
}

interface MonthlyScheduleStats {
  totalShifts: number;
  successfulAssignments: number;
  conflicts: SchedulingConflict[];
  recommendations: string[];
  workloadDistribution: { [userId: number]: number };
}

interface SchedulingConflict {
  date: string;
  location: string;
  shiftType: string;
  error?: string;
  userId?: number;
}

interface WeeklyScheduleRequest {
  startDate: string;
  locations: string[];
  shiftPattern?: { [location: string]: { PAGI?: number; SIANG?: number; MALAM?: number; } };
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

interface MonthlyScheduleRequest {
  year: number;
  month: number;
  locations: string[];
  averageStaffPerShift?: { [location: string]: number };
  workloadLimits?: {
    maxShiftsPerPerson: number;
    maxConsecutiveDays: number;
  };
}

interface ShiftAssignmentExtended {
  userId: number;
  date: string;
  location: string;
  shiftType: string;
  startTime: Date;
  endTime: Date;
  priority: string;
}

@Injectable()
export class AdminShiftOptimizationService {
  constructor(private prisma: PrismaService) {}

  /**
   * HYBRID ALGORITHM: Greedy + Backtracking for Optimal Shift Assignment
   */
  async createOptimalShiftAssignments(
    requests: ShiftCreationRequest[]
  ): Promise<{
    assignments: ShiftAssignment[];
    createdShifts: any[];
    conflicts: any[];
    workloadAlerts: WorkloadAlert[];
    locationCapacityStatus: any[];
    fulfillmentRate: number;
    recommendations: string[];
  }> {
    console.log('🧠 Starting Hybrid Algorithm: Greedy + Backtracking');
    
    // Step 1: Get all available users with current workload
    const availableUsers = await this.getAvailableUsersWithWorkload();
    
    // Step 2: Check location capacity for each request
    const locationCapacityStatus = await Promise.all(
      requests.map(req => this.checkLocationCapacity(req))
    );
    
    // Step 3: Apply Greedy Algorithm first (fast initial assignment)
    const greedyAssignments = await this.greedyAssignment(requests, availableUsers);
    
    // Step 4: Apply Backtracking to optimize conflicts
    const optimizedAssignments = await this.backtrackingOptimization(
      greedyAssignments,
      availableUsers
    );
    
    // Step 5: Generate workload alerts
    const workloadAlerts = await this.generateWorkloadAlerts();
    
    // Step 6: Identify remaining conflicts
    const conflicts = await this.identifyConflicts(optimizedAssignments);
    
    // Step 7: Calculate fulfillment rate
    const totalRequested = requests.reduce((sum, req) => sum + req.requiredCount, 0);
    const fulfillmentRate = totalRequested > 0 ? (optimizedAssignments.length / totalRequested) * 100 : 100;
    
    // Step 8: Generate recommendations
    const recommendations = this.generateOptimizationRecommendations(
      conflicts, 
      workloadAlerts, 
      locationCapacityStatus
    );

    // Step 9: ACTUALLY CREATE SHIFTS IN DATABASE
    let createdShifts: any[] = [];
    if (optimizedAssignments.length > 0) {
      console.log('🚀 Creating shifts in database...');
      createdShifts = await this.createShiftsInDatabase(optimizedAssignments);
    }
    
    return {
      assignments: optimizedAssignments,
      createdShifts,
      conflicts,
      workloadAlerts,
      locationCapacityStatus,
      fulfillmentRate,
      recommendations,
    };
  }

  /**
   * GREEDY ALGORITHM: Assign shifts to best available users first
   */
  private async greedyAssignment(
    requests: ShiftCreationRequest[],
    availableUsers: any[]
  ): Promise<ShiftAssignment[]> {
    const assignments: ShiftAssignment[] = [];
    const userAssignmentCount = new Map<number, number>();
    
    console.log(`🎯 Greedy Assignment: Processing ${requests.length} requests with ${availableUsers.length} users`);
    
    // Sort requests by priority (URGENT -> HIGH -> NORMAL -> LOW)
    const sortedRequests = requests.sort((a, b) => {
      const priorityOrder = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    for (const request of sortedRequests) {
      console.log(`📋 Processing request for ${request.location} on ${request.date}, need ${request.requiredCount} users`);
      
      // Calculate fitness score for each user for this shift
      const userScores = availableUsers.map(user => ({
        user,
        score: this.calculateUserFitnessScore(user, request),
        currentAssignments: userAssignmentCount.get(user.id) || 0
      }));
      
      console.log(`📊 User scores:`, userScores.slice(0, 5).map(us => ({ 
        userId: us.user.id, 
        score: us.score 
      })));
      
      // Sort by score (highest first)
      userScores.sort((a, b) => b.score - a.score);
      
      // Greedily assign to top N users (based on requiredCount)
      const selectedUsers = userScores
        .filter(us => us.score >= 20) // Lower minimum fitness threshold to allow more assignments
        .slice(0, request.requiredCount);
        
      console.log(`✅ Selected ${selectedUsers.length}/${request.requiredCount} users for this request`);
      
      for (const userScore of selectedUsers) {
        assignments.push({
          userId: userScore.user.id,
          shiftDetails: request,
          score: userScore.score,
          reason: `Greedy selection: score ${userScore.score}/100`
        });
        
        // Update assignment count
        userAssignmentCount.set(
          userScore.user.id,
          (userAssignmentCount.get(userScore.user.id) || 0) + 1
        );
      }
    }
    
    console.log(`🎯 Greedy Assignment Complete: Generated ${assignments.length} assignments`);
    return assignments;
  }

  /**
   * BACKTRACKING ALGORITHM: Optimize assignments by resolving conflicts
   */
  private async backtrackingOptimization(
    initialAssignments: ShiftAssignment[],
    availableUsers: any[]
  ): Promise<ShiftAssignment[]> {
    const optimizedAssignments = [...initialAssignments];
    
    // Group assignments by date to check for conflicts
    const assignmentsByDate = this.groupAssignmentsByDate(optimizedAssignments);
    
    for (const [date, dayAssignments] of assignmentsByDate.entries()) {
      // Check for overloaded users (more than 1 shift per day)
      const userShiftCount = new Map<number, number>();
      
      for (const assignment of dayAssignments) {
        const currentCount = userShiftCount.get(assignment.userId) || 0;
        userShiftCount.set(assignment.userId, currentCount + 1);
      }
      
      // Find users with conflicts (multiple shifts same day)
      const conflictedUsers = Array.from(userShiftCount.entries())
        .filter(([userId, count]) => count > 1)
        .map(([userId]) => userId);
      
      // Apply backtracking for each conflicted user
      for (const userId of conflictedUsers) {
        await this.backtrackUserAssignments(
          userId,
          date,
          optimizedAssignments,
          availableUsers
        );
      }
    }
    
    return optimizedAssignments;
  }

  /**
   * Calculate fitness score for user-shift compatibility
   */
  private calculateUserFitnessScore(user: any, request: ShiftCreationRequest): number {
    let score = 50; // Base score
    
    // Role compatibility
    if (request.preferredRoles?.includes(user.role)) {
      score += 25;
    }
    
    // Location experience
    const locationExperience = user.shifts?.filter(
      (shift: any) => shift.lokasiEnum === request.location
    ).length || 0;
    
    if (locationExperience > 5) score += 20;
    else if (locationExperience > 0) score += 10;
    
    // Workload balance (prefer users with fewer shifts)
    const currentShiftCount = user.shifts?.length || 0;
    if (currentShiftCount < 10) score += 15;
    else if (currentShiftCount < 15) score += 10;
    else if (currentShiftCount > 20) score -= 20;
    
    // Consecutive days check (fatigue prevention)
    const consecutiveDays = this.calculateConsecutiveDays(user, request.date);
    if (consecutiveDays >= 5) score -= 30;
    else if (consecutiveDays >= 3) score -= 15;
    
    // Availability check
    const hasConflict = this.checkDateConflict(user, request.date);
    if (hasConflict) score = 0; // Unavailable
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Admin Dashboard: Get workload alerts for monitoring
   */
  async getAdminDashboard() {
    const workloadAlerts = await this.generateWorkloadAlerts();
    const locationCapacity = await this.getLocationCapacityOverview();
    const shiftDistribution = await this.getShiftDistributionStats();
    const upcomingConflicts = await this.getUpcomingConflicts();
    
    return {
      workloadAlerts,
      locationCapacity,
      shiftDistribution,
      upcomingConflicts,
      summary: {
        totalEmployees: await this.prisma.user.count({ where: { status: 'ACTIVE' } }),
        activeShifts: await this.getTodayActiveShifts(),
        overworkedEmployees: workloadAlerts.filter(w => w.status === 'OVERWORKED').length,
        criticalEmployees: workloadAlerts.filter(w => w.status === 'CRITICAL').length,
        averageUtilization: await this.calculateUtilizationRate()
      }
    };
  }

  /**
   * Generate workload alerts for admin monitoring
   */
  private async generateWorkloadAlerts(): Promise<WorkloadAlert[]> {
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
            }
          }
        }
      }
    });
    
    const alerts: WorkloadAlert[] = [];
    
    for (const user of users) {
      const shiftCount = user.shifts.length;
      const consecutiveDays = await this.getConsecutiveDaysCount(user.id);
      
      let status: WorkloadAlert['status'] = 'NORMAL';
      let recommendation = 'Workload normal';
      
      if (shiftCount >= 25) {
        status = 'CRITICAL';
        recommendation = 'URGENT: Reduce shifts immediately to prevent burnout';
      } else if (shiftCount >= 20) {
        status = 'OVERWORKED';
        recommendation = 'Consider redistributing shifts to lighter-loaded staff';
      } else if (shiftCount >= 15) {
        status = 'HIGH';
        recommendation = 'Monitor closely, approaching maximum capacity';
      }
      
      if (consecutiveDays >= 7) {
        status = 'CRITICAL';
        recommendation = 'MANDATORY REST: Too many consecutive working days';
      }
      
      alerts.push({
        userId: user.id,
        employeeId: user.employeeId,
        name: `${user.namaDepan} ${user.namaBelakang}`,
        role: user.role,
        currentShifts: shiftCount,
        consecutiveDays,
        status,
        recommendation
      });
    }
    
    return alerts.sort((a, b) => {
      const statusOrder = { CRITICAL: 4, OVERWORKED: 3, HIGH: 2, NORMAL: 1 };
      return statusOrder[b.status] - statusOrder[a.status];
    });
  }

  /**
   * Check location capacity for a specific date/shift
   */
  private async checkLocationCapacity(request: ShiftCreationRequest) {
    // Map string location to enum value
    const locationEnum = this.mapLocationToEnum(request.location);
    
    const existingShifts = await this.prisma.shift.findMany({
      where: {
        tanggal: new Date(request.date),
        lokasiEnum: locationEnum
      },
      include: { user: true }
    });
    
    // Define maximum capacity per location
    const maxCapacity = this.getLocationMaxCapacity(request.location);
    const currentCount = existingShifts.length;
    const availableSlots = maxCapacity - currentCount;
    
    return {
      location: request.location,
      date: request.date,
      currentCount,
      maxCapacity,
      availableSlots,
      utilizationPercentage: (currentCount / maxCapacity) * 100,
      status: availableSlots >= request.requiredCount ? 'AVAILABLE' : 'FULL',
      existingAssignments: existingShifts.map(shift => ({
        userId: shift.userId,
        userName: `${shift.user.namaDepan} ${shift.user.namaBelakang}`,
        role: shift.user.role
      }))
    };
  }

  /**
   * Map string location to LokasiShift enum
   */
  private mapLocationToEnum(location: string): any {
    const locationMap: { [key: string]: string } = {
      ICU: 'ICU',
      GAWAT_DARURAT: 'GAWAT_DARURAT',
      RAWAT_INAP: 'RAWAT_INAP',
      RAWAT_JALAN: 'RAWAT_JALAN',
      LABORATORIUM: 'LABORATORIUM',
      FARMASI: 'FARMASI',
      RADIOLOGI: 'RADIOLOGI',
      GEDUNG_ADMINISTRASI: 'GEDUNG_ADMINISTRASI',
      GIZI: 'GIZI',
      KEAMANAN: 'KEAMANAN',
      LAUNDRY: 'LAUNDRY',
      CLEANING_SERVICE: 'CLEANING_SERVICE',
      SUPIR: 'SUPIR'
    };
    return locationMap[location] || location;
  }

  /**
   * Get shift type enum based on location
   */
  private getShiftTypeFromLocation(location: string): any {
    const shiftTypeMap = {
      'ICU': 'RAWAT_INAP_3_SHIFT',
      'NICU': 'RAWAT_INAP_3_SHIFT',
      'GAWAT_DARURAT': 'GAWAT_DARURAT_3_SHIFT',
      'RAWAT_INAP': 'RAWAT_INAP_3_SHIFT',
      'RAWAT_JALAN': 'RAWAT_JALAN',
      'LABORATORIUM': 'LABORATORIUM_2_SHIFT',
      'FARMASI': 'FARMASI_2_SHIFT',
      'RADIOLOGI': 'RADIOLOGI_2_SHIFT',
      'GEDUNG_ADMINISTRASI': 'GEDUNG_ADMINISTRASI',
      'GIZI': 'GIZI_2_SHIFT',
      'KEAMANAN': 'KEAMANAN_2_SHIFT',
      'LAUNDRY': 'LAUNDRY_REGULER',
      'CLEANING_SERVICE': 'CLEANING_SERVICE',
      'SUPIR': 'SUPIR_2_SHIFT'
    };
    
    return shiftTypeMap[location] || 'GEDUNG_ADMINISTRASI';
  }

  // Helper methods
  private groupAssignmentsByDate(assignments: ShiftAssignment[]) {
    const grouped = new Map<string, ShiftAssignment[]>();
    
    for (const assignment of assignments) {
      const date = assignment.shiftDetails.date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(assignment);
    }
    
    return grouped;
  }

  private async backtrackUserAssignments(
    userId: number,
    date: string,
    assignments: ShiftAssignment[],
    availableUsers: any[]
  ): Promise<void> {
    // Find alternative users for conflicted assignments
    const userAssignments = assignments.filter(
      a => a.userId === userId && a.shiftDetails.date === date
    );
    
    if (userAssignments.length > 1) {
      // Keep the highest priority assignment, reassign others
      const sortedAssignments = userAssignments.sort((a, b) => {
        const priorityOrder = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
        return priorityOrder[b.shiftDetails.priority] - priorityOrder[a.shiftDetails.priority];
      });
      
      // Keep the first (highest priority), reassign others
      for (let i = 1; i < sortedAssignments.length; i++) {
        const assignmentToReassign = sortedAssignments[i];
        
        // Find alternative user
        const alternativeUser = this.findAlternativeUser(
          assignmentToReassign,
          availableUsers,
          assignments
        );
        
        if (alternativeUser) {
          const index = assignments.indexOf(assignmentToReassign);
          assignments[index] = {
            ...assignmentToReassign,
            userId: alternativeUser.id,
            reason: `Backtracking reassignment: resolved conflict`
          };
        } else {
          // No alternative found, remove assignment
          const index = assignments.indexOf(assignmentToReassign);
          assignments.splice(index, 1);
        }
      }
    }
  }

  private findAlternativeUser(
    assignment: ShiftAssignment,
    availableUsers: any[],
    currentAssignments: ShiftAssignment[]
  ) {
    // Find users not already assigned on this date
    const assignedUserIds = new Set(
      currentAssignments
        .filter(a => a.shiftDetails.date === assignment.shiftDetails.date)
        .map(a => a.userId)
    );
    
    const availableAlternatives = availableUsers.filter(
      user => !assignedUserIds.has(user.id)
    );
    
    // Calculate scores and return best alternative
    const alternatives = availableAlternatives.map(user => ({
      user,
      score: this.calculateUserFitnessScore(user, assignment.shiftDetails)
    }));
    
    alternatives.sort((a, b) => b.score - a.score);
    
    return alternatives.length > 0 && alternatives[0].score > 50 
      ? alternatives[0].user 
      : null;
  }

  private async getAvailableUsersWithWorkload() {
    return this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // Next 30 days
            }
          }
        }
      }
    });
  }

  private calculateConsecutiveDays(user: any, targetDate: string): number {
    // Implementation for consecutive days calculation
    return 0; // Simplified for now
  }

  private checkDateConflict(user: any, targetDate: string): boolean {
    // Check if user already has shift on target date
    return user.shifts?.some((shift: any) => 
      shift.tanggal.toISOString().split('T')[0] === targetDate
    ) || false;
  }

  private async getConsecutiveDaysCount(userId: number): Promise<number> {
    // Implementation for consecutive days count
    return 0; // Simplified for now
  }

  private async getLocationCapacityOverview(): Promise<any[]> {
    const locations = [
      { code: 'ICU', name: 'Intensive Care Unit' },
      { code: 'NICU', name: 'Neonatal ICU' },
      { code: 'GAWAT_DARURAT', name: 'Unit Gawat Darurat' },
      { code: 'RAWAT_INAP', name: 'Rawat Inap' },
      { code: 'RAWAT_JALAN', name: 'Rawat Jalan' },
      { code: 'LABORATORIUM', name: 'Laboratorium' },
      { code: 'FARMASI', name: 'Farmasi' },
      { code: 'RADIOLOGI', name: 'Radiologi' }
    ];
    const overview: any[] = [];
    
    for (const location of locations) {
      const locationEnum = this.mapLocationToEnum(location.code);
      const todayShifts = await this.prisma.shift.count({
        where: {
          lokasiEnum: locationEnum as any,
          tanggal: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      });
      
      const maxCapacity = this.getLocationMaxCapacity(location.code);
      overview.push({
        location: location.code,
        name: location.name,
        current: todayShifts,
        capacity: maxCapacity,
        utilization: (todayShifts / maxCapacity) * 100,
        status: todayShifts >= maxCapacity ? 'Full' : todayShifts >= maxCapacity * 0.8 ? 'High' : 'Normal'
      });
    }
    
    return overview;
  }

  private async getShiftDistributionStats() {
    return this.prisma.shift.groupBy({
      by: ['lokasiEnum'],
      _count: { id: true },
      where: {
        tanggal: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      }
    });
  }

  private async getUpcomingConflicts() {
    // Implementation for detecting upcoming scheduling conflicts
    return [];
  }

  private async calculateUtilizationRate(): Promise<number> {
    const totalShifts = await this.prisma.shift.count({
      where: {
        tanggal: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });
    
    const totalCapacity = 200; // Total hospital capacity
    return (totalShifts / totalCapacity) * 100;
  }

  private async getTodayActiveShifts(): Promise<number> {
    return await this.prisma.shift.count({
      where: {
        tanggal: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });
  }

  private async identifyConflicts(assignments: ShiftAssignment[]): Promise<any[]> {
    // Implementation for identifying remaining conflicts
    return [];
  }

  private generateOptimizationRecommendations(
    conflicts: any[], 
    workloadAlerts: WorkloadAlert[], 
    locationCapacityStatus: any[]
  ): string[] {
    const recommendations: string[] = [];

    // Conflict-based recommendations
    if (conflicts.length > 0) {
      recommendations.push(`${conflicts.length} scheduling conflicts detected - manual review required`);
    }

    // Workload-based recommendations
    const overworkedCount = workloadAlerts.filter(alert => 
      alert.status === 'OVERWORKED' || alert.status === 'CRITICAL'
    ).length;
    
    if (overworkedCount > 0) {
      recommendations.push(`${overworkedCount} employees are overworked - consider workload redistribution`);
    }

    // Capacity-based recommendations
    const highCapacityLocations = locationCapacityStatus.filter(loc => 
      loc.utilizationPercentage > 90
    );
    
    if (highCapacityLocations.length > 0) {
      recommendations.push(`${highCapacityLocations.length} locations are near capacity - plan additional staff`);
    }

    // Default recommendation if all good
    if (recommendations.length === 0) {
      recommendations.push('All assignments optimized successfully');
    }

    return recommendations;
  }

  /**
   * ACTUALLY CREATE SHIFTS IN DATABASE
   * This method converts assignments into real database shifts
   */
  async createShiftsInDatabase(assignments: ShiftAssignment[]): Promise<any[]> {
    console.log('🔄 Creating', assignments.length, 'shifts in database...');
    
    const createdShifts: any[] = [];
    
    // Define varied locations for better distribution
    const locationRotation = [
      'ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 
      'LABORATORIUM', 'FARMASI', 'RADIOLOGI', 'KAMAR_OPERASI'
    ];
    
    // Define varied shift types with their times
    const shiftTypeVariations = {
      'PAGI': [
        { start: '06:00', end: '14:00' },
        { start: '07:00', end: '15:00' },
        { start: '08:00', end: '16:00' }
      ],
      'SIANG': [
        { start: '14:00', end: '22:00' },
        { start: '15:00', end: '23:00' },
        { start: '16:00', end: '00:00' }
      ],
      'MALAM': [
        { start: '22:00', end: '06:00' },
        { start: '23:00', end: '07:00' },
        { start: '00:00', end: '08:00' }
      ],
      'ON_CALL': [
        { start: '08:00', end: '17:00' },
        { start: '17:00', end: '08:00' }
      ],
      'JAGA': [
        { start: '12:00', end: '20:00' },
        { start: '20:00', end: '04:00' }
      ]
    };
    
    for (const assignment of assignments) {
      try {
        // Parse date and create shift times based on shift type
        const shiftDate = new Date(assignment.shiftDetails.date);
        
        // Add variety to locations - rotate through different locations instead of always using the same
        const locationIndex = Math.floor(Math.random() * locationRotation.length);
        const selectedLocation = assignment.shiftDetails.location || locationRotation[locationIndex];
        
        // Add variety to shift types - cycle through different shift types
        const availableShiftTypes = ['PAGI', 'SIANG', 'MALAM', 'ON_CALL'];
        const shiftTypeIndex = Math.floor(Math.random() * availableShiftTypes.length);
        const selectedShiftType = assignment.shiftDetails.shiftType || availableShiftTypes[shiftTypeIndex];
        
        // Get varied shift times based on type
        const shiftVariations = shiftTypeVariations[selectedShiftType] || shiftTypeVariations['PAGI'];
        const timeVariationIndex = Math.floor(Math.random() * shiftVariations.length);
        const selectedTimes = shiftVariations[timeVariationIndex];
        
        const startTime = selectedTimes.start;
        const endTime = selectedTimes.end;

        // Create proper datetime objects for shift times
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const startDateTime = new Date(shiftDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(shiftDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        // Handle overnight shifts (night shift ends next day)
        if (endDateTime <= startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }

        // Create shift in database
        const createdShift = await this.prisma.shift.create({
          data: {
            userId: assignment.userId,
            tanggal: shiftDate,
            jammulai: startDateTime,
            jamselesai: endDateTime,
            lokasishift: selectedLocation,
            tipeshift: selectedShiftType,
            tipeEnum: assignment.shiftDetails.shiftType as any, // PAGI, SIANG, MALAM etc.
            lokasiEnum: this.mapLocationToEnum(assignment.shiftDetails.location),
            // shiftType should be institution type, not time period
            // For now, let's determine it based on location
            shiftType: this.getShiftTypeFromLocation(assignment.shiftDetails.location),
          },
          include: {
            user: true
          }
        });

        console.log(`✅ Created shift for ${createdShift.user.namaDepan} ${createdShift.user.namaBelakang}`);
        createdShifts.push(createdShift);
      } catch (error) {
        console.error(`❌ Failed to create shift for user ${assignment.userId}:`, error);
      }
    }
    
    console.log(`🎉 Successfully created ${createdShifts.length} shifts in database`);
    return createdShifts;
  }

  /**
   * Get location maximum capacity based on hospital standards
   */
  private getLocationMaxCapacity(location: string): number {
    const capacityMap = {
      'ICU': 15,
      'NICU': 12,
      'GAWAT_DARURAT': 20,
      'RAWAT_INAP': 25,
      'RAWAT_JALAN': 15,
      'LABORATORIUM': 8,
      'FARMASI': 6,
      'RADIOLOGI': 5,
      'GEDUNG_ADMINISTRASI': 10,
      'GIZI': 8,
      'KEAMANAN': 5,
      'LAUNDRY': 4,
      'CLEANING_SERVICE': 6,
      'SUPIR': 3,
      'HEMODIALISA': 8,
      'FISIOTERAPI': 6,
      'KAMAR_OPERASI': 12
    };
    
    return capacityMap[location] || 10; // Default capacity
  }

  /**
   * WEEKLY AND MONTHLY SCHEDULE CREATION
   * Advanced features for bulk schedule generation
   */

  // Generate weekly schedule automatically
  async createWeeklySchedule(request: WeeklyScheduleRequest): Promise<any> {
    console.log('📅 Creating weekly schedule starting:', request.startDate);
    
    const startDate = new Date(request.startDate);
    
    // Expand locations with more variety
    const allLocations = [
      'ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 
      'LABORATORIUM', 'FARMASI', 'RADIOLOGI', 'KAMAR_OPERASI',
      'HEMODIALISA', 'FISIOTERAPI', 'KEAMANAN', 'LAUNDRY'
    ];
    
    // Use provided locations or rotate through varied locations
    const locations = request.locations?.length > 0 ? request.locations : 
      this.getRandomSubset(allLocations, 6); // Pick 6 random locations
    
    const weeklyShifts: ShiftAssignmentExtended[] = [];
    const stats: WeeklyScheduleStats = {
      totalShifts: 0,
      successfulAssignments: 0,
      conflicts: [],
      recommendations: []
    };

    // Generate shifts for 7 days
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      // Generate shifts for each location with variety
      for (const location of locations) {
        
        // Create more varied shift patterns based on day of week and location type
        const shiftPattern = this.generateVariedShiftPattern(location, day, request.shiftPattern?.[location]);

        // Add variety to shift types - don't always do the same pattern
        const shiftTypes = ['PAGI', 'SIANG', 'MALAM', 'ON_CALL'];
        const selectedShiftTypes = this.getRandomSubset(shiftTypes, Math.random() > 0.5 ? 3 : 2);
        
        for (const shiftType of selectedShiftTypes) {
          const shiftCount = shiftPattern[shiftType as keyof typeof shiftPattern] || 
                           Math.floor(Math.random() * 4) + 1; // Random 1-4 people
          
          if (shiftCount > 0) {
            const shiftRequest: ShiftCreationRequest = {
              date: currentDate.toISOString().split('T')[0],
              location,
              shiftType: shiftType as any,
              requiredCount: shiftCount,
              priority: request.priority || 'NORMAL'
            };

            try {
              const result = await this.createOptimalShiftAssignments([shiftRequest]);
              
              // Convert ShiftAssignment to ShiftAssignmentExtended
              const extendedAssignments: ShiftAssignmentExtended[] = result.assignments.map(assignment => ({
                userId: assignment.userId,
                date: assignment.shiftDetails.date,
                location: assignment.shiftDetails.location,
                shiftType: assignment.shiftDetails.shiftType,
                startTime: new Date(assignment.shiftDetails.date),
                endTime: new Date(assignment.shiftDetails.date),
                priority: assignment.shiftDetails.priority
              }));
              
              weeklyShifts.push(...extendedAssignments);
              stats.totalShifts += shiftCount;
              stats.successfulAssignments += result.assignments.length;
              
              if (result.conflicts.length > 0) {
                const convertedConflicts: SchedulingConflict[] = result.conflicts.map(conflict => ({
                  date: currentDate.toISOString().split('T')[0],
                  location,
                  shiftType,
                  error: 'Scheduling conflict detected'
                }));
                stats.conflicts.push(...convertedConflicts);
              }
            } catch (error: any) {
              console.error(`Failed to create shift for ${location} ${shiftType} on ${currentDate}:`, error);
              stats.conflicts.push({
                date: currentDate.toISOString().split('T')[0],
                location,
                shiftType,
                error: error.message
              });
            }
          }
        }
      }
    }

    // Generate weekly recommendations
    stats.recommendations = this.generateWeeklyRecommendations(stats, request);

    // Save weekly shifts to database
    const createdShifts = await this.createShiftsInDatabaseExtended(weeklyShifts);

    return {
      ...stats,
      createdShifts: createdShifts.length,
      weekStart: request.startDate,
      weekEnd: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      schedule: weeklyShifts
    };
  }

  // Generate monthly schedule automatically
  async createMonthlySchedule(request: MonthlyScheduleRequest): Promise<any> {
    console.log('📅 Creating monthly schedule for:', `${request.month}/${request.year}`);
    
    const year = request.year;
    const month = request.month; // 1-12
    const locations = request.locations || ['ICU', 'RAWAT_INAP', 'GAWAT_DARURAT', 'RAWAT_JALAN'];
    
    // Get days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthlyShifts: ShiftAssignmentExtended[] = [];
    const stats: MonthlyScheduleStats = {
      totalShifts: 0,
      successfulAssignments: 0,
      conflicts: [],
      recommendations: [],
      workloadDistribution: {}
    };

    // Workload limits
    const workloadLimits = request.workloadLimits || {
      maxShiftsPerPerson: 20,
      maxConsecutiveDays: 5
    };

    // Track user assignments to prevent overwork
    const userShiftCounts = new Map();

    // Generate shifts for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday
      
      // Skip Sundays for regular shifts (can be customized)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      for (const location of locations) {
        const avgStaff = request.averageStaffPerShift?.[location] || 3;
        
        // Adjust staff count for weekends
        const shiftCounts = {
          PAGI: isWeekend ? Math.ceil(avgStaff * 0.7) : avgStaff,
          SIANG: isWeekend ? Math.ceil(avgStaff * 0.8) : avgStaff,
          MALAM: Math.ceil(avgStaff * 0.6) // Night shifts always have fewer staff
        };

        for (const [shiftType, count] of Object.entries(shiftCounts)) {
          const shiftCount = Number(count);
          if (shiftCount > 0) {
            const shiftRequest: ShiftCreationRequest = {
              date: currentDate.toISOString().split('T')[0],
              location,
              shiftType: shiftType as any,
              requiredCount: shiftCount,
              priority: 'NORMAL'
            };

            try {
              const result = await this.createOptimalShiftAssignmentsWithLimits([shiftRequest], userShiftCounts, workloadLimits);
              
              // Convert to extended assignments
              const extendedAssignments: ShiftAssignmentExtended[] = result.assignments.map(assignment => ({
                userId: assignment.userId,
                date: assignment.shiftDetails.date,
                location: assignment.shiftDetails.location,
                shiftType: assignment.shiftDetails.shiftType,
                startTime: new Date(assignment.shiftDetails.date),
                endTime: new Date(assignment.shiftDetails.date),
                priority: assignment.shiftDetails.priority
              }));
              
              monthlyShifts.push(...extendedAssignments);
              stats.totalShifts += shiftCount;
              stats.successfulAssignments += result.assignments.length;
              
              // Update user shift counts
              result.assignments.forEach(assignment => {
                const userId = assignment.userId;
                userShiftCounts.set(userId, (userShiftCounts.get(userId) || 0) + 1);
              });
              
              if (result.conflicts.length > 0) {
                const convertedConflicts: SchedulingConflict[] = result.conflicts.map(conflict => ({
                  date: currentDate.toISOString().split('T')[0],
                  location,
                  shiftType,
                  error: 'Monthly scheduling conflict'
                }));
                stats.conflicts.push(...convertedConflicts);
              }
            } catch (error: any) {
              console.error(`Failed to create monthly shift for ${location} ${shiftType} on ${currentDate}:`, error);
            }
          }
        }
      }
    }

    // Calculate workload distribution
    stats.workloadDistribution = this.calculateWorkloadDistribution(userShiftCounts);
    stats.recommendations = this.generateMonthlyRecommendations(stats, request);

    // Save monthly shifts to database
    const createdShifts = await this.createShiftsInDatabaseExtended(monthlyShifts);

    return {
      ...stats,
      createdShifts: createdShifts.length,
      month: request.month,
      year: request.year,
      daysInMonth,
      schedule: monthlyShifts
    };
  }

  // Generate weekly template suggestions
  async generateWeeklyTemplate(startDate: string): Promise<any> {
    const locations = await this.getActiveLocations();
    const availableUsers = await this.getAvailableUsersWithWorkload();
    
    const template = {
      startDate,
      endDate: new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recommendedPattern: {} as any,
      capacityAnalysis: {} as any,
      suggestions: [] as string[]
    };

    // Generate recommended patterns for each location
    for (const location of locations) {
      const capacity = this.getLocationMaxCapacity(location.code);
      const currentUtilization = await this.getCurrentLocationUtilization(location.code);
      
      template.recommendedPattern[location.code] = {
        PAGI: Math.ceil(capacity * 0.6),
        SIANG: Math.ceil(capacity * 0.7),
        MALAM: Math.ceil(capacity * 0.4)
      };
      
      template.capacityAnalysis[location.code] = {
        maxCapacity: capacity,
        currentUtilization,
        recommendedStaffing: Math.ceil(capacity * 0.6)
      };
    }

    // Generate suggestions based on current workload
    const overworkedUsers = availableUsers.filter(u => u.shifts.length > 15); // More than 15 shifts
    const underutilizedUsers = availableUsers.filter(u => u.shifts.length < 5); // Less than 5 shifts
    
    if (overworkedUsers.length > 0) {
      template.suggestions.push('Consider reducing shifts for overworked employees');
    }
    
    if (underutilizedUsers.length > 0) {
      template.suggestions.push('Opportunity to assign more shifts to underutilized staff');
    }

    return template;
  }

  // Generate monthly template suggestions
  async generateMonthlyTemplate(year: number, month: number): Promise<any> {
    const daysInMonth = new Date(year, month, 0).getDate();
    const locations = await this.getActiveLocations();
    
    const template = {
      year,
      month,
      daysInMonth,
      totalWorkingDays: this.getWorkingDaysInMonth(year, month),
      recommendedDistribution: {} as any,
      workloadProjection: {} as any,
      suggestions: [] as string[]
    };

    // Calculate recommended distribution
    for (const location of locations) {
      const capacity = this.getLocationMaxCapacity(location.code);
      const workingDays = template.totalWorkingDays;
      
      template.recommendedDistribution[location.code] = {
        totalShiftsNeeded: workingDays * 3, // 3 shifts per day
        averageStaffPerShift: Math.ceil(capacity * 0.6),
        totalStaffHours: workingDays * 3 * 8 * Math.ceil(capacity * 0.6)
      };
    }

    // Project workload for users
    const users = await this.getAvailableUsersWithWorkload();
    const averageShiftsPerUser = Math.ceil((daysInMonth * locations.length * 3) / users.length);
    
    template.workloadProjection = {
      totalUsers: users.length,
      averageShiftsPerUser,
      estimatedMaxWorkload: (averageShiftsPerUser / 25) * 100, // Assuming 25 max shifts per month
      overworkRisk: averageShiftsPerUser > 20 ? 'HIGH' : averageShiftsPerUser > 15 ? 'MEDIUM' : 'LOW'
    };

    // Generate suggestions
    if (averageShiftsPerUser > 20) {
      template.suggestions.push('Consider hiring additional staff to reduce workload');
    }
    
    if (users.length < locations.length * 10) {
      template.suggestions.push('Staff to location ratio may be insufficient for optimal coverage');
    }

    return template;
  }

  // Helper methods for weekly/monthly scheduling

  private async createOptimalShiftAssignmentsWithLimits(requests: ShiftCreationRequest[], userShiftCounts: Map<number, number>, limits: any): Promise<any> {
    // Modified version of existing method that respects workload limits
    const result = await this.createOptimalShiftAssignments(requests);
    
    // Filter assignments that would exceed limits
    const filteredAssignments = result.assignments.filter(assignment => {
      const currentCount = userShiftCounts.get(assignment.userId) || 0;
      return currentCount < limits.maxShiftsPerPerson;
    });

    return {
      ...result,
      assignments: filteredAssignments
    };
  }

  private generateWeeklyRecommendations(stats: WeeklyScheduleStats, request: WeeklyScheduleRequest): string[] {
    const recommendations: string[] = [];
    
    const fulfillmentRate = (stats.successfulAssignments / stats.totalShifts) * 100;
    
    if (fulfillmentRate < 80) {
      recommendations.push('Low fulfillment rate. Consider adjusting staffing requirements or hiring additional staff.');
    }
    
    if (stats.conflicts.length > 0) {
      recommendations.push(`${stats.conflicts.length} scheduling conflicts detected. Review staff availability.`);
    }
    
    if (fulfillmentRate > 95) {
      recommendations.push('Excellent schedule fulfillment. Consider this pattern for future weeks.');
    }
    
    return recommendations;
  }

  private generateMonthlyRecommendations(stats: MonthlyScheduleStats, request: MonthlyScheduleRequest): string[] {
    const recommendations: string[] = [];
    
    const fulfillmentRate = (stats.successfulAssignments / stats.totalShifts) * 100;
    
    if (fulfillmentRate < 85) {
      recommendations.push('Monthly fulfillment rate below target. Consider workforce expansion.');
    }
    
    // Analyze workload distribution
    const workloadValues = Object.values(stats.workloadDistribution) as number[];
    const maxWorkload = Math.max(...workloadValues);
    const minWorkload = Math.min(...workloadValues);
    
    if (maxWorkload - minWorkload > 10) {
      recommendations.push('Uneven workload distribution detected. Consider rebalancing assignments.');
    }
    
    if (stats.conflicts.length > stats.totalShifts * 0.1) {
      recommendations.push('High conflict rate. Review staff availability patterns and constraints.');
    }
    
    return recommendations;
  }

  // Create specialized database method for extended shift assignments
  private async createShiftsInDatabaseExtended(assignments: ShiftAssignmentExtended[]): Promise<any[]> {
    const createdShifts: any[] = [];
    
    console.log(`🔄 Attempting to create ${assignments.length} shifts in database`);
    
    for (const assignment of assignments) {
      try {
        console.log(`Creating shift:`, {
          date: assignment.date,
          location: assignment.location,
          shiftType: assignment.shiftType,
          userId: assignment.userId
        });
        
        const shift = await this.prisma.shift.create({
          data: {
            tanggal: new Date(assignment.date),
            jammulai: assignment.startTime,
            jamselesai: assignment.endTime,
            lokasishift: assignment.location,
            userId: assignment.userId,
            lokasiEnum: assignment.location as any,
            tipeEnum: assignment.shiftType as any
          }
        });
        
        console.log(`✅ Shift created successfully:`, shift.id);
        createdShifts.push(shift);
      } catch (error) {
        console.error('❌ Failed to create shift in database:', error);
      }
    }
    
    console.log(`✅ Total shifts created: ${createdShifts.length}/${assignments.length}`);
    return createdShifts;
  }

  private calculateWorkloadDistribution(userShiftCounts: Map<number, number>): { [userId: number]: number } {
    const distribution: { [userId: number]: number } = {};
    for (const [userId, count] of userShiftCounts.entries()) {
      distribution[userId] = count;
    }
    return distribution;
  }

  /**
   * Helper functions for variety in scheduling
   */
  private getRandomSubset<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private generateVariedShiftPattern(location: string, dayOfWeek: number, providedPattern?: any) {
    // Base patterns by location type
    const locationPatterns: { [key: string]: any } = {
      'ICU': { PAGI: 4, SIANG: 3, MALAM: 2 },
      'NICU': { PAGI: 3, SIANG: 2, MALAM: 2 },
      'GAWAT_DARURAT': { PAGI: 5, SIANG: 4, MALAM: 3 },
      'RAWAT_INAP': { PAGI: 3, SIANG: 3, MALAM: 2 },
      'RAWAT_JALAN': { PAGI: 2, SIANG: 1, MALAM: 0 },
      'LABORATORIUM': { PAGI: 2, SIANG: 2, MALAM: 1 },
      'FARMASI': { PAGI: 2, SIANG: 2, MALAM: 1 },
      'RADIOLOGI': { PAGI: 2, SIANG: 1, MALAM: 1 },
      'KAMAR_OPERASI': { PAGI: 6, SIANG: 4, MALAM: 2 },
      'HEMODIALISA': { PAGI: 3, SIANG: 2, MALAM: 1 },
      'FISIOTERAPI': { PAGI: 2, SIANG: 2, MALAM: 0 },
      'KEAMANAN': { PAGI: 2, SIANG: 2, MALAM: 2 },
      'LAUNDRY': { PAGI: 2, SIANG: 1, MALAM: 0 }
    };

    // Get base pattern for location
    const basePattern = locationPatterns[location] || { PAGI: 2, SIANG: 2, MALAM: 1 };
    
    // Modify pattern based on day of week (weekend adjustments)
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      basePattern.PAGI = Math.max(1, Math.floor(basePattern.PAGI * 0.7));
      basePattern.SIANG = Math.max(1, Math.floor(basePattern.SIANG * 0.8));
      basePattern.MALAM = Math.max(1, basePattern.MALAM);
    }

    // Add some randomization for variety
    const variation = () => Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    
    return {
      PAGI: Math.max(1, basePattern.PAGI + variation()),
      SIANG: Math.max(1, basePattern.SIANG + variation()), 
      MALAM: Math.max(1, basePattern.MALAM + variation())
    };
  }

  private async getActiveLocations(): Promise<Array<{ code: string; name: string }>> {
    // Return active locations - this could be from database or config
    return [
      { code: 'ICU', name: 'Intensive Care Unit' },
      { code: 'RAWAT_INAP', name: 'Inpatient Ward' },
      { code: 'GAWAT_DARURAT', name: 'Emergency Room' },
      { code: 'RAWAT_JALAN', name: 'Outpatient Clinic' },
      { code: 'LABORATORIUM', name: 'Laboratory' },
      { code: 'FARMASI', name: 'Pharmacy' }
    ];
  }

  private async getCurrentLocationUtilization(locationCode: string): Promise<number> {
    const today = new Date();
    const shiftsToday = await this.prisma.shift.count({
      where: {
        tanggal: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        },
        lokasiEnum: locationCode as any
      }
    });
    
    const maxCapacity = this.getLocationMaxCapacity(locationCode);
    return (shiftsToday / maxCapacity) * 100;
  }

  private getWorkingDaysInMonth(year: number, month: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Count Monday to Saturday as working days (excluding Sunday)
      if (dayOfWeek !== 0) {
        workingDays++;
      }
    }
    
    return workingDays;
  }
}
