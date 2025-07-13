// Fixed Test dengan struktur data yang benar
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data
    };
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500,
      details: {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      }
    };
  }
};

const runFixedTests = async () => {
  console.log('\n🔧 Running Fixed Tests with Correct Data Structure...\n');
  
  // Test 1: Check existing users untuk mencari admin
  console.log('1. Checking existing users:');
  const usersResult = await makeRequest('GET', '/users');
  if (usersResult.success) {
    const users = usersResult.data;
    console.log(`   Found ${users.length} users`);
    
    // Cari admin user
    const adminUser = users.find(u => u.role === 'ADMIN');
    if (adminUser) {
      console.log('   Admin user found:', adminUser.email);
      console.log('   Admin name:', adminUser.namaDepan, adminUser.namaBelakang);
    }
    
    // Show first few users for reference
    console.log('   Sample users:');
    users.slice(0, 3).forEach(user => {
      console.log(`     - ${user.email} (${user.role})`);
    });
  }
  
  // Test 2: Register user dengan struktur yang benar
  console.log('\n2. Testing user registration (correct structure):');
  const testUser = {
    email: 'qa.test' + Date.now() + '@rsud.com',
    password: 'password123',
    namaDepan: 'Test',
    namaBelakang: 'User QA',
    role: 'PERAWAT',
    jenisKelamin: 'L',
    telegramChatId: '123456789'
  };
  
  const regResult = await makeRequest('POST', '/users', testUser);
  console.log('   Success:', regResult.success);
  console.log('   Status:', regResult.status);
  if (!regResult.success) {
    console.log('   Error:', regResult.details.response);
  } else {
    console.log('   Created user:', regResult.data);
  }
  
  // Test 3: Try login dengan user yang baru dibuat
  if (regResult.success) {
    console.log('\n3. Testing login with newly created user:');
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const loginResult = await makeRequest('POST', '/auth/login', loginData);
    console.log('   Success:', loginResult.success);
    console.log('   Status:', loginResult.status);
    if (!loginResult.success) {
      console.log('   Error:', loginResult.details.response);
    } else {
      console.log('   Token received:', loginResult.data.access_token ? 'YES' : 'NO');
      
      // Test protected endpoints
      const token = loginResult.data.access_token;
      console.log('\n4. Testing protected endpoints with valid token:');
      
      const protectedTests = [
        { method: 'GET', url: '/shifts', name: 'Get Shifts' },
        { method: 'GET', url: '/absensi/my-attendance', name: 'Get My Attendance' },
        { method: 'GET', url: '/notifikasi', name: 'Get Notifications' },
        { method: 'GET', url: '/users', name: 'Get Users (should need auth)' }
      ];
      
      for (const test of protectedTests) {
        const result = await makeRequest(test.method, test.url, null, token);
        console.log(`   ${test.name}:`, result.success ? 'SUCCESS' : 'FAILED');
        if (!result.success) {
          console.log(`     Status: ${result.status}`);
          console.log(`     Error: ${result.details.response?.message || result.details.message}`);
        }
      }
    }
  }
  
  // Test 4: Security test - check if endpoints require authentication
  console.log('\n5. Security Test - Checking authentication requirements:');
  const securityTests = [
    { method: 'GET', url: '/users', name: 'Get Users' },
    { method: 'GET', url: '/shifts', name: 'Get Shifts' },
    { method: 'GET', url: '/absensi/my-attendance', name: 'Get My Attendance' },
    { method: 'GET', url: '/notifikasi', name: 'Get Notifications' }
  ];
  
  for (const test of securityTests) {
    const result = await makeRequest(test.method, test.url);
    const requiresAuth = result.status === 401 || result.status === 403;
    console.log(`   ${test.name}: ${requiresAuth ? '✅ SECURE' : '❌ UNSECURE'} (Status: ${result.status})`);
  }
  
  console.log('\n✨ Fixed tests completed!');
};

runFixedTests().catch(console.error);
