#!/usr/bin/env node

const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testNotificationAPI() {
  console.log('🧪 Testing Notification API');
  console.log('=============================\n');
  
  // Test login first
  console.log('1. Testing login...');
  try {
    const loginResponse = await makeRequest('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }),
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.status, loginResponse.data);
      return;
    }

    console.log('✅ Login successful');
    const token = loginResponse.data.access_token;
    console.log('Token:', token.substring(0, 20) + '...');

    // Test get notifications
    console.log('\n2. Testing get notifications...');
    const notificationsResponse = await makeRequest('http://localhost:3001/notifikasi', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', notificationsResponse.status);
    console.log('Response:', JSON.stringify(notificationsResponse.data, null, 2));

    // Test create notification
    console.log('\n3. Testing create notification...');
    const createResponse = await makeRequest('http://localhost:3001/notifikasi', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 1,
        judul: 'Test Notification',
        pesan: 'This is a test notification',
        jenis: 'SISTEM_INFO'
      }),
    });

    console.log('Create Status:', createResponse.status);
    console.log('Create Response:', JSON.stringify(createResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNotificationAPI();
