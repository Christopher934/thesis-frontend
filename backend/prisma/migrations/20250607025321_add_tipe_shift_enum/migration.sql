-- CreateEnum
CREATE TYPE "TipeShift" AS ENUM ('PAGI', 'SIANG', 'MALAM', 'ON_CALL', 'JAGA');

-- AlterTable
ALTER TABLE "shifts" ADD COLUMN     "tipeEnum" "TipeShift",
ADD COLUMN     "tipeshift" TEXT;
