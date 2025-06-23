import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { ShiftSwapRequestController } from './shift-swap-request.controller';
import { ShiftSwapRequestService } from './shift-swap-request.service';
import { JwtModule } from '@nestjs/jwt';
// import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ShiftController, ShiftSwapRequestController],
  providers: [ShiftService, ShiftSwapRequestService],
})
export class ShiftModule {}
