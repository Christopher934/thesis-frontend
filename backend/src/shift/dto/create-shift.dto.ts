import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';

// Match the LokasiShift enum from the Prisma schema - Updated for RSUD Anugerah
enum LokasiShift {
  GEDUNG_ADMINISTRASI = 'GEDUNG_ADMINISTRASI',
  RAWAT_JALAN = 'RAWAT_JALAN',
  RAWAT_INAP = 'RAWAT_INAP',
  GAWAT_DARURAT = 'GAWAT_DARURAT',
  LABORATORIUM = 'LABORATORIUM',
  FARMASI = 'FARMASI',
  RADIOLOGI = 'RADIOLOGI',
  GIZI = 'GIZI',
  KEAMANAN = 'KEAMANAN',
  LAUNDRY = 'LAUNDRY',
  CLEANING_SERVICE = 'CLEANING_SERVICE',
  SUPIR = 'SUPIR',
  ICU = 'ICU',
  NICU = 'NICU',
}

// Match the TipeShift enum from the Prisma schema
enum TipeShift {
  PAGI = 'PAGI',
  SIANG = 'SIANG',
  MALAM = 'MALAM',
  ON_CALL = 'ON_CALL',
  JAGA = 'JAGA',
}

// RSUD Anugerah Official ShiftType enum - Updated to match hospital regulations
enum ShiftType {
  GEDUNG_ADMINISTRASI = 'GEDUNG_ADMINISTRASI',
  RAWAT_JALAN = 'RAWAT_JALAN',
  RAWAT_INAP_3_SHIFT = 'RAWAT_INAP_3_SHIFT',
  GAWAT_DARURAT_3_SHIFT = 'GAWAT_DARURAT_3_SHIFT',
  LABORATORIUM_2_SHIFT = 'LABORATORIUM_2_SHIFT',
  FARMASI_2_SHIFT = 'FARMASI_2_SHIFT',
  RADIOLOGI_2_SHIFT = 'RADIOLOGI_2_SHIFT',
  GIZI_2_SHIFT = 'GIZI_2_SHIFT',
  KEAMANAN_2_SHIFT = 'KEAMANAN_2_SHIFT',
  LAUNDRY_REGULER = 'LAUNDRY_REGULER',
  CLEANING_SERVICE = 'CLEANING_SERVICE',
  SUPIR_2_SHIFT = 'SUPIR_2_SHIFT',
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

  // Official RSUD Anugerah shift type system
  @IsOptional()
  @IsEnum(ShiftType)
  shiftType?: ShiftType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  shiftNumber?: number;

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
