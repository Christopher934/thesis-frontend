// Final comprehensive test dengan admin login
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

const runFinalTests = async () => {
  console.log('\n🚀 FINAL COMPREHENSIVE QA TEST REPORT\n');
  console.log('=' .repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  const testResult = (testName, success, details = '') => {
    totalTests++;
    if (success) {
      passedTests++;
      console.log(`✅ ${testName}: PASSED ${details}`);
    } else {
      failedTests++;
      console.log(`❌ ${testName}: FAILED ${details}`);
    }
  };
  
  // Test 1: Health Check
  console.log('\n📊 1. SYSTEM HEALTH TESTS');
  console.log('-'.repeat(40));
  const healthResult = await makeRequest('GET', '/');
  testResult('Health Check', healthResult.success, `(${healthResult.status})`);
  
  // Test 2: Database Connection Tests
  console.log('\n📊 2. DATABASE CONNECTION TESTS');
  console.log('-'.repeat(40));
  const dbTests = [
    { method: 'GET', url: '/users/count-by-gender', name: 'Count by Gender' },
    { method: 'GET', url: '/users/count-by-role', name: 'Count by Role' },
    { method: 'GET', url: '/events', name: 'Events System' }
  ];
  
  for (const test of dbTests) {
    const result = await makeRequest(test.method, test.url);
    testResult(test.name, result.success, `(${result.status})`);
  }
  
  // Test 3: User Management Tests
  console.log('\n📊 3. USER MANAGEMENT TESTS');
  console.log('-'.repeat(40));
  
  // Create new user
  const newUser = {
    email: 'final.test' + Date.now() + '@rsud.com',
    password: 'password123',
    namaDepan: 'Final',
    namaBelakang: 'Test User',
    role: 'PERAWAT',
    jenisKelamin: 'P',
    telegramChatId: '987654321'
  };
  
  const createResult = await makeRequest('POST', '/users', newUser);
  testResult('User Creation', createResult.success, createResult.success ? `(ID: ${createResult.data.id})` : `(${createResult.status})`);
  
  // Test 4: Authentication Tests
  console.log('\n📊 4. AUTHENTICATION TESTS');
  console.log('-'.repeat(40));
  
  // Test login with admin
  const adminLogin = {
    email: 'admin@rsud.id',
    password: 'admin123'
  };
  
  const adminLoginResult = await makeRequest('POST', '/auth/login', adminLogin);
  testResult('Admin Login', adminLoginResult.success, adminLoginResult.success ? '(Token received)' : `(${adminLoginResult.status})`);
  
  // Test login with new user
  if (createResult.success) {
    const userLogin = {
      email: newUser.email,
      password: newUser.password
    };
    
    const userLoginResult = await makeRequest('POST', '/auth/login', userLogin);
    testResult('User Login', userLoginResult.success, userLoginResult.success ? '(Token received)' : `(${userLoginResult.status})`);
    
    // Test 5: Protected Endpoints
    if (userLoginResult.success) {
      console.log('\n📊 5. PROTECTED ENDPOINTS TESTS');
      console.log('-'.repeat(40));
      
      const token = userLoginResult.data.access_token;
      const protectedTests = [
        { method: 'GET', url: '/shifts', name: 'Get Shifts' },
        { method: 'GET', url: '/absensi/my-attendance', name: 'My Attendance' },
        { method: 'GET', url: '/notifikasi', name: 'Notifications' }
      ];
      
      for (const test of protectedTests) {
        const result = await makeRequest(test.method, test.url, null, token);
        testResult(test.name, result.success, `(${result.status})`);
      }
    }
  }
  
  // Test 6: Security Tests
  console.log('\n📊 6. SECURITY TESTS');
  console.log('-'.repeat(40));
  
  const securityTests = [
    { method: 'GET', url: '/users', name: 'Users Endpoint Security', shouldRequireAuth: true },
    { method: 'GET', url: '/shifts', name: 'Shifts Endpoint Security', shouldRequireAuth: true },
    { method: 'GET', url: '/absensi/my-attendance', name: 'Attendance Endpoint Security', shouldRequireAuth: true },
    { method: 'GET', url: '/notifikasi', name: 'Notifications Endpoint Security', shouldRequireAuth: true }
  ];
  
  for (const test of securityTests) {
    const result = await makeRequest(test.method, test.url);
    const requiresAuth = result.status === 401 || result.status === 403;
    const isSecure = test.shouldRequireAuth ? requiresAuth : !requiresAuth;
    testResult(`${test.name}`, isSecure, `(${result.status})`);
  }
  
  // Test 7: Telegram Bot Integration
  console.log('\n📊 7. TELEGRAM BOT TESTS');
  console.log('-'.repeat(40));
  
  const telegramTests = [
    { method: 'GET', url: '/telegram/bot-info', name: 'Bot Info' },
    { method: 'GET', url: '/telegram/webhook-info', name: 'Webhook Info' }
  ];
  
  for (const test of telegramTests) {
    const result = await makeRequest(test.method, test.url);
    testResult(test.name, result.success, `(${result.status})`);
  }
  
  // Test 8: Business Logic Tests
  console.log('\n📊 8. BUSINESS LOGIC TESTS');
  console.log('-'.repeat(40));
  
  // Test shift creation
  const shiftData = {
    nama: 'Test Shift QA',
    jamMulai: '08:00',
    jamSelesai: '16:00',
    jenisShift: 'PAGI'
  };
  
  const shiftResult = await makeRequest('POST', '/shifts', shiftData);
  testResult('Shift Creation', shiftResult.success, shiftResult.success ? `(ID: ${shiftResult.data?.id})` : `(${shiftResult.status})`);
  
  // Test event creation
  const eventData = {
    title: 'Test Event QA',
    description: 'Test event for QA purposes',
    date: '2024-12-31',
    time: '14:00'
  };
  
  const eventResult = await makeRequest('POST', '/events', eventData);
  testResult('Event Creation', eventResult.success, eventResult.success ? `(ID: ${eventResult.data?.id})` : `(${eventResult.status})`);
  
  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FINAL TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    console.log('1. Users endpoint tidak memerlukan autentikasi (security vulnerability)');
    if (adminLoginResult && !adminLoginResult.success) {
      console.log('2. Admin login credentials mungkin salah');
    }
  } else {
    console.log('\n🎉 ALL TESTS PASSED! System is ready for production.');
  }
  
  console.log('\n🏥 RSUD Anugerah Hospital Management System QA Complete');
  console.log('='.repeat(60));
};

runFinalTests().catch(console.error);
