// Simple test for event creation and notification
const API_BASE = 'http://localhost:3001';

async function testEventNotification() {
  console.log('🧪 Testing Event Notification System');
  
  try {
    // 1. Login
    console.log('🔐 Logging in...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.access_token;
    console.log('✅ Login successful');
    
    // 2. Get current notifications count
    console.log('📊 Getting current notifications...');
    const notifBeforeRes = await fetch(`${API_BASE}/notifikasi`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const notifsBefore = await notifBeforeRes.json();
    const countBefore = Array.isArray(notifsBefore) ? notifsBefore.length : 0;
    console.log(`Current notifications: ${countBefore}`);
    
    // 3. Create event
    console.log('📅 Creating test event...');
    const eventData = {
      nama: 'Test Event - Notification Test',
      deskripsi: 'Testing notification system',
      lokasi: 'Test Room',
      penanggungJawab: 'Test Admin',
      jenisKegiatan: 'RAPAT',
      tanggalMulai: '2025-06-24T09:00:00.000Z',
      waktuMulai: '09:00',
      status: 'DIRENCANAKAN'
    };
    
    const eventRes = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });
    
    if (!eventRes.ok) {
      const errorText = await eventRes.text();
      throw new Error(`Event creation failed: ${eventRes.status} - ${errorText}`);
    }
    
    const eventResult = await eventRes.json();
    console.log(`✅ Event created with ID: ${eventResult.id}`);
    
    // 4. Wait and check notifications
    console.log('⏳ Waiting 3 seconds for notifications...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🔔 Checking for new notifications...');
    const notifAfterRes = await fetch(`${API_BASE}/notifikasi`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const notifsAfter = await notifAfterRes.json();
    const countAfter = Array.isArray(notifsAfter) ? notifsAfter.length : 0;
    
    console.log(`Notifications after: ${countAfter}`);
    
    if (countAfter > countBefore) {
      console.log('✅ SUCCESS: New notifications were created!');
      console.log(`New notifications: ${countAfter - countBefore}`);
      
      // Show recent notifications
      const recentNotifs = notifsAfter.slice(-3);
      console.log('Recent notifications:');
      recentNotifs.forEach((notif, i) => {
        console.log(`  ${i+1}. ${notif.judul}: ${notif.pesan}`);
      });
    } else {
      console.log('❌ FAILURE: No new notifications were created');
      console.log('The notification system might not be working properly');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.log('\nPossible issues:');
    console.log('- Backend server not running');
    console.log('- Database connection issues');
    console.log('- Authentication problems');
    console.log('- Internal server errors');
  }
}

// Run the test
testEventNotification();
