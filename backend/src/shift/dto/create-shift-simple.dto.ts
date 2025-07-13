import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

// Simple DTO for basic shift creation
export class CreateShiftSimpleDto {
  @IsNotEmpty()
  @IsString()
  tanggal: string;

  @IsNotEmpty()
  @IsString()
  jammulai: string;

  @IsNotEmpty()
  @IsString()
  jamselesai: string;

  @IsNotEmpty()
  @IsString()
  lokasishift: string;

  @IsOptional()
  @IsString()
  tipeshift?: string;

  @IsOptional()
  @IsString()
  nama?: string;
}
