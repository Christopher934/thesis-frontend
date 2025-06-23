#!/usr/bin/env node

/**
 * Test Event Notification System
 * Tests whether notifications are triggered when creating events
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

// Test user credentials (you may need to adjust these)
const TEST_CREDENTIALS = {
  email: 'admin@rsud.com',
  password: 'admin123',
};

async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    let responseData;
    
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }

    return {
      ok: response.ok,
      status: response.status,
      data: responseData,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { error: error.message },
    };
  }
}

async function login() {
  console.log('🔐 Logging in...');
  const result = await makeRequest('POST', '/auth/login', TEST_CREDENTIALS);
  
  if (result.ok && result.data.access_token) {
    console.log('✅ Login successful');
    return result.data.access_token;
  } else {
    console.log('❌ Login failed:', result.data);
    throw new Error('Login failed');
  }
}

async function createTestEvent(token) {
  console.log('\n📅 Creating test event...');
  
  const eventData = {
    nama: 'Test Event - Rapat Mingguan Auto',
    jenisKegiatan: 'RAPAT',
    deskripsi: 'Test event untuk mengecek sistem notifikasi',
    tanggalMulai: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    tanggalSelesai: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Tomorrow + 2 hours
    waktuMulai: '09:00',
    waktuSelesai: '11:00',
    lokasi: 'Ruang Rapat Utama',
    kapasitas: 20,
    penanggungJawab: 'Test Admin',
    kontak: '081234567890',
    departemen: 'IT',
    prioritas: 'TINGGI',
    targetPeserta: ['ADMIN', 'SUPERVISOR'],
    status: 'DIRENCANAKAN',
    catatan: 'Event test untuk notification system'
  };

  const result = await makeRequest('POST', '/events', eventData, token);
  
  if (result.ok) {
    console.log('✅ Event created successfully');
    console.log('Event ID:', result.data.id);
    return result.data;
  } else {
    console.log('❌ Event creation failed:', result.data);
    throw new Error('Event creation failed');
  }
}

async function checkNotifications(token) {
  console.log('\n🔔 Checking notifications...');
  
  // Wait a moment for notifications to be processed
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const result = await makeRequest('GET', '/notifikasi', null, token);
  
  if (result.ok && Array.isArray(result.data)) {
    console.log('✅ Notifications retrieved');
    
    // Filter recent notifications (last 1 minute)
    const recentNotifications = result.data.filter(notif => {
      const notifTime = new Date(notif.createdAt);
      const now = new Date();
      return (now - notifTime) < 60000; // 1 minute
    });
    
    if (recentNotifications.length > 0) {
      console.log(`✅ Found ${recentNotifications.length} recent notification(s):`);
      recentNotifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.judul}: ${notif.pesan}`);
        console.log(`     Type: ${notif.jenis}, Status: ${notif.status}`);
      });
      return true;
    } else {
      console.log('❌ No recent notifications found');
      console.log(`Total notifications: ${result.data.length}`);
      return false;
    }
  } else {
    console.log('❌ Failed to retrieve notifications:', result.data);
    return false;
  }
}

async function runTest() {
  try {
    console.log('🧪 Starting Event Notification Test\n');
    console.log('This test will:');
    console.log('1. Login as admin');
    console.log('2. Create a test event');
    console.log('3. Check if notifications were created');
    console.log('=====================================\n');

    // Step 1: Login
    const token = await login();
    
    // Step 2: Create event
    const event = await createTestEvent(token);
    
    // Step 3: Check notifications
    const notificationsFound = await checkNotifications(token);
    
    // Results
    console.log('\n📊 Test Results:');
    console.log('================');
    if (notificationsFound) {
      console.log('✅ SUCCESS: Event notification system is working!');
      console.log('   - Event was created successfully');
      console.log('   - Notifications were generated');
      console.log('   - Admins will receive notifications for new events');
    } else {
      console.log('❌ FAILURE: Event notification system is NOT working');
      console.log('   - Event was created successfully');
      console.log('   - But no notifications were generated');
      console.log('   - Need to check backend notification integration');
    }
    
    // Cleanup suggestion
    console.log('\n🧹 Cleanup:');
    console.log(`You may want to delete the test event (ID: ${event.id}) from the admin panel.`);
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Backend server is not running on port 3001');
    console.log('2. Database connection issues');
    console.log('3. Authentication credentials are incorrect');
    console.log('4. API endpoints have changed');
  }
}

runTest();
