/*
  Warnings:

  - The values [POLI_UMUM,POLI_ANAK,POLI_GIGI,IGD,EMERGENCY_ROOM] on the enum `LokasiShift` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('GEDUNG_ADMINISTRASI', 'RAWAT_JALAN', 'RAWAT_INAP_3_SHIFT', 'GAWAT_DARURAT_3_SHIFT', 'LABORATORIUM_2_SHIFT', 'FARMASI_2_SHIFT', 'RADIOLOGI_2_SHIFT', 'GIZI_2_SHIFT', 'KEAMANAN_2_SHIFT', 'LAUNDRY_REGULER', 'CLEANING_SERVICE', 'SUPIR_2_SHIFT');

-- CreateEnum
CREATE TYPE "JenisNotifikasi" AS ENUM ('REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'PERSETUJUAN_CUTI', 'KEGIATAN_HARIAN', 'ABSENSI_TERLAMBAT', 'SHIFT_BARU_DITAMBAHKAN', 'SISTEM_INFO', 'PENGUMUMAN');

-- CreateEnum
CREATE TYPE "StatusNotifikasi" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- AlterEnum
BEGIN;
CREATE TYPE "LokasiShift_new" AS ENUM ('GEDUNG_ADMINISTRASI', 'RAWAT_JALAN', 'RAWAT_INAP', 'GAWAT_DARURAT', 'LABORATORIUM', 'FARMASI', 'RADIOLOGI', 'GIZI', 'KEAMANAN', 'LAUNDRY', 'CLEANING_SERVICE', 'SUPIR', 'ICU', 'NICU');
ALTER TABLE "shifts" ALTER COLUMN "lokasiEnum" TYPE "LokasiShift_new" USING ("lokasiEnum"::text::"LokasiShift_new");
ALTER TYPE "LokasiShift" RENAME TO "LokasiShift_old";
ALTER TYPE "LokasiShift_new" RENAME TO "LokasiShift";
DROP TYPE "LokasiShift_old";
COMMIT;

-- AlterTable
ALTER TABLE "shifts" ADD COLUMN     "shiftNumber" INTEGER,
ADD COLUMN     "shiftType" "ShiftType";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "telegramChatId" TEXT;

-- CreateTable
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

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
