import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { NotifikasiController } from './notifikasi.controller';
import { TelegramController } from './telegram.controller';
import { UserNotificationsController } from './user-notifications.controller';
import { NotifikasiService } from './notifikasi.service';
import { TelegramService } from './telegram.service';
import { TelegramBotService } from './telegram-bot.service';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationIntegrationService } from './notification-integration.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [NotifikasiController, TelegramController, UserNotificationsController],
  providers: [
    NotifikasiService,
    TelegramService,
    TelegramBotService,
    NotificationGateway,
    ScheduledTasksService,
    NotificationIntegrationService,
  ],
  exports: [
    NotifikasiService,
    TelegramService,
    NotificationGateway,
    NotificationIntegrationService,
  ],
})
export class NotifikasiModule {}
