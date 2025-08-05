import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OvertimeRequestData {
  userId: number;
  shiftDate: Date;
  extraHours: number;
  reason: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  requestType?: 'EXTRA_SHIFT' | 'OVERTIME_EXTENSION';
}

export interface LeaveRequestData {
  userId: number;
  startDate: Date;
  endDate: Date;
  leaveType: 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'MATERNITY';
  reason: string;
  substituteUserId?: number;
}

@Injectable()
export class RequestManagementService {
  constructor(private prisma: PrismaService) {}

  // Temporary: All methods are simplified until OvertimeRequest and LeaveRequest models are available
  createOvertimeRequest(data: OvertimeRequestData): Promise<any> {
    // TODO: Implement when OvertimeRequest model is available
    console.log('Creating overtime request:', data);
    return Promise.reject(new Error('OvertimeRequest functionality temporarily disabled'));
  }

  approveOvertimeRequest(
    requestId: number,
    reviewerId: number,
    reviewerNotes?: string,
  ): Promise<any> {
    // TODO: Implement when OvertimeRequest model is available
    console.log('Approving overtime request:', requestId, reviewerId, reviewerNotes);
    return Promise.reject(new Error('OvertimeRequest functionality temporarily disabled'));
  }

  rejectOvertimeRequest(
    requestId: number,
    reviewerId: number,
    rejectionReason: string,
  ): Promise<any> {
    // TODO: Implement when OvertimeRequest model is available
    console.log('Rejecting overtime request:', requestId, reviewerId, rejectionReason);
    return Promise.reject(new Error('OvertimeRequest functionality temporarily disabled'));
  }

  createLeaveRequest(data: LeaveRequestData): Promise<any> {
    // TODO: Implement when LeaveRequest model is available
    console.log('Creating leave request:', data);
    return Promise.reject(new Error('LeaveRequest functionality temporarily disabled'));
  }

  approveLeaveRequest(
    requestId: number,
    reviewerId: number,
    reviewerNotes?: string,
  ): Promise<any> {
    // TODO: Implement when LeaveRequest model is available
    console.log('Approving leave request:', requestId, reviewerId, reviewerNotes);
    return Promise.reject(new Error('LeaveRequest functionality temporarily disabled'));
  }

  rejectLeaveRequest(
    requestId: number,
    reviewerId: number,
    rejectionReason: string,
  ): Promise<any> {
    // TODO: Implement when LeaveRequest model is available
    console.log('Rejecting leave request:', requestId, reviewerId, rejectionReason);
    return Promise.reject(new Error('LeaveRequest functionality temporarily disabled'));
  }

  getOvertimeRequests(
    userId?: number,
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    page = 1,
    limit = 10,
  ): Promise<{ requests: any[]; total: number; totalPages: number }> {
    // TODO: Implement when OvertimeRequest model is available
    console.log('Getting overtime requests:', userId, status, page, limit);
    return Promise.resolve({
      requests: [],
      total: 0,
      totalPages: 0,
    });
  }

  getLeaveRequests(
    userId?: number,
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    page = 1,
    limit = 10,
  ): Promise<{ requests: any[]; total: number; totalPages: number }> {
    // TODO: Implement when LeaveRequest model is available
    console.log('Getting leave requests:', userId, status, page, limit);
    return Promise.resolve({
      requests: [],
      total: 0,
      totalPages: 0,
    });
  }

  getRequestStatistics(): Promise<{
    overtime: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    };
    leave: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    };
  }> {
    // TODO: Implement when models are available
    return Promise.resolve({
      overtime: { pending: 0, approved: 0, rejected: 0, total: 0 },
      leave: { pending: 0, approved: 0, rejected: 0, total: 0 },
    });
  }

  private async createNotification(
    userId: number,
    type: string,
    message: string,
  ): Promise<void> {
    try {
      await this.prisma.notifikasi.create({
        data: {
          userId,
          judul: type,
          pesan: message,
          jenis: 'SISTEM_INFO',
          status: 'UNREAD',
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}
