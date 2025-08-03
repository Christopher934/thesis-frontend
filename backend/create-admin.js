// Quick admin user creation
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rsud.id' },
      update: {
        password: hashedPassword,
      },
      create: {
        employeeId: 'ADM001',
        username: 'admin',
        email: 'admin@rsud.id',
        password: hashedPassword,
        namaDepan: 'Admin',
        namaBelakang: 'System',
        alamat: 'Jalan Administrasi No.1',
        noHp: '081234567890',
        jenisKelamin: 'L',
        tanggalLahir: new Date('1985-01-01'),
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    
    console.log('✅ Admin user created:', admin.email);
    
    // Create a few test employees with shifts for workload testing
    const testEmployees = [
      {
        employeeId: 'DOK001',
        username: 'dokter1',
        email: 'dokter1@rsud.id',
        namaDepan: 'Dr. Ahmad',
        namaBelakang: 'Pratama',
        role: 'DOKTER'
      },
      {
        employeeId: 'PER001', 
        username: 'perawat1',
        email: 'perawat1@rsud.id',
        namaDepan: 'Siti',
        namaBelakang: 'Nurhaliza',
        role: 'PERAWAT'
      }
    ];
    
    for (const emp of testEmployees) {
      const user = await prisma.user.upsert({
        where: { email: emp.email },
        update: {},
        create: {
          ...emp,
          password: hashedPassword,
          alamat: 'Alamat Test',
          noHp: '081111111111',
          jenisKelamin: 'L',
          tanggalLahir: new Date('1990-01-01'),
          status: 'ACTIVE',
        },
      });
      
      // Create some shifts for this month to test workload
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      for (let i = 0; i < 12; i++) {
        const shiftDate = new Date(startOfMonth);
        shiftDate.setDate(shiftDate.getDate() + i * 2);
        
        await prisma.shift.upsert({
          where: {
            employeeId_date: {
              employeeId: user.id,
              date: shiftDate,
            }
          },
          update: {},
          create: {
            employeeId: user.id,
            date: shiftDate,
            startTime: '08:00',
            endTime: '16:00',
            location: 'ICU',
            status: 'SCHEDULED',
          },
        });
      }
      
      console.log(`✅ Created test employee: ${emp.namaDepan} with shifts`);
    }
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
