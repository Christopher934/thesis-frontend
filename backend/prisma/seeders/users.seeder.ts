import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users for notification testing...');

  const users = [
    {
      employeeId: 'ADM001',
      username: 'admin',
      email: 'admin@hospital.com',
      password: await bcrypt.hash('admin123', 10),
      namaDepan: 'Admin',
      namaBelakang: 'System',
      alamat: 'Rumah Sakit',
      noHp: '081234567890',
      jenisKelamin: 'Laki-laki',
      tanggalLahir: new Date('1990-01-01'),
      role: 'ADMIN' as Role,
    },
    {
      employeeId: 'SUP001',
      username: 'supervisor1',
      email: 'supervisor@hospital.com',
      password: await bcrypt.hash('supervisor123', 10),
      namaDepan: 'Dr. Sarah',
      namaBelakang: 'Johnson',
      alamat: 'Jakarta',
      noHp: '081234567891',
      jenisKelamin: 'Perempuan',
      tanggalLahir: new Date('1985-05-15'),
      role: 'SUPERVISOR' as Role,
    },
    {
      employeeId: 'PER001',
      username: 'perawat1',
      email: 'perawat@hospital.com',
      password: await bcrypt.hash('perawat123', 10),
      namaDepan: 'Siti',
      namaBelakang: 'Nurhaliza',
      alamat: 'Jakarta',
      noHp: '081234567892',
      jenisKelamin: 'Perempuan',
      tanggalLahir: new Date('1992-08-20'),
      role: 'PERAWAT' as Role,
    },
    {
      employeeId: 'DOK001',
      username: 'dokter1',
      email: 'dokter@hospital.com',
      password: await bcrypt.hash('dokter123', 10),
      namaDepan: 'Dr. Ahmad',
      namaBelakang: 'Wijaya',
      alamat: 'Jakarta',
      noHp: '081234567893',
      jenisKelamin: 'Laki-laki',
      tanggalLahir: new Date('1988-03-10'),
      role: 'DOKTER' as Role,
    }
  ];

  try {
    // Cek apakah user sudah ada, jika belum ada baru buat
    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const user = await prisma.user.create({
          data: userData
        });
        console.log(`✅ Created user: ${user.namaDepan} ${user.namaBelakang} (${user.role})`);
      } else {
        console.log(`⚠️  User already exists: ${existingUser.namaDepan} ${existingUser.namaBelakang} (${existingUser.role})`);
      }
    }

    // Tampilkan summary users
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    console.log('\n📊 User Summary:');
    userCounts.forEach(({ role, _count }) => {
      console.log(`  - ${role}: ${_count.role} users`);
    });

    console.log('\n🎯 Test credentials:');
    console.log('Admin: admin@hospital.com / admin123');
    console.log('Supervisor: supervisor@hospital.com / supervisor123');
    console.log('Perawat: perawat@hospital.com / perawat123');
    console.log('Dokter: dokter@hospital.com / dokter123');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeder failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });
