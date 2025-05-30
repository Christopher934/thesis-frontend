import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Buat password hash
  const adminPass = await bcrypt.hash('admin123', 10);
  const pegawai1Pass = await bcrypt.hash('pegawai123', 10);
  const pegawai2Pass = await bcrypt.hash('pegawai456', 10);

  // Tambah User
  const admin = await prisma.user.create({
    data: {
      nama: 'Admin RSUD',
      email: 'admin@rsud.local',
      password: adminPass,
      role: 'ADMIN',
      status: 'AKTIF',
    },
  });

  const pegawai1 = await prisma.user.create({
    data: {
      nama: 'Pegawai Satu',
      email: 'pegawai1@rsud.local',
      password: pegawai1Pass,
      role: 'PERAWAT',
      status: 'AKTIF',
    },
  });

  const pegawai2 = await prisma.user.create({
    data: {
      nama: 'Pegawai Dua',
      email: 'pegawai2@rsud.local',
      password: pegawai2Pass,
      role: 'PERAWAT',
      status: 'AKTIF',
    },
  });

  // Tambah Shift
  const shift1 = await prisma.shift.create({
    data: {
      tanggal: new Date('2025-06-01'),
      jamMulai: '08:00',
      jamSelesai: '16:00',
      pegawaiId: pegawai1.id,
    },
  });

  const shift2 = await prisma.shift.create({
    data: {
      tanggal: new Date('2025-06-02'),
      jamMulai: '08:00',
      jamSelesai: '16:00',
      pegawaiId: pegawai2.id,
    },
  });

  // Tambah Absensi
  await prisma.absensi.create({
    data: {
      userId: pegawai1.id,
      shiftId: shift1.id,
      jamMasuk: new Date('2025-06-01T08:10:00'),
      jamKeluar: new Date('2025-06-01T16:00:00'),
      status: 'TERLAMBAT',
    },
  });

  await prisma.absensi.create({
    data: {
      userId: pegawai2.id,
      shiftId: shift2.id,
      jamMasuk: new Date('2025-06-02T07:59:00'),
      jamKeluar: new Date('2025-06-02T16:00:00'),
      status: 'HADIR',
    },
  });

  // Tambah Tukar Shift
  await prisma.shiftSwap.create({
    data: {
      fromUserId: pegawai1.id,
      toUserId: pegawai2.id,
      shiftId: shift1.id,
      status: 'PENDING',
      alasan: 'Perlu izin ke luar kota',
      tanggalSwap: new Date('2025-06-01'),
    },
  });

  // Tambah Kegiatan
  await prisma.kegiatan.create({
    data: {
      nama: 'Rapat Evaluasi Bulanan',
      deskripsi: 'Rapat rutin untuk membahas kinerja unit kerja RSUD',
      tanggal: new Date('2025-06-03T10:00:00'),
    },
  });

  console.log('✅ Data seed berhasil dimasukkan!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
