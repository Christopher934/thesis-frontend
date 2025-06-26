import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftSwapRequestDto } from './dto/create-shift-swap-request.dto';
import { UpdateShiftSwapRequestDto } from './dto/update-shift-swap-request.dto';
import {
  ResponseShiftSwapRequestDto,
  ResponseAction,
} from './dto/response-shift-swap-request.dto';
import { SwapStatus, Role, ShiftSwap } from '@prisma/client';
import { NotificationIntegrationService } from '../notifikasi/notification-integration.service';
import { JenisNotifikasi } from '@prisma/client';

@Injectable()
export class ShiftSwapRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationIntegrationService, // inject notification service
  ) {}

  async create(createDto: CreateShiftSwapRequestDto, fromUserId: number) {
    if (!createDto || !fromUserId) {
      throw new BadRequestException('Shift swap data and fromUserId are required');
    }
    try {
      // Ambil data user yang mengajukan
      const fromUser = await this.prisma.user.findUnique({
        where: { id: fromUserId },
      });
      if (!fromUser) {
        throw new NotFoundException('User not found');
      }
      if (fromUser.role === Role.ADMIN || fromUser.role === Role.SUPERVISOR) {
        throw new ForbiddenException(
          'Admin dan supervisor tidak boleh mengajukan permintaan tukar shift',
        );
      }

      // Validate that the shift exists and belongs to the requesting user
      const shift = await this.prisma.shift.findFirst({
        where: {
          id: createDto.shiftId,
          userId: fromUserId,
        },
        include: {
          user: true,
        },
      });

      if (!shift) {
        throw new NotFoundException('Shift not found or does not belong to you');
      }

      // Validate that target user exists
      const targetUser = await this.prisma.user.findUnique({
        where: { id: createDto.toUserId },
      });

      if (!targetUser) {
        throw new NotFoundException('Target user not found');
      }

      // Check if there's already a pending swap request for this shift
      const existingSwap = await this.prisma.shiftSwap.findFirst({
        where: {
          shiftId: createDto.shiftId,
          status: {
            in: [
              SwapStatus.PENDING,
              SwapStatus.APPROVED_BY_TARGET,
              SwapStatus.WAITING_UNIT_HEAD,
              SwapStatus.WAITING_SUPERVISOR,
            ],
          },
        },
      });

      if (existingSwap) {
        throw new BadRequestException(
          'Sudah ada permintaan tukar shift yang masih menunggu persetujuan untuk shift ini. Silakan tunggu proses sebelumnya selesai.',
        );
      }

      // Determine if unit head approval is required based on shift location
      const specialUnits = ['ICU', 'NICU', 'IGD', 'EMERGENCY_ROOM'];
      const requiresUnitHead =
        specialUnits.includes(shift.lokasishift) || createDto.requiresUnitHead;

      // Setelah swap berhasil dibuat, kirim notifikasi ke user B (toUser)
      const swap = await this.prisma.shiftSwap.create({
        data: {
          fromUserId,
          toUserId: createDto.toUserId,
          shiftId: createDto.shiftId,
          alasan: createDto.alasan,
          tanggalSwap: shift.tanggal,
          requiresUnitHead,
          status: SwapStatus.PENDING,
        },
        include: {
          fromUser: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              role: true,
            },
          },
          toUser: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              role: true,
            },
          },
          shift: {
            include: {
              user: {
                select: {
                  id: true,
                  namaDepan: true,
                  namaBelakang: true,
                },
              },
            },
          },
        },
      });

      // Kirim notifikasi ke user B (toUser)
      await this.notificationService.sendNotification(
        createDto.toUserId,
        JenisNotifikasi.KONFIRMASI_TUKAR_SHIFT,
        'Permintaan Tukar Shift',
        `Ada permintaan tukar shift dari ${fromUser.namaDepan} ${fromUser.namaBelakang} untuk shift tanggal ${shift.tanggal instanceof Date ? shift.tanggal.toISOString().split('T')[0] : shift.tanggal}.`,
        { shiftId: shift.id, fromUserId, toUserId: createDto.toUserId },
      );

      return swap;
    } catch (error) {
      console.error('[ShiftSwapRequestService][create] Error:', error);
      throw new InternalServerErrorException(
        error.message || 'Failed to create shift swap request',
      );
    }
  }

  async findAll(userId?: number, status?: SwapStatus) {
    const where: {
      OR?: Array<{ fromUserId: number } | { toUserId: number }>;
      status?: SwapStatus;
    } = {};

    if (userId) {
      where.OR = [{ fromUserId: userId }, { toUserId: userId }];
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.shiftSwap.findMany({
      where,
      include: {
        fromUser: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            role: true,
          },
        },
        shift: {
          include: {
            user: {
              select: {
                id: true,
                namaDepan: true,
                namaBelakang: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const shiftSwap = await this.prisma.shiftSwap.findUnique({
      where: { id },
      include: {
        fromUser: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            role: true,
          },
        },
        shift: {
          include: {
            user: {
              select: {
                id: true,
                namaDepan: true,
                namaBelakang: true,
              },
            },
          },
        },
      },
    });

    if (!shiftSwap) {
      throw new NotFoundException('Shift swap request not found');
    }

    return shiftSwap;
  }

  async respondToRequest(
    id: number,
    responseDto: ResponseShiftSwapRequestDto,
    userId: number,
  ) {
    const shiftSwap = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Determine the user's role in this swap request
    const isTargetUser = shiftSwap.toUserId === userId;
    const isUnitHead =
      user.role === Role.SUPERVISOR && shiftSwap.requiresUnitHead;
    const isSupervisor = user.role === Role.SUPERVISOR;

    let newStatus: SwapStatus;
    const updateData: {
      updatedAt: Date;
      status?: SwapStatus;
      targetApprovedAt?: Date;
      targetApprovedBy?: number;
      unitHeadApprovedAt?: Date;
      unitHeadApprovedBy?: number;
      supervisorApprovedAt?: Date;
      supervisorApprovedBy?: number;
      rejectionReason?: string;
    } = {
      updatedAt: new Date(),
    };

    if (isTargetUser && shiftSwap.status === SwapStatus.PENDING) {
      // Target user responding to initial request
      if (responseDto.action === ResponseAction.ACCEPT) {
        newStatus = shiftSwap.requiresUnitHead
          ? SwapStatus.WAITING_UNIT_HEAD
          : SwapStatus.WAITING_SUPERVISOR;
        updateData.targetApprovedAt = new Date();
        updateData.targetApprovedBy = userId;
      } else if (responseDto.action === ResponseAction.REJECT) {
        newStatus = SwapStatus.REJECTED_BY_TARGET;
        updateData.rejectionReason = responseDto.rejectionReason;
      } else {
        throw new BadRequestException('Invalid action for target user');
      }
    } else if (
      isUnitHead &&
      shiftSwap.status === SwapStatus.WAITING_UNIT_HEAD
    ) {
      // Unit head responding
      if (responseDto.action === ResponseAction.APPROVE) {
        newStatus = SwapStatus.WAITING_SUPERVISOR;
        updateData.unitHeadApprovedAt = new Date();
        updateData.unitHeadApprovedBy = userId;
      } else if (responseDto.action === ResponseAction.REJECT) {
        newStatus = SwapStatus.REJECTED_BY_UNIT_HEAD;
        updateData.rejectionReason = responseDto.rejectionReason;
      } else {
        throw new BadRequestException('Invalid action for unit head');
      }
    } else if (
      isSupervisor &&
      shiftSwap.status === SwapStatus.WAITING_SUPERVISOR
    ) {
      // Supervisor final approval
      if (responseDto.action === ResponseAction.APPROVE) {
        newStatus = SwapStatus.APPROVED;
        updateData.supervisorApprovedAt = new Date();
        updateData.supervisorApprovedBy = userId;

        // Auto-transfer shift ownership when approved
        await this.transferShiftOwnership(shiftSwap);
      } else if (responseDto.action === ResponseAction.REJECT) {
        newStatus = SwapStatus.REJECTED_BY_SUPERVISOR;
        updateData.rejectionReason = responseDto.rejectionReason;
      } else {
        throw new BadRequestException('Invalid action for supervisor');
      }
    } else {
      throw new ForbiddenException(
        'You are not authorized to respond to this request at this stage',
      );
    }

    updateData.status = newStatus;

    const updatedSwap = await this.prisma.shiftSwap.update({
      where: { id },
      data: updateData,
      include: {
        fromUser: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            role: true,
          },
        },
        shift: {
          include: {
            user: {
              select: {
                id: true,
                namaDepan: true,
                namaBelakang: true,
              },
            },
          },
        },
      },
    });

    // Kirim notifikasi ke supervisor jika status WAITING_SUPERVISOR
    if (newStatus === SwapStatus.WAITING_SUPERVISOR) {
      // Cari semua supervisor di unit terkait
      const supervisors = await this.prisma.user.findMany({
        where: { role: Role.SUPERVISOR },
      });
      for (const supervisor of supervisors) {
        await this.notificationService.sendNotification(
          supervisor.id,
          JenisNotifikasi.PERSETUJUAN_CUTI,
          'Permintaan Persetujuan Tukar Shift',
          `Ada permintaan tukar shift yang perlu disetujui untuk shift tanggal ${shiftSwap.tanggalSwap instanceof Date ? shiftSwap.tanggalSwap.toISOString().split('T')[0] : shiftSwap.tanggalSwap}.`,
          { shiftSwapId: id },
        );
      }
    }

    // Setelah shift swap disetujui oleh supervisor, kirim notifikasi ke kedua user
    if (newStatus === SwapStatus.APPROVED) {
      // Notifikasi ke pengaju (fromUser)
      await this.notificationService.sendNotification(
        shiftSwap.fromUserId,
        JenisNotifikasi.KONFIRMASI_TUKAR_SHIFT,
        'Tukar Shift Disetujui',
        `Permintaan tukar shift Anda dengan ${shiftSwap.toUser?.namaDepan || ''} ${shiftSwap.toUser?.namaBelakang || ''} pada tanggal ${shiftSwap.tanggalSwap instanceof Date ? shiftSwap.tanggalSwap.toISOString().split('T')[0] : shiftSwap.tanggalSwap} telah disetujui dan jadwal sudah diperbarui.`,
        { shiftSwapId: id },
      );
      // Notifikasi ke partner (toUser)
      await this.notificationService.sendNotification(
        shiftSwap.toUserId,
        JenisNotifikasi.KONFIRMASI_TUKAR_SHIFT,
        'Tukar Shift Disetujui',
        `Anda telah menerima shift dari ${shiftSwap.fromUser?.namaDepan || ''} ${shiftSwap.fromUser?.namaBelakang || ''} pada tanggal ${shiftSwap.tanggalSwap instanceof Date ? shiftSwap.tanggalSwap.toISOString().split('T')[0] : shiftSwap.tanggalSwap}. Jadwal Anda sudah diperbarui.`,
        { shiftSwapId: id },
      );
    }

    return updatedSwap;
  }

  async update(
    id: number,
    updateDto: UpdateShiftSwapRequestDto,
    userId: number,
  ) {
    const shiftSwap = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow the requester to update their own request if it's still pending
    if (shiftSwap.fromUserId !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own requests');
    }

    if (shiftSwap.status !== SwapStatus.PENDING) {
      throw new BadRequestException(
        'Cannot update a request that has already been processed',
      );
    }

    return this.prisma.shiftSwap.update({
      where: { id },
      data: updateDto,
      include: {
        fromUser: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            role: true,
          },
        },
        shift: {
          include: {
            user: {
              select: {
                id: true,
                namaDepan: true,
                namaBelakang: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    const shiftSwap = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow the requester or admin to delete
    if (shiftSwap.fromUserId !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own requests');
    }

    // Only allow deletion if request is still pending
    if (shiftSwap.status !== SwapStatus.PENDING) {
      throw new BadRequestException(
        'Cannot delete a request that has already been processed',
      );
    }

    return this.prisma.shiftSwap.delete({
      where: { id },
    });
  }

  async getMyRequests(userId: number) {
    return this.findAll(userId);
  }

  async getPendingApprovals(userId: number) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const where: {
        OR?: Array<{
          status: SwapStatus;
          requiresUnitHead?: boolean;
        }>;
        toUserId?: number;
        status?: SwapStatus;
      } = {};

      if (user.role === Role.SUPERVISOR) {
        // Supervisors see requests waiting for their approval or unit head approval
        where.OR = [
          { status: SwapStatus.WAITING_SUPERVISOR },
          { status: SwapStatus.WAITING_UNIT_HEAD, requiresUnitHead: true },
        ];
      } else {
        // Regular users see requests directed to them
        where.toUserId = userId;
        where.status = SwapStatus.PENDING;
      }

      return this.prisma.shiftSwap.findMany({
        where,
        include: {
          fromUser: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              role: true,
            },
          },
          toUser: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              role: true,
            },
          },
          shift: {
            include: {
              user: {
                select: {
                  id: true,
                  namaDepan: true,
                  namaBelakang: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('[ShiftSwapRequestService][getPendingApprovals] Error:', error);
      throw new InternalServerErrorException(
        error.message || 'Failed to get pending approvals',
      );
    }
  }

  /**
   * Transfer shift ownership when swap request is approved
   * This method swaps the userId between the requester and target user shifts
   */
  private async transferShiftOwnership(shiftSwap: ShiftSwap): Promise<void> {
    try {
      // Find the shift being swapped
      const originalShift = await this.prisma.shift.findUnique({
        where: { id: shiftSwap.shiftId },
        include: { user: true },
      });

      if (!originalShift) {
        throw new Error(
          `Original shift with ID ${shiftSwap.shiftId} not found`,
        );
      }

      // Find corresponding shift for the target user on the same date
      const targetShift = await this.prisma.shift.findFirst({
        where: {
          userId: shiftSwap.toUserId,
          tanggal: originalShift.tanggal,
        },
        include: { user: true },
      });

      if (!targetShift) {
        // If target user doesn't have a shift on the same date, just transfer the shift
        await this.prisma.shift.update({
          where: { id: originalShift.id },
          data: { userId: shiftSwap.toUserId },
        });

        console.log(
          `Shift ${originalShift.id} transferred from user ${shiftSwap.fromUserId} to user ${shiftSwap.toUserId}`,
        );
      } else {
        // If both users have shifts on the same date, swap them
        await this.prisma.$transaction(async (tx) => {
          // Update original shift to target user
          await tx.shift.update({
            where: { id: originalShift.id },
            data: { userId: shiftSwap.toUserId },
          });

          // Update target shift to original user
          await tx.shift.update({
            where: { id: targetShift.id },
            data: { userId: shiftSwap.fromUserId },
          });
        });

        console.log(
          `Shifts swapped: Shift ${originalShift.id} (${shiftSwap.fromUserId} → ${shiftSwap.toUserId}), Shift ${targetShift.id} (${shiftSwap.toUserId} → ${shiftSwap.fromUserId})`,
        );
      }
    } catch (error) {
      console.error('Error transferring shift ownership:', error);
      throw new Error(
        `Failed to transfer shift ownership: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
