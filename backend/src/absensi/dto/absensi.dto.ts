import { IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { AbsensiStatus } from '@prisma/client';

export class CreateAbsensiDto {
  @IsOptional()
  @IsString()
  lokasi?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsString()
  catatan?: string;
}

export class UpdateAbsensiDto {
  @IsOptional()
  @IsString()
  lokasi?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsString()
  catatan?: string;

  @IsOptional()
  @IsEnum(AbsensiStatus)
  status?: AbsensiStatus;
}

export class AbsensiQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(AbsensiStatus)
  status?: AbsensiStatus;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
