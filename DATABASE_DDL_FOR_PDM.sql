-- SQL DDL for RSUD Anugerah Hospital Management System
-- Physical Data Model (PDM) Reference
-- Generated from Prisma Schema
-- Database: PostgreSQL

-- ===============================================
-- ENUM DEFINITIONS
-- ===============================================

-- User roles in the hospital system
CREATE TYPE "Role" AS ENUM (
    'ADMIN',
    'DOKTER',
    'PERAWAT',
    'STAF',
    'SUPERVISOR'
);

-- Attendance status types
CREATE TYPE "AbsensiStatus" AS ENUM (
    'HADIR',
    'TERLAMBAT',
    'IZIN',
    'ALFA'
);

-- Shift swap request statuses
CREATE TYPE "SwapStatus" AS ENUM (
    'PENDING',
    'APPROVED_BY_TARGET',
    'REJECTED_BY_TARGET',
    'WAITING_UNIT_HEAD',
    'REJECTED_BY_UNIT_HEAD',
    'WAITING_SUPERVISOR',
    'REJECTED_BY_SUPERVISOR',
    'APPROVED'
);

-- Hospital shift locations
CREATE TYPE "LokasiShift" AS ENUM (
    'GEDUNG_ADMINISTRASI',
    'RAWAT_JALAN',
    'RAWAT_INAP',
    'GAWAT_DARURAT',
    'LABORATORIUM',
    'FARMASI',
    'RADIOLOGI',
    'GIZI',
    'KEAMANAN',
    'LAUNDRY',
    'CLEANING_SERVICE',
    'SUPIR',
    'ICU',
    'NICU'
);

-- Shift time types
CREATE TYPE "TipeShift" AS ENUM (
    'PAGI',
    'SIANG',
    'MALAM',
    'ON_CALL',
    'JAGA'
);

-- Comprehensive shift categorization
CREATE TYPE "ShiftType" AS ENUM (
    'GEDUNG_ADMINISTRASI',
    'RAWAT_JALAN',
    'RAWAT_INAP_3_SHIFT',
    'GAWAT_DARURAT_3_SHIFT',
    'LABORATORIUM_2_SHIFT',
    'FARMASI_2_SHIFT',
    'RADIOLOGI_2_SHIFT',
    'GIZI_2_SHIFT',
    'KEAMANAN_2_SHIFT',
    'LAUNDRY_REGULER',
    'CLEANING_SERVICE',
    'SUPIR_2_SHIFT'
);

-- Notification types (Enhanced with User-Based Features)
CREATE TYPE "JenisNotifikasi" AS ENUM (
    'REMINDER_SHIFT',
    'KONFIRMASI_TUKAR_SHIFT',
    'PERSETUJUAN_CUTI',
    'KEGIATAN_HARIAN',
    'ABSENSI_TERLAMBAT',
    'SHIFT_BARU_DITAMBAHKAN',
    'SISTEM_INFO',
    'PENGUMUMAN',
    'PERSONAL_REMINDER_ABSENSI',
    'TUGAS_PERSONAL',
    'HASIL_EVALUASI_PERSONAL',
    'KONFIRMASI_SHIFT_SWAP_PERSONAL',
    'PENGUMUMAN_INTERAKTIF',
    'NOTIFIKASI_DIREKTUR',
    'REMINDER_MEETING_PERSONAL',
    'PERINGATAN_PERSONAL'
);

-- Notification read status
CREATE TYPE "StatusNotifikasi" AS ENUM (
    'UNREAD',
    'READ',
    'ARCHIVED'
);

-- ===============================================
-- TABLE DEFINITIONS
-- ===============================================

-- User table - Central entity for all hospital staff
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "employeeId" VARCHAR NOT NULL UNIQUE,
    "username" VARCHAR NOT NULL UNIQUE,
    "email" VARCHAR NOT NULL UNIQUE,
    "password" VARCHAR NOT NULL,
    "namaDepan" VARCHAR NOT NULL,
    "namaBelakang" VARCHAR NOT NULL,
    "alamat" VARCHAR,
    "noHp" VARCHAR NOT NULL,
    "jenisKelamin" VARCHAR NOT NULL,
    "tanggalLahir" TIMESTAMP NOT NULL,
    "role" "Role" NOT NULL,
    "status" VARCHAR NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "telegramChatId" VARCHAR
);

-- Shift table - Manages work shifts for hospital staff
CREATE TABLE "shifts" (
    "id" SERIAL PRIMARY KEY,
    "tanggal" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jammulai" VARCHAR NOT NULL,
    "jamselesai" VARCHAR NOT NULL,
    "lokasishift" VARCHAR NOT NULL,
    "userId" INTEGER NOT NULL,
    "lokasiEnum" "LokasiShift",
    "tipeEnum" "TipeShift",
    "tipeshift" VARCHAR,
    "shiftNumber" INTEGER,
    "shiftType" "ShiftType",
    CONSTRAINT "shifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Attendance table - Tracks attendance records for each shift
CREATE TABLE "absensis" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL UNIQUE,
    "jamMasuk" TIMESTAMP,
    "jamKeluar" TIMESTAMP,
    "status" "AbsensiStatus" NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catatan" VARCHAR,
    "foto" VARCHAR,
    "lokasi" VARCHAR,
    CONSTRAINT "absensis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "absensis_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id")
);

-- Shift swap table - Manages shift swap requests between users
CREATE TABLE "shiftswaps" (
    "id" SERIAL PRIMARY KEY,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL UNIQUE,
    "status" "SwapStatus" NOT NULL DEFAULT 'PENDING',
    "alasan" VARCHAR,
    "tanggalSwap" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectionReason" VARCHAR,
    "requiresUnitHead" BOOLEAN NOT NULL DEFAULT false,
    "supervisorApprovedAt" TIMESTAMP,
    "supervisorApprovedBy" INTEGER,
    "targetApprovedAt" TIMESTAMP,
    "targetApprovedBy" INTEGER,
    "unitHeadApprovedAt" TIMESTAMP,
    "unitHeadApprovedBy" INTEGER,
    CONSTRAINT "shiftswaps_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "shiftswaps_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "shiftswaps_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE
);

-- Activity table - Stores hospital activities and events
CREATE TABLE "kegiatans" (
    "id" SERIAL PRIMARY KEY,
    "nama" VARCHAR NOT NULL,
    "deskripsi" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anggaran" INTEGER,
    "catatan" VARCHAR,
    "departemen" VARCHAR,
    "jenisKegiatan" VARCHAR NOT NULL,
    "kapasitas" INTEGER,
    "kontak" VARCHAR,
    "lokasi" VARCHAR NOT NULL,
    "lokasiDetail" VARCHAR,
    "penanggungJawab" VARCHAR NOT NULL,
    "prioritas" VARCHAR NOT NULL,
    "status" VARCHAR NOT NULL,
    "tanggalMulai" TIMESTAMP NOT NULL,
    "tanggalSelesai" TIMESTAMP,
    "targetPeserta" VARCHAR[] NOT NULL,
    "waktuMulai" VARCHAR NOT NULL,
    "waktuSelesai" VARCHAR
);

-- Token table - Manages authentication tokens
CREATE TABLE "tokens" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "token" VARCHAR NOT NULL UNIQUE,
    "expiredAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Login log table - Tracks user login activities
CREATE TABLE "login_logs" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "ipAddress" VARCHAR,
    "userAgent" VARCHAR,
    "loginAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Notification table - Stores all system notifications
CREATE TABLE "notifikasi" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "judul" VARCHAR NOT NULL,
    "pesan" VARCHAR NOT NULL,
    "jenis" "JenisNotifikasi" NOT NULL,
    "status" "StatusNotifikasi" NOT NULL DEFAULT 'UNREAD',
    "data" JSONB,
    "sentVia" VARCHAR NOT NULL DEFAULT 'WEB',
    "telegramSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- ===============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ===============================================

-- User table indexes
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Shift table indexes
CREATE INDEX "idx_shifts_userId" ON "shifts"("userId");
CREATE INDEX "idx_shifts_user_date" ON "shifts"("userId", "tanggal");
CREATE INDEX "idx_shifts_date" ON "shifts"("tanggal");

-- Attendance table indexes
CREATE UNIQUE INDEX "absensis_shiftId_key" ON "absensis"("shiftId");
CREATE INDEX "idx_absensis_userId" ON "absensis"("userId");
CREATE INDEX "idx_absensis_user_status" ON "absensis"("userId", "status");

-- Shift swap table indexes
CREATE UNIQUE INDEX "shiftswaps_shiftId_key" ON "shiftswaps"("shiftId");
CREATE INDEX "idx_shiftswaps_fromUserId" ON "shiftswaps"("fromUserId");
CREATE INDEX "idx_shiftswaps_toUserId" ON "shiftswaps"("toUserId");
CREATE INDEX "idx_shiftswaps_status" ON "shiftswaps"("status");

-- Token table indexes
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");
CREATE INDEX "idx_tokens_userId" ON "tokens"("userId");

-- Login log table indexes
CREATE INDEX "idx_login_logs_userId" ON "login_logs"("userId");
CREATE INDEX "idx_login_logs_user_date" ON "login_logs"("userId", "loginAt");

-- Notification table indexes
CREATE INDEX "idx_notifikasi_userId" ON "notifikasi"("userId");
CREATE INDEX "idx_notifikasi_user_status" ON "notifikasi"("userId", "status");
CREATE INDEX "idx_notifikasi_jenis" ON "notifikasi"("jenis");
CREATE INDEX "idx_notifikasi_created" ON "notifikasi"("createdAt");

-- ===============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ===============================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updatedAt column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON "shifts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_absensis_updated_at BEFORE UPDATE ON "absensis"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shiftswaps_updated_at BEFORE UPDATE ON "shiftswaps"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kegiatans_updated_at BEFORE UPDATE ON "kegiatans"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifikasi_updated_at BEFORE UPDATE ON "notifikasi"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- VIEWS FOR COMMON QUERIES
-- ===============================================

-- View for user shift summary
CREATE VIEW "user_shift_summary" AS
SELECT 
    u."id" as "userId",
    u."username",
    u."namaDepan",
    u."namaBelakang",
    u."role",
    COUNT(s."id") as "totalShifts",
    COUNT(a."id") as "attendanceRecords",
    COUNT(CASE WHEN a."status" = 'HADIR' THEN 1 END) as "presentCount",
    COUNT(CASE WHEN a."status" = 'TERLAMBAT' THEN 1 END) as "lateCount",
    COUNT(CASE WHEN a."status" = 'ALFA' THEN 1 END) as "absentCount"
FROM "users" u
LEFT JOIN "shifts" s ON u."id" = s."userId"
LEFT JOIN "absensis" a ON s."id" = a."shiftId"
GROUP BY u."id", u."username", u."namaDepan", u."namaBelakang", u."role";

-- View for pending shift swaps
CREATE VIEW "pending_shift_swaps" AS
SELECT 
    ss."id",
    ss."status",
    ss."tanggalSwap",
    ss."alasan",
    u1."namaDepan" || ' ' || u1."namaBelakang" as "fromUserName",
    u2."namaDepan" || ' ' || u2."namaBelakang" as "toUserName",
    s."tanggal" as "shiftDate",
    s."jammulai" as "shiftStart",
    s."jamselesai" as "shiftEnd",
    s."lokasishift" as "location"
FROM "shiftswaps" ss
JOIN "users" u1 ON ss."fromUserId" = u1."id"
JOIN "users" u2 ON ss."toUserId" = u2."id"
JOIN "shifts" s ON ss."shiftId" = s."id"
WHERE ss."status" IN ('PENDING', 'APPROVED_BY_TARGET', 'WAITING_UNIT_HEAD', 'WAITING_SUPERVISOR');

-- View for notification dashboard
CREATE VIEW "notification_dashboard" AS
SELECT 
    n."userId",
    u."namaDepan" || ' ' || u."namaBelakang" as "userName",
    u."role",
    COUNT(*) as "totalNotifications",
    COUNT(CASE WHEN n."status" = 'UNREAD' THEN 1 END) as "unreadCount",
    COUNT(CASE WHEN n."jenis" LIKE 'PERSONAL_%' THEN 1 END) as "personalNotifications",
    COUNT(CASE WHEN n."jenis" = 'PENGUMUMAN_INTERAKTIF' THEN 1 END) as "interactiveNotifications",
    MAX(n."createdAt") as "lastNotificationAt"
FROM "notifikasi" n
JOIN "users" u ON n."userId" = u."id"
GROUP BY n."userId", u."namaDepan", u."namaBelakang", u."role";

-- ===============================================
-- COMMENTS FOR DOCUMENTATION
-- ===============================================

COMMENT ON TABLE "users" IS 'Central table storing all hospital staff information with role-based access';
COMMENT ON TABLE "shifts" IS 'Work shift scheduling table with comprehensive location and time tracking';
COMMENT ON TABLE "absensis" IS 'Attendance tracking table linked to shifts with photo and location evidence';
COMMENT ON TABLE "shiftswaps" IS 'Shift exchange management with multi-level approval workflow';
COMMENT ON TABLE "kegiatans" IS 'Hospital activities and events management';
COMMENT ON TABLE "tokens" IS 'Authentication token management for secure access';
COMMENT ON TABLE "login_logs" IS 'User login activity tracking for security auditing';
COMMENT ON TABLE "notifikasi" IS 'Comprehensive notification system with user-based targeting and JSON data support';

COMMENT ON COLUMN "notifikasi"."data" IS 'JSONB field for storing rich notification data, interactive responses, and metadata';
COMMENT ON COLUMN "users"."telegramChatId" IS 'Integration field for Telegram bot notifications';
COMMENT ON COLUMN "shiftswaps"."requiresUnitHead" IS 'Flag indicating if unit head approval is required for this swap';

-- ===============================================
-- SAMPLE DATA CONSTRAINTS AND BUSINESS RULES
-- ===============================================

-- Business rule: User cannot swap shift with themselves
-- (Implemented in application logic)

-- Business rule: Shift start time must be before end time  
-- (Implemented in application logic)

-- Business rule: Attendance check-in must be before check-out
-- (Implemented in application logic)

-- Business rule: Only one active swap request per shift
-- (Enforced by unique constraint on shiftswaps.shiftId)

-- ===============================================
-- PARTITIONING STRATEGY (FOR LARGE DATASETS)
-- ===============================================

-- Uncomment and modify for production systems with large data volumes:

/*
-- Partition notifications by month for better performance
CREATE TABLE "notifikasi_y2024m01" PARTITION OF "notifikasi"
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Partition login logs by month
CREATE TABLE "login_logs_y2024m01" PARTITION OF "login_logs"
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Add monthly partitions as needed
*/

-- ===============================================
-- END OF DDL SCRIPT
-- ===============================================
-- 1. ENUM TYPES
-- ===============================================

-- User roles in the system
CREATE TYPE "Role" AS ENUM (
    'ADMIN',
    'DOKTER',
    'PERAWAT',
    'STAF',
    'SUPERVISOR'
);

-- Attendance status options
CREATE TYPE "AbsensiStatus" AS ENUM (
    'HADIR',
    'TERLAMBAT',
    'IZIN',
    'ALFA'
);

-- Shift swap request status workflow
CREATE TYPE "SwapStatus" AS ENUM (
    'PENDING',
    'APPROVED_BY_TARGET',
    'REJECTED_BY_TARGET',
    'WAITING_UNIT_HEAD',
    'REJECTED_BY_UNIT_HEAD',
    'WAITING_SUPERVISOR',
    'REJECTED_BY_SUPERVISOR',
    'APPROVED'
);

-- Hospital location options for shifts
CREATE TYPE "LokasiShift" AS ENUM (
    'GEDUNG_ADMINISTRASI',
    'RAWAT_JALAN',
    'RAWAT_INAP',
    'GAWAT_DARURAT',
    'LABORATORIUM',
    'FARMASI',
    'RADIOLOGI',
    'GIZI',
    'KEAMANAN',
    'LAUNDRY',
    'CLEANING_SERVICE',
    'SUPIR',
    'ICU',
    'NICU'
);

-- Basic shift time categories
CREATE TYPE "TipeShift" AS ENUM (
    'PAGI',
    'SIANG',
    'MALAM',
    'ON_CALL',
    'JAGA'
);

-- Detailed shift type categories with work patterns
CREATE TYPE "ShiftType" AS ENUM (
    'GEDUNG_ADMINISTRASI',
    'RAWAT_JALAN',
    'RAWAT_INAP_3_SHIFT',
    'GAWAT_DARURAT_3_SHIFT',
    'LABORATORIUM_2_SHIFT',
    'FARMASI_2_SHIFT',
    'RADIOLOGI_2_SHIFT',
    'GIZI_2_SHIFT',
    'KEAMANAN_2_SHIFT',
    'LAUNDRY_REGULER',
    'CLEANING_SERVICE',
    'SUPIR_2_SHIFT'
);

-- Enhanced notification types including user-based notifications
CREATE TYPE "JenisNotifikasi" AS ENUM (
    -- Traditional notifications
    'REMINDER_SHIFT',
    'KONFIRMASI_TUKAR_SHIFT',
    'PERSETUJUAN_CUTI',
    'KEGIATAN_HARIAN',
    'ABSENSI_TERLAMBAT',
    'SHIFT_BARU_DITAMBAHKAN',
    'SISTEM_INFO',
    'PENGUMUMAN',
    -- Enhanced user-based notifications
    'PERSONAL_REMINDER_ABSENSI',
    'TUGAS_PERSONAL',
    'HASIL_EVALUASI_PERSONAL',
    'KONFIRMASI_SHIFT_SWAP_PERSONAL',
    'PENGUMUMAN_INTERAKTIF',
    'NOTIFIKASI_DIREKTUR',
    'REMINDER_MEETING_PERSONAL',
    'PERINGATAN_PERSONAL'
);

-- Notification read status
CREATE TYPE "StatusNotifikasi" AS ENUM (
    'UNREAD',
    'READ',
    'ARCHIVED'
);

-- ===============================================
-- 2. MAIN TABLES
-- ===============================================

-- User information for all hospital staff
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "namaDepan" TEXT NOT NULL,
    "namaBelakang" TEXT NOT NULL,
    "alamat" TEXT,
    "noHp" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "telegramChatId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Work shifts for hospital staff
CREATE TABLE "shifts" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idpegawai" TEXT NOT NULL,
    "jammulai" TEXT NOT NULL,
    "jamselesai" TEXT NOT NULL,
    "lokasishift" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "lokasiEnum" "LokasiShift",
    "tipeEnum" "TipeShift",
    "tipeshift" TEXT,
    "shiftNumber" INTEGER,
    "shiftType" "ShiftType",

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- Attendance tracking for each shift
CREATE TABLE "absensis" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "jamMasuk" TIMESTAMP(3),
    "jamKeluar" TIMESTAMP(3),
    "status" "AbsensiStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "catatan" TEXT,
    "foto" TEXT,
    "lokasi" TEXT,

    CONSTRAINT "absensis_pkey" PRIMARY KEY ("id")
);

-- Shift exchange requests between users
CREATE TABLE "shiftswaps" (
    "id" SERIAL NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "status" "SwapStatus" NOT NULL DEFAULT 'PENDING',
    "alasan" TEXT,
    "tanggalSwap" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rejectionReason" TEXT,
    "requiresUnitHead" BOOLEAN NOT NULL DEFAULT false,
    "supervisorApprovedAt" TIMESTAMP(3),
    "supervisorApprovedBy" INTEGER,
    "targetApprovedAt" TIMESTAMP(3),
    "targetApprovedBy" INTEGER,
    "unitHeadApprovedAt" TIMESTAMP(3),
    "unitHeadApprovedBy" INTEGER,

    CONSTRAINT "shiftswaps_pkey" PRIMARY KEY ("id")
);

-- Hospital activities and events management
CREATE TABLE "kegiatans" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "anggaran" INTEGER,
    "catatan" TEXT,
    "departemen" TEXT,
    "jenisKegiatan" TEXT NOT NULL,
    "kapasitas" INTEGER,
    "kontak" TEXT,
    "lokasi" TEXT NOT NULL,
    "lokasiDetail" TEXT,
    "penanggungJawab" TEXT NOT NULL,
    "prioritas" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "targetPeserta" TEXT[],
    "waktuMulai" TEXT NOT NULL,
    "waktuSelesai" TEXT,

    CONSTRAINT "kegiatans_pkey" PRIMARY KEY ("id")
);

-- Authentication token management
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- User login activity tracking
CREATE TABLE "login_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

-- Enhanced notification system with user-based notifications
CREATE TABLE "notifikasi" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "jenis" "JenisNotifikasi" NOT NULL,
    "status" "StatusNotifikasi" NOT NULL DEFAULT 'UNREAD',
    "data" JSONB,
    "sentVia" TEXT NOT NULL DEFAULT 'WEB',
    "telegramSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- ===============================================
-- 3. UNIQUE CONSTRAINTS
-- ===============================================

-- Ensure unique usernames and emails
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- One attendance record per shift
CREATE UNIQUE INDEX "absensis_shiftId_key" ON "absensis"("shiftId");

-- One swap request per shift
CREATE UNIQUE INDEX "shiftswaps_shiftId_key" ON "shiftswaps"("shiftId");

-- Unique authentication tokens
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- ===============================================
-- 4. FOREIGN KEY CONSTRAINTS
-- ===============================================

-- Shift belongs to user
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Attendance belongs to user and shift
ALTER TABLE "absensis" ADD CONSTRAINT "absensis_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "absensis" ADD CONSTRAINT "absensis_shiftId_fkey" 
    FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Shift swap relationships
ALTER TABLE "shiftswaps" ADD CONSTRAINT "shiftswaps_fromUserId_fkey" 
    FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shiftswaps" ADD CONSTRAINT "shiftswaps_toUserId_fkey" 
    FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shiftswaps" ADD CONSTRAINT "shiftswaps_shiftId_fkey" 
    FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Token belongs to user
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Login log belongs to user
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Notification belongs to user
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===============================================
-- 5. PERFORMANCE INDEXES
-- ===============================================

-- User management indexes
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_status" ON "users"("status");

-- Shift management indexes
CREATE INDEX "idx_shifts_user_date" ON "shifts"("userId", "tanggal");
CREATE INDEX "idx_shifts_tanggal" ON "shifts"("tanggal");
CREATE INDEX "idx_shifts_lokasi" ON "shifts"("lokasiEnum");
CREATE INDEX "idx_shifts_tipe" ON "shifts"("tipeEnum");

-- Attendance tracking indexes
CREATE INDEX "idx_absensis_user" ON "absensis"("userId");
CREATE INDEX "idx_absensis_status" ON "absensis"("status");
CREATE INDEX "idx_absensis_date" ON "absensis"("createdAt");

-- Shift swap indexes
CREATE INDEX "idx_shiftswaps_from_user" ON "shiftswaps"("fromUserId");
CREATE INDEX "idx_shiftswaps_to_user" ON "shiftswaps"("toUserId");
CREATE INDEX "idx_shiftswaps_status" ON "shiftswaps"("status");
CREATE INDEX "idx_shiftswaps_date" ON "shiftswaps"("tanggalSwap");

-- Activity management indexes
CREATE INDEX "idx_kegiatans_date" ON "kegiatans"("tanggalMulai");
CREATE INDEX "idx_kegiatans_status" ON "kegiatans"("status");
CREATE INDEX "idx_kegiatans_jenis" ON "kegiatans"("jenisKegiatan");

-- Authentication indexes
CREATE INDEX "idx_tokens_user" ON "tokens"("userId");
CREATE INDEX "idx_tokens_expired" ON "tokens"("expiredAt");

-- Login tracking indexes
CREATE INDEX "idx_login_logs_user" ON "login_logs"("userId");
CREATE INDEX "idx_login_logs_date" ON "login_logs"("loginAt");

-- Notification system indexes
CREATE INDEX "idx_notifikasi_user_status" ON "notifikasi"("userId", "status");
CREATE INDEX "idx_notifikasi_jenis" ON "notifikasi"("jenis");
CREATE INDEX "idx_notifikasi_created" ON "notifikasi"("createdAt");
CREATE INDEX "idx_notifikasi_user_jenis" ON "notifikasi"("userId", "jenis");

-- ===============================================
-- 6. VIEWS FOR COMMON QUERIES
-- ===============================================

-- View for user shift summary
CREATE VIEW "user_shift_summary" AS
SELECT 
    u.id as user_id,
    u."namaDepan" || ' ' || u."namaBelakang" as full_name,
    u.role,
    COUNT(s.id) as total_shifts,
    COUNT(CASE WHEN a.status = 'HADIR' THEN 1 END) as hadir_count,
    COUNT(CASE WHEN a.status = 'TERLAMBAT' THEN 1 END) as terlambat_count,
    COUNT(CASE WHEN a.status = 'ALFA' THEN 1 END) as alfa_count
FROM users u
LEFT JOIN shifts s ON u.id = s."userId"
LEFT JOIN absensis a ON s.id = a."shiftId"
GROUP BY u.id, u."namaDepan", u."namaBelakang", u.role;

-- View for notification summary
CREATE VIEW "notification_summary" AS
SELECT 
    u.id as user_id,
    u."namaDepan" || ' ' || u."namaBelakang" as full_name,
    u.role,
    COUNT(n.id) as total_notifications,
    COUNT(CASE WHEN n.status = 'UNREAD' THEN 1 END) as unread_count,
    COUNT(CASE WHEN n.jenis LIKE 'PERSONAL_%' THEN 1 END) as personal_notifications,
    COUNT(CASE WHEN n.jenis = 'PENGUMUMAN_INTERAKTIF' THEN 1 END) as interactive_notifications
FROM users u
LEFT JOIN notifikasi n ON u.id = n."userId"
GROUP BY u.id, u."namaDepan", u."namaBelakang", u.role;

-- View for shift swap status
CREATE VIEW "shift_swap_status" AS
SELECT 
    ss.id,
    uf."namaDepan" || ' ' || uf."namaBelakang" as from_user,
    ut."namaDepan" || ' ' || ut."namaBelakang" as to_user,
    s.tanggal as shift_date,
    s.jammulai || ' - ' || s.jamselesai as shift_time,
    s.lokasishift as location,
    ss.status,
    ss."createdAt",
    ss."tanggalSwap"
FROM shiftswaps ss
JOIN users uf ON ss."fromUserId" = uf.id
JOIN users ut ON ss."toUserId" = ut.id
JOIN shifts s ON ss."shiftId" = s.id;

-- ===============================================
-- 7. STORED PROCEDURES
-- ===============================================

-- Function to calculate attendance percentage
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(user_id INTEGER, start_date DATE, end_date DATE)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_shifts INTEGER;
    hadir_shifts INTEGER;
    percentage DECIMAL(5,2);
BEGIN
    -- Count total shifts for user in date range
    SELECT COUNT(*) INTO total_shifts
    FROM shifts s
    WHERE s."userId" = user_id
    AND s.tanggal::DATE BETWEEN start_date AND end_date;
    
    -- Count shifts with attendance status 'HADIR'
    SELECT COUNT(*) INTO hadir_shifts
    FROM shifts s
    JOIN absensis a ON s.id = a."shiftId"
    WHERE s."userId" = user_id
    AND s.tanggal::DATE BETWEEN start_date AND end_date
    AND a.status = 'HADIR';
    
    -- Calculate percentage
    IF total_shifts > 0 THEN
        percentage := (hadir_shifts::DECIMAL / total_shifts::DECIMAL) * 100;
    ELSE
        percentage := 0;
    END IF;
    
    RETURN percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count by type
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id INTEGER, notification_type "JenisNotifikasi" DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    IF notification_type IS NULL THEN
        SELECT COUNT(*) INTO count
        FROM notifikasi
        WHERE "userId" = user_id AND status = 'UNREAD';
    ELSE
        SELECT COUNT(*) INTO count
        FROM notifikasi
        WHERE "userId" = user_id AND status = 'UNREAD' AND jenis = notification_type;
    END IF;
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 8. TRIGGERS
-- ===============================================

-- Trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_absensis_updated_at BEFORE UPDATE ON absensis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shiftswaps_updated_at BEFORE UPDATE ON shiftswaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kegiatans_updated_at BEFORE UPDATE ON kegiatans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifikasi_updated_at BEFORE UPDATE ON notifikasi
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 9. SAMPLE DATA STRUCTURE
-- ===============================================

-- Sample data inserts for testing (commented out for production)
/*
-- Sample users
INSERT INTO users (username, email, password, "namaDepan", "namaBelakang", "noHp", "jenisKelamin", "tanggalLahir", role) VALUES
('admin', 'admin@hospital.com', '$2b$10$hash', 'Admin', 'System', '081234567890', 'L', '1980-01-01', 'ADMIN'),
('dr.smith', 'smith@hospital.com', '$2b$10$hash', 'John', 'Smith', '081234567891', 'L', '1975-05-15', 'DOKTER'),
('nurse.jane', 'jane@hospital.com', '$2b$10$hash', 'Jane', 'Doe', '081234567892', 'P', '1985-03-20', 'PERAWAT');

-- Sample shifts
INSERT INTO shifts (tanggal, "idpegawai", jammulai, jamselesai, lokasishift, "userId", "lokasiEnum", "tipeEnum") VALUES
('2025-07-04', 'EMP001', '08:00', '16:00', 'ICU', 2, 'ICU', 'PAGI'),
('2025-07-04', 'EMP002', '16:00', '00:00', 'ICU', 3, 'ICU', 'SIANG');

-- Sample notifications
INSERT INTO notifikasi ("userId", judul, pesan, jenis) VALUES
(2, 'Shift Reminder', 'Your shift starts in 30 minutes', 'REMINDER_SHIFT'),
(3, 'Personal Task', 'Complete patient documentation', 'TUGAS_PERSONAL');
*/
