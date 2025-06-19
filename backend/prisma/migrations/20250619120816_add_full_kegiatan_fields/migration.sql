/*
  Warnings:

  - You are about to drop the column `tanggal` on the `kegiatans` table. All the data in the column will be lost.
  - Added the required column `jenisKegiatan` to the `kegiatans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lokasi` to the `kegiatans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penanggungJawab` to the `kegiatans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prioritas` to the `kegiatans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `kegiatans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggalMulai` to the `kegiatans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waktuMulai` to the `kegiatans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "kegiatans" DROP COLUMN "tanggal",
ADD COLUMN     "anggaran" INTEGER,
ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "departemen" TEXT,
ADD COLUMN     "jenisKegiatan" TEXT NOT NULL,
ADD COLUMN     "kapasitas" INTEGER,
ADD COLUMN     "kontak" TEXT,
ADD COLUMN     "lokasi" TEXT NOT NULL,
ADD COLUMN     "lokasiDetail" TEXT,
ADD COLUMN     "penanggungJawab" TEXT NOT NULL,
ADD COLUMN     "prioritas" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "tanggalMulai" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tanggalSelesai" TIMESTAMP(3),
ADD COLUMN     "targetPeserta" TEXT[],
ADD COLUMN     "waktuMulai" TEXT NOT NULL,
ADD COLUMN     "waktuSelesai" TEXT;
