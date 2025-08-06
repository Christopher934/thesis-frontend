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
      throw new BadRequestException('Data permintaan tukar shift dan identitas pengguna diperlukan');
    }
    try {
      // Ambil data pegawai yang mengajukan
      const fromUser = await this.prisma.user.findUnique({
        where: { id: fromUserId },
      });
      if (!fromUser) {
        throw new NotFoundException('Pegawai tidak ditemukan');
      }
      if (fromUser.role === Role.ADMIN || fromUser.role === Role.SUPERVISOR) {
        throw new ForbiddenException(
          'Administrator dan penyelia tidak diperkenankan mengajukan permintaan tukar shift',
        );
      }

      // Validasi bahwa shift yang dimaksud ada dan milik pengguna yang mengajukan
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
        throw new NotFoundException('Shift tidak ditemukan atau bukan milik Anda');
      }

      // Validasi bahwa pegawai tujuan ada
      const targetUser = await this.prisma.user.findUnique({
        where: { id: createDto.toUserId },
      });

      if (!targetUser) {
        throw new NotFoundException('Pegawai tujuan tidak ditemukan');
      }

      // Periksa apakah sudah ada permintaan tukar shift yang menunggu untuk shift ini
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

      // Tentukan apakah perlu persetujuan kepala unit berdasarkan lokasi shift
      const specialUnits = ['ICU', 'NICU', 'IGD', 'EMERGENCY_ROOM'];
      const requiresUnitHead =
        specialUnits.includes(shift.lokasishift) || createDto.requiresUnitHead;

      // Setelah permintaan tukar shift berhasil dibuat, kirim notifikasi ke pegawai B (toUser)
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

      // Kirim notifikasi ke pegawai B (toUser)
      await this.notificationService.sendNotification(
        createDto.toUserId,
        JenisNotifikasi.KONFIRMASI_TUKAR_SHIFT,
        'Permintaan Tukar Shift',
        `Ada permintaan tukar shift dari ${fromUser.namaDepan} ${fromUser.namaBelakang} untuk shift tanggal ${shift.tanggal instanceof Date ? shift.tanggal.toISOString().split('T')[0] : shift.tanggal}.`,
        { shiftId: shift.id, fromUserId, toUserId: createDto.toUserId },
      );

      return swap;
    } catch (error) {
      console.error('[LayananPermintaanTukarShift][create] Kesalahan:', error);
      throw new InternalServerErrorException(
        error.message || 'Gagal membuat permintaan tukar shift',
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
      throw new NotFoundException('Permintaan tukar shift tidak ditemukan');
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
      throw new NotFoundException('Pegawai tidak ditemukan');
    }

    // Tentukan peran pengguna dalam permintaan tukar shift ini
    const isTargetUser = shiftSwap.toUserId === userId;
    const isUnitHead =
      user.role === Role.SUPERVISOR && shiftSwap.requiresUnitHead;
    const isSupervisor = user.role === Role.SUPERVISOR;
    const isAdmin = user.role === Role.ADMIN;

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
      // Pegawai tujuan merespons permintaan awal
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
        throw new BadRequestException('Tindakan tidak valid untuk pegawai tujuan');
      }
    } else if (
      isUnitHead &&
      shiftSwap.status === SwapStatus.WAITING_UNIT_HEAD
    ) {
      // Respons kepala unit
      if (responseDto.action === ResponseAction.APPROVE) {
        newStatus = SwapStatus.WAITING_SUPERVISOR;
        updateData.unitHeadApprovedAt = new Date();
        updateData.unitHeadApprovedBy = userId;
      } else if (responseDto.action === ResponseAction.REJECT) {
        newStatus = SwapStatus.REJECTED_BY_UNIT_HEAD;
        updateData.rejectionReason = responseDto.rejectionReason;
      } else {
        throw new BadRequestException('Tindakan tidak valid untuk kepala unit');
      }
    } else if (
      (isSupervisor || isAdmin) &&
      shiftSwap.status === SwapStatus.WAITING_SUPERVISOR
    ) {
      // Persetujuan akhir penyelia atau administrator
      if (responseDto.action === ResponseAction.APPROVE) {
        newStatus = SwapStatus.APPROVED;
        updateData.supervisorApprovedAt = new Date();
        updateData.supervisorApprovedBy = userId;

        // Transfer otomatis kepemilikan shift ketika disetujui
        await this.transferShiftOwnership(shiftSwap);
      } else if (responseDto.action === ResponseAction.REJECT) {
        newStatus = SwapStatus.REJECTED_BY_SUPERVISOR;
        updateData.rejectionReason = responseDto.rejectionReason;
      } else {
        throw new BadRequestException('Tindakan tidak valid untuk penyelia/administrator');
      }
    } else {
      throw new ForbiddenException(
        'Anda tidak berwenang merespons permintaan ini pada tahap saat ini',
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

    // Kirim notifikasi ke penyelia jika status WAITING_SUPERVISOR
    if (newStatus === SwapStatus.WAITING_SUPERVISOR) {
      // Cari semua penyelia di unit terkait
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

    // Setelah tukar shift disetujui oleh penyelia, kirim notifikasi ke kedua pegawai
    if (newStatus === SwapStatus.APPROVED) {
      // Notifikasi ke pengaju (fromUser)
      await this.notificationService.sendNotification(
        shiftSwap.fromUserId,
        JenisNotifikasi.KONFIRMASI_TUKAR_SHIFT,
        'Tukar Shift Disetujui',
        `Permintaan tukar shift Anda dengan ${shiftSwap.toUser?.namaDepan || ''} ${shiftSwap.toUser?.namaBelakang || ''} pada tanggal ${shiftSwap.tanggalSwap instanceof Date ? shiftSwap.tanggalSwap.toISOString().split('T')[0] : shiftSwap.tanggalSwap} telah disetujui dan jadwal sudah diperbarui.`,
        { shiftSwapId: id },
      );
      // Notifikasi ke mitra (toUser)
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
      throw new NotFoundException('Pegawai tidak ditemukan');
    }

    // Hanya izinkan pengaju untuk memperbarui permintaan mereka sendiri jika masih menunggu
    if (shiftSwap.fromUserId !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Anda hanya dapat memperbarui permintaan Anda sendiri');
    }

    if (shiftSwap.status !== SwapStatus.PENDING) {
      throw new BadRequestException(
        'Tidak dapat memperbarui permintaan yang sudah diproses',
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
      throw new NotFoundException('Pegawai tidak ditemukan');
    }

    // Hanya izinkan pengaju atau administrator untuk menghapus
    if (shiftSwap.fromUserId !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Anda hanya dapat menghapus permintaan Anda sendiri');
    }

    // Hanya izinkan penghapusan jika permintaan masih menunggu
    if (shiftSwap.status !== SwapStatus.PENDING) {
      throw new BadRequestException(
        'Tidak dapat menghapus permintaan yang sudah diproses',
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
      throw new BadRequestException('Identitas pegawai diperlukan');
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
        // Supervisors see only requests waiting for their approval
        where.OR = [
          { status: SwapStatus.WAITING_SUPERVISOR },
          { status: SwapStatus.WAITING_UNIT_HEAD, requiresUnitHead: true },
        ];
      } else if (user.role === Role.ADMIN) {
        // Admins see all requests for monitoring (pending + approved + rejected)
        // No where clause - get all requests for monitoring
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
        error.message || 'Gagal mendapatkan persetujuan yang tertunda',
      );
    }
  }

  /**
   * Transfer kepemilikan shift ketika permintaan tukar disetujui
   * Metode ini menukar userId antara pengaju dan pegawai tujuan
   */
  private async transferShiftOwnership(shiftSwap: ShiftSwap): Promise<void> {
    try {
      // Cari shift yang akan ditukar
      const originalShift = await this.prisma.shift.findUnique({
        where: { id: shiftSwap.shiftId },
        include: { user: true },
      });

      if (!originalShift) {
        throw new Error(
          `Shift asli dengan ID ${shiftSwap.shiftId} tidak ditemukan`,
        );
      }

      // Cari shift terkait untuk pegawai tujuan pada tanggal yang sama
      const targetShift = await this.prisma.shift.findFirst({
        where: {
          userId: shiftSwap.toUserId,
          tanggal: originalShift.tanggal,
        },
        include: { user: true },
      });

      if (!targetShift) {
        // Jika pegawai tujuan tidak memiliki shift pada tanggal yang sama, cukup transfer shift
        await this.prisma.shift.update({
          where: { id: originalShift.id },
          data: { userId: shiftSwap.toUserId },
        });

        console.log(
          `Shift ${originalShift.id} ditransfer dari pegawai ${shiftSwap.fromUserId} ke pegawai ${shiftSwap.toUserId}`,
        );
      } else {
        // Jika kedua pegawai memiliki shift pada tanggal yang sama, tukar keduanya
        await this.prisma.$transaction(async (tx) => {
          // Perbarui shift asli ke pegawai tujuan
          await tx.shift.update({
            where: { id: originalShift.id },
            data: { userId: shiftSwap.toUserId },
          });

          // Perbarui shift tujuan ke pegawai asli
          await tx.shift.update({
            where: { id: targetShift.id },
            data: { userId: shiftSwap.fromUserId },
          });
        });

        console.log(
          `Shift ditukar: Shift ${originalShift.id} (${shiftSwap.fromUserId} → ${shiftSwap.toUserId}), Shift ${targetShift.id} (${shiftSwap.toUserId} → ${shiftSwap.fromUserId})`,
        );
      }
    } catch (error) {
      console.error('Kesalahan dalam transfer kepemilikan shift:', error);
      throw new Error(
        `Gagal mentransfer kepemilikan shift: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`,
      );
    }
  }

  /**
   * Dapatkan data pemantauan komprehensif untuk administrator
   * Termasuk semua permintaan dengan statistik dan tren
   */
  async getAdminMonitoringData(userId: number) {
    if (!userId) {
      throw new BadRequestException('Identitas pegawai diperlukan');
    }

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('Pegawai tidak ditemukan');
      }

      if (user.role !== Role.ADMIN) {
        throw new ForbiddenException('Hanya administrator yang dapat mengakses data pemantauan');
      }

      // Dapatkan semua permintaan tukar shift
      const allRequests = await this.prisma.shiftSwap.findMany({
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
          supervisorApprover: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Kelompokkan permintaan berdasarkan status
      const groupedRequests = {
        pending: allRequests.filter(req => 
          req.status === SwapStatus.PENDING || 
          req.status === SwapStatus.APPROVED_BY_TARGET ||
          req.status === SwapStatus.WAITING_SUPERVISOR ||
          req.status === SwapStatus.WAITING_UNIT_HEAD
        ),
        approved: allRequests.filter(req => req.status === SwapStatus.APPROVED),
        rejected: allRequests.filter(req => 
          req.status === SwapStatus.REJECTED_BY_TARGET ||
          req.status === SwapStatus.REJECTED_BY_SUPERVISOR ||
          req.status === SwapStatus.REJECTED_BY_UNIT_HEAD
        ),
      };

      // Hitung statistik
      const stats = {
        total: allRequests.length,
        approved: groupedRequests.approved.length,
        rejected: groupedRequests.rejected.length,
        pending: groupedRequests.pending.length,
        approvalRate: allRequests.length > 0 ? 
          (groupedRequests.approved.length / allRequests.length * 100) : 0,
      };

      // Tren bulanan
      const monthlyData = {};
      allRequests.forEach(req => {
        const date = new Date(req.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: date.toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long' 
            }),
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0,
            avgProcessingTime: 0,
            totalProcessingTime: 0,
            processedCount: 0,
          };
        }
        
        monthlyData[monthKey].total++;
        
        if (req.status === SwapStatus.APPROVED) {
          monthlyData[monthKey].approved++;
          
          // Hitung waktu pemrosesan
          if (req.createdAt && req.supervisorApprovedAt) {
            const created = new Date(req.createdAt);
            const approved = new Date(req.supervisorApprovedAt);
            const processingHours = (approved.getTime() - created.getTime()) / (1000 * 60 * 60);
            monthlyData[monthKey].totalProcessingTime += processingHours;
            monthlyData[monthKey].processedCount++;
          }
        } else if (req.status.toString().includes('REJECTED')) {
          monthlyData[monthKey].rejected++;
        } else {
          monthlyData[monthKey].pending++;
        }
      });

      // Hitung rata-rata bulanan
      Object.keys(monthlyData).forEach(monthKey => {
        const month = monthlyData[monthKey];
        month.avgProcessingTime = month.processedCount > 0 ? 
          month.totalProcessingTime / month.processedCount : 0;
        month.approvalRate = month.total > 0 ? 
          (month.approved / month.total * 100) : 0;
      });

      // Performa penyetuju
      const approverStats = {};
      allRequests.forEach(req => {
        if (req.supervisorApprovedBy) {
          if (!approverStats[req.supervisorApprovedBy]) {
            approverStats[req.supervisorApprovedBy] = {
              approverId: req.supervisorApprovedBy,
              approverName: req.supervisorApprover ? 
                `${req.supervisorApprover.namaDepan} ${req.supervisorApprover.namaBelakang}` : 
                'Tidak Diketahui',
              approverRole: req.supervisorApprover?.role || 'Tidak Diketahui',
              count: 0,
              avgProcessingTime: 0,
              totalProcessingTime: 0,
            };
          }
          
          approverStats[req.supervisorApprovedBy].count++;
          
          if (req.createdAt && req.supervisorApprovedAt) {
            const created = new Date(req.createdAt);
            const approved = new Date(req.supervisorApprovedAt);
            const processingHours = (approved.getTime() - created.getTime()) / (1000 * 60 * 60);
            approverStats[req.supervisorApprovedBy].totalProcessingTime += processingHours;
          }
        }
      });

      // Hitung rata-rata penyetuju
      Object.keys(approverStats).forEach(approverId => {
        const stats = approverStats[approverId];
        stats.avgProcessingTime = stats.count > 0 ? 
          stats.totalProcessingTime / stats.count : 0;
        stats.share = groupedRequests.approved.length > 0 ? 
          (stats.count / groupedRequests.approved.length * 100) : 0;
      });

      return {
        requests: groupedRequests,
        stats,
        monthlyTrends: Object.values(monthlyData).sort((a: any, b: any) => 
          new Date(a.month).getTime() - new Date(b.month).getTime()
        ),
        approverPerformance: Object.values(approverStats).sort((a: any, b: any) => 
          b.count - a.count
        ),
      };
    } catch (error) {
      console.error(
        '[ShiftSwapRequestService][getAdminMonitoringData] Error:',
        error,
      );
      throw new InternalServerErrorException(
        (error as Error).message || 'Gagal mendapatkan data pemantauan administrator',
      );
    }
  }

}
