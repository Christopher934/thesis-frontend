import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { NotificationIntegrationService } from './notification-integration.service';
import { NotifikasiService } from './notifikasi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/user-notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserNotificationsController {
  constructor(
    private readonly notificationIntegrationService: NotificationIntegrationService,
    private readonly notifikasiService: NotifikasiService,
  ) {}

  /**
   * Send personal attendance reminder
   */
  @Post('personal-attendance-reminder')
  @Roles('ADMIN', 'SUPERVISOR')
  async sendPersonalAttendanceReminder(
    @Body()
    body: {
      userId: number;
      shiftTime: string;
      location: string;
      reminderMinutes?: number;
    },
  ) {
    const { userId, ...reminderData } = body;
    return await this.notificationIntegrationService.sendPersonalAttendanceReminder(
      userId,
      reminderData,
    );
  }

  /**
   * Send personal task assignment
   */
  @Post('personal-task-assignment')
  @Roles('ADMIN', 'SUPERVISOR')
  async sendPersonalTaskAssignment(
    @Body()
    body: {
      userId: number;
      taskId: number;
      taskTitle: string;
      description: string;
      dueDate: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      assignedBy: string;
    },
  ) {
    const { userId, ...taskData } = body;
    return await this.notificationIntegrationService.sendPersonalTaskAssignment(
      userId,
      taskData,
    );
  }

  /**
   * Send personal evaluation results
   */
  @Post('personal-evaluation-results')
  @Roles('ADMIN', 'SUPERVISOR')
  async sendPersonalEvaluationResults(
    @Body()
    body: {
      userId: number;
      evaluationId: number;
      evaluationType: string;
      score: number;
      feedback: string;
      evaluatedBy: string;
      evaluationDate: string;
    },
  ) {
    const { userId, ...evaluationData } = body;
    return await this.notificationIntegrationService.sendPersonalEvaluationResults(
      userId,
      evaluationData,
    );
  }

  /**
   * Send personal shift swap confirmation
   */
  @Post('personal-shift-swap')
  @Roles('ADMIN', 'SUPERVISOR', 'PERAWAT', 'DOKTER')
  async sendPersonalShiftSwapConfirmation(
    @Body()
    body: {
      requesterUserId: number;
      targetUserId: number;
      swapId: number;
      requesterShiftDate: string;
      requesterShiftTime: string;
      targetShiftDate: string;
      targetShiftTime: string;
      reason: string;
    },
  ) {
    const { requesterUserId, targetUserId, ...swapData } = body;
    return await this.notificationIntegrationService.sendPersonalShiftSwapConfirmation(
      requesterUserId,
      targetUserId,
      swapData,
    );
  }

  /**
   * Send interactive announcement
   */
  @Post('interactive-announcement')
  @Roles('ADMIN', 'SUPERVISOR')
  async sendInteractiveAnnouncement(
    @Body()
    body: {
      title: string;
      content: string;
      targetRoles: string[];
      interactionType: 'INTEREST' | 'CONFIRMATION' | 'FEEDBACK';
      deadline?: string;
      maxParticipants?: number;
    },
  ) {
    return await this.notificationIntegrationService.sendInteractiveAnnouncement(
      body,
    );
  }

  /**
   * Send director notification
   */
  @Post('director-notification')
  @Roles('ADMIN')
  async sendDirectorNotification(
    @Body()
    body: {
      userId: number;
      title: string;
      content: string;
      priority: 'URGENT' | 'HIGH' | 'NORMAL';
      actionRequired?: boolean;
      relatedDocumentId?: number;
    },
  ) {
    const { userId, ...notificationData } = body;
    return await this.notificationIntegrationService.sendDirectorNotification(
      userId,
      notificationData,
    );
  }

  /**
   * Send personal meeting reminder
   */
  @Post('personal-meeting-reminder')
  @Roles('ADMIN', 'SUPERVISOR')
  async sendPersonalMeetingReminder(
    @Body()
    body: {
      userId: number;
      meetingId: number;
      title: string;
      startTime: string;
      location: string;
      reminderMinutes: number;
      organizer: string;
    },
  ) {
    const { userId, ...meetingData } = body;
    return await this.notificationIntegrationService.sendPersonalMeetingReminder(
      userId,
      meetingData,
    );
  }

  /**
   * Send personal warning
   */
  @Post('personal-warning')
  @Roles('ADMIN', 'SUPERVISOR')
  async sendPersonalWarning(
    @Body()
    body: {
      userId: number;
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
  ) {
    const { userId, ...warningData } = body;
    return await this.notificationIntegrationService.sendPersonalWarning(
      userId,
      warningData,
    );
  }

  /**
   * Handle interactive notification response
   */
  @Put('interactive-response/:notificationId')
  async handleInteractiveResponse(
    @Request() req: any,
    @Param('notificationId') notificationId: string,
    @Body()
    body: {
      responseType: 'INTERESTED' | 'CONFIRMED' | 'DECLINED' | 'FEEDBACK';
      message?: string;
      additionalData?: any;
    },
  ) {
    const userId = req.user.userId;
    const notifId = parseInt(notificationId, 10);

    if (isNaN(notifId)) {
      throw new BadRequestException('Invalid notification ID');
    }

    return await this.notificationIntegrationService.handleInteractiveResponse(
      userId,
      notifId,
      body,
    );
  }

  /**
   * Get user-specific notifications with enhanced filtering
   */
  @Get('user-specific')
  async getUserSpecificNotifications(
    @Request() req: any,
    @Query('types') types?: string,
    @Query('status') status?: string,
    @Query('isPersonal') isPersonal?: string,
    @Query('requiresInteraction') requiresInteraction?: string,
  ) {
    const userId = req.user.userId;

    const filters: any = {};

    if (types) {
      filters.types = types.split(',');
    }

    if (status) {
      filters.status = status;
    }

    if (isPersonal !== undefined) {
      filters.isPersonal = isPersonal === 'true';
    }

    if (requiresInteraction !== undefined) {
      filters.requiresInteraction = requiresInteraction === 'true';
    }

    return await this.notificationIntegrationService.getUserSpecificNotifications(
      userId,
      filters,
    );
  }

  /**
   * Get personal notifications only
   */
  @Get('personal')
  async getPersonalNotifications(@Request() req: any) {
    const userId = req.user.userId;

    return await this.notificationIntegrationService.getUserSpecificNotifications(
      userId,
      { isPersonal: true },
    );
  }

  /**
   * Get interactive notifications requiring response
   */
  @Get('interactive')
  async getInteractiveNotifications(@Request() req: any) {
    const userId = req.user.userId;

    return await this.notificationIntegrationService.getUserSpecificNotifications(
      userId,
      { requiresInteraction: true },
    );
  }
}
