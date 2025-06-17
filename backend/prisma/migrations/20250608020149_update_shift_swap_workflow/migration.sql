/*
  Warnings:

  - The values [DISETUJUI,DITOLAK] on the enum `SwapStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SwapStatus_new" AS ENUM ('PENDING', 'APPROVED_BY_TARGET', 'REJECTED_BY_TARGET', 'WAITING_UNIT_HEAD', 'REJECTED_BY_UNIT_HEAD', 'WAITING_SUPERVISOR', 'REJECTED_BY_SUPERVISOR', 'APPROVED');
ALTER TABLE "shiftswaps" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "shiftswaps" ALTER COLUMN "status" TYPE "SwapStatus_new" USING ("status"::text::"SwapStatus_new");
ALTER TYPE "SwapStatus" RENAME TO "SwapStatus_old";
ALTER TYPE "SwapStatus_new" RENAME TO "SwapStatus";
DROP TYPE "SwapStatus_old";
ALTER TABLE "shiftswaps" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "shiftswaps" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "requiresUnitHead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supervisorApprovedAt" TIMESTAMP(3),
ADD COLUMN     "supervisorApprovedBy" INTEGER,
ADD COLUMN     "targetApprovedAt" TIMESTAMP(3),
ADD COLUMN     "targetApprovedBy" INTEGER,
ADD COLUMN     "unitHeadApprovedAt" TIMESTAMP(3),
ADD COLUMN     "unitHeadApprovedBy" INTEGER;
