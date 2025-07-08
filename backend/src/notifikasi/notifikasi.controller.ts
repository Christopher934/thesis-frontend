import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { NotifikasiService, CreateNotificationDto } from './notifikasi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatusNotifikasi } from '@prisma/client';

@Controller('notifikasi')
@UseGuards(JwtAuthGuard)
export class NotifikasiController {
  constructor(private readonly notifikasiService: NotifikasiService) {}

  // Get notifikasi untuk user yang sedang login dengan role-based filtering
  @Get()
  async getMyNotifications(
    @Request() req,
    @Query('status') status?: StatusNotifikasi,
    @Query('type') type?: string,
  ) {
    const userId = req.user.id; // Use req.user.id instead of req.user.sub
    const userRole = req.user.role;
    
    return this.notifikasiService.getNotificationsByRole(userId, userRole, status, type);
  }

  // Get jumlah notifikasi yang belum dibaca berdasarkan role
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.id; // Use req.user.id instead of req.user.sub
    const userRole = req.user.role;
    const count = await this.notifikasiService.getUnreadCountByRole(userId, userRole);
    return { unreadCount: count };
  }

  // Mark notification as read
  @Put(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id; // Use req.user.id instead of req.user.sub
    return this.notifikasiService.markAsRead(id, userId);
  }

  // Mark multiple notifications as read
  @Put('mark-read')
  async markMultipleAsRead(@Body() body: { ids: number[] }, @Request() req) {
    const userId = req.user.id; // Use req.user.id instead of req.user.sub
    return this.notifikasiService.markMultipleAsRead(body.ids, userId);
  }

  // Delete notification
  @Delete(':id')
  async deleteNotification(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id; // Use req.user.id instead of req.user.sub
    return this.notifikasiService.deleteNotification(id, userId);
  }

  // Create notification (untuk admin/sistem)
  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notifikasiService.createNotification(dto);
  }

  // Get all notifications for admin
  @Get('admin/all')
  async getAllNotifications(
    @Query('userId') userId?: string,
    @Query('status') status?: StatusNotifikasi,
  ) {
    // TODO: Add admin role check
    if (userId) {
      return this.notifikasiService.getNotificationsByUser(
        parseInt(userId),
        status,
      );
    }
    // Return all notifications for admin view
    // This would need a separate method in service
    return { message: 'Admin view not implemented yet' };
  }

  // Test endpoint untuk membuat notifikasi reminder shift
  @Post('test/shift-reminder')
  async testShiftReminder(@Request() req, @Body() shiftData: any) {
    const userId = req.user.id; // Use req.user.id instead of req.user.sub
    return this.notifikasiService.createShiftReminderNotification(userId, shiftData);
  }

  // Test endpoint untuk membuat notifikasi shift baru
  @Post('test/new-shift')
  async testNewShift(@Request() req, @Body() shiftData: any) {
    const userId = req.user.id; // Use req.user.id instead of req.user.sub
    return this.notifikasiService.createNewShiftNotification(userId, shiftData);
  }
}
