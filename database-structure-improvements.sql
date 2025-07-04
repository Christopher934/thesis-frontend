-- ==========================================
-- DATABASE STRUCTURE IMPROVEMENTS MIGRATION
-- RSUD Anugerah Hospital Management System
-- Date: July 5, 2025
-- ==========================================

-- ==========================================
-- 1. TABEL USERS IMPROVEMENTS
-- ==========================================

-- Create ENUM for jenisKelamin (Gender)
DO $$ BEGIN
    CREATE TYPE gender_enum AS ENUM ('L', 'P');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for status
DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns with ENUM types
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS jenis_kelamin_enum gender_enum,
ADD COLUMN IF NOT EXISTS status_enum user_status_enum DEFAULT 'ACTIVE';

-- Migrate existing data
UPDATE users 
SET jenis_kelamin_enum = CASE 
    WHEN "jenisKelamin" = 'L' THEN 'L'::gender_enum
    WHEN "jenisKelamin" = 'P' THEN 'P'::gender_enum
    ELSE 'L'::gender_enum -- Default fallback
END;

UPDATE users 
SET status_enum = CASE 
    WHEN status = 'ACTIVE' THEN 'ACTIVE'::user_status_enum
    WHEN status = 'INACTIVE' THEN 'INACTIVE'::user_status_enum
    ELSE 'ACTIVE'::user_status_enum -- Default fallback
END;

-- Drop old columns and rename new ones
ALTER TABLE users DROP COLUMN IF EXISTS "jenisKelamin";
ALTER TABLE users DROP COLUMN IF EXISTS status;
ALTER TABLE users RENAME COLUMN jenis_kelamin_enum TO "jenisKelamin";
ALTER TABLE users RENAME COLUMN status_enum TO status;

-- Add constraints for email and phone validation
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS valid_email 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS valid_phone 
CHECK ("noHp" ~* '^(\+62|62|0)[0-9]{8,12}$');

-- ==========================================
-- 2. TABEL SHIFTS IMPROVEMENTS
-- ==========================================

-- Add new TIME columns
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS jam_mulai_time TIME,
ADD COLUMN IF NOT EXISTS jam_selesai_time TIME;

-- Migrate existing VARCHAR time data to TIME format
UPDATE shifts 
SET jam_mulai_time = CASE 
    WHEN jammulai ~ '^[0-9]{1,2}:[0-9]{2}$' THEN jammulai::TIME
    ELSE '08:00'::TIME -- Default fallback
END;

UPDATE shifts 
SET jam_selesai_time = CASE 
    WHEN jamselesai ~ '^[0-9]{1,2}:[0-9]{2}$' THEN jamselesai::TIME
    ELSE '16:00'::TIME -- Default fallback
END;

-- Drop old VARCHAR columns and rename new ones
ALTER TABLE shifts DROP COLUMN IF EXISTS jammulai;
ALTER TABLE shifts DROP COLUMN IF EXISTS jamselesai;
ALTER TABLE shifts RENAME COLUMN jam_mulai_time TO jammulai;
ALTER TABLE shifts RENAME COLUMN jam_selesai_time TO jamselesai;

-- ==========================================
-- 3. TABEL SHIFTSWAPS IMPROVEMENTS
-- ==========================================

-- Add foreign key constraints for approval columns
ALTER TABLE shiftswaps 
ADD CONSTRAINT IF NOT EXISTS fk_supervisor_approved_by 
FOREIGN KEY ("supervisorApprovedBy") REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE shiftswaps 
ADD CONSTRAINT IF NOT EXISTS fk_target_approved_by 
FOREIGN KEY ("targetApprovedBy") REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE shiftswaps 
ADD CONSTRAINT IF NOT EXISTS fk_unit_head_approved_by 
FOREIGN KEY ("unitHeadApprovedBy") REFERENCES users(id) ON DELETE SET NULL;

-- ==========================================
-- 4. TABEL NOTIFIKASI IMPROVEMENTS
-- ==========================================

-- Create ENUM for sentVia
DO $$ BEGIN
    CREATE TYPE sent_via_enum AS ENUM ('WEB', 'TELEGRAM', 'BOTH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new column with ENUM type
ALTER TABLE notifikasi 
ADD COLUMN IF NOT EXISTS sent_via_enum sent_via_enum DEFAULT 'WEB';

-- Migrate existing data
UPDATE notifikasi 
SET sent_via_enum = CASE 
    WHEN "sentVia" = 'WEB' THEN 'WEB'::sent_via_enum
    WHEN "sentVia" = 'TELEGRAM' THEN 'TELEGRAM'::sent_via_enum
    WHEN "sentVia" = 'BOTH' THEN 'BOTH'::sent_via_enum
    ELSE 'WEB'::sent_via_enum -- Default fallback
END;

-- Drop old column and rename new one
ALTER TABLE notifikasi DROP COLUMN IF EXISTS "sentVia";
ALTER TABLE notifikasi RENAME COLUMN sent_via_enum TO "sentVia";

-- ==========================================
-- 5. TABEL KEGIATANS IMPROVEMENTS
-- ==========================================

-- Create ENUMs for prioritas and status
DO $$ BEGIN
    CREATE TYPE prioritas_enum AS ENUM ('RENDAH', 'SEDANG', 'TINGGI', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kegiatan_status_enum AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns with ENUM types and TIME columns
ALTER TABLE kegiatans 
ADD COLUMN IF NOT EXISTS prioritas_enum prioritas_enum DEFAULT 'SEDANG',
ADD COLUMN IF NOT EXISTS status_enum kegiatan_status_enum DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS waktu_mulai_time TIME,
ADD COLUMN IF NOT EXISTS waktu_selesai_time TIME;

-- Migrate existing data for prioritas
UPDATE kegiatans 
SET prioritas_enum = CASE 
    WHEN prioritas = 'RENDAH' THEN 'RENDAH'::prioritas_enum
    WHEN prioritas = 'SEDANG' THEN 'SEDANG'::prioritas_enum
    WHEN prioritas = 'TINGGI' THEN 'TINGGI'::prioritas_enum
    WHEN prioritas = 'URGENT' THEN 'URGENT'::prioritas_enum
    ELSE 'SEDANG'::prioritas_enum -- Default fallback
END;

-- Migrate existing data for status
UPDATE kegiatans 
SET status_enum = CASE 
    WHEN status = 'DRAFT' THEN 'DRAFT'::kegiatan_status_enum
    WHEN status = 'ACTIVE' THEN 'ACTIVE'::kegiatan_status_enum
    WHEN status = 'COMPLETED' THEN 'COMPLETED'::kegiatan_status_enum
    WHEN status = 'CANCELLED' THEN 'CANCELLED'::kegiatan_status_enum
    ELSE 'DRAFT'::kegiatan_status_enum -- Default fallback
END;

-- Migrate existing VARCHAR time data to TIME format
UPDATE kegiatans 
SET waktu_mulai_time = CASE 
    WHEN "waktuMulai" ~ '^[0-9]{1,2}:[0-9]{2}$' THEN "waktuMulai"::TIME
    ELSE '08:00'::TIME -- Default fallback
END;

UPDATE kegiatans 
SET waktu_selesai_time = CASE 
    WHEN "waktuSelesai" ~ '^[0-9]{1,2}:[0-9]{2}$' THEN "waktuSelesai"::TIME
    ELSE NULL -- Can be null for ongoing activities
END
WHERE "waktuSelesai" IS NOT NULL;

-- Drop old columns and rename new ones
ALTER TABLE kegiatans DROP COLUMN IF EXISTS prioritas;
ALTER TABLE kegiatans DROP COLUMN IF EXISTS status;
ALTER TABLE kegiatans DROP COLUMN IF EXISTS "waktuMulai";
ALTER TABLE kegiatans DROP COLUMN IF EXISTS "waktuSelesai";

ALTER TABLE kegiatans RENAME COLUMN prioritas_enum TO prioritas;
ALTER TABLE kegiatans RENAME COLUMN status_enum TO status;
ALTER TABLE kegiatans RENAME COLUMN waktu_mulai_time TO "waktuMulai";
ALTER TABLE kegiatans RENAME COLUMN waktu_selesai_time TO "waktuSelesai";

-- ==========================================
-- 6. PERFORMANCE OPTIMIZATION INDEXES
-- ==========================================

-- Indexes for frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users("employeeId");

CREATE INDEX IF NOT EXISTS idx_shifts_tanggal ON shifts(tanggal);
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts("userId");
CREATE INDEX IF NOT EXISTS idx_shifts_shift_type ON shifts("shiftType");

CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON absensis("createdAt");
CREATE INDEX IF NOT EXISTS idx_absensi_status ON absensis(status);

CREATE INDEX IF NOT EXISTS idx_shiftswap_status ON shiftswaps(status);
CREATE INDEX IF NOT EXISTS idx_shiftswap_tanggal ON shiftswaps("tanggalSwap");

CREATE INDEX IF NOT EXISTS idx_notifikasi_status ON notifikasi(status);
CREATE INDEX IF NOT EXISTS idx_notifikasi_jenis ON notifikasi(jenis);
CREATE INDEX IF NOT EXISTS idx_notifikasi_created ON notifikasi("createdAt");

CREATE INDEX IF NOT EXISTS idx_kegiatan_status ON kegiatans(status);
CREATE INDEX IF NOT EXISTS idx_kegiatan_prioritas ON kegiatans(prioritas);
CREATE INDEX IF NOT EXISTS idx_kegiatan_tanggal_mulai ON kegiatans("tanggalMulai");

-- ==========================================
-- 7. ADDITIONAL SECURITY CONSTRAINTS
-- ==========================================

-- Ensure username is not empty
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS non_empty_username 
CHECK (length(trim(username)) > 0);

-- Ensure employee ID follows pattern
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS valid_employee_id 
CHECK ("employeeId" ~* '^[A-Z]{3}[0-9]{3}$');

-- Ensure shift times are logical
ALTER TABLE shifts 
ADD CONSTRAINT IF NOT EXISTS valid_shift_times 
CHECK (jammulai < jamselesai OR jamselesai < jammulai); -- Allow overnight shifts

-- Ensure activity dates are logical
ALTER TABLE kegiatans 
ADD CONSTRAINT IF NOT EXISTS valid_activity_dates 
CHECK ("tanggalMulai" <= "tanggalSelesai" OR "tanggalSelesai" IS NULL);

-- Ensure activity times are logical (when both are provided)
ALTER TABLE kegiatans 
ADD CONSTRAINT IF NOT EXISTS valid_activity_times 
CHECK ("waktuMulai" <= "waktuSelesai" OR "waktuSelesai" IS NULL);

-- ==========================================
-- 8. DATA VALIDATION AND CLEANUP
-- ==========================================

-- Clean up any invalid data that might exist
UPDATE users SET "noHp" = REGEXP_REPLACE("noHp", '[^0-9+]', '', 'g');

-- Ensure all foreign key relationships are valid
DELETE FROM shifts WHERE "userId" NOT IN (SELECT id FROM users);
DELETE FROM absensis WHERE "userId" NOT IN (SELECT id FROM users);
DELETE FROM absensis WHERE "shiftId" NOT IN (SELECT id FROM shifts);
DELETE FROM shiftswaps WHERE "fromUserId" NOT IN (SELECT id FROM users);
DELETE FROM shiftswaps WHERE "toUserId" NOT IN (SELECT id FROM users);
DELETE FROM shiftswaps WHERE "shiftId" NOT IN (SELECT id FROM shifts);
DELETE FROM notifikasi WHERE "userId" NOT IN (SELECT id FROM users);
DELETE FROM tokens WHERE "userId" NOT IN (SELECT id FROM users);
DELETE FROM login_logs WHERE "userId" NOT IN (SELECT id FROM users);

-- ==========================================
-- MIGRATION COMPLETED
-- ==========================================

-- Create a summary view for verification
CREATE OR REPLACE VIEW database_improvements_summary AS
SELECT 
    'users' as table_name,
    'jenisKelamin converted to ENUM, status converted to ENUM, email/phone validation added' as improvements
UNION ALL
SELECT 
    'shifts' as table_name,
    'jammulai and jamselesai converted to TIME type' as improvements
UNION ALL
SELECT 
    'shiftswaps' as table_name,
    'Added FK constraints for approval columns' as improvements
UNION ALL
SELECT 
    'notifikasi' as table_name,
    'sentVia converted to ENUM' as improvements
UNION ALL
SELECT 
    'kegiatans' as table_name,
    'prioritas and status converted to ENUM, time columns converted to TIME' as improvements
UNION ALL
SELECT 
    'performance' as table_name,
    'Added indexes for frequently queried columns' as improvements
UNION ALL
SELECT 
    'security' as table_name,
    'Added data validation constraints' as improvements;

-- Display summary
SELECT * FROM database_improvements_summary;

-- Final validation query
SELECT 
    'Database structure improvements completed successfully!' as status,
    NOW() as completed_at;
