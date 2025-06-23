/*
  Warnings:

  - You are about to drop the column `lokasi` on the `kegiatans` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "absensis" DROP CONSTRAINT "absensis_userId_fkey";

-- DropForeignKey
ALTER TABLE "login_logs" DROP CONSTRAINT "login_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "shifts" DROP CONSTRAINT "shifts_userId_fkey";

-- DropForeignKey
ALTER TABLE "shiftswaps" DROP CONSTRAINT "shiftswaps_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "shiftswaps" DROP CONSTRAINT "shiftswaps_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "shiftswaps" DROP CONSTRAINT "shiftswaps_toUserId_fkey";

-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_userId_fkey";

-- AlterTable
ALTER TABLE "kegiatans" DROP COLUMN "lokasi";

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensis" ADD CONSTRAINT "absensis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shiftswaps" ADD CONSTRAINT "shiftswaps_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shiftswaps" ADD CONSTRAINT "shiftswaps_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shiftswaps" ADD CONSTRAINT "shiftswaps_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
