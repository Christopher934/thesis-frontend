import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminMonitoringService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get basic user monitoring statistics
   */
  async getUserMonitoringStats(): Promise<any> {
    console.log('📊 Getting user monitoring statistics...');
    
    // Get all users with their shift counts
    const users = await this.prisma.user.findMany({
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
    });

    const userStats = users.map((user) => {
      const shiftsThisMonth = user.shifts.length;
      const totalShifts = 0; // Will be calculated separately
      
      // Simple workload calculation
      let workloadScore = 0;
      workloadScore += Math.min(30, (shiftsThisMonth / 20) * 30); // Max 30 points for monthly shifts
      
      const workloadStatus = this.getWorkloadStatus(workloadScore);
      
      return {
        userId: user.id,
        employeeId: user.employeeId || 'N/A',
        name: `${user.namaDepan} ${user.namaBelakang}`,
        role: 'Employee', 
        totalShifts,
        shiftsThisMonth,
        consecutiveDays: 0, // Will be calculated separately
        workloadScore: Math.round(workloadScore * 100) / 100,
        workloadStatus,
        recommendation: this.getRecommendation(workloadScore),
      };
    });

    // Sort by workload score descending
    userStats.sort((a, b) => b.workloadScore - a.workloadScore);

    return {
      totalUsers: userStats.length,
      averageWorkload: userStats.reduce((acc, u) => acc + u.workloadScore, 0) / userStats.length,
      highWorkloadUsers: userStats.filter((u) => u.workloadScore > 80).length,
      overworkedUsers: userStats.filter((u) => u.workloadScore > 90).length,
      users: userStats,
    };
  }

  /**
   * Get location capacity overview  
   */
  async getLocationCapacityOverview(): Promise<any> {
    console.log('🏢 Getting location capacity overview...');
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Get today's shifts by location
    const shiftsToday = await this.prisma.shift.findMany({
      where: {
        tanggal: {
          gte: todayStart,
          lt: todayEnd
        }
      },
      include: {
        user: true
      }
    });

    // Group by location
    const locationGroups = shiftsToday.reduce((acc, shift) => {
      const location = shift.lokasishift || 'UNKNOWN';
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(shift);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate capacity for each location
    const locationStats = Object.entries(locationGroups).map(([location, shifts]) => {
      const maxCapacity = this.getLocationMaxCapacity(location);
      const currentOccupancy = shifts.length;
      const utilizationRate = (currentOccupancy / maxCapacity) * 100;
      
      return {
        location: this.getLocationDisplayName(location),
        locationCode: location,
        maxCapacity,
        currentOccupancy,
        utilizationRate: Math.round(utilizationRate * 10) / 10,
        status: utilizationRate > 90 ? 'OVERLOADED' : 
                utilizationRate > 80 ? 'HIGH' : 
                utilizationRate > 50 ? 'NORMAL' : 'LOW',
        isOverloaded: utilizationRate > 90
      };
    });

    // Sort by utilization rate descending
    locationStats.sort((a, b) => b.utilizationRate - a.utilizationRate);

    return {
      totalLocations: locationStats.length,
      overloadedLocations: locationStats.filter(l => l.isOverloaded).length,
      averageUtilization: locationStats.reduce((acc, l) => acc + l.utilizationRate, 0) / locationStats.length || 0,
      locations: locationStats,
      summary: {
        totalShiftsToday: shiftsToday.length,
        mostUtilized: locationStats[0]?.location || 'None',
        leastUtilized: locationStats[locationStats.length - 1]?.location || 'None'
      }
    };
  }

  /**
   * Get enhanced admin dashboard combining all monitoring data
   */
  async getEnhancedDashboard(): Promise<any> {
    console.log('📊 Getting enhanced admin dashboard...');
    
    const [userStats, locationStats] = await Promise.all([
      this.getUserMonitoringStats(),
      this.getLocationCapacityOverview()
    ]);

    // Get additional summary data
    const totalShifts = await this.prisma.shift.count();
    const activeShiftsToday = await this.prisma.shift.count({
      where: {
        tanggal: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    });

    return {
      summary: {
        totalUsers: userStats.totalUsers,
        totalShifts,
        activeShiftsToday,
        averageWorkload: Math.round(userStats.averageWorkload * 100) / 100,
        overloadedLocations: locationStats.overloadedLocations
      },
      userMonitoring: {
        averageWorkload: userStats.averageWorkload,
        highWorkloadUsers: userStats.highWorkloadUsers,
        overworkedUsers: userStats.overworkedUsers,
        topWorkloadUsers: userStats.users.slice(0, 5)
      },
      locationMonitoring: locationStats,
      alerts: {
        overworkedUsers: userStats.overworkedUsers,
        overloadedLocations: locationStats.overloadedLocations,
        criticalIssues: userStats.users.filter(u => u.workloadScore > 95).length
      },
      recommendations: this.generateSystemRecommendations(userStats, locationStats)
    };
  }

  /**
   * Update user monitoring data after shift changes
   */
  async updateUserMonitoring(userId: number): Promise<void> {
    console.log(`📈 Updating monitoring data for user ${userId}...`);
    
    // Count total shifts
    const totalShifts = await this.prisma.shift.count({
      where: { userId },
    });

    // Calculate consecutive days (simplified)
    const consecutiveDays = 0; // Will implement later if needed

    console.log(`✅ Updated monitoring data for user ${userId}: ${totalShifts} total shifts`);
  }

  // Helper methods
  private getWorkloadStatus(score: number): string {
    if (score >= 95) return 'CRITICAL';
    if (score >= 90) return 'OVERWORKED';
    if (score >= 80) return 'HIGH';
    if (score >= 50) return 'NORMAL';
    return 'UNDERLOADED';
  }

  private getRecommendation(score: number): string {
    if (score >= 95) {
      return 'URGENT: Reduce workload immediately. Consider temporary reassignment.';
    } else if (score >= 90) {
      return 'HIGH PRIORITY: Schedule time off. Monitor closely.';
    } else if (score >= 80) {
      return 'ATTENTION: Consider workload redistribution.';
    } else if (score < 30) {
      return 'OPPORTUNITY: Can take on additional shifts.';
    }
    return 'NORMAL: Workload is well-balanced.';
  }

  private getLocationMaxCapacity(location: string): number {
    const capacities: Record<string, number> = {
      'ICU': 15,
      'NICU': 12,
      'RAWAT_INAP': 30,
      'RAWAT_JALAN': 25,
      'GAWAT_DARURAT': 20,
      'LABORATORIUM': 10,
      'FARMASI': 8,
      'RADIOLOGI': 6,
      'GEDUNG_ADMINISTRASI': 10,
      'GIZI': 8,
      'KEAMANAN': 5,
      'LAUNDRY': 4,
      'CLEANING_SERVICE': 6,
      'SUPIR': 3
    };
    return capacities[location] || 10;
  }

  private getLocationDisplayName(location: string): string {
    const displayNames: Record<string, string> = {
      'ICU': 'Intensive Care Unit',
      'NICU': 'Neonatal ICU',
      'RAWAT_INAP': 'Inpatient Ward',
      'RAWAT_JALAN': 'Outpatient Clinic', 
      'GAWAT_DARURAT': 'Emergency Room',
      'LABORATORIUM': 'Laboratory',
      'FARMASI': 'Pharmacy',
      'RADIOLOGI': 'Radiology',
      'GEDUNG_ADMINISTRASI': 'Administration',
      'GIZI': 'Nutrition',
      'KEAMANAN': 'Security',
      'LAUNDRY': 'Laundry Service',
      'CLEANING_SERVICE': 'Cleaning Service',
      'SUPIR': 'Driver'
    };
    return displayNames[location] || location;
  }

  private generateSystemRecommendations(userStats: any, locationStats: any): string[] {
    const recommendations: string[] = [];
    
    if (userStats.overworkedUsers > 0) {
      recommendations.push(`${userStats.overworkedUsers} employees are overworked. Consider workload redistribution.`);
    }
    
    if (locationStats.overloadedLocations > 0) {
      recommendations.push(`${locationStats.overloadedLocations} locations are at capacity. Hire additional staff.`);
    }
    
    if (userStats.averageWorkload < 50) {
      recommendations.push('Overall workload is low. Consider optimizing staff allocation.');
    }

    if (locationStats.averageUtilization > 85) {
      recommendations.push('High utilization across locations. Monitor for burnout risk.');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating within normal parameters.');
    }

    return recommendations;
  }
}
