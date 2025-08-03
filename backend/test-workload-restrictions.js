const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testWorkloadRestrictions() {
  try {
    console.log('🔍 Testing workload restrictions...\n');

    // Find a user with high workload (40+ shifts)
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const userWithHighWorkload = await prisma.user.findFirst({
      where: {
        role: { in: ['DOKTER', 'PERAWAT', 'STAF', 'SUPERVISOR'] },
        status: 'ACTIVE'
      },
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }
      }
    });

    if (!userWithHighWorkload) {
      console.log('❌ No users found');
      return;
    }

    const shiftsThisMonth = userWithHighWorkload.shifts.length;
    console.log(`👤 Testing with user: ${userWithHighWorkload.namaDepan} ${userWithHighWorkload.namaBelakang}`);
    console.log(`📊 Current shifts this month: ${shiftsThisMonth}`);
    console.log(`🎯 Max shifts allowed: ${userWithHighWorkload.maxShiftsPerMonth || 20}`);
    console.log(`📈 Workload status: ${userWithHighWorkload.workloadStatus || 'NORMAL'}\n`);

    // Check if user has reached limit
    const maxShifts = userWithHighWorkload.maxShiftsPerMonth || 20;
    if (shiftsThisMonth >= maxShifts) {
      console.log('🚫 User has reached maximum workload limit!');
      console.log('✅ Workload restrictions should prevent manual shift creation');
      console.log('⚠️  User should only be able to create shifts via Overwork Request');
    } else if (shiftsThisMonth >= maxShifts * 0.9) {
      console.log('⚠️  User is approaching workload limit (90%+)');
      console.log('🔶 Should show warning when creating shifts');
    } else {
      console.log('✅ User can still accept normal shifts');
    }

    // Check weekly workload
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Saturday

    const weeklyShifts = await prisma.shift.count({
      where: {
        userId: userWithHighWorkload.id,
        tanggal: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    });

    console.log(`\n📅 Weekly workload check:`);
    console.log(`📊 Shifts this week: ${weeklyShifts}/6`);
    
    if (weeklyShifts >= 6) {
      console.log('🚫 User has reached weekly limit (6 shifts)');
    } else if (weeklyShifts >= 5) {
      console.log('⚠️  User is approaching weekly limit');
    } else {
      console.log('✅ User can still take more shifts this week');
    }

    // Check today's shifts
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayShifts = await prisma.shift.count({
      where: {
        userId: userWithHighWorkload.id,
        tanggal: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    console.log(`\n🗓️  Daily workload check:`);
    console.log(`📊 Shifts today: ${todayShifts}`);
    
    if (todayShifts >= 2) {
      console.log('🚫 User already has multiple shifts today');
    } else if (todayShifts >= 1) {
      console.log('📋 User has one shift today');
    } else {
      console.log('✅ User has no shifts today');
    }

    // Summary
    console.log(`\n📋 WORKLOAD RESTRICTION SUMMARY:`);
    console.log(`▪️  Monthly: ${shiftsThisMonth}/${maxShifts} (${Math.round((shiftsThisMonth/maxShifts)*100)}%)`);
    console.log(`▪️  Weekly: ${weeklyShifts}/6`);
    console.log(`▪️  Daily: ${todayShifts}`);
    
    const isOverloaded = shiftsThisMonth >= maxShifts;
    const isApproachingLimit = shiftsThisMonth >= maxShifts * 0.9;
    
    if (isOverloaded) {
      console.log(`🔴 STATUS: OVERLOADED - Requires Overwork Request`);
    } else if (isApproachingLimit) {
      console.log(`🟡 STATUS: APPROACHING LIMIT - Show warnings`);
    } else {
      console.log(`🟢 STATUS: NORMAL - Can accept shifts normally`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWorkloadRestrictions();
