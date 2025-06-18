import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';

// Match the LokasiShift enum from the Prisma schema
enum LokasiShift {
  POLI_UMUM = 'POLI_UMUM',
  POLI_ANAK = 'POLI_ANAK',
  POLI_GIGI = 'POLI_GIGI',
  IGD = 'IGD',
  ICU = 'ICU',
  LABORATORIUM = 'LABORATORIUM',
  RADIOLOGI = 'RADIOLOGI',
  FARMASI = 'FARMASI',
  EMERGENCY_ROOM = 'EMERGENCY_ROOM',
}

// Match the TipeShift enum from the Prisma schema
enum TipeShift {
  PAGI = 'PAGI',
  SIANG = 'SIANG',
  MALAM = 'MALAM',
  ON_CALL = 'ON_CALL',
  JAGA = 'JAGA',
}

export class CreateShiftDto {
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
  @IsEnum(LokasiShift)
  lokasiEnum?: LokasiShift;

  @IsOptional()
  @IsString()
  tipeshift?: string;

  @IsOptional()
  @IsEnum(TipeShift)
  tipeEnum?: TipeShift;

  @IsNotEmpty()
  @IsString()
  idpegawai: string;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  nama?: string;
}
