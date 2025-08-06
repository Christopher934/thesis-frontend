const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔧 Creating new admin user...');
  
  try {
    // Hash password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin user
    const newAdmin = await prisma.user.create({
      data: {
        employeeId: 'ADM002',
        username: 'adminbaru',
        email: 'admin@hospital.com',
        password: hashedPassword,
        namaDepan: 'Admin',
        namaBelakang: 'Baru',
        alamat: 'RSUD Anugerah',
        noHp: '081234567999',
        jenisKelamin: 'L',
        tanggalLahir: new Date('1985-01-01'),
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 User Details:');
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Employee ID: ${newAdmin.employeeId}`);
    console.log(`   Username: ${newAdmin.username}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   Status: ${newAdmin.status}`);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Password: ${password}`);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Error: User with this email or username already exists');
      console.log('🔄 Trying to update existing user...');
      
      try {
        const updatedAdmin = await prisma.user.update({
          where: { email: 'admin@hospital.com' },
          data: {
            role: 'ADMIN',
            status: 'ACTIVE',
            password: hashedPassword,
          },
        });
        
        console.log('✅ Existing user updated to admin successfully!');
        console.log('🔑 Login Credentials:');
        console.log(`   Email: admin@hospital.com`);
        console.log(`   Password: ${password}`);
        
      } catch (updateError) {
        console.error('❌ Error updating user:', updateError.message);
      }
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
