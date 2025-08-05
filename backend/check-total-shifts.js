const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTotalShifts() {
  try {
    // Total shifts in database
    const totalShifts = await prisma.shift.count();
    console.log('Total shifts in database:', totalShifts);

    // Active users count
    const activeUsers = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        role: { in: ['DOKTER', 'PERAWAT', 'STAF', 'SUPERVISOR'] }
      }
    });
    console.log('Active healthcare users:', activeUsers);

    // Current month shifts
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthShifts = await prisma.shift.count({
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });
    console.log('Current month shifts:', currentMonthShifts);

    // Shifts per user this month
    const shiftsPerUser = await prisma.shift.groupBy({
      by: ['userId'],
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    console.log('Shifts per user this month:');
    for (const userShifts of shiftsPerUser) {
      const user = await prisma.user.findUnique({
        where: { id: userShifts.userId },
        select: { namaDepan: true, namaBelakang: true, role: true }
      });
      console.log(`- ${user?.namaDepan} ${user?.namaBelakang} (${user?.role}): ${userShifts._count.id} shifts`);
    }

    // Date range of shifts
    const oldestShift = await prisma.shift.findFirst({
      orderBy: { tanggal: 'asc' },
      select: { tanggal: true }
    });
    
    const newestShift = await prisma.shift.findFirst({
      orderBy: { tanggal: 'desc' },
      select: { tanggal: true }
    });

    console.log('Shift date range:', oldestShift?.tanggal, 'to', newestShift?.tanggal);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTotalShifts();
