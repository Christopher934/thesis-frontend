const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function manualShiftReminderCheck() {
  try {
    console.log('🔍 Checking for upcoming shifts to send reminders...');
    
    // Get all shifts for today
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
    
    console.log(`📋 Found ${allShiftsToday.length} shifts today`);
    
    // Filter shifts that start within the next hour (with 15 minute tolerance)
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    const upcomingShifts = allShiftsToday.filter(shift => {
      const shiftStart = new Date(shift.jammulai);
      const shiftTimeInMinutes = shiftStart.getHours() * 60 + shiftStart.getMinutes();
      const targetTimeInMinutes = oneHourFromNow.getHours() * 60 + oneHourFromNow.getMinutes();
      const timeDiff = Math.abs(shiftTimeInMinutes - targetTimeInMinutes);
      
      console.log(`⏰ Shift ${shift.id}: ${shift.jammulai.toLocaleString()} - Target: ${oneHourFromNow.toLocaleString()} - Diff: ${timeDiff} minutes`);
      
      return timeDiff <= 15;
    });
    
    console.log(`🎯 Found ${upcomingShifts.length} upcoming shifts (within 1 hour)`);
    
    for (const shift of upcomingShifts) {
      console.log(`\\n📅 Processing shift for ${shift.user.namaDepan} ${shift.user.namaBelakang}`);
      
      // Check if reminder already sent today
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
        console.log('⏭️  Reminder already sent for this shift');
        continue;
      }
      
      // Send Telegram notification if user has chatId
      if (shift.user.telegramChatId) {
        console.log('📱 Sending Telegram reminder...');
        
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
            console.log('✅ Telegram reminder sent successfully');
          } else {
            console.log('❌ Failed to send Telegram reminder:', response.data.description);
          }
        } catch (error) {
          console.error('❌ Telegram error:', error.message);
        }
      }
      
      // Create notification record
      await prisma.notifikasi.create({
        data: {
          userId: shift.userId,
          jenis: 'REMINDER_SHIFT',
          judul: 'Reminder Shift',
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
      
      console.log(`✅ Reminder sent to ${shift.user.namaDepan} ${shift.user.namaBelakang}`);
    }
    
    console.log(`\\n🎉 Processed ${upcomingShifts.length} upcoming shifts`);
    
  } catch (error) {
    console.error('❌ Error in shift reminder check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualShiftReminderCheck();
