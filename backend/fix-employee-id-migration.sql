-- Migration script untuk menambahkan employeeId dan menghapus idpegawai
-- File: fix-employee-id-migration.sql

-- 1. Tambahkan kolom employeeId dengan nilai sementara
ALTER TABLE users ADD COLUMN "employeeId" VARCHAR;

-- 2. Update employeeId berdasarkan role dan id
UPDATE users SET "employeeId" = 
  CASE 
    WHEN role = 'ADMIN' THEN 'ADM' || LPAD(id::text, 3, '0')
    WHEN role = 'DOKTER' THEN 'DOK' || LPAD(id::text, 3, '0')  
    WHEN role = 'PERAWAT' THEN 'PER' || LPAD(id::text, 3, '0')
    WHEN role = 'STAF' THEN 'STF' || LPAD(id::text, 3, '0')
    WHEN role = 'SUPERVISOR' THEN 'SUP' || LPAD(id::text, 3, '0')
    ELSE 'PEG' || LPAD(id::text, 3, '0')
  END;

-- 3. Tambahkan constraint NOT NULL dan UNIQUE setelah update
ALTER TABLE users ALTER COLUMN "employeeId" SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_employeeId_key UNIQUE ("employeeId");

-- 4. Hapus kolom idpegawai dari shifts (jika ada data, perlu backup dulu)
-- Backup data dulu
CREATE TABLE shifts_backup AS SELECT * FROM shifts;

-- Hapus kolom idpegawai
ALTER TABLE shifts DROP COLUMN IF EXISTS idpegawai;

-- 5. Verifikasi hasil
SELECT id, "employeeId", username, role FROM users ORDER BY id;
SELECT id, "userId", tanggal, jammulai, jamselesai FROM shifts LIMIT 5;
