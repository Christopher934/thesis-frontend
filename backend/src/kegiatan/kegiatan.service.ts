import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationIntegrationService } from '../notifikasi/notification-integration.service';
import { Prisma, JenisNotifikasi } from '@prisma/client';

@Injectable()
export class KegiatanService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationIntegrationService,
  ) {}

  async findAll() {
    return this.prisma.kegiatan.findMany();
  }

  async findOne(id: number) {
    return this.prisma.kegiatan.findUnique({ where: { id } });
  }

  // @ts-nocheck
  async create(data: any): Promise<any> {
    try {
      const eventData = {
        nama: data.nama || data.title || 'Untitled Event',
        deskripsi: data.deskripsi || data.description || 'No description provided',
        jenisKegiatan: data.jenisKegiatan || data.type || 'PENGUMUMAN',
        lokasi: data.lokasi || data.location || 'To be determined',
        penanggungJawab: data.penanggungJawab || data.responsiblePerson || 'Admin',
        tanggalMulai: data.tanggalMulai ? new Date(data.tanggalMulai) 
          : data.startDate ? new Date(data.startDate) 
          : new Date(),
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai)
          : data.endDate ? new Date(data.endDate)
          : null,
        waktuMulai: data.waktuMulai || data.startTime || '09:00:00',
        waktuSelesai: data.waktuSelesai || data.endTime || '17:00:00',
        targetPeserta: Array.isArray(data.targetPeserta) 
          ? data.targetPeserta
          : data.targetParticipants ? data.targetParticipants
          : ['ADMIN'],
        prioritas: data.prioritas || data.priority || 'SEDANG',
        status: data.status || 'DRAFT',
        lokasiDetail: data.lokasiDetail || data.locationDetail || null,
        kapasitas: data.kapasitas || data.capacity || null,
        anggaran: data.anggaran || data.budget || null,
        departemen: data.departemen || data.department || null,
        kontak: data.kontak || data.contact || null,
        catatan: data.catatan || data.notes || null,
      };
      
      const event = await this.prisma.kegiatan.create({ data: eventData });

      // Send notifications for new event
      await this.sendEventNotifications(event, 'EVENT_CREATED');

      return event;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, data: any): Promise<any> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const event = await this.prisma.kegiatan.update({ where: { id }, data });

      // Send notifications for updated event
      await this.sendEventNotifications(event, 'EVENT_UPDATED');

      return event;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Event not found');
        }
      }
      // Fallback: convert error to string for message
      let msg = 'Failed to update event';
      if (
        error &&
        typeof error === 'object' &&
        error !== null &&
        Object.prototype.hasOwnProperty.call(error, 'message')
      ) {
        msg = String((error as { message?: unknown }).message);
      }
      throw new BadRequestException(msg);
    }
  }

  async remove(id: number) {
    return this.prisma.kegiatan.delete({ where: { id } });
  }

  /**
   * Send notifications when events are created or updated
   */
  private async sendEventNotifications(
    event: any,
    action: 'EVENT_CREATED' | 'EVENT_UPDATED',
  ): Promise<void> {
    try {
      // Get admin users to notify
      const adminUsers = await this.prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPERVISOR'],
          },
        },
      });

      const eventTitle =
        action === 'EVENT_CREATED' ? 'Event Baru Dibuat' : 'Event Diperbarui';
      const eventMessage = `${eventTitle}: ${
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        event.nama || 'Event Tanpa Judul'
      }`;

      // Send notifications to all admin users
      for (const admin of adminUsers) {
        await this.notificationService.sendNotification(
          admin.id,
          JenisNotifikasi.PENGUMUMAN,
          eventTitle,
          eventMessage,
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            eventId: event.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            eventName: event.nama,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            eventDate: event.tanggalMulai,
            action,
          },
        );
      }

      // If event has target participants, notify them too
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (event.targetPeserta && Array.isArray(event.targetPeserta)) {
        const targetUsers = await this.prisma.user.findMany({
          where: {
            role: {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              in: event.targetPeserta,
            },
          },
        });

        for (const user of targetUsers) {
          await this.notificationService.sendNotification(
            user.id,
            JenisNotifikasi.PENGUMUMAN,
            `Event untuk ${user.role}`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            `Anda diundang ke event: ${event.nama}`,
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              eventId: event.id,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              eventName: event.nama,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              eventDate: event.tanggalMulai,
              action,
            },
          );
        }
      }
    } catch (error) {
      // Log error but don't fail the event creation
      console.error('Failed to send event notifications:', error);
    }
  }
}
