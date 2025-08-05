const axios = require('axios');

async function testCreateShiftWithAuth() {
  try {
    console.log('🧪 Testing Create Shift with Authentication...\n');
    
    // Step 1: Login untuk mendapatkan JWT token
    console.log('🔐 Step 1: Login untuk mendapatkan JWT token...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@rsud.id',
      password: 'password123'
    });
    
    if (loginResponse.status === 201 || loginResponse.status === 200) {
      const { access_token } = loginResponse.data;
      console.log('✅ Login berhasil, token diperoleh');
      
      // Step 2: Buat shift dengan token
      console.log('\n📅 Step 2: Membuat shift baru...');
      
      const shiftData = {
        tanggal: '2025-07-16', // Lusa
        jammulai: '14:00',
        jamselesai: '22:00',
        lokasishift: 'Ruang IGD',
        tipeshift: 'SORE',
        idpegawai: 'per004' // username Siti Perawat
      };
      
      console.log('📊 Data shift:', shiftData);
      
      const shiftResponse = await axios.post('http://localhost:3001/shifts', shiftData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      if (shiftResponse.status === 201) {
        console.log('✅ Shift berhasil dibuat via API!');
        console.log('📊 Response:', shiftResponse.data);
        
        console.log('\n🎉 Success! Sekarang cek:');
        console.log('📱 1. Telegram Siti Perawat untuk notifikasi "Shift Baru Ditambahkan"');
        console.log('💾 2. Database untuk record notifikasi');
        console.log('⏰ 3. Sistem akan mengirim reminder otomatis sesuai jadwal');
        
        // Tampilkan jadwal reminder yang akan datang
        const shiftDate = new Date(shiftData.tanggal);
        const shiftTime = new Date(`${shiftData.tanggal}T${shiftData.jammulai}:00`);
        const reminderAbsensi = new Date(shiftTime.getTime() - 30 * 60 * 1000); // 30 menit sebelum
        const reminderShift = new Date(shiftTime.getTime() - 60 * 60 * 1000); // 1 jam sebelum
        
        console.log('\n⏰ Jadwal reminder otomatis:');
        console.log(`   - Reminder Absensi: ${reminderAbsensi.toLocaleString('id-ID')}`);
        console.log(`   - Reminder Shift: ${reminderShift.toLocaleString('id-ID')}`);
        
      } else {
        console.log('❌ Gagal membuat shift:', shiftResponse.status);
      }
      
    } else {
      console.log('❌ Login gagal:', loginResponse.status);
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testCreateShiftWithAuth();
