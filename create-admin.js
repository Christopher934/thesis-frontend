const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user for testing...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        employeeId: 'ADM999',
        username: 'testadmin',
        email: 'admin@test.com',
        password: hashedPassword,
        namaDepan: 'Test',
        namaBelakang: 'Admin',
        alamat: 'Test Address',
        noHp: '081234567890',
        jenisKelamin: 'L',
        tanggalLahir: new Date('1990-01-01'),
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    
    console.log('✅ Admin user created/updated:', admin.email);
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
