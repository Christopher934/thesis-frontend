// Script untuk membuat test user dan data shifts
console.log('🚀 Creating test data for backend...');

const createTestData = async () => {
  try {
    // 1. Buat test user terlebih dahulu
    console.log('📝 Creating test user...');
    
    const createUserResponse = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'testuser@rsud.com',
        password: 'password123',
        namaDepan: 'Test',
        namaBelakang: 'User',
        role: 'perawat',
        idpegawai: 'TEST001'
      })
    });

    if (createUserResponse.ok) {
      const userData = await createUserResponse.json();
      console.log('✅ Test user created:', userData);
    } else {
      const errorText = await createUserResponse.text();
      console.log('⚠️ User creation response:', createUserResponse.status, errorText);
      
      // User mungkin sudah ada, coba login
      console.log('🔑 Trying to login with existing user...');
    }

    // 2. Login untuk mendapatkan token
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'testuser@rsud.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    const token = loginData.token;
    const userId = loginData.user?.id;

    // 3. Buat beberapa test shifts
    console.log('📅 Creating test shifts...');
    
    const testShifts = [
      {
        idpegawai: 'TEST001',
        userId: userId,
        tipeshift: 'PAGI',
        tanggal: '2025-07-14', // Besok
        lokasishift: 'RAWAT_INAP_3_SHIFT',
        jammulai: '07:00',
        jamselesai: '15:00'
      },
      {
        idpegawai: 'TEST001',
        userId: userId,
        tipeshift: 'SIANG',
        tanggal: '2025-07-15',
        lokasishift: 'UGD',
        jammulai: '14:00',
        jamselesai: '22:00'
      },
      {
        idpegawai: 'TEST001',
        userId: userId,
        tipeshift: 'MALAM',
        tanggal: '2025-07-16',
        lokasishift: 'ICU',
        jammulai: '22:00',
        jamselesai: '07:00'
      }
    ];

    for (const shift of testShifts) {
      const createShiftResponse = await fetch('http://localhost:3001/shifts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shift)
      });

      if (createShiftResponse.ok) {
        const shiftData = await createShiftResponse.json();
        console.log('✅ Shift created:', shiftData.tanggal, shiftData.tipeshift);
      } else {
        const errorText = await createShiftResponse.text();
        console.log('❌ Shift creation failed:', errorText);
      }
    }

    // 4. Verify data
    console.log('🔍 Verifying created data...');
    const shiftsResponse = await fetch('http://localhost:3001/shifts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (shiftsResponse.ok) {
      const allShifts = await shiftsResponse.json();
      console.log('✅ Total shifts in database:', allShifts.length);
      console.log('📊 Sample shift:', allShifts[0]);
    }

    console.log('\n🎉 Test data creation completed!');
    console.log('🔗 You can now login with:');
    console.log('   Email: testuser@rsud.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
};

createTestData();
