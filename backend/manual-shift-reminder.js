const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function manualShiftReminderCheck() {
  try {
    console.log('🔍 Memeriksa shift yang akan datang untuk mengirim pengingat...');
    
    // Dapatkan semua shift untuk hari ini
    const today = new Date();
    const todayStart = new Date(today.toDateString());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const allShiftsToday = await prisma.shift.findMany({
      where: {
        tanggal: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            telegramChatId: true,
          },
        },
      },
    });
    
    console.log(`📋 Ditemukan ${allShiftsToday.length} shift hari ini`);
    
    // Filter shift yang dimulai dalam satu jam ke depan (dengan toleransi 15 menit)
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    const upcomingShifts = allShiftsToday.filter(shift => {
      const shiftStart = new Date(shift.jammulai);
      const shiftTimeInMinutes = shiftStart.getHours() * 60 + shiftStart.getMinutes();
      const targetTimeInMinutes = oneHourFromNow.getHours() * 60 + oneHourFromNow.getMinutes();
      const timeDiff = Math.abs(shiftTimeInMinutes - targetTimeInMinutes);
      
      console.log(`⏰ Shift ${shift.id}: ${shift.jammulai.toLocaleString()} - Target: ${oneHourFromNow.toLocaleString()} - Selisih: ${timeDiff} menit`);
      
      return timeDiff <= 15;
    });
    
    console.log(`🎯 Ditemukan ${upcomingShifts.length} shift yang akan datang (dalam 1 jam)`);
    
    for (const shift of upcomingShifts) {
      console.log(`\\n📅 Memproses shift untuk ${shift.user.namaDepan} ${shift.user.namaBelakang}`);
      
      // Periksa apakah pengingat sudah dikirim hari ini
      const existingReminder = await prisma.notifikasi.findFirst({
        where: {
          userId: shift.userId,
          jenis: 'REMINDER_SHIFT',
          createdAt: {
            gte: todayStart,
          },
          data: {
            path: ['shiftId'],
            equals: shift.id,
          },
        },
      });
      
      if (existingReminder) {
        console.log('⏭️  Pengingat sudah dikirim untuk shift ini');
        continue;
      }
      
      // Kirim notifikasi Telegram jika pengguna memiliki chatId
      if (shift.user.telegramChatId) {
        console.log('📱 Mengirim pengingat Telegram...');
        
        const message = `🏥 *REMINDER SHIFT - RSUD ANUGERAH*

Halo ${shift.user.namaDepan}!

⏰ Shift Anda akan dimulai dalam 1 jam:
📅 Tanggal: ${shift.tanggal.toLocaleDateString('id-ID')}
🕐 Waktu: ${shift.jammulai.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})} - ${shift.jamselesai.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
📍 Lokasi: ${shift.lokasishift}

Harap bersiap dan datang tepat waktu.

🏥 RSUD Anugerah Tomohon`;
        
        try {
          const response = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: shift.user.telegramChatId,
            text: message,
            parse_mode: 'Markdown'
          });
          
          if (response.data.ok) {
            console.log('✅ Pengingat Telegram berhasil dikirim');
          } else {
            console.log('❌ Gagal mengirim pengingat Telegram:', response.data.description);
          }
        } catch (error) {
          console.error('❌ Kesalahan Telegram:', error.message);
        }
      }
      
      // Buat catatan notifikasi
      await prisma.notifikasi.create({
        data: {
          userId: shift.userId,
          jenis: 'REMINDER_SHIFT',
          judul: 'Pengingat Shift',
          pesan: `Shift Anda akan dimulai dalam 1 jam di ${shift.lokasishift}`,
          status: 'UNREAD',
          data: {
            shiftId: shift.id,
            tanggal: shift.tanggal.toISOString(),
            jammulai: shift.jammulai.toISOString(),
            jamselesai: shift.jamselesai.toISOString(),
            lokasishift: shift.lokasishift,
          },
        },
      });
      
      console.log(`✅ Pengingat dikirim ke ${shift.user.namaDepan} ${shift.user.namaBelakang}`);
    }
    
    console.log(`\\n🎉 Diproses ${upcomingShifts.length} shift yang akan datang`);
    
  } catch (error) {
    console.error('❌ Kesalahan dalam pengecekan pengingat shift:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualShiftReminderCheck();
