import { IsNotEmpty, IsString, IsEnum, IsOptional, ValidateBy } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Role } from '@prisma/client';

/**
 * Custom validator for hospital shift times
 * Validates that shift times follow RSUD Anugerah regulations
 */
function IsValidShiftTime(validationOptions?: any) {
  return ValidateBy(
    {
      name: 'isValidShiftTime',
      validator: {
        validate: (value: string) => {
          if (!value) return false;
          
          // Valid shift times for RSUD Anugerah
          const validShiftTimes = [
            '07:00', '08:00', '14:00', '15:00', '21:00', '22:00'
          ];
          
          return validShiftTimes.includes(value);
        },
        defaultMessage: () => 'Jam shift harus sesuai dengan aturan RSUD Anugerah (07:00, 08:00, 14:00, 15:00, 21:00, 22:00)',
      },
    },
    validationOptions,
  );
}

/**
 * Custom validator for shift duration
 * Ensures shift duration is appropriate (6-12 hours)
 */
function IsValidShiftDuration(validationOptions?: any) {
  return ValidateBy(
    {
      name: 'isValidShiftDuration',
      validator: {
        validate: function(value: string, args: any) {
          const jamMulai = args.object.jamMulai;
          if (!jamMulai || !value) return false;
          
          const startTime = new Date(`2000-01-01 ${jamMulai}`);
          const endTime = new Date(`2000-01-01 ${value}`);
          
          // Handle overnight shifts
          if (endTime <= startTime) {
            endTime.setDate(endTime.getDate() + 1);
          }
          
          const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          // Valid duration: 6-12 hours
          return durationHours >= 6 && durationHours <= 12;
        },
        defaultMessage: () => 'Durasi shift harus antara 6-12 jam',
      },
    },
    validationOptions,
  );
}

/**
 * Enhanced DTO for shift creation with comprehensive validation
 */
export class EnhancedCreateShiftDto {
  @IsNotEmpty({ message: 'User ID tidak boleh kosong' })
  @Transform(({ value }) => parseInt(value))
  userId: number;

  @IsNotEmpty({ message: 'Tanggal shift tidak boleh kosong' })
  @Transform(({ value }) => {
    const date = new Date(value);
    // Ensure date is not in the past (except for today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      throw new Error('Tanggal shift tidak boleh di masa lalu');
    }
    
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  })
  tanggal: string;

  @IsNotEmpty({ message: 'Jam mulai tidak boleh kosong' })
  @IsValidShiftTime()
  jamMulai: string;

  @IsNotEmpty({ message: 'Jam selesai tidak boleh kosong' })
  @IsValidShiftDuration()
  jamSelesai: string;

  @IsNotEmpty({ message: 'Installasi tidak boleh kosong' })
  @IsEnum(['IGD', 'ICU', 'RAWAT_INAP', 'RAWAT_JALAN', 'FARMASI', 'LABORATORIUM'], {
    message: 'Installasi harus salah satu dari: IGD, ICU, RAWAT_INAP, RAWAT_JALAN, FARMASI, LABORATORIUM'
  })
  installasi: string;

  @IsOptional()
  @IsString()
  keterangan?: string;
}

/**
 * Enhanced DTO for leave request with business validation
 */
export class EnhancedCreateLeaveRequestDto {
  @IsNotEmpty({ message: 'User ID tidak boleh kosong' })
  @Transform(({ value }) => parseInt(value))
  userId: number;

  @IsNotEmpty({ message: 'Tanggal mulai cuti tidak boleh kosong' })
  @Transform(({ value }) => {
    const date = new Date(value);
    const today = new Date();
    
    // Leave must be requested at least 3 days in advance
    const minDate = new Date();
    minDate.setDate(today.getDate() + 3);
    
    if (date < minDate) {
      throw new Error('Cuti harus diajukan minimal 3 hari sebelumnya');
    }
    
    return date.toISOString().split('T')[0];
  })
  tanggalMulai: string;

  @IsNotEmpty({ message: 'Tanggal selesai cuti tidak boleh kosong' })
  @Transform(({ value }) => value)
  tanggalSelesai: string;

  @IsNotEmpty({ message: 'Jenis cuti tidak boleh kosong' })
  @IsEnum(['TAHUNAN', 'SAKIT', 'MELAHIRKAN', 'DARURAT', 'LAINNYA'], {
    message: 'Jenis cuti tidak valid'
  })
  jenisCuti: string;

  @IsNotEmpty({ message: 'Alasan cuti tidak boleh kosong' })
  @IsString()
  @Transform(({ value }) => value.trim())
  alasan: string;

  @IsOptional()
  @IsString()
  dokumenPendukung?: string;
}

/**
 * Enhanced DTO for user creation with hospital-specific validation
 */
export class EnhancedCreateUserDto {
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @ValidateBy({
    name: 'isStrongPassword',
    validator: {
      validate: (value: string) => {
        // Password must be at least 8 characters with uppercase, lowercase, and number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(value);
      },
      defaultMessage: () => 'Password harus minimal 8 karakter dengan huruf besar, huruf kecil, dan angka',
    },
  })
  password: string;

  @IsNotEmpty({ message: 'Nama depan tidak boleh kosong' })
  @Transform(({ value }) => value.trim())
  namaDepan: string;

  @IsNotEmpty({ message: 'Nama belakang tidak boleh kosong' })
  @Transform(({ value }) => value.trim())
  namaBelakang: string;

  @IsNotEmpty({ message: 'Role tidak boleh kosong' })
  @IsEnum(Role, { message: 'Role tidak valid' })
  role: Role;

  @IsOptional()
  @ValidateBy({
    name: 'isValidPhoneNumber',
    validator: {
      validate: (value: string) => {
        if (!value) return true; // Optional field
        // Indonesian phone number format
        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
        return phoneRegex.test(value);
      },
      defaultMessage: () => 'Format nomor HP tidak valid (contoh: 08123456789)',
    },
  })
  noHp?: string;

  @IsOptional()
  @ValidateBy({
    name: 'isValidNIP',
    validator: {
      validate: (value: string) => {
        if (!value) return true; // Optional field
        // NIP format: 18 digits
        const nipRegex = /^[0-9]{18}$/;
        return nipRegex.test(value);
      },
      defaultMessage: () => 'NIP harus 18 digit angka',
    },
  })
  nip?: string;
}

/**
 * Response DTO with standardized format
 */
export class StandardApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
  path: string;

  constructor(success: boolean, message: string, data?: T, errors?: string[]) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Pagination DTO for list endpoints
 */
export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Math.min(parseInt(value) || 10, 100)) // Max 100 per page
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
