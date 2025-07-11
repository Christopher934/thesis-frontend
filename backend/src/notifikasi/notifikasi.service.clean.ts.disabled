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
    type?: string
  ) {
    const whereClause: any = {};

    // Filter berdasarkan role
    switch (userRole?.toUpperCase()) {
      case 'ADMIN':
        // Admin melihat semua notifikasi
        break;
      
      case 'SUPERVISOR':
        // Supervisor hanya melihat notifikasi jenis approval, shift, event, dan system
        whereClause.jenis = {
          in: [
            'PERSETUJUAN_CUTI', 
            'REMINDER_SHIFT', 
            'KONFIRMASI_TUKAR_SHIFT', 
            'SHIFT_BARU_DITAMBAHKAN', 
            'KEGIATAN_HARIAN', 
            'SISTEM_INFO', 
            'PENGUMUMAN'
          ]
        };
        break;
      
      case 'PERAWAT':
      case 'DOKTER':
        // Staff hanya dapat melihat notifikasi mereka sendiri untuk jenis shift, absensi, event, dan system
        whereClause.userId = userId;
        whereClause.jenis = {
          in: [
            'REMINDER_SHIFT', 
            'KONFIRMASI_TUKAR_SHIFT', 
            'SHIFT_BARU_DITAMBAHKAN', 
            'KEGIATAN_HARIAN', 
            'ABSENSI_TERLAMBAT', 
            'SISTEM_INFO'
          ]
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
  async getUnreadCountByRole(userId: number, userRole: string): Promise<number> {
    const whereClause: any = { status: 'UNREAD' };

    // Filter berdasarkan role (sama seperti getNotificationsByRole)
    switch (userRole?.toUpperCase()) {
      case 'ADMIN':
        // Admin melihat semua notifikasi
        break;
      
      case 'SUPERVISOR':
        whereClause.jenis = {
          in: [
            'PERSETUJUAN_CUTI', 
            'REMINDER_SHIFT', 
            'KONFIRMASI_TUKAR_SHIFT', 
            'SHIFT_BARU_DITAMBAHKAN', 
            'KEGIATAN_HARIAN', 
            'SISTEM_INFO', 
            'PENGUMUMAN'
          ]
        };
        break;
      
      case 'PERAWAT':
      case 'DOKTER':
        whereClause.userId = userId;
        whereClause.jenis = {
          in: [
            'REMINDER_SHIFT', 
            'KONFIRMASI_TUKAR_SHIFT', 
            'SHIFT_BARU_DITAMBAHKAN', 
            'KEGIATAN_HARIAN', 
            'ABSENSI_TERLAMBAT', 
            'SISTEM_INFO'
          ]
        };
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

  // Get unread count untuk user
  async getUnreadCount(userId: number) {
    return this.prisma.notifikasi.count({
      where: {
        userId,
        status: 'UNREAD',
      },
    });
  }
}
