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

  /**
   * Enhanced User-Based Notification Methods
   */

  /**
   * Send personal attendance reminder
   */
  async sendPersonalAttendanceReminder(
    userId: number,
    reminderData: {
      shiftTime: string;
      location: string;
      reminderMinutes?: number;
    },
  ): Promise<any> {
    return await this.notifikasiService.sendPersonalAttendanceReminder(
      userId,
      reminderData,
    );
  }

  /**
   * Send personal task assignment
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
    return await this.notifikasiService.sendPersonalTaskAssignment(
      userId,
      taskData,
    );
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
    return await this.notifikasiService.sendPersonalEvaluationResults(
      userId,
      evaluationData,
    );
  }

  /**
   * Send personal shift swap confirmation between users
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
    return await this.notifikasiService.sendPersonalShiftSwapConfirmation(
      requesterUserId,
      targetUserId,
      swapData,
    );
  }

  /**
   * Send interactive announcement to multiple users
   */
  async sendInteractiveAnnouncement(announcementData: {
    title: string;
    content: string;
    targetRoles: string[];
    interactionType: 'INTEREST' | 'CONFIRMATION' | 'FEEDBACK';
    deadline?: string;
    maxParticipants?: number;
  }): Promise<any[]> {
    return await this.notifikasiService.sendInteractiveAnnouncement(
      announcementData,
    );
  }

  /**
   * Send director-level notification
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
    return await this.notifikasiService.sendDirectorNotification(
      userId,
      notificationData,
    );
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
    return await this.notifikasiService.sendPersonalMeetingReminder(
      userId,
      meetingData,
    );
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
    return await this.notifikasiService.sendPersonalWarning(userId, warningData);
  }

  /**
   * Handle interactive notification response
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
    return await this.notifikasiService.handleInteractiveResponse(
      userId,
      notificationId,
      responseData,
    );
  }

  /**
   * Get user-specific notifications with enhanced filtering
   */
  async getUserSpecificNotifications(
    userId: number,
    filters?: {
      types?: any[];
      status?: any;
      isPersonal?: boolean;
      requiresInteraction?: boolean;
    },
  ): Promise<any[]> {
    return await this.notifikasiService.getUserSpecificNotifications(
      userId,
      filters,
    );
  }
}