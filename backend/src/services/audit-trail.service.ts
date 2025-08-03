import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Define enums locally since they might not be exported
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST = 'REQUEST',
  CANCEL = 'CANCEL',
  VIEW = 'VIEW',
}

export enum EntityType {
  SHIFT = 'SHIFT',
  OVERTIME = 'OVERTIME',
  LEAVE = 'LEAVE',
  SWAP = 'SWAP',
  USER = 'USER',
  ATTENDANCE = 'ATTENDANCE',
}

export interface AuditLogEntry {
  id?: string;
  userId: number;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  oldData?: any;
  newData?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

@Injectable()
export class AuditTrailService {
  constructor(private prisma: PrismaService) {}

  async logShiftChange(
    userId: number,
    action: AuditAction,
    shiftId: string,
    oldData?: any,
    newData?: any,
    reason?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType: 'SHIFT',
          entityId: shiftId,
          oldData: oldData ? JSON.stringify(oldData) : null,
          newData: newData ? JSON.stringify(newData) : null,
          reason,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          timestamp: new Date(),
        },
      });

      // Log summary for admin dashboard
      console.log(
        `[AUDIT] ${action} shift ${shiftId} by user ${userId}${reason ? ` - ${reason}` : ''}`,
      );
    } catch (error) {
      console.error('Failed to log audit trail:', error);
      // Don't throw error to prevent breaking the main operation
    }
  }

  async logOvertimeRequest(
    userId: number,
    action: AuditAction,
    overtimeId: string,
    data?: any,
    reason?: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType: 'OVERTIME',
          entityId: overtimeId,
          newData: data ? JSON.stringify(data) : null,
          reason,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to log overtime audit:', error);
    }
  }

  async logLeaveRequest(
    userId: number,
    action: AuditAction,
    leaveId: string,
    data?: any,
    reason?: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType: 'LEAVE',
          entityId: leaveId,
          newData: data ? JSON.stringify(data) : null,
          reason,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to log leave audit:', error);
    }
  }

  async getAuditHistory(
    entityType?: 'SHIFT' | 'OVERTIME' | 'LEAVE' | 'SWAP',
    entityId?: string,
    userId?: string,
    limit = 50,
    offset = 0
  ): Promise<any[]> {
    const where: any = {};
    
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;

    return await this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            namaDepan: true,
            namaBelakang: true,
            username: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    });
  }

  async getShiftHistory(shiftId: string): Promise<any[]> {
    return await this.getAuditHistory('SHIFT', shiftId);
  }

  async getUserActivityLog(userId: string, limit = 20): Promise<any[]> {
    return await this.getAuditHistory(undefined, undefined, userId, limit);
  }

  async getRecentActivity(limit = 10): Promise<any[]> {
    return await this.prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            namaDepan: true,
            namaBelakang: true,
            username: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  // Generate audit report
  async generateAuditReport(
    startDate: Date,
    endDate: Date,
    entityType?: string,
    userId?: string
  ): Promise<{
    totalActions: number;
    actionBreakdown: Record<string, number>;
    userActivity: Record<string, number>;
    timeline: any[];
  }> {
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    };

    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            namaDepan: true,
            namaBelakang: true,
            username: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    const totalActions = logs.length;
    const actionBreakdown: Record<string, number> = {};
    const userActivity: Record<string, number> = {};

    logs.forEach(log => {
      // Action breakdown
      const key = `${log.entityType}_${log.action}`;
      actionBreakdown[key] = (actionBreakdown[key] || 0) + 1;

      // User activity
      const userName = `${log.user.namaDepan} ${log.user.namaBelakang}`;
      userActivity[userName] = (userActivity[userName] || 0) + 1;
    });

    return {
      totalActions,
      actionBreakdown,
      userActivity,
      timeline: logs.slice(0, 100) // Latest 100 for timeline
    };
  }
}
