import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftSwapRequestDto } from './dto/create-shift-swap-request.dto';
import { UpdateShiftSwapRequestDto } from './dto/update-shift-swap-request.dto';
import {
  ResponseShiftSwapRequestDto,
  ResponseAction,
} from './dto/response-shift-swap-request.dto';
import { SwapStatus, Role } from '@prisma/client';

@Injectable()
export class ShiftSwapRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateShiftSwapRequestDto, fromUserId: number) {
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
        'There is already a pending swap request for this shift',
      );
    }

    // Determine if unit head approval is required based on shift location
    const specialUnits = ['ICU', 'NICU', 'IGD', 'EMERGENCY_ROOM'];
    const requiresUnitHead =
      specialUnits.includes(shift.lokasishift) || createDto.requiresUnitHead;

    return this.prisma.shiftSwap.create({
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

    return this.prisma.shiftSwap.update({
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
  }
}
