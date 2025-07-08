import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotifikasiService } from './notifikasi.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private notifikasiService: NotifikasiService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Client attempted to connect without token');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;

      // Store connection
      if (client.userId) {
        this.connectedUsers.set(client.userId, client.id);
        
        this.logger.log(`User ${client.userId} connected with socket ${client.id}`);
        
        // Send unread count to newly connected user
        const unreadCount = await this.notifikasiService.getUnreadCount(client.userId);
        client.emit('unreadCount', unreadCount);
      }

    } catch (error) {
      this.logger.error('Failed to authenticate socket connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('joinNotificationRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: number },
  ) {
    if (client.userId === data.userId) {
      await client.join(`user_${data.userId}`);
      this.logger.log(`User ${data.userId} joined notification room`);
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: number },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      await this.notifikasiService.markAsRead(data.notificationId, client.userId);
      
      // Send updated unread count
      const unreadCount = await this.notifikasiService.getUnreadCount(client.userId);
      client.emit('unreadCount', unreadCount);
      
      this.logger.log(`Notification ${data.notificationId} marked as read by user ${client.userId}`);
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { status?: 'read' | 'unread'; limit?: number },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      const notifications = await this.notifikasiService.getNotificationsByUser(
        client.userId,
        data.status === 'unread' ? 'UNREAD' : data.status === 'read' ? 'READ' : undefined,
      );
      
      client.emit('notifications', notifications.slice(0, data.limit || 20));
    } catch (error) {
      this.logger.error('Error fetching notifications:', error);
      client.emit('error', { message: 'Failed to fetch notifications' });
    }
  }

  // Method to send notification to specific user
  async sendNotificationToUser(userId: number, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newNotification', notification);
      
      // Also send updated unread count
      const unreadCount = await this.notifikasiService.getUnreadCount(userId);
      this.server.to(socketId).emit('unreadCount', unreadCount);
      
      this.logger.log(`Real-time notification sent to user ${userId}`);
      return true;
    }
    return false;
  }

  // Method to send notification to multiple users
  async sendNotificationToUsers(userIds: number[], notification: any) {
    const promises = userIds.map(userId => this.sendNotificationToUser(userId, notification));
    const results = await Promise.all(promises);
    return results.filter(result => result).length; // Count successful sends
  }

  // Method to broadcast notification to all connected users
  broadcastNotification(notification: any) {
    this.server.emit('globalNotification', notification);
    this.logger.log('Global notification broadcasted to all users');
  }

  // Method to send unread count update to user
  async sendUnreadCountUpdate(userId: number) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const unreadCount = await this.notifikasiService.getUnreadCount(userId);
      this.server.to(socketId).emit('unreadCount', unreadCount);
      return true;
    }
    return false;
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  isUserConnected(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }
}
