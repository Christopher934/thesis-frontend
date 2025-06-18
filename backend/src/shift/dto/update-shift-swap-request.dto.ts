import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SwapStatus } from '@prisma/client';

export class UpdateShiftSwapRequestDto {
  @IsEnum(SwapStatus)
  @IsOptional()
  status?: SwapStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
