/*
  Warnings:

  - You are about to drop the column `jamMulai` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `jamSelesai` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `pegawaiId` on the `shifts` table. All the data in the column will be lost.
  - Added the required column `idpegawai` to the `shifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jammulai` to the `shifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jamselesai` to the `shifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lokasishift` to the `shifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `shifts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "shifts" DROP CONSTRAINT "shifts_pegawaiId_fkey";

-- AlterTable
ALTER TABLE "shifts" DROP COLUMN "jamMulai",
DROP COLUMN "jamSelesai",
DROP COLUMN "pegawaiId",
ADD COLUMN     "idpegawai" TEXT NOT NULL,
ADD COLUMN     "jammulai" TEXT NOT NULL,
ADD COLUMN     "jamselesai" TEXT NOT NULL,
ADD COLUMN     "lokasishift" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
