const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testAllNotifications() {
  try {
    console.log('🧪 Testing All Notification Types to Telegram...\n');
    
    // Cari user Siti Perawat
    const siti = await prisma.user.findFirst({
      where: { namaDepan: 'Siti', namaBelakang: 'Perawat' },
      select: { id: true, namaDepan: true, namaBelakang: true, telegramChatId: true }
    });
    
    if (!siti) {
      console.log('❌ User Siti Perawat tidak ditemukan');
      return;
    }
    
    console.log('👤 Testing notifications for user:', siti);
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = siti.telegramChatId;
    
    // Test 1: Shift Baru Ditambahkan
    console.log('\n📅 Test 1: Shift Baru Ditambahkan');
    const shiftBaruMessage = `🆕 *SHIFT BARU DITAMBAHKAN*

Halo ${siti.namaDepan}!

Shift baru telah ditambahkan untuk Anda:

🕒 Shift: PAGI (08:00 - 16:00)
🏥 Lokasi: Ruang Perawatan VIP
📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}

Silakan cek jadwal Anda untuk detail lengkap.

🏥 RSUD Anugerah Tomohon`;
    
    await sendTelegramMessage(botToken, chatId, shiftBaruMessage);
    
    // Test 2: Konfirmasi Tukar Shift
    console.log('\n🔄 Test 2: Konfirmasi Tukar Shift');
    const tukarShiftMessage = `🔄 *KONFIRMASI TUKAR SHIFT*

Halo ${siti.namaDepan}!

Permintaan tukar shift Anda telah DISETUJUI:

📅 Shift asal: ${new Date().toLocaleDateString('id-ID')}
🕒 Waktu: 08:00 - 16:00
👤 Ditukar dengan: Ahmad Dokter

Shift berhasil ditukar! Silakan cek jadwal terbaru Anda.

🏥 RSUD Anugerah Tomohon`;
    
    await sendTelegramMessage(botToken, chatId, tukarShiftMessage);
    
    // Test 3: Reminder Absensi
    console.log('\n📍 Test 3: Reminder Absensi');
    const reminderAbsensiMessage = `📍 *REMINDER ABSENSI*

Halo ${siti.namaDepan}!

Jangan lupa untuk melakukan absensi:

🕒 Shift: 08:00 - 16:00
📍 Lokasi: Ruang Perawatan VIP
⏰ Waktu reminder: 30 menit sebelum shift

Harap lakukan absensi tepat waktu.

🏥 RSUD Anugerah Tomohon`;
    
    await sendTelegramMessage(botToken, chatId, reminderAbsensiMessage);
    
    // Test 4: Absensi Terlambat
    console.log('\n⚠️ Test 4: Absensi Terlambat');
    const terlambatMessage = `⚠️ *ABSENSI TERLAMBAT*

Halo ${siti.namaDepan}!

Absensi Anda terlambat:

📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}
🕒 Jam masuk: 08:25
⏰ Seharusnya: 08:00
⏱️ Terlambat: 25 menit

Harap lebih tepat waktu di masa mendatang.

🏥 RSUD Anugerah Tomohon`;
    
    await sendTelegramMessage(botToken, chatId, terlambatMessage);
    
    // Test 5: Shift Reminder (yang sudah ada)
    console.log('\n🕒 Test 5: Shift Reminder');
    const shiftReminderMessage = `🕒 *PENGINGAT SHIFT*

Halo ${siti.namaDepan}!

Anda akan mulai shift:

🕒 PAGI: 08:00 - 16:00
🏥 Lokasi: Ruang Perawatan VIP
📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}

Silakan bersiap tepat waktu 🙏

🏥 RSUD Anugerah Tomohon`;
    
    await sendTelegramMessage(botToken, chatId, shiftReminderMessage);
    
    console.log('\n✅ Semua test notifikasi berhasil dikirim!');
    console.log('📱 Silakan cek Telegram untuk melihat semua notifikasi.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function sendTelegramMessage(botToken, chatId, message) {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    if (response.data.ok) {
      console.log('✅ Notification sent successfully');
    } else {
      console.log('❌ Failed to send notification:', response.data.description);
    }
    
    // Delay untuk menghindari rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('❌ Telegram error:', error.message);
  }
}

testAllNotifications();
