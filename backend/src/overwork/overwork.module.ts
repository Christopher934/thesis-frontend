import { Module } from '@nestjs/common';
import { OverworkRequestController } from './overwork-request.controller';
import { OverworkRequestService } from './overwork-request.service';
import { ShiftValidationService } from '../services/shift-validation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OverworkRequestController],
  providers: [OverworkRequestService, ShiftValidationService],
  exports: [OverworkRequestService, ShiftValidationService],
})
export class OverworkModule {}
