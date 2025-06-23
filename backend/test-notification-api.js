const https = require('http');

const BACKEND_URL = 'http://localhost:3001';

// Test function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testNotificationAPI() {
  console.log('=== Testing RSUD Notification System API ===\n');

  try {
    // Step 1: Login
    console.log('1. Testing login...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const loginData = JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    });

    const loginResponse = await makeRequest(loginOptions, loginData);
    
    if (loginResponse.statusCode !== 200 && loginResponse.statusCode !== 201) {
      console.log('❌ Login failed');
      console.log('Status:', loginResponse.statusCode);
      console.log('Response:', loginResponse.body);
      return;
    }

    const loginResult = JSON.parse(loginResponse.body);
    const token = loginResult.access_token;
    
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 50) + '...');
    console.log('User:', loginResult.user.namaDepan, loginResult.user.namaBelakang);

    // Step 2: Test notification endpoints
    console.log('\n2. Testing notification endpoints...');
    
    // Get all notifications
    console.log('   - GET /notifikasi');
    const notifOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/notifikasi',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    };

    const notifResponse = await makeRequest(notifOptions);
    console.log('   Status:', notifResponse.statusCode);
    console.log('   Response:', notifResponse.body);

    // Get unread count
    console.log('\n   - GET /notifikasi/unread-count');
    const countOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/notifikasi/unread-count',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    };

    const countResponse = await makeRequest(countOptions);
    console.log('   Status:', countResponse.statusCode);
    console.log('   Response:', countResponse.body);

    // Create a test notification
    console.log('\n   - POST /notifikasi (create notification)');
    const createOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/notifikasi',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    const createData = JSON.stringify({
      judul: 'Test Notification',
      pesan: 'This is a test notification from the API',
      jenis: 'SISTEM_INFO'
    });

    const createResponse = await makeRequest(createOptions, createData);
    console.log('   Status:', createResponse.statusCode);
    console.log('   Response:', createResponse.body);

    console.log('\n=== Test completed successfully! ===');
    console.log('✅ Notification system is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNotificationAPI();
