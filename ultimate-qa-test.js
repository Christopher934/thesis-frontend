// Ultimate QA Test dengan semua perbaikan
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

const runUltimateTest = async () => {
  console.log('\n🏥 RSUD ANUGERAH HOSPITAL MANAGEMENT SYSTEM');
  console.log('🔍 ULTIMATE QA TEST WITH SECURITY FIXES');
  console.log('=' .repeat(70));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let securityIssues = [];
  
  const testResult = (testName, success, details = '', category = 'GENERAL') => {
    totalTests++;
    if (success) {
      passedTests++;
      console.log(`✅ [${category}] ${testName}: PASSED ${details}`);
    } else {
      failedTests++;
      console.log(`❌ [${category}] ${testName}: FAILED ${details}`);
      if (category === 'SECURITY') {
        securityIssues.push(testName);
      }
    }
  };
  
  // Test 1: System Health
  console.log('\n🔧 SYSTEM HEALTH CHECK');
  console.log('-'.repeat(50));
  const healthResult = await makeRequest('GET', '/');
  testResult('System Health Check', healthResult.success, `(${healthResult.status})`, 'SYSTEM');
  
  // Test 2: Database Connectivity
  console.log('\n💾 DATABASE CONNECTIVITY');
  console.log('-'.repeat(50));
  const dbTests = [
    { url: '/users/count-by-gender', name: 'Gender Statistics' },
    { url: '/users/count-by-role', name: 'Role Statistics' },
    { url: '/events', name: 'Events System' }
  ];
  
  for (const test of dbTests) {
    const result = await makeRequest('GET', test.url);
    testResult(test.name, result.success, `(${result.status})`, 'DATABASE');
  }
  
  // Test 3: Authentication System
  console.log('\n🔐 AUTHENTICATION SYSTEM');
  console.log('-'.repeat(50));
  
  // Test admin login dengan password yang benar
  const adminLogin = {
    email: 'admin@rsud.id',
    password: 'password123'  // Password yang benar dari seed
  };
  
  const adminLoginResult = await makeRequest('POST', '/auth/login', adminLogin);
  testResult('Admin Login', adminLoginResult.success, 
    adminLoginResult.success ? '(Token received)' : `(${adminLoginResult.status}: ${adminLoginResult.details.response?.message})`, 
    'AUTH');
  
  let adminToken = null;
  if (adminLoginResult.success) {
    adminToken = adminLoginResult.data.access_token;
  }
  
  // Test user creation and login
  const newUser = {
    email: 'ultimate.test' + Date.now() + '@rsud.com',
    password: 'password123',
    namaDepan: 'Ultimate',
    namaBelakang: 'Test User',
    role: 'PERAWAT',
    jenisKelamin: 'L',
    telegramChatId: '555444333'
  };
  
  const createResult = await makeRequest('POST', '/users', newUser);
  testResult('User Creation', createResult.success, 
    createResult.success ? `(ID: ${createResult.data.id})` : `(${createResult.status})`, 
    'AUTH');
  
  if (createResult.success) {
    const userLogin = {
      email: newUser.email,
      password: newUser.password
    };
    
    const userLoginResult = await makeRequest('POST', '/auth/login', userLogin);
    testResult('User Login', userLoginResult.success, 
      userLoginResult.success ? '(Token received)' : `(${userLoginResult.status})`, 
      'AUTH');
    
    if (userLoginResult.success) {
      const userToken = userLoginResult.data.access_token;
      
      // Test 4: Protected Endpoints
      console.log('\n🔒 PROTECTED ENDPOINTS');
      console.log('-'.repeat(50));
      
      const protectedTests = [
        { url: '/users', name: 'Users List' },
        { url: '/shifts', name: 'Shifts List' },
        { url: '/absensi/my-attendance', name: 'My Attendance' },
        { url: '/notifikasi', name: 'Notifications' }
      ];
      
      for (const test of protectedTests) {
        const result = await makeRequest('GET', test.url, null, userToken);
        testResult(test.name, result.success, `(${result.status})`, 'PROTECTED');
      }
      
      // Test 5: Admin-only endpoints
      if (adminToken) {
        console.log('\n👑 ADMIN ENDPOINTS');
        console.log('-'.repeat(50));
        
        const adminTests = [
          { url: '/users', name: 'Admin Users Access' },
          { method: 'POST', url: '/shifts', data: { nama: 'Admin Test Shift', jamMulai: '09:00', jamSelesai: '17:00', jenisShift: 'PAGI' }, name: 'Admin Shift Creation' }
        ];
        
        for (const test of adminTests) {
          const result = await makeRequest(test.method || 'GET', test.url, test.data, adminToken);
          testResult(test.name, result.success, `(${result.status})`, 'ADMIN');
        }
      }
    }
  }
  
  // Test 6: Security Validation
  console.log('\n🛡️ SECURITY VALIDATION');
  console.log('-'.repeat(50));
  
  const securityTests = [
    { url: '/users', name: 'Users Endpoint Auth Required' },
    { url: '/shifts', name: 'Shifts Endpoint Auth Required' },
    { url: '/absensi/my-attendance', name: 'Attendance Endpoint Auth Required' },
    { url: '/notifikasi', name: 'Notifications Endpoint Auth Required' }
  ];
  
  for (const test of securityTests) {
    const result = await makeRequest('GET', test.url);
    const isSecure = result.status === 401 || result.status === 403;
    testResult(test.name, isSecure, `(${result.status})`, 'SECURITY');
  }
  
  // Test 7: Telegram Integration
  console.log('\n📱 TELEGRAM INTEGRATION');
  console.log('-'.repeat(50));
  
  const telegramTests = [
    { url: '/telegram/bot-info', name: 'Bot Information' },
    { url: '/telegram/webhook-info', name: 'Webhook Status' }
  ];
  
  for (const test of telegramTests) {
    const result = await makeRequest('GET', test.url);
    testResult(test.name, result.success, `(${result.status})`, 'TELEGRAM');
  }
  
  // Test 8: Business Logic
  console.log('\n💼 BUSINESS LOGIC');
  console.log('-'.repeat(50));
  
  const eventData = {
    title: 'Ultimate Test Event',
    description: 'Event created during QA testing',
    date: '2024-12-25',
    time: '10:00'
  };
  
  const eventResult = await makeRequest('POST', '/events', eventData);
  testResult('Event Creation', eventResult.success, 
    eventResult.success ? `(ID: ${eventResult.data?.id})` : `(${eventResult.status})`, 
    'BUSINESS');
  
  // Final Report
  console.log('\n' + '='.repeat(70));
  console.log('🎯 ULTIMATE QA TEST RESULTS');
  console.log('='.repeat(70));
  console.log(`📊 Total Tests Executed: ${totalTests}`);
  console.log(`✅ Tests Passed: ${passedTests}`);
  console.log(`❌ Tests Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (securityIssues.length > 0) {
    console.log(`\n🚨 Security Issues Found: ${securityIssues.length}`);
    securityIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('\n🛡️ No Security Issues Found');
  }
  
  console.log('\n📋 SYSTEM STATUS:');
  if (failedTests === 0) {
    console.log('🟢 SYSTEM READY FOR PRODUCTION');
  } else if (failedTests <= 2) {
    console.log('🟡 SYSTEM NEEDS MINOR FIXES');
  } else {
    console.log('🔴 SYSTEM NEEDS MAJOR FIXES');
  }
  
  console.log('\n🏥 RSUD Anugerah Hospital Management System');
  console.log('📅 QA Test Completed: ' + new Date().toLocaleString());
  console.log('=' .repeat(70));
};

runUltimateTest().catch(console.error);
