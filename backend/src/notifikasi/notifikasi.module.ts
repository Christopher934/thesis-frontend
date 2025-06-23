import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { NotifikasiController } from './notifikasi.controller';
import { TelegramController } from './telegram.controller';
import { NotifikasiService } from './notifikasi.service';
import { TelegramService } from './telegram.service';
import { TelegramBotService } from './telegram-bot.service';
// import { ScheduledTasksService } from './scheduled-tasks.service'; // Temporarily commented out
// import { NotificationGateway } from './notification.gateway'; // Temporarily commented out
import { NotificationIntegrationService } from './notification-integration.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [NotifikasiController, TelegramController],
  providers: [
    NotifikasiService,
    TelegramService,
    TelegramBotService,
    // ScheduledTasksService, // Temporarily commented out
    // NotificationGateway, // Temporarily commented out
    NotificationIntegrationService,
  ],
  exports: [
    NotifikasiService,
    TelegramService,
    // NotificationGateway, // Temporarily commented out
    NotificationIntegrationService,
  ], // Export untuk digunakan di module lain
})
export class NotifikasiModule {}
