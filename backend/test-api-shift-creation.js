const axios = require('axios');

async function testCreateShiftViaAPI() {
  try {
    console.log('🧪 Testing Create Shift via API Endpoint...\n');
    
    // Data shift yang akan dibuat
    const shiftData = {
      tanggal: '2025-07-16', // Lusa
      jammulai: '14:00',
      jamselesai: '22:00',
      lokasishift: 'Ruang IGD',
      tipeshift: 'SORE',
      idpegawai: 'per004' // username Siti Perawat
    };
    
    console.log('📅 Data shift yang akan dikirim ke API:', shiftData);
    
    // Kirim request ke API endpoint
    const response = await axios.post('http://localhost:3001/shifts', shiftData, {
      headers: {
        'Content-Type': 'application/json',
        // Dalam implementasi nyata, akan ada Authorization header dengan JWT token
        // 'Authorization': 'Bearer <jwt_token>'
      }
    });
    
    if (response.status === 201) {
      console.log('✅ Shift berhasil dibuat via API!');
      console.log('📊 Response:', response.data);
      
      console.log('\n📱 Cek Telegram untuk melihat notifikasi yang dikirim secara otomatis.');
      console.log('⏰ Sistem akan mengirim notifikasi:');
      console.log('   - Shift baru ditambahkan (segera)');
      console.log('   - Reminder absensi (30 menit sebelum shift)');
      console.log('   - Reminder shift (1 jam sebelum shift)');
      
    } else {
      console.log('❌ Gagal membuat shift:', response.status);
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server tidak berjalan. Jalankan: npm run start:dev');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testCreateShiftViaAPI();
