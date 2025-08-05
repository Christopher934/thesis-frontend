import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkShifts() {
  try {
    const shiftCount = await prisma.shift.count();
    console.log(`📊 Total shifts in database: ${shiftCount}`);
    
    if (shiftCount > 0) {
      const shifts = await prisma.shift.findMany({
        take: 5,
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`📋 Recent shifts:`);
      shifts.forEach((shift, index) => {
        console.log(`${index + 1}. ${shift.user?.namaDepan} ${shift.user?.namaBelakang} - ${shift.tanggal} (${shift.jammulai}-${shift.jamselesai}) at ${shift.lokasishift}`);
      });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkShifts();
