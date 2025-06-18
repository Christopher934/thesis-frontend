import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateShiftSwapRequestDto {
  @IsInt()
  @IsNotEmpty()
  toUserId: number;

  @IsInt()
  @IsNotEmpty()
  shiftId: number;

  @IsString()
  @IsOptional()
  alasan?: string;

  @IsBoolean()
  @IsOptional()
  requiresUnitHead?: boolean;
}
