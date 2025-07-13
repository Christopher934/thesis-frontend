// Enhanced Testing dengan error details
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

const runDetailedTests = async () => {
  console.log('\n🔍 Running Detailed Error Analysis...\n');
  
  // Test 1: Check if authentication is required
  console.log('1. Testing unauthorized access:');
  const unauthorizedResult = await makeRequest('GET', '/users');
  console.log('   Status:', unauthorizedResult.status);
  console.log('   Error:', JSON.stringify(unauthorizedResult.details, null, 2));
  
  // Test 2: Try user registration
  console.log('\n2. Testing user registration:');
  const testUser = {
    name: 'Test User QA',
    email: 'qa.test' + Date.now() + '@rsud.com',
    password: 'password123',
    role: 'PERAWAT',
    telegramChatId: '123456789'
  };
  
  const regResult = await makeRequest('POST', '/users', testUser);
  console.log('   Success:', regResult.success);
  console.log('   Status:', regResult.status);
  console.log('   Details:', JSON.stringify(regResult.details, null, 2));
  
  // Test 3: Try login with existing user
  console.log('\n3. Testing login with existing user:');
  const loginData = {
    email: 'admin@rsud.com', // Try with existing admin
    password: 'admin123'
  };
  
  const loginResult = await makeRequest('POST', '/auth/login', loginData);
  console.log('   Success:', loginResult.success);
  console.log('   Status:', loginResult.status);
  console.log('   Details:', JSON.stringify(loginResult.details, null, 2));
  
  if (loginResult.success) {
    const token = loginResult.data.access_token;
    
    // Test protected endpoints with valid token
    console.log('\n4. Testing protected endpoints with valid token:');
    
    const protectedTests = [
      { method: 'GET', url: '/shifts', name: 'Get Shifts' },
      { method: 'GET', url: '/absensi/my-attendance', name: 'Get My Attendance' },
      { method: 'GET', url: '/notifikasi', name: 'Get Notifications' }
    ];
    
    for (const test of protectedTests) {
      const result = await makeRequest(test.method, test.url, null, token);
      console.log(`   ${test.name}:`, result.success ? 'SUCCESS' : 'FAILED');
      if (!result.success) {
        console.log('     Error:', JSON.stringify(result.details, null, 2));
      }
    }
  }
  
  // Test 4: Check database connection
  console.log('\n5. Testing database-dependent endpoints:');
  const dbTests = [
    { method: 'GET', url: '/users/count-by-gender', name: 'Count by Gender' },
    { method: 'GET', url: '/users/count-by-role', name: 'Count by Role' },
    { method: 'GET', url: '/events', name: 'Get Events' }
  ];
  
  for (const test of dbTests) {
    const result = await makeRequest(test.method, test.url);
    console.log(`   ${test.name}:`, result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      console.log('     Error:', JSON.stringify(result.details, null, 2));
    }
  }
  
  console.log('\n✨ Detailed analysis completed!');
};

runDetailedTests().catch(console.error);
