const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testCreateShiftWithNotification() {
  try {
    console.log('🧪 Testing Create Shift with Notification...\n');
    
    // Cari user Siti Perawat
    const siti = await prisma.user.findFirst({
      where: { namaDepan: 'Siti', namaBelakang: 'Perawat' },
      select: { id: true, namaDepan: true, namaBelakang: true, telegramChatId: true, username: true }
    });
    
    if (!siti) {
      console.log('❌ User Siti Perawat tidak ditemukan');
      return;
    }
    
    console.log('👤 Target user:', siti);
    
    // Buat shift untuk besok
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const shiftData = {
      tanggal: tomorrow.toISOString().split('T')[0], // Format: YYYY-MM-DD
      jammulai: '08:00',
      jamselesai: '16:00',
      lokasishift: 'Ruang Perawatan VIP',
      tipeshift: 'PAGI',
      userId: siti.id
    };
    
    console.log('📅 Data shift yang akan dibuat:', shiftData);
    
    // Buat shift langsung melalui Prisma (simulasi create dari API)
    const shift = await prisma.shift.create({
      data: {
        tanggal: new Date(shiftData.tanggal),
        jammulai: new Date(`${shiftData.tanggal}T${shiftData.jammulai}:00`),
        jamselesai: new Date(`${shiftData.tanggal}T${shiftData.jamselesai}:00`),
        lokasishift: shiftData.lokasishift,
        tipeshift: shiftData.tipeshift,
        userId: shiftData.userId
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
      jammulai: shift.jammulai.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}),
      jamselesai: shift.jamselesai.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}),
      lokasishift: shift.lokasishift,
      tipeshift: shift.tipeshift,
      user: shift.user.namaDepan + ' ' + shift.user.namaBelakang
    });
    
    // Simulasi notifikasi yang akan dikirim (seperti di shift.service.ts)
    if (shift.user.telegramChatId) {
      console.log('\n📱 Mengirim notifikasi shift baru ke Telegram...');
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = shift.user.telegramChatId;
      
      const notificationMessage = `🆕 *SHIFT BARU DITAMBAHKAN*

Halo ${shift.user.namaDepan}!

Shift baru telah ditambahkan untuk Anda:

🕒 ${shift.tipeshift}: ${shift.jammulai.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})} - ${shift.jamselesai.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
🏥 Lokasi: ${shift.lokasishift}
📅 Tanggal: ${shift.tanggal.toLocaleDateString('id-ID')}

Silakan cek jadwal Anda untuk detail lengkap.

🏥 RSUD Anugerah Tomohon`;
      
      try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: chatId,
          text: notificationMessage,
          parse_mode: 'Markdown'
        });
        
        if (response.data.ok) {
          console.log('✅ Notifikasi Telegram berhasil dikirim!');
          console.log('📨 Message ID:', response.data.result.message_id);
        } else {
          console.log('❌ Gagal mengirim notifikasi:', response.data.description);
        }
      } catch (error) {
        console.error('❌ Error Telegram:', error.response?.data || error.message);
      }
      
      // Buat notifikasi di database
      await prisma.notifikasi.create({
        data: {
          userId: shift.userId,
          judul: '📅 Shift Baru Ditambahkan',
          pesan: `Shift baru telah ditambahkan untuk Anda pada ${shift.tanggal.toLocaleDateString('id-ID')} dari ${shift.jammulai.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})} - ${shift.jamselesai.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})} di ${shift.lokasishift}`,
          jenis: 'SHIFT_BARU_DITAMBAHKAN',
          status: 'UNREAD',
          sentVia: 'BOTH',
          data: {
            shiftId: shift.id,
            tanggal: shift.tanggal,
            jammulai: shift.jammulai,
            jamselesai: shift.jamselesai,
            lokasishift: shift.lokasishift,
            tipeshift: shift.tipeshift,
          }
        }
      });
      
      console.log('✅ Notifikasi database berhasil dibuat!');
    } else {
      console.log('❌ User tidak memiliki Telegram Chat ID');
    }
    
    console.log('\n🎉 Test selesai! Silakan cek Telegram untuk melihat notifikasi.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateShiftWithNotification();
