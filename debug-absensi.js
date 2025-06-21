#!/usr/bin/env node

import fetch from 'node-fetch';

async function testAbsensiClean() {
  console.log('🔄 Testing Absensi with Clean Environment...');
  
  try {
    // 1. Login
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login successful');
    
    // 2. Create shift for today
    const today = new Date().toISOString().split('T')[0];
    const shiftResponse = await fetch('http://localhost:3001/shifts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tanggal: today,
        jammulai: '08:00',
        jamselesai: '16:00',
        tipeshift: 'PAGI',
        lokasishift: 'RAWAT_JALAN',
        idpegawai: `CLEAN_TEST_${Date.now()}`,
        userId: 1
      })
    });
    
    if (!shiftResponse.ok) {
      console.log('❌ Shift creation failed:', await shiftResponse.text());
      return;
    }
    
    const shiftData = await shiftResponse.json();
    console.log('✅ Shift created:', shiftData.id);
    
    // 3. Try absensi with more detailed error handling
    const absensiResponse = await fetch('http://localhost:3001/absensi/masuk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        lokasi: 'RSUD Anugerah Tomohon',
        catatan: 'Test absen masuk - clean environment'
      })
    });
    
    console.log('📋 Absensi Response Status:', absensiResponse.status);
    const absensiResult = await absensiResponse.text();
    console.log('📋 Absensi Response:', absensiResult);
    
    if (absensiResponse.ok) {
      console.log('✅ Absensi successful!');
      const absensiData = JSON.parse(absensiResult);
      console.log('📝 Created Absensi ID:', absensiData.id);
    } else {
      console.log('❌ Absensi failed');
    }
    
    // 4. Cleanup
    await fetch(`http://localhost:3001/shifts/${shiftData.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('🧹 Cleanup completed');
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

testAbsensiClean();
