import { PrismaClient, Role, Gender, UserStatus, WorkloadStatus, SkillLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleDataWithShift() {
  console.log('🔄 Adding sample user and shift data...\n');

  try {
    // 1. Create a sample user (Doctor)
    console.log('👨‍⚕️ Creating sample doctor...');
    const doctor = await prisma.user.upsert({
      where: { email: 'dr.ahmad@rsud.id' },
      update: {},
      create: {
        employeeId: 'DOC001',
        username: 'dr.ahmad',
        email: 'dr.ahmad@rsud.id',
        password: '$2b$10$1234567890abcdefghijklmnopqrstuvwxyz', // hashed password
        namaDepan: 'Dr. Ahmad',
        namaBelakang: 'Rahman',
        alamat: 'Jl. Sudirman No. 123, Jakarta',
        noHp: '081234567890',
        jenisKelamin: Gender.L,
        tanggalLahir: new Date('1985-03-15'),
        role: Role.DOKTER,
        status: UserStatus.ACTIVE,
        totalShifts: 0,
        currentMonthShifts: 0,
        consecutiveDays: 0,
        workloadStatus: WorkloadStatus.NORMAL,
        skillLevel: SkillLevel.SENIOR,
        preferredLocations: JSON.stringify(['ICU', 'GAWAT_DARURAT', 'KAMAR_OPERASI']),
        maxShiftsPerMonth: 18
      }
    });
    console.log(`   ✅ Created doctor: ${doctor.namaDepan} ${doctor.namaBelakang} (ID: ${doctor.id})`);

    // 2. Create a sample nurse
    console.log('\n👩‍⚕️ Creating sample nurse...');
    const nurse = await prisma.user.upsert({
      where: { email: 'siti.perawat@rsud.id' },
      update: {},
      create: {
        employeeId: 'NUR001',
        username: 'siti.perawat',
        email: 'siti.perawat@rsud.id',
        password: '$2b$10$1234567890abcdefghijklmnopqrstuvwxyz',
        namaDepan: 'Siti',
        namaBelakang: 'Nurhaliza',
        alamat: 'Jl. Merdeka No. 456, Jakarta',
        noHp: '081234567891',
        jenisKelamin: Gender.P,
        tanggalLahir: new Date('1990-07-20'),
        role: Role.PERAWAT,
        status: UserStatus.ACTIVE,
        totalShifts: 0,
        currentMonthShifts: 0,
        consecutiveDays: 0,
        workloadStatus: WorkloadStatus.NORMAL,
        skillLevel: SkillLevel.INTERMEDIATE,
        preferredLocations: JSON.stringify(['ICU', 'RAWAT_INAP', 'GAWAT_DARURAT']),
        maxShiftsPerMonth: 20
      }
    });
    console.log(`   ✅ Created nurse: ${nurse.namaDepan} ${nurse.namaBelakang} (ID: ${nurse.id})`);

    // 3. Create a sample admin
    console.log('\n👨‍💼 Creating sample admin...');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rsud.id' },
      update: {},
      create: {
        employeeId: 'ADM001',
        username: 'admin',
        email: 'admin@rsud.id',
        password: '$2b$10$1234567890abcdefghijklmnopqrstuvwxyz',
        namaDepan: 'Admin',
        namaBelakang: 'Hospital',
        alamat: 'Jl. Admin No. 789, Jakarta',
        noHp: '081234567892',
        jenisKelamin: Gender.L,
        tanggalLahir: new Date('1980-01-01'),
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        totalShifts: 0,
        currentMonthShifts: 0,
        consecutiveDays: 0,
        workloadStatus: WorkloadStatus.NORMAL,
        skillLevel: SkillLevel.EXPERT,
        preferredLocations: JSON.stringify(['FARMASI', 'LABORATORIUM']),
        maxShiftsPerMonth: 14
      }
    });
    console.log(`   ✅ Created admin: ${admin.namaDepan} ${admin.namaBelakang} (ID: ${admin.id})`);

    // 4. Create sample shifts
    console.log('\n🕐 Creating sample shifts...');
    
    // Shift 1: Doctor morning shift at ICU
    const shift1 = await prisma.shift.create({
      data: {
        tanggal: new Date('2025-08-01'),
        jammulai: new Date('1970-01-01T07:00:00Z'),
        jamselesai: new Date('1970-01-01T15:00:00Z'),
        lokasishift: 'ICU',
        userId: doctor.id,
        tipeshift: 'PAGI',
        isAutoAssigned: false,
        notes: 'Sample morning shift for doctor at ICU'
      }
    });
    console.log(`   ✅ Created shift: Doctor Morning ICU (ID: ${shift1.id})`);

    // Shift 2: Nurse afternoon shift at RAWAT_INAP
    const shift2 = await prisma.shift.create({
      data: {
        tanggal: new Date('2025-08-01'),
        jammulai: new Date('1970-01-01T15:00:00Z'),
        jamselesai: new Date('1970-01-01T23:00:00Z'),
        lokasishift: 'RAWAT_INAP',
        userId: nurse.id,
        tipeshift: 'SIANG',
        isAutoAssigned: false,
        notes: 'Sample afternoon shift for nurse at RAWAT_INAP'
      }
    });
    console.log(`   ✅ Created shift: Nurse Afternoon RAWAT_INAP (ID: ${shift2.id})`);

    // Shift 3: Night shift for nurse at GAWAT_DARURAT
    const shift3 = await prisma.shift.create({
      data: {
        tanggal: new Date('2025-08-02'),
        jammulai: new Date('1970-01-01T23:00:00Z'),
        jamselesai: new Date('1970-01-02T07:00:00Z'),
        lokasishift: 'GAWAT_DARURAT',
        userId: nurse.id,
        tipeshift: 'MALAM',
        isAutoAssigned: false,
        notes: 'Sample night shift for nurse at Emergency Room'
      }
    });
    console.log(`   ✅ Created shift: Nurse Night GAWAT_DARURAT (ID: ${shift3.id})`);

    // 5. Create sample user preferences
    console.log('\n⚙️ Creating sample user preferences...');
    
    // Doctor preferences
    await prisma.userPreference.create({
      data: {
        userId: doctor.id,
        preferenceType: 'PREFERRED_SHIFT_TYPE',
        value: 'PAGI',
        priority: 5,
        isActive: true
      }
    });

    await prisma.userPreference.create({
      data: {
        userId: doctor.id,
        preferenceType: 'DAY_OFF',
        value: '0', // Sunday
        priority: 4,
        isActive: true
      }
    });

    // Nurse preferences
    await prisma.userPreference.create({
      data: {
        userId: nurse.id,
        preferenceType: 'PREFERRED_SHIFT_TYPE',
        value: 'SIANG',
        priority: 3,
        isActive: true
      }
    });

    await prisma.userPreference.create({
      data: {
        userId: nurse.id,
        preferenceType: 'LOCATION_PREFERENCE',
        value: 'ICU',
        priority: 4,
        isActive: true
      }
    });

    console.log('   ✅ Created user preferences');

    // 6. Update user statistics
    console.log('\n📊 Updating user statistics...');
    
    await prisma.user.update({
      where: { id: doctor.id },
      data: {
        totalShifts: 1,
        currentMonthShifts: 1,
        lastShiftDate: new Date('2025-08-01')
      }
    });

    await prisma.user.update({
      where: { id: nurse.id },
      data: {
        totalShifts: 2,
        currentMonthShifts: 2,
        lastShiftDate: new Date('2025-08-02')
      }
    });

    console.log('   ✅ Updated user statistics');

    // 7. Display summary
    console.log('\n📋 SUMMARY:');
    console.log('=====================================');
    console.log(`👨‍⚕️ Doctor: ${doctor.namaDepan} ${doctor.namaBelakang} (ID: ${doctor.id})`);
    console.log(`   Email: ${doctor.email}`);
    console.log(`   Role: ${doctor.role}`);
    console.log(`   Preferred Locations: ${doctor.preferredLocations}`);
    console.log('');
    console.log(`👩‍⚕️ Nurse: ${nurse.namaDepan} ${nurse.namaBelakang} (ID: ${nurse.id})`);
    console.log(`   Email: ${nurse.email}`);
    console.log(`   Role: ${nurse.role}`);
    console.log(`   Preferred Locations: ${nurse.preferredLocations}`);
    console.log('');
    console.log(`👨‍💼 Admin: ${admin.namaDepan} ${admin.namaBelakang} (ID: ${admin.id})`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('');
    console.log('🕐 SHIFTS CREATED:');
    console.log(`   1. ${shift1.tanggal.toDateString()} - ${doctor.namaDepan} - ICU - PAGI`);
    console.log(`   2. ${shift2.tanggal.toDateString()} - ${nurse.namaDepan} - RAWAT_INAP - SIANG`);
    console.log(`   3. ${shift3.tanggal.toDateString()} - ${nurse.namaDepan} - GAWAT_DARURAT - MALAM`);
    console.log('');
    console.log('✅ Sample data created successfully!');
    console.log('🔧 You can now test the shift restrictions system with real data.');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addSampleDataWithShift()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
