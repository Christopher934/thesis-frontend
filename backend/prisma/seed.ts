// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // Common password for all test users
  const commonPassword = await bcrypt.hash('password123', 10);

  // 1) Create Admin User
  console.log('👤 Creating Admin user...');
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@rsud.id',
      password: commonPassword,
      namaDepan: 'Admin',
      namaBelakang: 'System',
      alamat: 'Jalan Administrasi No.1',
      noHp: '081234567890',
      jenisKelamin: 'L',
      tanggalLahir: new Date('1985-01-01'),
      role: Role.ADMIN,
      status: 'ACTIVE',
    },
  });

  // 2) Create Staff Users (2 users)
  console.log('👥 Creating Staff users...');
  await prisma.user.upsert({
    where: { username: 'staff1' },
    update: {},
    create: {
      username: 'staff1',
      email: 'staff1@rsud.id',
      password: commonPassword,
      namaDepan: 'Ahmad',
      namaBelakang: 'Wijaya',
      alamat: 'Jalan Staff No.1',
      noHp: '081111111111',
      jenisKelamin: 'L',
      tanggalLahir: new Date('1990-03-15'),
      role: Role.STAF,
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { username: 'staff2' },
    update: {},
    create: {
      username: 'staff2',
      email: 'staff2@rsud.id',
      password: commonPassword,
      namaDepan: 'Sari',
      namaBelakang: 'Dewi',
      alamat: 'Jalan Staff No.2',
      noHp: '082222222222',
      jenisKelamin: 'P',
      tanggalLahir: new Date('1992-07-20'),
      role: Role.STAF,
      status: 'ACTIVE',
    },
  });

  // 3) Create Perawat Users (2 users)
  console.log('🏥 Creating Perawat users...');
  await prisma.user.upsert({
    where: { username: 'perawat1' },
    update: {},
    create: {
      username: 'perawat1',
      email: 'perawat1@rsud.id',
      password: commonPassword,
      namaDepan: 'Nurse',
      namaBelakang: 'Maya',
      alamat: 'Jalan Perawat No.1',
      noHp: '083333333333',
      jenisKelamin: 'P',
      tanggalLahir: new Date('1993-05-10'),
      role: Role.PERAWAT,
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { username: 'perawat2' },
    update: {},
    create: {
      username: 'perawat2',
      email: 'perawat2@rsud.id',
      password: commonPassword,
      namaDepan: 'Rina',
      namaBelakang: 'Sari',
      alamat: 'Jalan Perawat No.2',
      noHp: '084444444444',
      jenisKelamin: 'P',
      tanggalLahir: new Date('1991-09-25'),
      role: Role.PERAWAT,
      status: 'ACTIVE',
    },
  });

  // 4) Create Supervisor Users (2 users)
  console.log('👨‍⚕️ Creating Supervisor users...');
  await prisma.user.upsert({
    where: { username: 'supervisor1' },
    update: {},
    create: {
      username: 'supervisor1',
      email: 'supervisor1@rsud.id',
      password: commonPassword,
      namaDepan: 'Dr. Budi',
      namaBelakang: 'Pratama',
      alamat: 'Jalan Supervisor No.1',
      noHp: '085555555555',
      jenisKelamin: 'L',
      tanggalLahir: new Date('1980-12-05'),
      role: Role.SUPERVISOR,
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { username: 'supervisor2' },
    update: {},
    create: {
      username: 'supervisor2',
      email: 'supervisor2@rsud.id',
      password: commonPassword,
      namaDepan: 'Dr. Lisa',
      namaBelakang: 'Handayani',
      alamat: 'Jalan Supervisor No.2',
      noHp: '086666666666',
      jenisKelamin: 'P',
      tanggalLahir: new Date('1982-02-18'),
      role: Role.SUPERVISOR,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('');
  console.log('👥 Created users:');
  console.log('   🔑 Admin: admin@rsud.id (password: password123)');
  console.log('   📋 Staff1: staff1@rsud.id (password: password123)');
  console.log('   📋 Staff2: staff2@rsud.id (password: password123)');
  console.log('   🏥 Perawat1: perawat1@rsud.id (password: password123)');
  console.log('   🏥 Perawat2: perawat2@rsud.id (password: password123)');
  console.log('   👨‍⚕️ Supervisor1: supervisor1@rsud.id (password: password123)');
  console.log('   👨‍⚕️ Supervisor2: supervisor2@rsud.id (password: password123)');
  console.log('');
  console.log('🎯 Total: 1 Admin + 2 Staff + 2 Perawat + 2 Supervisor = 7 users');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
