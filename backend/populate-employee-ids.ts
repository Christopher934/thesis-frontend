// Script untuk populate employeeId untuk user yang belum memilikinya
// File: populate-employee-ids.ts

import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function populateEmployeeIds() {
  console.log('🔄 Starting to populate missing employeeIds...');

  try {
    // 1. Check if there are any users without employeeId (should be none after reset)
    const usersWithoutEmployeeId = await prisma.user.findMany({
      where: {
        employeeId: { equals: '' }
      },
      select: {
        id: true,
        username: true,
        namaDepan: true,
        namaBelakang: true,
        role: true
      }
    });

    console.log(`📊 Found ${usersWithoutEmployeeId.length} users without employeeId`);

    if (usersWithoutEmployeeId.length === 0) {
      console.log('✅ All users already have employeeId');
      return;
    }

    // 2. Generate employeeId berdasarkan role dan id
    const updates = usersWithoutEmployeeId.map(user => {
      let prefix = '';
      switch (user.role) {
        case Role.ADMIN:
          prefix = 'ADM';
          break;
        case Role.DOKTER:
          prefix = 'DOK';
          break;
        case Role.PERAWAT:
          prefix = 'PER';
          break;
        case Role.STAF:
          prefix = 'STF';
          break;
        case Role.SUPERVISOR:
          prefix = 'SUP';
          break;
        default:
          prefix = 'PEG';
      }

      const paddedId = user.id.toString().padStart(3, '0');
      const employeeId = `${prefix}${paddedId}`;

      return {
        userId: user.id,
        employeeId,
        username: user.username,
        fullName: `${user.namaDepan} ${user.namaBelakang}`,
        role: user.role
      };
    });

    console.log('📋 Generated employee IDs:');
    updates.forEach(update => {
      console.log(`   ${update.employeeId} - ${update.fullName} (${update.role})`);
    });

    // 3. Update users dengan employeeId baru
    for (const update of updates) {
      await prisma.user.update({
        where: { id: update.userId },
        data: { employeeId: update.employeeId }
      });
      console.log(`✅ Updated user ${update.username} with employeeId: ${update.employeeId}`);
    }

    // 4. Verifikasi hasil - since employeeId is now required, count all users
    const totalUsers = await prisma.user.count();
    const usersWithEmployeeId = await prisma.user.count({
      where: {
        employeeId: {
          not: ''
        }
      }
    });

    console.log('\n📈 Results:');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with employeeId: ${usersWithEmployeeId}`);
    console.log(`   Success rate: ${((usersWithEmployeeId / totalUsers) * 100).toFixed(1)}%`);

    // 5. Show all employee IDs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        username: true,
        namaDepan: true,
        namaBelakang: true,
        role: true
      },
      orderBy: {
        employeeId: 'asc'
      }
    });

    console.log('\n📋 All Employee IDs:');
    console.log('ID  | Employee ID | Name                  | Username   | Role');
    console.log('----|-------------|----------------------|------------|----------');
    allUsers.forEach(user => {
      const name = `${user.namaDepan} ${user.namaBelakang}`.padEnd(20);
      const username = user.username.padEnd(10);
      console.log(`${user.id.toString().padStart(3)} | ${user.employeeId?.padEnd(11)} | ${name} | ${username} | ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error populating employeeIds:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 6. Function untuk check existing shifts dan fix references
async function checkShiftReferences() {
  console.log('\n🔍 Checking shift references...');
  
  const shiftsWithUserInfo = await prisma.shift.findMany({
    include: {
      user: {
        select: {
          id: true,
          employeeId: true,
          username: true,
          namaDepan: true,
          namaBelakang: true
        }
      }
    },
    take: 10 // Show first 10 as sample
  });

  console.log('📊 Sample shift-user relationships:');
  console.log('Shift ID | User ID | Employee ID | User Name');
  console.log('---------|---------|-------------|----------');
  shiftsWithUserInfo.forEach(shift => {
    const userName = `${shift.user.namaDepan} ${shift.user.namaBelakang}`;
    console.log(`${shift.id.toString().padStart(8)} | ${shift.userId.toString().padStart(7)} | ${shift.user.employeeId?.padEnd(11)} | ${userName}`);
  });

  const totalShifts = await prisma.shift.count();
  console.log(`\n📈 Total shifts in database: ${totalShifts}`);
}

// Main execution
async function main() {
  console.log('🚀 EMPLOYEE ID POPULATION SCRIPT');
  console.log('================================\n');

  await populateEmployeeIds();
  await checkShiftReferences();

  console.log('\n✅ Script completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Verify employeeId uniqueness');
  console.log('   2. Update frontend components to use employeeId');
  console.log('   3. Test notification system with new IDs');
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { populateEmployeeIds, checkShiftReferences };