-- CreateEnum
CREATE TYPE "LokasiShift" AS ENUM ('POLI_UMUM', 'POLI_ANAK', 'POLI_GIGI', 'IGD', 'ICU', 'LABORATORIUM', 'RADIOLOGI', 'FARMASI', 'EMERGENCY_ROOM');

-- AlterTable
ALTER TABLE "shifts" ADD COLUMN     "lokasiEnum" "LokasiShift";
