-- Script untuk menghapus semua data shift dan relasi terkait
-- Hati-hati: Ini akan menghapus SEMUA data shift yang ada!
-- Pastikan menggunakan: psql -h localhost -p 5432 -U postgres -d rsud_anugerah_db -f delete-all-shifts.sql

BEGIN;

-- 1. Hapus semua data absensi (karena ada foreign key ke shift)
DELETE FROM absensis;

-- 2. Hapus semua data shift swap requests
DELETE FROM shiftswaps;

-- 3. Hapus semua data shift
DELETE FROM shifts;

-- 4. Reset auto increment sequences
SELECT setval('absensis_id_seq', 1, false);
SELECT setval('shifts_id_seq', 1, false);
SELECT setval('shiftswaps_id_seq', 1, false);

COMMIT;

-- Verifikasi bahwa semua data sudah terhapus
SELECT 'Shifts remaining:' as info, COUNT(*) as count FROM shifts
UNION ALL
SELECT 'Absensis remaining:' as info, COUNT(*) as count FROM absensis
UNION ALL
SELECT 'Shiftswaps remaining:' as info, COUNT(*) as count FROM shiftswaps;
