const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testTelegramNotification() {
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
    
    console.log('👤 Testing notification for user:', siti);
    
    // Cek environment variable
    console.log('🔧 Environment Check:');
    console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
    
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.log('❌ TELEGRAM_BOT_TOKEN tidak diset. Cek file .env');
      return;
    }
    
    // Test kirim pesan langsung
    console.log('\n📱 Testing Direct Telegram Message...');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = siti.telegramChatId;
    
    const message = `🔔 *TEST NOTIFIKASI SHIFT*

Halo ${siti.namaDepan}!

📅 Shift Anda besok:
⏰ Waktu: 07:00 - 15:00
📍 Lokasi: Ruang Perawatan
🏥 RSUD Anugerah Tomohon

Ini adalah test notifikasi untuk memastikan sistem bekerja dengan baik.

Waktu test: ${new Date().toLocaleString('id-ID')}`;
    
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    if (response.data.ok) {
      console.log('✅ Test notification berhasil dikirim ke Telegram!');
      console.log('📨 Message ID:', response.data.result.message_id);
    } else {
      console.log('❌ Test notification gagal:', response.data.description);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📛 Telegram API Error:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testTelegramNotification();
