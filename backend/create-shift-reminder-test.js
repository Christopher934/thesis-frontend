const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createShiftInOneHour() {
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
    
    // Buat shift yang akan dimulai dalam 1 jam dari sekarang
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // +1 jam
    
    const shiftDate = new Date(oneHourLater);
    shiftDate.setHours(0, 0, 0, 0); // Reset ke awal hari
    
    const shiftStart = new Date(oneHourLater);
    const shiftEnd = new Date(oneHourLater.getTime() + 8 * 60 * 60 * 1000); // +8 jam
    
    const shift = await prisma.shift.create({
      data: {
        tanggal: shiftDate,
        jammulai: shiftStart,
        jamselesai: shiftEnd,
        lokasishift: 'Ruang Perawatan',
        tipeshift: 'TEST_REMINDER',
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
    
    console.log('✅ Shift untuk test reminder berhasil dibuat:', {
      id: shift.id,
      tanggal: shift.tanggal.toISOString().split('T')[0],
      jammulai: shift.jammulai.toLocaleString('id-ID'),
      jamselesai: shift.jamselesai.toLocaleString('id-ID'),
      lokasishift: shift.lokasishift,
      user: shift.user.namaDepan + ' ' + shift.user.namaBelakang,
      telegramChatId: shift.user.telegramChatId
    });
    
    console.log('⏰ Shift akan dimulai dalam 1 jam. Cron job akan mengirim reminder dalam 15 menit.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createShiftInOneHour();
