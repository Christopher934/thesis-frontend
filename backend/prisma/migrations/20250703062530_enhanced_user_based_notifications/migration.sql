-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JenisNotifikasi" ADD VALUE 'PERSONAL_REMINDER_ABSENSI';
ALTER TYPE "JenisNotifikasi" ADD VALUE 'TUGAS_PERSONAL';
ALTER TYPE "JenisNotifikasi" ADD VALUE 'HASIL_EVALUASI_PERSONAL';
ALTER TYPE "JenisNotifikasi" ADD VALUE 'KONFIRMASI_SHIFT_SWAP_PERSONAL';
ALTER TYPE "JenisNotifikasi" ADD VALUE 'PENGUMUMAN_INTERAKTIF';
ALTER TYPE "JenisNotifikasi" ADD VALUE 'NOTIFIKASI_DIREKTUR';
ALTER TYPE "JenisNotifikasi" ADD VALUE 'REMINDER_MEETING_PERSONAL';
ALTER TYPE "JenisNotifikasi" ADD VALUE 'PERINGATAN_PERSONAL';
