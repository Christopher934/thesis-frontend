import { Injectable } from '@nestjs/common';
import { NotifikasiService } from './notifikasi.service';

/**
 * Simplified Notification Integration Service (without WebSocket)
 * Use this service to send notifications from other services
 */
@Injectable()
export class NotificationIntegrationService {
  constructor(
    private notifikasiService: NotifikasiService,
  ) {}

  /**
   * Send new shift notification to user
   */
  async notifyNewShift(userId: number, shiftData: any) {
    try {
      const notification = await this.notifikasiService.createNewShiftNotification(userId, shiftData);
      return notification;
    } catch (error) {
      console.error('Error sending new shift notification:', error);
      return null;
    }
  }

  /**
   * Send shift reminder notification
   */
  async notifyShiftReminder(userId: number, shiftData: any) {
    try {
      const notification = await this.notifikasiService.createShiftReminderNotification(userId, shiftData);
      return notification;
    } catch (error) {
      console.error('Error sending shift reminder:', error);
      return null;
    }
  }

  /**
   * Send shift swap confirmation
   */
  async notifyShiftSwap(userId: number, swapData: any) {
    try {
      const notification = await this.notifikasiService.createShiftSwapNotification(userId, swapData);
      return notification;
    } catch (error) {
      console.error('Error sending shift swap notification:', error);
      return null;
    }
  }

  /**
   * Send late attendance notification
   */
  async notifyLateAttendance(userId: number, attendanceData: any) {
    try {
      const notification = await this.notifikasiService.createLateAttendanceNotification(userId, attendanceData);
      return notification;
    } catch (error) {
      console.error('Error sending late attendance notification:', error);
      return null;
    }
  }

  /**
   * Generic notification sender
   */
  async notifyUser(userId: number, title: string, message: string, type: any, data?: any) {
    try {
      const notification = await this.notifikasiService.createNotification({
        userId,
        judul: title,
        pesan: message,
        jenis: type,
        data,
        sentVia: 'BOTH'
      });
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }
}
