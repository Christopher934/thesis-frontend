// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1) Create atau skip admin
  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'adminrsud' },
    update: {}, // jika sudah ada, tidak melakukan apa‐apa
    create: {
      username: 'adminrsud',
      email: 'admin@example.com',
      password: adminPass,
      namaDepan: 'Admin',
      namaBelakang: 'RSUD',
      alamat: 'Jalan Kesehatan No.1',
      noHp: '081234567890',
      jenisKelamin: 'L',
      tanggalLahir: new Date('1990-01-01'),
      role: Role.ADMIN,
      status: 'ACTIVE',
    },
  });

  // 2) Create atau skip pegawai satu
  const pegawai1Pass = await bcrypt.hash('pegawai123', 10);
  await prisma.user.upsert({
    where: { username: 'pegawaione' },
    update: {},
    create: {
      username: 'pegawaione',
      email: 'pegawai1@example.com',
      password: pegawai1Pass,
      namaDepan: 'Budi',
      namaBelakang: 'Santoso',
      alamat: 'Jalan Pahlawan No.2',
      noHp: '081111111111',
      jenisKelamin: 'L',
      tanggalLahir: new Date('1992-05-20'),
      role: Role.STAF,
      status: 'ACTIVE',
    },
  });

  // 3) Create atau skip pegawai dua
  const pegawai2Pass = await bcrypt.hash('pegawai456', 10);
  await prisma.user.upsert({
    where: { username: 'pegawaitwo' },
    update: {},
    create: {
      username: 'pegawaitwo',
      email: 'pegawai2@example.com',
      password: pegawai2Pass,
      namaDepan: 'Siti',
      namaBelakang: 'Rahayu',
      alamat: 'Jalan Merdeka No.3',
      noHp: '082222222222',
      jenisKelamin: 'P',
      tanggalLahir: new Date('1994-07-15'),
      role: Role.STAF,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Seeding selesai.');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
