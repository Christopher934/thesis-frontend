import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram.service';
import { JenisNotifikasi, StatusNotifikasi, SentViaChannel } from '@prisma/client';

export interface CreateNotificationDto {
  userId: number;
  judul: string;
  pesan: string;
  jenis: JenisNotifikasi;
  data?: any;
  sentVia?: SentViaChannel;
}

export interface UpdateNotificationDto {
  status?: StatusNotifikasi;
  telegramSent?: boolean;
  sentVia?: SentViaChannel;
}

@Injectable()
export class NotifikasiService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
  ) {}

  // Ambil notifikasi berdasarkan role dengan filtering
  async getNotificationsByRole(
    userId: number,
    userRole: string,
    status?: StatusNotifikasi,
    type?: string,
  ) {
    if (!userId || !userRole) {
      throw new BadRequestException('userId and userRole are required');
    }
    try {
      console.log(
        `🔍 [DEBUG] getNotificationsByRole called with:`,
        {
          userId,
          userRole,
          status,
          type,
        },
      );

      const whereClause: any = {};

      // Filter berdasarkan role dan jenis notifikasi
      switch (userRole?.toUpperCase()) {
        case 'ADMIN':
          // ✅ Admin dapat melihat SEMUA notifikasi dari semua user
          console.log(`🔍 [DEBUG] ADMIN role - can see all notifications`);
          // Tidak ada filter userId - admin melihat semua
          break;

        case 'SUPERVISOR':
          // ✅ Supervisor dapat melihat:
          // - Approval notifications (dari semua user)
          // - Event/Kegiatan (untuk semua)
          // - System notifications (untuk semua)
          // - Shift notifications (yang melibatkan supervisor)
          console.log(
            `🔍 [DEBUG] SUPERVISOR role - filtered by notification type`,
          );
          whereClause.OR = [
            // Approval notifications - supervisor bisa lihat dari semua user
            { jenis: 'PERSETUJUAN_CUTI' },
            // Event/Kegiatan - semua bisa lihat
            { jenis: 'KEGIATAN_HARIAN' },
            { jenis: 'PENGUMUMAN' },
            // System notifications - semua bisa lihat
            { jenis: 'SISTEM_INFO' },
            // Shift notifications yang melibatkan supervisor atau untuk semua
            {
              jenis: { in: ['SHIFT_BARU_DITAMBAHKAN', 'KONFIRMASI_TUKAR_SHIFT'] },
            },
          ];
          break;

        case 'PERAWAT':
        case 'DOKTER':
          // 🔐 Staff hanya dapat melihat:
          // - Notifikasi mereka sendiri (absensi, reminder shift, tukar shift)
          // - Event/Kegiatan yang bersifat publik
          // - System notifications yang bersifat publik
          console.log(
            `🔍 [DEBUG] PERAWAT/DOKTER role - own notifications + public ones`,
          );
          whereClause.OR = [
            // Notifikasi pribadi mereka sendiri
            {
              AND: [
                { userId: userId },
                {
                  jenis: {
                    in: [
                      'REMINDER_SHIFT', // ✅ Hanya user terkait
                      'ABSENSI_TERLAMBAT', // ✅ Hanya user terkait
                      'KONFIRMASI_TUKAR_SHIFT', // ✅ User yang terlibat dalam tukar shift
                    ],
                  },
                },
              ],
            },
            // Event/Kegiatan publik - semua staff bisa lihat
            { jenis: 'KEGIATAN_HARIAN' },
            { jenis: 'PENGUMUMAN' },
            // System notifications publik - semua bisa lihat
            { jenis: 'SISTEM_INFO' },
            // Shift baru yang ditujukan untuk mereka
            {
              AND: [
                { userId: userId },
                { jenis: 'SHIFT_BARU_DITAMBAHKAN' },
              ],
            },
          ];
          break;

        default:
          // Role lain hanya melihat notifikasi mereka sendiri
          console.log(`🔍 [DEBUG] DEFAULT role - own notifications only`);
          whereClause.userId = userId;
      }

      // Filter tambahan berdasarkan parameter
      if (status) {
        whereClause.status = status;
      }

      if (type) {
        // Jika ada type filter, override jenis filter
        whereClause.jenis = type;
        // Hapus OR clause jika ada type spesifik
        delete whereClause.OR;
      }

      console.log(
        `🔍 [DEBUG] Final whereClause:`,
        JSON.stringify(whereClause, null, 2),
      );

      return this.prisma.notifikasi.findMany({
        where: whereClause,
        include: {
          user: {
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
    } catch (error) {
      console.error('[NotifikasiService][getNotificationsByRole] Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to get notifications');
    }
  }

  // Get unread count berdasarkan role
  async getUnreadCountByRole(
    userId: number,
    userRole: string,
  ): Promise<number> {
    try {
      const whereClause: any = { status: 'UNREAD' };

      // Filter berdasarkan role (sama seperti getNotificationsByRole)
      switch (userRole?.toUpperCase()) {
        case 'ADMIN':
          // ✅ Admin dapat melihat SEMUA notifikasi unread
          break;

        case 'SUPERVISOR':
          // ✅ Supervisor dapat melihat unread notifications yang relevan
          whereClause.OR = [
            // Approval notifications - supervisor bisa lihat dari semua user
            { jenis: 'PERSETUJUAN_CUTI' },
            // Event/Kegiatan - semua bisa lihat
            { jenis: 'KEGIATAN_HARIAN' },
            { jenis: 'PENGUMUMAN' },
            // System notifications - semua bisa lihat
            { jenis: 'SISTEM_INFO' },
            // Shift notifications yang melibatkan supervisor
            {
              jenis: { in: ['SHIFT_BARU_DITAMBAHKAN', 'KONFIRMASI_TUKAR_SHIFT'] },
            },
          ];
          // Hapus status dari OR clause level atas
          delete whereClause.status;
          whereClause.AND = [
            { status: 'UNREAD' },
            { OR: whereClause.OR },
          ];
          delete whereClause.OR;
          break;

        case 'PERAWAT':
        case 'DOKTER':
          // 🔐 Staff hanya dapat melihat unread notifications mereka + public ones
          delete whereClause.status;
          whereClause.AND = [
            { status: 'UNREAD' },
            {
              OR: [
                // Notifikasi pribadi mereka sendiri
                {
                  AND: [
                    { userId: userId },
                    {
                      jenis: {
                        in: [
                          'REMINDER_SHIFT',
                          'ABSENSI_TERLAMBAT',
                          'KONFIRMASI_TUKAR_SHIFT',
                        ],
                      },
                    },
                  ],
                },
                // Event/Kegiatan publik
                { jenis: 'KEGIATAN_HARIAN' },
                { jenis: 'PENGUMUMAN' },
                // System notifications publik
                { jenis: 'SISTEM_INFO' },
                // Shift baru yang ditujukan untuk mereka
                {
                  AND: [
                    { userId: userId },
                    { jenis: 'SHIFT_BARU_DITAMBAHKAN' },
                  ],
                },
              ],
            },
          ];
          break;

        default:
          whereClause.userId = userId;
      }

      return this.prisma.notifikasi.count({
        where: whereClause,
      });
    } catch (error) {
      console.error('[NOTIFIKASI] Error getUnreadCountByRole:', error);
      throw new Error('Gagal mengambil jumlah notifikasi belum dibaca. Pastikan user dan role valid.');
    }
  }

  // Buat notifikasi baru
  async createNotification(dto: CreateNotificationDto) {
    if (!dto.userId || !dto.judul || !dto.pesan || !dto.jenis) {
      throw new BadRequestException('userId, judul, pesan, and jenis are required');
    }
    try {
      const notification = await this.prisma.notifikasi.create({
        data: {
          userId: dto.userId,
          judul: dto.judul,
          pesan: dto.pesan,
          jenis: dto.jenis,
          data: dto.data,
          sentVia: dto.sentVia || SentViaChannel.WEB,
        },
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              telegramChatId: true,
            },
          },
        },
      });

      // Jika user punya Telegram Chat ID, kirim ke Telegram
      if (notification.user && notification.user.telegramChatId) {
        await this.sendToTelegram(notification);
      }

      return notification;
    } catch (error) {
      console.error('[NotifikasiService][createNotification] Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to create notification');
    }
  }

  // Ambil notifikasi untuk user tertentu
  async getNotificationsByUser(userId: number, status?: StatusNotifikasi) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.prisma.notifikasi.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
          },
        },
      },
    });
  }

  // Update status notifikasi (mark as read, dll)
  async updateNotification(id: number, dto: UpdateNotificationDto) {
    if (!id) {
      throw new BadRequestException('Notification id is required');
    }
    try {
      return this.prisma.notifikasi.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      console.error('[NotifikasiService][updateNotification] Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to update notification');
    }
  }

  // Mark notification as read (with user verification)
  async markAsRead(id: number, userId: number) {
    // First check if the notification belongs to the user
    const notification = await this.prisma.notifikasi.findFirst({
      where: {
        id: id,
        userId: userId, // Ensure only the owner can mark as read
      },
    });

    if (!notification) {
      throw new Error(
        'Notification not found or you do not have permission to mark it as read',
      );
    }

    return this.prisma.notifikasi.update({
      where: { id },
      data: { status: 'READ' },
    });
  }

  // Mark multiple notifications as read (with user verification)
  async markMultipleAsRead(ids: number[], userId: number) {
    return this.prisma.notifikasi.updateMany({
      where: {
        id: { in: ids },
        userId: userId, // Ensure only the owner can mark their notifications as read
      },
      data: { status: 'READ' },
    });
  }

  // Delete notification (with user verification)
  async deleteNotification(id: number, userId: number) {
    if (!id) {
      throw new BadRequestException('Notification id is required');
    }
    try {
      // First check if the notification belongs to the user
      const notification = await this.prisma.notifikasi.findFirst({
        where: {
          id: id,
          userId: userId, // Ensure only the owner can delete their notification
        },
      });

      if (!notification) {
        throw new Error(
          'Notification not found or you do not have permission to delete it',
        );
      }

      return this.prisma.notifikasi.delete({
        where: { id },
      });
    } catch (error) {
      console.error('[NotifikasiService][deleteNotification] Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to delete notification');
    }
  }

  // Get unread count for user
  async getUnreadCount(userId: number) {
    return this.prisma.notifikasi.count({
      where: {
        userId,
        status: 'UNREAD',
      },
    });
  }

  // Helper methods untuk membuat notifikasi spesifik

  // Reminder shift (1 jam sebelum shift)
  async createShiftReminderNotification(userId: number, shiftData: any) {
    const judul = '🕒 Pengingat Shift';
    const pesan = `Halo, Anda akan mulai shift:

🕒 ${shiftData.tipeshift}: ${shiftData.jammulai} - ${shiftData.jamselesai}
🏥 Lokasi: ${shiftData.lokasishift}
📅 Tanggal: ${new Date(shiftData.tanggal).toLocaleDateString('id-ID')}

Silakan bersiap tepat waktu 🙏`;

    return this.createNotification({
      userId,
      judul,
      pesan,
      jenis: 'REMINDER_SHIFT',
      data: shiftData,
      sentVia: 'BOTH', // Web dan Telegram
    });
  }

  // Notifikasi shift baru ditambahkan
  async createNewShiftNotification(userId: number, shiftData: any) {
    const judul = '📅 Shift Baru Ditambahkan';
    const pesan = `Shift baru telah ditambahkan untuk Anda:

🕒 ${shiftData.tipeshift}: ${shiftData.jammulai} - ${shiftData.jamselesai}
🏥 Lokasi: ${shiftData.lokasishift}
📅 Tanggal: ${new Date(shiftData.tanggal).toLocaleDateString('id-ID')}

Silakan cek jadwal Anda untuk detail lengkap.`;

    return this.createNotification({
      userId,
      judul,
      pesan,
      jenis: 'SHIFT_BARU_DITAMBAHKAN',
      data: shiftData,
    });
  }

  // Notifikasi konfirmasi tukar shift
  async createShiftSwapNotification(userId: number, swapData: any) {
    const judul = '🔄 Konfirmasi Tukar Shift';
    const pesan = `Permintaan tukar shift Anda telah ${swapData.status === 'APPROVED' ? 'disetujui' : 'ditolak'}:

📅 Shift asal: ${new Date(swapData.originalShift.tanggal).toLocaleDateString('id-ID')}
🕒 Waktu: ${swapData.originalShift.jammulai} - ${swapData.originalShift.jamselesai}
👤 Ditukar dengan: ${swapData.targetUser.namaDepan} ${swapData.targetUser.namaBelakang}

${swapData.status === 'APPROVED' ? 'Shift berhasil ditukar!' : 'Silakan ajukan kembali jika perlu.'}`;

    return this.createNotification({
      userId,
      judul,
      pesan,
      jenis: 'KONFIRMASI_TUKAR_SHIFT',
      data: swapData,
    });
  }

  // Notifikasi absensi terlambat
  async createLateAttendanceNotification(userId: number, attendanceData: any) {
    const judul = '⚠️ Absensi Terlambat';
    const pesan = `Absensi Anda terlambat:

📅 Tanggal: ${new Date(attendanceData.tanggal).toLocaleDateString('id-ID')}
🕒 Jam masuk: ${attendanceData.jamMasuk}
⏰ Seharusnya: ${attendanceData.jamMulaiShift}
⏱️ Terlambat: ${attendanceData.durasiTerlambat}

Harap lebih tepat waktu di masa mendatang.`;

    return this.createNotification({
      userId,
      judul,
      pesan,
      jenis: 'ABSENSI_TERLAMBAT',
      data: attendanceData,
    });
  }

  // Method untuk kirim ke Telegram
  private async sendToTelegram(notification: any) {
    try {
      if (notification.user.telegramChatId) {
        const message = this.telegramService.formatNotificationMessage(
          notification.judul,
          notification.pesan,
          notification.jenis,
        );

        const success = await this.telegramService.sendMessage({
          chatId: notification.user.telegramChatId,
          message,
          parseMode: 'HTML',
        });

        // Update notification status
        await this.updateNotification(notification.id, { 
          telegramSent: success,
          sentVia: success ? 'BOTH' : 'WEB',
        });

        return success;
      }
      return false;
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }
  }

  // Enhanced User-Based Notification Methods

  /**
   * Send personal attendance reminder to specific user
   */
  async sendPersonalAttendanceReminder(
    userId: number,
    reminderData: {
      shiftTime: string;
      location: string;
      reminderMinutes?: number;
    },
  ): Promise<any> {
    try {
      const judul = 'Personal Attendance Reminder';
      const pesan = `Reminder: Your shift starts at ${reminderData.shiftTime} at ${reminderData.location}. Please ensure you arrive on time.`;

      return await this.createNotification({
        userId,
        judul,
        pesan,
        jenis: JenisNotifikasi.PERSONAL_REMINDER_ABSENSI,
        data: reminderData,
        sentVia: 'WEB',
      });
    } catch (error) {
      console.error('Error sending personal attendance reminder:', error);
      throw new InternalServerErrorException(
        'Failed to send personal attendance reminder',
      );
    }
  }

  /**
   * Send personal task assignment notification
   */
  async sendPersonalTaskAssignment(
    userId: number,
    taskData: {
      taskId: number;
      taskTitle: string;
      description: string;
      dueDate: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      assignedBy: string;
    },
  ): Promise<any> {
    try {
      const judul = `New Personal Task: ${taskData.taskTitle}`;
      const pesan = `You have been assigned a new task by ${taskData.assignedBy}. Priority: ${taskData.priority}. Due date: ${taskData.dueDate}`;

      return await this.createNotification({
        userId,
        judul,
        pesan,
        jenis: JenisNotifikasi.TUGAS_PERSONAL,
        data: taskData,
        sentVia: 'WEB',
      });
    } catch (error) {
      console.error('Error sending personal task assignment:', error);
      throw new InternalServerErrorException(
        'Failed to send personal task assignment',
      );
    }
  }

  /**
   * Send personal evaluation results
   */
  async sendPersonalEvaluationResults(
    userId: number,
    evaluationData: {
      evaluationId: number;
      evaluationType: string;
      score: number;
      feedback: string;
      evaluatedBy: string;
      evaluationDate: string;
    },
  ): Promise<any> {
    try {
      const judul = `Personal Evaluation Results - ${evaluationData.evaluationType}`;
      const pesan = `Your evaluation results are available. Score: ${evaluationData.score}/100. Evaluated by ${evaluationData.evaluatedBy} on ${evaluationData.evaluationDate}`;

      return await this.createNotification({
        userId,
        judul,
        pesan,
        jenis: JenisNotifikasi.HASIL_EVALUASI_PERSONAL,
        data: evaluationData,
        sentVia: 'WEB',
      });
    } catch (error) {
      console.error('Error sending personal evaluation results:', error);
      throw new InternalServerErrorException(
        'Failed to send personal evaluation results',
      );
    }
  }

  /**
   * Send direct shift swap confirmation between two users
   */
  async sendPersonalShiftSwapConfirmation(
    requesterUserId: number,
    targetUserId: number,
    swapData: {
      swapId: number;
      requesterShiftDate: string;
      requesterShiftTime: string;
      targetShiftDate: string;
      targetShiftTime: string;
      reason: string;
    },
  ): Promise<{ requesterNotification: any; targetNotification: any }> {
    try {
      // Get user names for personalized messages
      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { namaDepan: true, namaBelakang: true },
      });

      const target = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { namaDepan: true, namaBelakang: true },
      });

      const requesterName = `${requester?.namaDepan} ${requester?.namaBelakang}`;
      const targetName = `${target?.namaDepan} ${target?.namaBelakang}`;

      // Notification for the requester
      const requesterJudul = 'Shift Swap Request Submitted';
      const requesterPesan = `Your shift swap request has been sent to ${targetName}. Waiting for confirmation.`;

      const requesterNotification = await this.createNotification({
        userId: requesterUserId,
        judul: requesterJudul,
        pesan: requesterPesan,
        jenis: JenisNotifikasi.KONFIRMASI_SHIFT_SWAP_PERSONAL,
        data: { ...swapData, type: 'requester', targetUserName: targetName },
        sentVia: 'WEB',
      });

      // Notification for the target user
      const targetJudul = 'Shift Swap Request Received';
      const targetPesan = `${requesterName} wants to swap shifts with you. Your shift: ${swapData.targetShiftDate} ${swapData.targetShiftTime} → Their shift: ${swapData.requesterShiftDate} ${swapData.requesterShiftTime}`;

      const targetNotification = await this.createNotification({
        userId: targetUserId,
        judul: targetJudul,
        pesan: targetPesan,
        jenis: JenisNotifikasi.KONFIRMASI_SHIFT_SWAP_PERSONAL,
        data: {
          ...swapData,
          type: 'target',
          requesterUserName: requesterName,
        },
        sentVia: 'WEB',
      });

      return { requesterNotification, targetNotification };
    } catch (error) {
      console.error('Error sending personal shift swap confirmation:', error);
      throw new InternalServerErrorException(
        'Failed to send personal shift swap confirmation',
      );
    }
  }

  /**
   * Send interactive announcement (role-based that can become user-specific)
   */
  async sendInteractiveAnnouncement(announcementData: {
    title: string;
    content: string;
    targetRoles: string[];
    interactionType: 'INTEREST' | 'CONFIRMATION' | 'FEEDBACK';
    deadline?: string;
    maxParticipants?: number;
  }): Promise<any[]> {
    try {
      // Convert string roles to Role enum values
      const roleEnums = announcementData.targetRoles.filter((role) =>
        ['ADMIN', 'SUPERVISOR', 'PERAWAT', 'DOKTER'].includes(role),
      ) as ('ADMIN' | 'SUPERVISOR' | 'PERAWAT' | 'DOKTER')[];

      // Get all users with target roles
      const targetUsers = await this.prisma.user.findMany({
        where: {
          role: { in: roleEnums },
          status: 'ACTIVE',
        },
        select: { id: true, namaDepan: true, namaBelakang: true, role: true },
      });

      const notifications: any[] = [];

      for (const user of targetUsers) {
        const judul = `Interactive Announcement: ${announcementData.title}`;
        const pesan = `${announcementData.content}${announcementData.deadline ? ` Deadline: ${announcementData.deadline}` : ''}`;

        const notification = await this.createNotification({
          userId: user.id,
          judul,
          pesan,
          jenis: JenisNotifikasi.PENGUMUMAN_INTERAKTIF,
          data: {
            ...announcementData,
            requiresInteraction: true,
            userRole: user.role,
          },
          sentVia: 'WEB',
        });

        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error sending interactive announcement:', error);
      throw new InternalServerErrorException(
        'Failed to send interactive announcement',
      );
    }
  }

  /**
   * Send director-level notification to specific user
   */
  async sendDirectorNotification(
    userId: number,
    notificationData: {
      title: string;
      content: string;
      priority: 'URGENT' | 'HIGH' | 'NORMAL';
      actionRequired?: boolean;
      relatedDocumentId?: number;
    },
  ): Promise<any> {
    try {
      const judul = `[DIRECTOR] ${notificationData.title}`;
      const pesan = `${notificationData.content}${notificationData.actionRequired ? ' (Action Required)' : ''}`;

      return await this.createNotification({
        userId,
        judul,
        pesan,
        jenis: JenisNotifikasi.NOTIFIKASI_DIREKTUR,
        data: notificationData,
        sentVia: 'WEB',
      });
    } catch (error) {
      console.error('Error sending director notification:', error);
      throw new InternalServerErrorException(
        'Failed to send director notification',
      );
    }
  }

  /**
   * Send personal meeting reminder
   */
  async sendPersonalMeetingReminder(
    userId: number,
    meetingData: {
      meetingId: number;
      title: string;
      startTime: string;
      location: string;
      reminderMinutes: number;
      organizer: string;
    },
  ): Promise<any> {
    try {
      const judul = `Meeting Reminder: ${meetingData.title}`;
      const pesan = `Reminder: You have a meeting "${meetingData.title}" starting at ${meetingData.startTime} at ${meetingData.location}. Organized by ${meetingData.organizer}`;

      return await this.createNotification({
        userId,
        judul,
        pesan,
        jenis: JenisNotifikasi.REMINDER_MEETING_PERSONAL,
        data: meetingData,
        sentVia: 'WEB',
      });
    } catch (error) {
      console.error('Error sending personal meeting reminder:', error);
      throw new InternalServerErrorException(
        'Failed to send personal meeting reminder',
      );
    }
  }

  /**
   * Send personal warning notification
   */
  async sendPersonalWarning(
    userId: number,
    warningData: {
      warningType:
        | 'ATTENDANCE'
        | 'PERFORMANCE'
        | 'CONDUCT'
        | 'POLICY_VIOLATION';
      severity: 'VERBAL' | 'WRITTEN' | 'FINAL';
      reason: string;
      issuedBy: string;
      actionRequired?: string;
      deadline?: string;
    },
  ): Promise<any> {
    try {
      const judul = `Personal Warning - ${warningData.warningType}`;
      const pesan = `You have received a ${warningData.severity.toLowerCase()} warning regarding ${warningData.reason}. Issued by ${warningData.issuedBy}${warningData.actionRequired ? `. Action required: ${warningData.actionRequired}` : ''}`;

      return await this.createNotification({
        userId,
        judul,
        pesan,
        jenis: JenisNotifikasi.PERINGATAN_PERSONAL,
        data: warningData,
        sentVia: 'WEB',
      });
    } catch (error) {
      console.error('Error sending personal warning:', error);
      throw new InternalServerErrorException('Failed to send personal warning');
    }
  }

  /**
   * Handle interactive notification response (role-to-user conversion)
   */
  async handleInteractiveResponse(
    userId: number,
    notificationId: number,
    responseData: {
      responseType: 'INTERESTED' | 'CONFIRMED' | 'DECLINED' | 'FEEDBACK';
      message?: string;
      additionalData?: any;
    },
  ): Promise<any> {
    try {
      // Update the original notification
      const originalNotification = await this.prisma.notifikasi.findUnique({
        where: { id: notificationId },
        include: { user: true },
      });

      if (!originalNotification) {
        throw new NotFoundException('Notification not found');
      }

      // Mark as read and update with response
      await this.updateNotification(notificationId, {
        status: StatusNotifikasi.READ,
      });

      // Create follow-up notification based on response
      const followUpJudul = `Response Recorded: ${originalNotification.judul}`;
      const followUpPesan = `Your response "${responseData.responseType}" has been recorded for: ${originalNotification.judul}`;

      const followUpNotification = await this.createNotification({
        userId,
        judul: followUpJudul,
        pesan: followUpPesan,
        jenis: JenisNotifikasi.SISTEM_INFO,
        data: {
          originalNotificationId: notificationId,
          response: responseData,
          convertedToPersonal: true,
        },
        sentVia: 'WEB',
      });

      return {
        originalNotification,
        followUpNotification,
        response: responseData,
      };
    } catch (error) {
      console.error('Error handling interactive response:', error);
      throw new InternalServerErrorException(
        'Failed to handle interactive response',
      );
    }
  }

  /**
   * Get user-specific notifications (enhanced filtering)
   */
  async getUserSpecificNotifications(
    userId: number,
    filters?: {
      types?: JenisNotifikasi[];
      status?: StatusNotifikasi;
      isPersonal?: boolean;
      requiresInteraction?: boolean;
    },
  ): Promise<any[]> {
    try {
      const whereClause: any = { userId };

      if (filters?.types && filters.types.length > 0) {
        whereClause.jenis = { in: filters.types };
      }

      if (filters?.status) {
        whereClause.status = filters.status;
      }

      if (filters?.isPersonal !== undefined) {
        const personalTypes = [
          JenisNotifikasi.PERSONAL_REMINDER_ABSENSI,
          JenisNotifikasi.TUGAS_PERSONAL,
          JenisNotifikasi.HASIL_EVALUASI_PERSONAL,
          JenisNotifikasi.KONFIRMASI_SHIFT_SWAP_PERSONAL,
          JenisNotifikasi.NOTIFIKASI_DIREKTUR,
          JenisNotifikasi.REMINDER_MEETING_PERSONAL,
          JenisNotifikasi.PERINGATAN_PERSONAL,
        ];

        if (filters.isPersonal) {
          whereClause.jenis = { in: personalTypes };
        } else {
          whereClause.jenis = { notIn: personalTypes };
        }
      }

      const notifications = await this.prisma.notifikasi.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter by interaction requirement if specified
      if (filters?.requiresInteraction !== undefined) {
        return notifications.filter(
          (n) => {
            const data = n.data as any;
            return Boolean(data?.requiresInteraction) === filters.requiresInteraction;
          }
        );
      }

      return notifications;
    } catch (error) {
      console.error('Error getting user-specific notifications:', error);
      throw new InternalServerErrorException(
        'Failed to get user-specific notifications',
      );
    }
  }
}