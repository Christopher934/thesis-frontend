import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserTelegramController } from './user-telegram.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
  imports: [
    PrismaModule, 
    NotifikasiModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UserService],
  controllers: [UserController, UserTelegramController],
})
export class UserModule {}
