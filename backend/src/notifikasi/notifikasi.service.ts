import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram.service';
import { JenisNotifikasi, StatusNotifikasi } from '@prisma/client';

export interface CreateNotificationDto {
  userId: number;
  judul: string;
  pesan: string;
  jenis: JenisNotifikasi;
  data?: any;
  sentVia?: string;
}

export interface UpdateNotificationDto {
  status?: StatusNotifikasi;
  telegramSent?: boolean;
  sentVia?: string;
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
  }

  // Get unread count berdasarkan role
  async getUnreadCountByRole(
    userId: number,
    userRole: string,
  ): Promise<number> {
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
  }

  // Buat notifikasi baru
  async createNotification(dto: CreateNotificationDto) {
    try {
      const notification = await this.prisma.notifikasi.create({
        data: {
          userId: dto.userId,
          judul: dto.judul,
          pesan: dto.pesan,
          jenis: dto.jenis,
          data: dto.data,
          sentVia: dto.sentVia || 'WEB',
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
      if (notification.user.telegramChatId) {
        await this.sendToTelegram(notification);
      }

      return notification;
    } catch (error: any) {
      throw new Error(`Failed to create notification: ${error.message}`);
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
    return this.prisma.notifikasi.update({
      where: { id },
      data: dto,
    });
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
}