import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OverworkRequestData {
  userId: number;
  requestedAdditionalShifts: number; // Berapa tambahan shift yang diminta
  reason: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  requestType: 'TEMPORARY' | 'PERMANENT'; // Temporary = hanya bulan ini, Permanent = update limit permanen
}

export interface OverworkRequestResponse {
  id: number;
  userId: number;
  userName: string;
  currentShifts: number;
  currentLimit: number;
  requestedAdditionalShifts: number;
  newProposedLimit: number;
  reason: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  requestType: 'TEMPORARY' | 'PERMANENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: number;
  reviewerNotes?: string;
}

@Injectable()
export class OverworkRequestService {
  constructor(private prisma: PrismaService) {}

  // Create new overwork request
  async createOverworkRequest(data: OverworkRequestData): Promise<any> {
    try {
      // Check if user already has pending request
      const existingRequest = await this.prisma.shift.findFirst({
        where: {
          userId: data.userId,
          // We'll store overwork requests in a separate way for now
          // TODO: Create proper OverworkRequest table
        }
      });

      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        select: {
          namaDepan: true,
          namaBelakang: true,
          maxShiftsPerMonth: true,
          employeeId: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get current month shifts
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const currentShifts = await this.prisma.shift.count({
        where: {
          userId: data.userId,
          tanggal: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      const currentLimit = user.maxShiftsPerMonth || 20;
      const newProposedLimit = currentLimit + data.requestedAdditionalShifts;

      // For now, we'll create a notification as the request system
      // TODO: Replace with proper OverworkRequest table
      const requestNotification = await this.prisma.notifikasi.create({
        data: {
          userId: 1, // Admin user ID
          judul: `🔥 OVERWORK REQUEST - ${user.namaDepan} ${user.namaBelakang}`,
          pesan: `Employee: ${user.namaDepan} ${user.namaBelakang} (${user.employeeId})
Current Shifts: ${currentShifts}/${currentLimit}
Requested Additional: +${data.requestedAdditionalShifts} shifts
New Limit: ${newProposedLimit} shifts/month
Type: ${data.requestType}
Urgency: ${data.urgency}
Reason: ${data.reason}

STATUS: PENDING APPROVAL`,
          jenis: 'SISTEM_INFO',
          status: 'UNREAD',
          data: {
            type: 'OVERWORK_REQUEST',
            userId: data.userId,
            currentShifts,
            currentLimit,
            requestedAdditionalShifts: data.requestedAdditionalShifts,
            newProposedLimit,
            requestType: data.requestType,
            urgency: data.urgency,
            reason: data.reason
          }
        }
      });

      // Send notification to user confirming request
      await this.prisma.notifikasi.create({
        data: {
          userId: data.userId,
          judul: '📝 Overwork Request Submitted',
          pesan: `Your overwork request has been submitted to admin:
- Additional shifts requested: ${data.requestedAdditionalShifts}
- New monthly limit: ${newProposedLimit} shifts
- Type: ${data.requestType}
- Status: Pending approval

You'll be notified once admin reviews your request.`,
          jenis: 'SISTEM_INFO',
          status: 'UNREAD'
        }
      });

      return {
        id: requestNotification.id,
        message: 'Overwork request submitted successfully',
        currentShifts,
        currentLimit,
        requestedAdditionalShifts: data.requestedAdditionalShifts,
        newProposedLimit,
        status: 'PENDING'
      };

    } catch (error) {
      console.error('Error creating overwork request:', error);
      throw error;
    }
  }

  // Get pending overwork requests for admin
  async getPendingOverworkRequests(): Promise<any[]> {
    try {
      const pendingRequests = await this.prisma.notifikasi.findMany({
        where: {
          judul: {
            contains: 'OVERWORK REQUEST'
          },
          status: 'UNREAD'
        },
        include: {
          user: {
            select: {
              namaDepan: true,
              namaBelakang: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return pendingRequests.map(req => ({
        id: req.id,
        userName: `${req.user.namaDepan} ${req.user.namaBelakang}`,
        request: req.pesan,
        data: req.data,
        createdAt: req.createdAt,
        urgency: req.data && typeof req.data === 'object' && 'urgency' in req.data ? req.data.urgency : 'MEDIUM'
      }));

    } catch (error) {
      console.error('Error getting pending overwork requests:', error);
      return [];
    }
  }

  // Approve overwork request
  async approveOverworkRequest(
    requestId: number,
    adminId: number,
    adminNotes?: string
  ): Promise<any> {
    try {
      // Get the request notification
      const request = await this.prisma.notifikasi.findUnique({
        where: { id: requestId },
        include: {
          user: {
            select: {
              namaDepan: true,
              namaBelakang: true
            }
          }
        }
      });

      if (!request || !request.data || typeof request.data !== 'object') {
        throw new Error('Request not found or invalid data');
      }

      const requestData = request.data as any;
      const targetUserId = requestData.userId;
      const newLimit = requestData.newProposedLimit;
      const requestType = requestData.requestType;

      // Update user's shift limit
      if (requestType === 'PERMANENT') {
        await this.prisma.user.update({
          where: { id: targetUserId },
          data: {
            maxShiftsPerMonth: newLimit,
            workloadStatus: 'NORMAL' // Reset status since limit increased
          }
        });
      } else {
        // For temporary, we'll reset workload status and allow more shifts this month
        await this.prisma.user.update({
          where: { id: targetUserId },
          data: {
            workloadStatus: 'HIGH' // Allow more shifts but keep monitoring
          }
        });
      }

      // Mark request as read (approved)
      await this.prisma.notifikasi.update({
        where: { id: requestId },
        data: {
          status: 'READ',
          pesan: request.pesan + `\n\n✅ APPROVED by Admin\nNotes: ${adminNotes || 'No additional notes'}\nApproved at: ${new Date().toLocaleString()}`
        }
      });

      // Notify user of approval
      await this.prisma.notifikasi.create({
        data: {
          userId: targetUserId,
          judul: '✅ Overwork Request APPROVED',
          pesan: `Great news! Your overwork request has been APPROVED by admin.

Details:
- New monthly limit: ${newLimit} shifts
- Type: ${requestType}
- Admin notes: ${adminNotes || 'No additional notes'}

You can now be assigned additional shifts for this month!`,
          jenis: 'SISTEM_INFO',
          status: 'UNREAD'
        }
      });

      return {
        success: true,
        message: 'Overwork request approved successfully',
        newLimit,
        requestType
      };

    } catch (error) {
      console.error('Error approving overwork request:', error);
      throw error;
    }
  }

  // Reject overwork request
  async rejectOverworkRequest(
    requestId: number,
    adminId: number,
    rejectionReason: string
  ): Promise<any> {
    try {
      // Get the request notification
      const request = await this.prisma.notifikasi.findUnique({
        where: { id: requestId }
      });

      if (!request || !request.data || typeof request.data !== 'object') {
        throw new Error('Request not found or invalid data');
      }

      const requestData = request.data as any;
      const targetUserId = requestData.userId;

      // Mark request as read (rejected)
      await this.prisma.notifikasi.update({
        where: { id: requestId },
        data: {
          status: 'READ',
          pesan: request.pesan + `\n\n❌ REJECTED by Admin\nReason: ${rejectionReason}\nRejected at: ${new Date().toLocaleString()}`
        }
      });

      // Notify user of rejection
      await this.prisma.notifikasi.create({
        data: {
          userId: targetUserId,
          judul: '❌ Overwork Request REJECTED',
          pesan: `Your overwork request has been rejected by admin.

Reason: ${rejectionReason}

Please contact your supervisor if you need to discuss workload concerns or consider redistributing tasks with colleagues.`,
          jenis: 'SISTEM_INFO',
          status: 'UNREAD'
        }
      });

      return {
        success: true,
        message: 'Overwork request rejected',
        reason: rejectionReason
      };

    } catch (error) {
      console.error('Error rejecting overwork request:', error);
      throw error;
    }
  }

  // Get user's overwork request history
  async getUserOverworkHistory(userId: number): Promise<any[]> {
    try {
      const userRequests = await this.prisma.notifikasi.findMany({
        where: {
          OR: [
            {
              userId: userId,
              judul: {
                contains: 'Overwork Request'
              }
            },
            {
              userId: 1, // Admin notifications
              judul: {
                contains: 'OVERWORK REQUEST'
              },
              data: {
                path: ['userId'],
                equals: userId
              }
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return userRequests.map(req => ({
        id: req.id,
        title: req.judul,
        message: req.pesan,
        status: req.status === 'READ' ? 
          (req.pesan.includes('APPROVED') ? 'APPROVED' : 'REJECTED') : 
          'PENDING',
        createdAt: req.createdAt,
        data: req.data
      }));

    } catch (error) {
      console.error('Error getting user overwork history:', error);
      return [];
    }
  }
}
