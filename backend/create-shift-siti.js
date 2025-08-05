const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createShiftForSiti() {
  try {
    // Cari user Siti Perawat
    const siti = await prisma.user.findFirst({
      where: { namaDepan: 'Siti', namaBelakang: 'Perawat' },
      select: { id: true, namaDepan: true, namaBelakang: true, telegramChatId: true }
    });
    
    if (!siti) {
      console.log('❌ User Siti Perawat tidak ditemukan');
      return;
    }
    
    console.log('👤 Found user:', siti);
    
    // Buat shift untuk besok (shift pagi)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const shiftStart = new Date(tomorrow);
    shiftStart.setHours(7, 0, 0, 0); // 07:00
    
    const shiftEnd = new Date(tomorrow);
    shiftEnd.setHours(15, 0, 0, 0); // 15:00
    
    const shift = await prisma.shift.create({
      data: {
        tanggal: tomorrow,
        jammulai: shiftStart,
        jamselesai: shiftEnd,
        lokasishift: 'Ruang Perawatan',
        tipeshift: 'PAGI',
        userId: siti.id
      },
      include: {
        user: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            telegramChatId: true
          }
        }
      }
    });
    
    console.log('✅ Shift berhasil dibuat:', {
      id: shift.id,
      tanggal: shift.tanggal.toISOString().split('T')[0],
      jammulai: shift.jammulai.toTimeString().slice(0, 5),
      jamselesai: shift.jamselesai.toTimeString().slice(0, 5),
      lokasishift: shift.lokasishift,
      user: shift.user.namaDepan + ' ' + shift.user.namaBelakang,
      telegramChatId: shift.user.telegramChatId
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createShiftForSiti();
