#!/bin/bash

# ==========================================
# APPLICATION CODE UPDATE SCRIPT
# RSUD Anugerah Hospital Management System
# Date: July 5, 2025
# ==========================================

echo "🚀 Starting Application Code Updates for Database Improvements..."

# Navigate to backend directory
cd backend

echo "📊 Step 1: Generating Prisma Client with new schema..."
npx prisma generate

echo "📋 Step 2: Checking for TypeScript compilation issues..."
npm run build 2>&1 | tee compilation_check.log

echo "🔧 Step 3: Creating TypeScript interface updates..."

# Create updated interfaces file
cat > src/types/database-improvements.ts << 'EOF'
// ==========================================
// UPDATED TYPESCRIPT INTERFACES
// Database Structure Improvements
// Date: July 5, 2025
// ==========================================

export enum Gender {
  L = 'L',
  P = 'P'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum PrioritasKegiatan {
  RENDAH = 'RENDAH',
  SEDANG = 'SEDANG',
  TINGGI = 'TINGGI',
  URGENT = 'URGENT'
}

export enum StatusKegiatan {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum SentViaChannel {
  WEB = 'WEB',
  TELEGRAM = 'TELEGRAM',
  BOTH = 'BOTH'
}

// Updated User interface
export interface UpdatedUser {
  id: number;
  employeeId: string;
  username: string;
  email: string;
  password: string;
  namaDepan: string;
  namaBelakang: string;
  alamat?: string;
  noHp: string;
  jenisKelamin: Gender; // Updated from string
  tanggalLahir: Date;
  role: Role;
  status: UserStatus; // Updated from string
  createdAt: Date;
  updatedAt: Date;
  telegramChatId?: string;
}

// Updated Shift interface
export interface UpdatedShift {
  id: number;
  tanggal: Date;
  createdAt: Date;
  updatedAt: Date;
  jammulai: string; // Time format HH:MM
  jamselesai: string; // Time format HH:MM
  lokasishift: string;
  userId: number;
  lokasiEnum?: LokasiShift;
  tipeEnum?: TipeShift;
  tipeshift?: string;
  shiftNumber?: number;
  shiftType?: ShiftType;
}

// Updated Notifikasi interface
export interface UpdatedNotifikasi {
  id: number;
  userId: number;
  judul: string;
  pesan: string;
  jenis: JenisNotifikasi;
  status: StatusNotifikasi;
  data?: any;
  sentVia: SentViaChannel; // Updated from string
  telegramSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Updated Kegiatan interface
export interface UpdatedKegiatan {
  id: number;
  nama: string;
  deskripsi: string;
  createdAt: Date;
  updatedAt: Date;
  anggaran?: number;
  catatan?: string;
  departemen?: string;
  jenisKegiatan: string;
  kapasitas?: number;
  kontak?: string;
  lokasi: string;
  lokasiDetail?: string;
  penanggungJawab: string;
  prioritas: PrioritasKegiatan; // Updated from string
  status: StatusKegiatan; // Updated from string
  tanggalMulai: Date;
  tanggalSelesai?: Date;
  targetPeserta: string[];
  waktuMulai: string; // Time format HH:MM
  waktuSelesai?: string; // Time format HH:MM
}

// Validation helpers
export const ValidationHelpers = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  },

  isValidIndonesianPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)[0-9]{8,12}$/;
    return phoneRegex.test(phone);
  },

  isValidEmployeeId: (employeeId: string): boolean => {
    const employeeIdRegex = /^[A-Z]{3}[0-9]{3}$/;
    return employeeIdRegex.test(employeeId);
  },

  isValidTimeFormat: (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
};

// Form validation schemas (for use with validation libraries)
export const ValidationSchemas = {
  userGender: Object.values(Gender),
  userStatus: Object.values(UserStatus),
  prioritasKegiatan: Object.values(PrioritasKegiatan),
  statusKegiatan: Object.values(StatusKegiatan),
  sentViaChannel: Object.values(SentViaChannel)
};
EOF

echo "✅ Step 4: Creating DTO updates for validation..."

# Create updated DTOs
cat > src/common/updated-dtos.ts << 'EOF'
// ==========================================
// UPDATED DATA TRANSFER OBJECTS
// Database Structure Improvements
// Date: July 5, 2025
// ==========================================

import { IsEnum, IsEmail, IsOptional, IsString, Matches, IsDateString } from 'class-validator';
import { Gender, UserStatus, PrioritasKegiatan, StatusKegiatan, SentViaChannel } from '../types/database-improvements';

export class UpdatedCreateUserDto {
  @IsString()
  employeeId: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  namaDepan: string;

  @IsString()
  namaBelakang: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @Matches(/^(\+62|62|0)[0-9]{8,12}$/, {
    message: 'Nomor HP harus dalam format Indonesia yang valid'
  })
  noHp: string;

  @IsEnum(Gender, {
    message: 'Jenis kelamin harus L atau P'
  })
  jenisKelamin: Gender;

  @IsDateString()
  tanggalLahir: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  telegramChatId?: string;
}

export class UpdatedCreateShiftDto {
  @IsDateString()
  tanggal: string;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam mulai harus dalam format HH:MM'
  })
  jammulai: string;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam selesai harus dalam format HH:MM'
  })
  jamselesai: string;

  @IsString()
  lokasishift: string;

  // ... other fields remain same
}

export class UpdatedCreateNotifikasiDto {
  @IsString()
  judul: string;

  @IsString()
  pesan: string;

  @IsEnum(SentViaChannel, {
    message: 'sentVia harus WEB, TELEGRAM, atau BOTH'
  })
  sentVia: SentViaChannel;

  // ... other fields remain same
}

export class UpdatedCreateKegiatanDto {
  @IsString()
  nama: string;

  @IsString()
  deskripsi: string;

  @IsEnum(PrioritasKegiatan, {
    message: 'Prioritas harus RENDAH, SEDANG, TINGGI, atau URGENT'
  })
  prioritas: PrioritasKegiatan;

  @IsEnum(StatusKegiatan, {
    message: 'Status harus DRAFT, ACTIVE, COMPLETED, atau CANCELLED'
  })
  status: StatusKegiatan;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Waktu mulai harus dalam format HH:MM'
  })
  waktuMulai: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Waktu selesai harus dalam format HH:MM'
  })
  waktuSelesai?: string;

  // ... other fields remain same
}
EOF

echo "🔄 Step 5: Creating migration helper functions..."

# Create migration helpers
cat > src/utils/database-migration-helpers.ts << 'EOF'
// ==========================================
// DATABASE MIGRATION HELPER FUNCTIONS
// Date: July 5, 2025
// ==========================================

import { Gender, UserStatus, PrioritasKegiatan, StatusKegiatan, SentViaChannel } from '../types/database-improvements';

export class DatabaseMigrationHelpers {
  
  // Convert legacy string values to new ENUM values
  static convertGender(legacyValue: string): Gender {
    switch (legacyValue?.toUpperCase()) {
      case 'L':
      case 'LAKI-LAKI':
      case 'M':
      case 'MALE':
        return Gender.L;
      case 'P':
      case 'PEREMPUAN':
      case 'F':
      case 'FEMALE':
        return Gender.P;
      default:
        return Gender.L; // Default fallback
    }
  }

  static convertUserStatus(legacyValue: string): UserStatus {
    switch (legacyValue?.toUpperCase()) {
      case 'ACTIVE':
      case 'AKTIF':
        return UserStatus.ACTIVE;
      case 'INACTIVE':
      case 'TIDAK_AKTIF':
      case 'NONAKTIF':
        return UserStatus.INACTIVE;
      default:
        return UserStatus.ACTIVE; // Default fallback
    }
  }

  static convertPrioritas(legacyValue: string): PrioritasKegiatan {
    switch (legacyValue?.toUpperCase()) {
      case 'RENDAH':
      case 'LOW':
        return PrioritasKegiatan.RENDAH;
      case 'SEDANG':
      case 'MEDIUM':
        return PrioritasKegiatan.SEDANG;
      case 'TINGGI':
      case 'HIGH':
        return PrioritasKegiatan.TINGGI;
      case 'URGENT':
      case 'DARURAT':
        return PrioritasKegiatan.URGENT;
      default:
        return PrioritasKegiatan.SEDANG; // Default fallback
    }
  }

  static convertKegiatanStatus(legacyValue: string): StatusKegiatan {
    switch (legacyValue?.toUpperCase()) {
      case 'DRAFT':
      case 'DRAF':
        return StatusKegiatan.DRAFT;
      case 'ACTIVE':
      case 'AKTIF':
        return StatusKegiatan.ACTIVE;
      case 'COMPLETED':
      case 'SELESAI':
        return StatusKegiatan.COMPLETED;
      case 'CANCELLED':
      case 'DIBATALKAN':
        return StatusKegiatan.CANCELLED;
      default:
        return StatusKegiatan.DRAFT; // Default fallback
    }
  }

  static convertSentVia(legacyValue: string): SentViaChannel {
    switch (legacyValue?.toUpperCase()) {
      case 'WEB':
        return SentViaChannel.WEB;
      case 'TELEGRAM':
        return SentViaChannel.TELEGRAM;
      case 'BOTH':
      case 'KEDUANYA':
        return SentViaChannel.BOTH;
      default:
        return SentViaChannel.WEB; // Default fallback
    }
  }

  // Validation helpers
  static validateTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  static formatTimeForDatabase(time: string): string {
    // Ensure time is in HH:MM format
    if (this.validateTimeFormat(time)) {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    throw new Error(`Invalid time format: ${time}`);
  }

  static validateIndonesianPhone(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)[0-9]{8,12}$/;
    return phoneRegex.test(phone);
  }

  static normalizeIndonesianPhone(phone: string): string {
    // Remove non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Convert various formats to standard +62 format
    if (cleaned.startsWith('0')) {
      cleaned = '+62' + cleaned.substring(1);
    } else if (cleaned.startsWith('62')) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+62')) {
      cleaned = '+62' + cleaned;
    }
    
    return cleaned;
  }
}
EOF

echo "📝 Step 6: Creating update checklist..."

cat > DATABASE_UPDATE_CHECKLIST.md << 'EOF'
# 📋 Database Update Implementation Checklist

## Pre-Migration
- [ ] Create database backup
- [ ] Stop application services
- [ ] Verify migration script syntax

## Migration
- [ ] Apply database-structure-improvements.sql
- [ ] Verify all ENUMs created successfully
- [ ] Check data migration completed
- [ ] Validate constraints are working

## Code Updates
- [ ] Update Prisma schema (already done)
- [ ] Generate new Prisma client
- [ ] Update TypeScript interfaces
- [ ] Update DTOs and validation
- [ ] Update service methods
- [ ] Update API responses

## Testing
- [ ] Test user creation with new ENUM values
- [ ] Test shift time operations
- [ ] Test notification channel selection
- [ ] Test activity priority/status workflows
- [ ] Test foreign key constraints
- [ ] Verify email/phone validation

## Frontend Updates
- [ ] Update form validation schemas
- [ ] Update dropdown options for ENUMs
- [ ] Test time picker components
- [ ] Update TypeScript interfaces
- [ ] Test API integration

## Performance Verification
- [ ] Check query performance with new indexes
- [ ] Monitor database connection pool
- [ ] Verify constraint performance

## Production Deployment
- [ ] Deploy in maintenance window
- [ ] Monitor error logs
- [ ] Validate all functionality
- [ ] Update API documentation
EOF

echo "✅ Application code update preparation completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Review generated files in backend/src/"
echo "2. Apply database migration"
echo "3. Update existing service files to use new ENUMs"
echo "4. Test all functionality"
echo "5. Update frontend to match new types"
echo ""
echo "📁 Generated Files:"
echo "- src/types/database-improvements.ts"
echo "- src/common/updated-dtos.ts" 
echo "- src/utils/database-migration-helpers.ts"
echo "- DATABASE_UPDATE_CHECKLIST.md"
