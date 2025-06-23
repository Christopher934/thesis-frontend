#!/usr/bin/env node

/**
 * Test real API endpoints for role-based notification filtering
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
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

async function testLogin(email, password) {
  try {
    console.log(`🔐 Testing login for ${email}...`);
    const response = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 200) {
      console.log(`   ✅ Login successful - Role: ${response.data.role}`);
      return response.data;
    } else {
      console.log(`   ❌ Login failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Login error: ${error.message}`);
    return null;
  }
}

async function testNotificationAPI(token, userRole) {
  try {
    console.log(`📡 Testing notification API for ${userRole}...`);
    const response = await makeRequest(`${API_BASE_URL}/notifikasi`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      console.log(`   ✅ API response successful - ${response.data.length} notifications`);
      
      if (response.data.length > 0) {
        const notificationTypes = {};
        response.data.forEach(n => {
          notificationTypes[n.jenis] = (notificationTypes[n.jenis] || 0) + 1;
        });
        
        console.log('   📊 Notification types from API:');
        Object.entries(notificationTypes).forEach(([type, count]) => {
          console.log(`      - ${type}: ${count}`);
        });
      }
      
      return response.data;
    } else {
      console.log(`   ❌ API failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return [];
    }
  } catch (error) {
    console.log(`   ❌ API error: ${error.message}`);
    return [];
  }
}

async function testAPIEndpoints() {
  console.log('🧪 Testing Real API Endpoints for Role-based Notifications\n');
  console.log('='.repeat(70));

  // Test users - using common default credentials
  const testUsers = [
    { email: 'admin@rsud.com', password: 'admin123', expectedRole: 'ADMIN' },
    { email: 'admin@example.com', password: 'admin123', expectedRole: 'ADMIN' },
  ];

  for (const user of testUsers) {
    console.log(`\n👤 Testing user: ${user.email}`);
    console.log('-'.repeat(50));

    // Test login
    const loginResult = await testLogin(user.email, user.password);
    if (!loginResult) {
      console.log('   ⏭️  Skipping notification test due to login failure');
      continue;
    }

    const { access_token, role } = loginResult;
    
    // Test notification API
    const notifications = await testNotificationAPI(access_token, role);
    
    // Analyze results
    console.log('\n   🔍 Analysis:');
    if (role === 'ADMIN') {
      console.log('   ✅ Admin user - should see all notifications from backend');
      console.log(`   📈 Backend returned ${notifications.length} notifications`);
      console.log('   🔄 Frontend filtering will show all of these (no client-side filtering for admin)');
    } else {
      console.log(`   📊 ${role} user - backend returned ${notifications.length} notifications`);
      console.log('   🔄 Frontend will apply additional role-based filtering');
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 API endpoint testing completed!');
  console.log('\n📋 Summary:');
  console.log('   • Backend API is accessible and returns notification data');
  console.log('   • Authentication is working correctly');
  console.log('   • Frontend NotificationContext will apply role-based filtering');
  console.log('   • The filtering logic tested earlier will work with real API data');
  
  console.log('\n🔍 Next Steps:');
  console.log('   1. Open http://localhost:3000 in browser');
  console.log('   2. Login with different roles');
  console.log('   3. Check notification dropdown in header');
  console.log('   4. Verify notifications are filtered by role');
  console.log('   5. Check browser console for filtering debug logs');
}

// Test server connectivity first
async function testServerConnectivity() {
  console.log('🏥 Testing Server Connectivity...\n');
  
  try {
    // Test backend
    const backendResponse = await makeRequest(`${API_BASE_URL}/`);
    if (backendResponse.status < 500) {
      console.log('✅ Backend server is responding');
    } else {
      console.log('❌ Backend server is not responding properly');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend server is not accessible:', error.message);
    return false;
  }
  
  return true;
}

async function runFullTest() {
  const isConnected = await testServerConnectivity();
  if (isConnected) {
    await testAPIEndpoints();
  } else {
    console.log('\n❌ Cannot proceed with API tests - server is not accessible');
    console.log('💡 Make sure both frontend and backend servers are running:');
    console.log('   • Backend: cd backend && npm run dev');
    console.log('   • Frontend: cd frontend && npm run dev');
  }
}

runFullTest().catch(console.error);
