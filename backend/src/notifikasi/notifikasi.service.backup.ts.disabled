import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram.service';
import { JenisNotifikasi, StatusNotifikasi } from '@prisma/client';
// import { NotificationGateway } from './notification.gateway';

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
    // @Inject(forwardRef(() => NotificationGateway))
    // private notificationGateway?: any, // Use any to avoid circular dependency issues
  ) {}

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

      // Jika user punya Telegram Chat ID, kirim ke Telegram untuk SEMUA jenis notifikasi
      if (notification.user.telegramChatId) {
        // Kirim ke Telegram untuk semua jenis notifikasi
        await this.sendToTelegram(notification);
      }

      // Kirim real-time notification via WebSocket jika gateway tersedia
      // if (this.notificationGateway && this.notificationGateway.sendNotificationToUser) {
      //   try {
      //     await this.notificationGateway.sendNotificationToUser(dto.userId, notification);
      //   } catch (error) {
      //     console.error('Failed to send real-time notification:', error);
      //   }
      // }

      return notification;
    } catch (error) {
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

  // Ambil notifikasi berdasarkan role dengan filtering
  async getNotificationsByRole(userId: number, userRole: string, status?: StatusNotifikasi, type?: string) {
    let whereClause: any = {};

    // Filter berdasarkan role
    switch (userRole?.toUpperCase()) {
      case 'ADMIN':
        // Admin melihat semua notifikasi
        break;
      
      case 'SUPERVISOR':
        // Supervisor hanya melihat notifikasi jenis approval, shift, event, dan system
        whereClause.jenis = {
          in: ['PERSETUJUAN_CUTI', 'REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'SHIFT_BARU_DITAMBAHKAN', 'KEGIATAN_HARIAN', 'SISTEM_INFO', 'PENGUMUMAN']
        };
        break;
      
      case 'PERAWAT':
      case 'DOKTER':
        // Staff hanya dapat melihat notifikasi mereka sendiri untuk jenis shift, absensi, event, dan system
        whereClause.userId = userId;
        whereClause.jenis = {
          in: ['REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'SHIFT_BARU_DITAMBAHKAN', 'KEGIATAN_HARIAN', 'ABSENSI_TERLAMBAT', 'SISTEM_INFO']
        };
        break;
      
      default:
        // Role lain hanya melihat notifikasi mereka sendiri
        whereClause.userId = userId;
    }

    // Filter tambahan berdasarkan parameter
    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.jenis = type;
    }

    return this.prisma.notifikasi.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Get unread count untuk user
  async getUnreadCount(userId: number) {
    return this.prisma.notifikasi.count({
      where: {
        userId,
        status: 'UNREAD',
      },
    });
  }

  // Get unread count berdasarkan role
  async getUnreadCountByRole(userId: number, userRole: string): Promise<number> {
    let whereClause: any = { status: 'UNREAD' };

    // Filter berdasarkan role (sama seperti getNotificationsByRole)
    switch (userRole?.toUpperCase()) {
      case 'ADMIN':
        // Admin melihat semua notifikasi
        break;
      
      case 'SUPERVISOR':
        whereClause.jenis = {
          in: ['PERSETUJUAN_CUTI', 'REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'SHIFT_BARU_DITAMBAHKAN', 'KEGIATAN_HARIAN', 'SISTEM_INFO', 'PENGUMUMAN']
        };
        break;
      
      case 'PERAWAT':
      case 'DOKTER':
        whereClause.userId = userId;
        whereClause.jenis = {
          in: ['REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'SHIFT_BARU_DITAMBAHKAN', 'KEGIATAN_HARIAN', 'ABSENSI_TERLAMBAT', 'SISTEM_INFO']
        };
        break;
      
      default:
        whereClause.userId = userId;
    }

    return this.prisma.notifikasi.count({
      where: whereClause
    });
  }

  // Update status notifikasi (mark as read, dll)
  async updateNotification(id: number, dto: UpdateNotificationDto) {
    return this.prisma.notifikasi.update({
      where: { id },
      data: dto,
    });
  }

  // Mark notification as read
  async markAsRead(id: number) {
    return this.updateNotification(id, { status: 'READ' });
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(ids: number[]) {
    return this.prisma.notifikasi.updateMany({
      where: { id: { in: ids } },
      data: { status: 'READ' },
    });
  }

  // Delete notification
  async deleteNotification(id: number) {
    return this.prisma.notifikasi.delete({
      where: { id },
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
          notification.jenis
        );

        const success = await this.telegramService.sendMessage({
          chatId: notification.user.telegramChatId,
          message,
          parseMode: 'HTML'
        });

        // Update notification status
        await this.updateNotification(notification.id, { 
          telegramSent: success,
          sentVia: success ? 'BOTH' : 'WEB'
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
