const { PrismaClient } = require('@prisma/client');
const { TelegramService } = require('./src/notifikasi/telegram.service');
const { NotifikasiService } = require('./src/notifikasi/notifikasi.service');
const { ConfigService } = require('@nestjs/config');
const prisma = new PrismaClient();

async function testTelegramNotification() {
  try {
    // Setup services
    const configService = new ConfigService();
    const telegramService = new TelegramService(configService);
    const notifikasiService = new NotifikasiService(prisma, telegramService);
    
    // Cari user Siti Perawat
    const siti = await prisma.user.findFirst({
      where: { namaDepan: 'Siti', namaBelakang: 'Perawat' },
      select: { id: true, namaDepan: true, namaBelakang: true, telegramChatId: true }
    });
    
    if (!siti) {
      console.log('❌ User Siti Perawat tidak ditemukan');
      return;
    }
    
    console.log('👤 Testing notification for user:', siti);
    
    // Test 1: Kirim notifikasi shift reminder
    console.log('\n📅 Test 1: Shift Reminder Notification');
    try {
      await notifikasiService.createShiftReminderNotification(siti.id, {
        id: 17,
        tanggal: new Date('2025-07-15'),
        jammulai: new Date('2025-07-15T07:00:00'),
        jamselesai: new Date('2025-07-15T15:00:00'),
        lokasishift: 'Ruang Perawatan'
      });
      console.log('✅ Shift reminder notification berhasil dikirim');
    } catch (error) {
      console.error('❌ Error shift reminder:', error.message);
    }
    
    // Test 2: Kirim notifikasi test langsung ke Telegram
    console.log('\n📱 Test 2: Direct Telegram Message');
    try {
      const result = await telegramService.sendMessage({
        chatId: siti.telegramChatId,
        message: `🔔 *TEST NOTIFIKASI*\n\nHalo ${siti.namaDepan}!\n\nIni adalah test notifikasi untuk memastikan bot Telegram bekerja dengan baik.\n\n⏰ Waktu: ${new Date().toLocaleString('id-ID')}\n\n🏥 RSUD Anugerah Tomohon`,
        parseMode: 'Markdown'
      });
      
      if (result) {
        console.log('✅ Direct Telegram message berhasil dikirim');
      } else {
        console.log('❌ Direct Telegram message gagal dikirim');
      }
    } catch (error) {
      console.error('❌ Error direct telegram:', error.message);
    }
    
    // Test 3: Cek environment variable
    console.log('\n🔧 Test 3: Environment Check');
    console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTelegramNotification();
