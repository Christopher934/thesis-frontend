/*
  Warnings:

  - The `prioritas` column on the `kegiatans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `kegiatans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `waktuSelesai` column on the `kegiatans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sentVia` column on the `notifikasi` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `idpegawai` on the `shifts` table. All the data in the column will be lost.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[employeeId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `waktuMulai` on the `kegiatans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `jammulai` on the `shifts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `jamselesai` on the `shifts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `employeeId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `jenisKelamin` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PrioritasKegiatan" AS ENUM ('RENDAH', 'SEDANG', 'TINGGI', 'URGENT');

-- CreateEnum
CREATE TYPE "StatusKegiatan" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SentViaChannel" AS ENUM ('WEB', 'TELEGRAM', 'BOTH');

-- CreateEnum
CREATE TYPE "WorkloadStatus" AS ENUM ('UNDERLOADED', 'NORMAL', 'HIGH', 'OVERWORKED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('TRAINEE', 'JUNIOR', 'SENIOR', 'EXPERT', 'SPECIALIST');

-- CreateEnum
CREATE TYPE "ShiftPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "ShiftDifficulty" AS ENUM ('EASY', 'STANDARD', 'CHALLENGING', 'CRITICAL', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "PreferenceType" AS ENUM ('PREFERRED_SHIFT_TYPE', 'DAY_OFF', 'LOCATION_PREFERENCE', 'TIME_PREFERENCE', 'WORKLOAD_LIMIT', 'NOTIFICATION_SETTING');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL_LEAVE', 'SICK_LEAVE', 'EMERGENCY_LEAVE', 'MATERNITY_LEAVE', 'PERSONAL_LEAVE', 'STUDY_LEAVE');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LokasiShift" ADD VALUE 'HEMODIALISA';
ALTER TYPE "LokasiShift" ADD VALUE 'FISIOTERAPI';
ALTER TYPE "LokasiShift" ADD VALUE 'KAMAR_OPERASI';
ALTER TYPE "LokasiShift" ADD VALUE 'RECOVERY_ROOM';
ALTER TYPE "LokasiShift" ADD VALUE 'EMERGENCY_ROOM';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ShiftType" ADD VALUE 'HEMODIALISA_2_SHIFT';
ALTER TYPE "ShiftType" ADD VALUE 'FISIOTERAPI_REGULER';
ALTER TYPE "ShiftType" ADD VALUE 'KAMAR_OPERASI_3_SHIFT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipeShift" ADD VALUE 'LIBUR';
ALTER TYPE "TipeShift" ADD VALUE 'CUTI';
ALTER TYPE "TipeShift" ADD VALUE 'SAKIT';
ALTER TYPE "TipeShift" ADD VALUE 'TRAINING';

-- AlterTable
ALTER TABLE "kegiatans" DROP COLUMN "prioritas",
ADD COLUMN     "prioritas" "PrioritasKegiatan" NOT NULL DEFAULT 'SEDANG',
DROP COLUMN "status",
ADD COLUMN     "status" "StatusKegiatan" NOT NULL DEFAULT 'DRAFT',
DROP COLUMN "waktuMulai",
ADD COLUMN     "waktuMulai" TIME NOT NULL,
DROP COLUMN "waktuSelesai",
ADD COLUMN     "waktuSelesai" TIME;

-- AlterTable
ALTER TABLE "notifikasi" DROP COLUMN "sentVia",
ADD COLUMN     "sentVia" "SentViaChannel" NOT NULL DEFAULT 'WEB';

-- AlterTable
ALTER TABLE "shifts" DROP COLUMN "idpegawai",
ADD COLUMN     "difficulty" "ShiftDifficulty" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "isAutoAssigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "overtimeHours" DOUBLE PRECISION,
ADD COLUMN     "priority" "ShiftPriority" NOT NULL DEFAULT 'NORMAL',
DROP COLUMN "jammulai",
ADD COLUMN     "jammulai" TIME NOT NULL,
DROP COLUMN "jamselesai",
ADD COLUMN     "jamselesai" TIME NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "consecutiveDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentMonthShifts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "lastShiftDate" TIMESTAMP(3),
ADD COLUMN     "maxShiftsPerMonth" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "preferredLocations" TEXT,
ADD COLUMN     "skillLevel" "SkillLevel" NOT NULL DEFAULT 'JUNIOR',
ADD COLUMN     "totalShifts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "workloadStatus" "WorkloadStatus" NOT NULL DEFAULT 'NORMAL',
DROP COLUMN "jenisKelamin",
ADD COLUMN     "jenisKelamin" "Gender" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "user_shift_stats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalShifts" INTEGER NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOvertimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shiftsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "shiftsThisWeek" INTEGER NOT NULL DEFAULT 0,
    "consecutiveDays" INTEGER NOT NULL DEFAULT 0,
    "maxConsecutiveDays" INTEGER NOT NULL DEFAULT 0,
    "avgShiftsPerMonth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastShiftDate" TIMESTAMP(3),
    "nextShiftDate" TIMESTAMP(3),
    "workloadScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "performanceRating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "preferredShiftTypes" TEXT,
    "unavailableDates" TEXT,
    "skillRatings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_shift_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_capacities" (
    "id" SERIAL NOT NULL,
    "location" "LokasiShift" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "utilizationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "peakHours" TEXT,
    "isOverloaded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_capacities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "preferenceType" "PreferenceType" NOT NULL,
    "value" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,
    "rejectedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_shift_stats_userId_key" ON "user_shift_stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "location_capacities_location_date_key" ON "location_capacities"("location", "date");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- AddForeignKey
ALTER TABLE "user_shift_stats" ADD CONSTRAINT "user_shift_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shiftswaps" ADD CONSTRAINT "shiftswaps_supervisorApprovedBy_fkey" FOREIGN KEY ("supervisorApprovedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shiftswaps" ADD CONSTRAINT "shiftswaps_targetApprovedBy_fkey" FOREIGN KEY ("targetApprovedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shiftswaps" ADD CONSTRAINT "shiftswaps_unitHeadApprovedBy_fkey" FOREIGN KEY ("unitHeadApprovedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
