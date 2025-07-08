import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Enhanced service with transaction management and audit logging
 */
@Injectable()
export class EnhancedShiftService {
  private readonly logger = new Logger(EnhancedShiftService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Atomic shift swap approval with comprehensive business logic
   */
  async approveShiftSwap(swapId: number, approverId: number, comments?: string) {
    this.logger.log(`Starting shift swap approval process`, {
      swapId,
      approverId,
    });

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Get swap request details
        const swapRequest = await tx.shiftSwap.findUnique({
          where: { id: swapId },
          include: {
            fromUser: { select: { id: true, namaDepan: true, namaBelakang: true, role: true } },
            toUser: { select: { id: true, namaDepan: true, namaBelakang: true, role: true } },
            shift: { select: { id: true, tanggal: true, jammulai: true, jamselesai: true, lokasishift: true } }
          }
        });

        if (!swapRequest) {
          throw new Error(`Shift swap request ${swapId} not found`);
        }

        if (swapRequest.status !== 'PENDING') {
          throw new Error(`Shift swap request ${swapId} is not in pending status`);
        }

        // 2. Business validation
        await this.validateShiftSwapApproval(swapRequest, tx);

        // 3. Update swap status
        const updatedSwap = await tx.shiftSwap.update({
          where: { id: swapId },
          data: {
            status: 'APPROVED',
            targetApprovedAt: new Date(),
            rejectionReason: comments || null
          }
        });

        // 4. Update shift assignments atomically
        await tx.shift.update({
          where: { id: swapRequest.shiftId },
          data: { userId: swapRequest.toUserId }
        });

        // 5. Create notifications for both users
        await this.createSwapApprovalNotifications(swapRequest, approverId, tx);

        // 6. Create audit log entry (if you have an audit log table)
        // await this.createAuditLog({...}, tx);

        this.logger.log(`Shift swap approved successfully`, {
          swapId,
          approverId,
          fromUserId: swapRequest.fromUserId,
          toUserId: swapRequest.toUserId,
        });

        return updatedSwap;
      });
    } catch (error) {
      this.logger.error(`Failed to approve shift swap`, {
        swapId,
        approverId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Comprehensive business validation for shift swap approval
   */
  private async validateShiftSwapApproval(swapRequest: any, tx: any) {
    // Check if users still have the required shifts
    const currentShiftAssignment = await tx.shift.findFirst({
      where: {
        id: swapRequest.shiftId,
        userId: swapRequest.fromUserId
      }
    });

    if (!currentShiftAssignment) {
      throw new Error('Original shift assignment has changed');
    }

    // Check for shift conflicts after swap
    const shift = swapRequest.shift;
    const toUserConflicts = await this.checkShiftConflicts(
      swapRequest.toUserId,
      shift.tanggal,
      shift.jammulai,
      shift.jamselesai,
      swapRequest.shiftId,
      tx
    );

    if (toUserConflicts.length > 0) {
      throw new Error(`Shift conflict detected for target user after swap`);
    }

    // Validate role compatibility with location
    await this.validateRoleLocationCompatibility(
      swapRequest.toUser.role,
      shift.lokasishift
    );
  }

  /**
   * Check for shift time conflicts
   */
  private async checkShiftConflicts(
    userId: number,
    tanggal: Date,
    jammulai: string,
    jamselesai: string,
    excludeShiftId: number,
    tx: any
  ) {
    return await tx.shift.findMany({
      where: {
        userId,
        tanggal,
        id: { not: excludeShiftId },
        OR: [
          {
            jammulai: { lte: jammulai },
            jamselesai: { gt: jammulai }
          },
          {
            jammulai: { lt: jamselesai },
            jamselesai: { gte: jamselesai }
          },
          {
            jammulai: { gte: jammulai },
            jamselesai: { lte: jamselesai }
          }
        ]
      }
    });
  }

  /**
   * Validate if user role is compatible with location
   */
  private async validateRoleLocationCompatibility(role: string, lokasi: string) {
    const roleLocationMatrix = {
      'DOKTER': ['GAWAT_DARURAT', 'ICU', 'RAWAT_INAP', 'RAWAT_JALAN'],
      'PERAWAT': ['GAWAT_DARURAT', 'ICU', 'RAWAT_INAP', 'RAWAT_JALAN', 'NICU'],
      'STAF': ['FARMASI', 'LABORATORIUM', 'RAWAT_JALAN', 'RADIOLOGI'],
      'SUPERVISOR': ['GEDUNG_ADMINISTRASI', 'RAWAT_INAP', 'RAWAT_JALAN']
    };

    const allowedLocations = roleLocationMatrix[role] || [];
    if (!allowedLocations.includes(lokasi)) {
      throw new Error(`Role ${role} tidak dapat bertugas di ${lokasi}`);
    }
  }

  /**
   * Create notifications for swap approval
   */
  private async createSwapApprovalNotifications(swapRequest: any, approverId: number, tx: any) {
    const approver = await tx.user.findUnique({
      where: { id: approverId },
      select: { namaDepan: true, namaBelakang: true }
    });

    // Notification for requester
    await tx.notifikasi.create({
      data: {
        userId: swapRequest.fromUserId,
        judul: 'Tukar Shift Disetujui',
        pesan: `Permintaan tukar shift Anda telah disetujui oleh ${approver?.namaDepan} ${approver?.namaBelakang}`,
        jenis: 'KONFIRMASI_TUKAR_SHIFT'
      }
    });

    // Notification for target user
    await tx.notifikasi.create({
      data: {
        userId: swapRequest.toUserId,
        judul: 'Tukar Shift Disetujui',
        pesan: `Tukar shift dengan ${swapRequest.fromUser.namaDepan} ${swapRequest.fromUser.namaBelakang} telah disetujui`,
        jenis: 'KONFIRMASI_TUKAR_SHIFT'
      }
    });
  }

  /**
   * Generate comprehensive shift statistics
   */
  async getShiftStatistics(startDate: string, endDate: string) {
    this.logger.log(`Generating shift statistics`, { startDate, endDate });

    try {
      const stats = await this.prisma.$transaction(async (tx) => {
        // Shifts by location
        const shiftsByLocation = await tx.shift.groupBy({
          by: ['lokasishift'],
          where: {
            tanggal: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          },
          _count: {
            id: true
          }
        });

        // Shifts by user role
        const shiftsByRole = await tx.shift.groupBy({
          by: ['userId'],
          where: {
            tanggal: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          },
          _count: {
            id: true
          }
        });

        // Swap request statistics
        const swapStats = await tx.shiftSwap.groupBy({
          by: ['status'],
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          },
          _count: {
            id: true
          }
        });

        // Get role-based statistics separately
        const roleStats = await tx.user.groupBy({
          by: ['role'],
          _count: {
            id: true
          },
          where: {
            shifts: {
              some: {
                tanggal: {
                  gte: new Date(startDate),
                  lte: new Date(endDate)
                }
              }
            }
          }
        });

        return {
          shiftsByLocation,
          shiftsByRole,
          swapStats,
          roleStats,
          period: { startDate, endDate },
          generatedAt: new Date().toISOString()
        };
      });

      this.logger.log(`Shift statistics generated successfully`, {
        startDate,
        endDate,
        totalShifts: stats.shiftsByLocation.reduce((sum, item) => sum + (item._count?.id ?? 0), 0)
      });

      return stats;
    } catch (error) {
      this.logger.error(`Failed to generate shift statistics`, {
        startDate,
        endDate,
        error: error.message
      });
      throw error;
    }
  }
}
