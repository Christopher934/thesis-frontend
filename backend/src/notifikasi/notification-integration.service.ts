import { Injectable, Logger } from '@nestjs/common';
import { NotifikasiService } from './notifikasi.service';
import { TelegramService } from './telegram.service';
import { JenisNotifikasi } from '@prisma/client';

@Injectable()
export class NotificationIntegrationService {
  private readonly logger = new Logger(NotificationIntegrationService.name);

  constructor(
    private readonly notifikasiService: NotifikasiService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Send notification through web channel only (simplified version)
   */
  async sendNotification(
    userId: number,
    jenis: JenisNotifikasi,
    judul: string,
    pesan: string,
    data?: any,
  ): Promise<any> {
    try {
      // Create web notification
      const notification = await this.notifikasiService.createNotification({
        userId,
        jenis,
        judul,
        pesan,
        data,
      });

      this.logger.log(`Web notification created successfully`);
      return notification;
    } catch (error: any) {
      this.logger.error(`Failed to send notification: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Send shift reminder notification
   */
  async sendShiftReminder(userId: number, shiftData: any): Promise<any> {
    return await this.notifikasiService.createShiftReminderNotification(userId, shiftData);
  }

  /**
   * Send shift swap confirmation notification
   */
  async sendShiftSwapConfirmation(userId: number, swapData: any): Promise<any> {
    return await this.notifikasiService.createShiftSwapNotification(userId, swapData);
  }

  /**
   * Send leave approval notification
   */
  async sendLeaveApproval(userId: number, leaveDetails: any): Promise<any> {
    const judul = 'Leave Request Approved';
    const pesan = `Your leave request has been approved`;

    return await this.sendNotification(
      userId,
      JenisNotifikasi.PERSETUJUAN_CUTI,
      judul,
      pesan,
      { leaveId: leaveDetails?.id },
    );
  }

  /**
   * Send late attendance alert
   */
  async sendLateAttendanceAlert(userId: number, attendanceDetails: any): Promise<any> {
    const judul = 'Late Attendance Alert';
    const pesan = `You are marked as late for today's shift`;

    return await this.sendNotification(
      userId,
      JenisNotifikasi.ABSENSI_TERLAMBAT,
      judul,
      pesan,
      { attendanceId: attendanceDetails?.id },
    );
  }
}