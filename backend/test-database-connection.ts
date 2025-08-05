import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Check users
    const userCount = await prisma.user.count();
    console.log(`✅ Users found: ${userCount}`);
    
    // Test 2: Check active users
    const activeUsers = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      take: 3
    });
    console.log(`✅ Active users: ${activeUsers.length}`);
    activeUsers.forEach(user => {
      console.log(`   - ${user.namaDepan} ${user.namaBelakang} (${user.role})`);
    });
    
    // Test 3: Check shifts
    const shiftCount = await prisma.shift.count();
    console.log(`✅ Shifts found: ${shiftCount}`);
    
    // Test 4: Test the specific query from the service
    console.log('🔍 Testing service query...');
    const usersWithShifts = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      },
      take: 2
    });
    
    console.log(`✅ Users with shifts query successful: ${usersWithShifts.length} users`);
    usersWithShifts.forEach(user => {
      console.log(`   - ${user.namaDepan} has ${user.shifts.length} shifts`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
