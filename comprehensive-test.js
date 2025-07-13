// Comprehensive API Testing Script for RSUD Anugerah
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const testUser = {
  name: 'Test User QA',
  email: 'qa.test@rsud.com',
  password: 'password123',
  role: 'PERAWAT',
  telegramChatId: '123456789'
};

const testShift = {
  pegawaiId: 1,
  tanggal: '2025-07-13',
  jamMasuk: '08:00',
  jamKeluar: '16:00',
  tipeShift: 'PAGI',
  installasi: 'ICU'
};

const testAbsensi = {
  pegawaiId: 1,
  shiftId: 1,
  waktuMasuk: new Date().toISOString(),
  koordinatMasuk: '-6.2088,106.8456',
  fotoMasuk: 'base64encodedphoto'
};

let authToken = '';
let userId = 0;

// Test Results
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
const logTest = (testName, status, details = '') => {
  const symbol = status === 'PASS' ? '✅' : '❌';
  console.log(`${symbol} ${testName}: ${status}`);
  if (details) console.log(`   Details: ${details}`);
  
  if (status === 'PASS') {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, details });
  }
};

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
      status: error.response?.status || 500 
    };
  }
};

// Test Functions
const testHealthCheck = async () => {
  const result = await makeRequest('GET', '/');
  if (result.success) {
    logTest('Health Check', 'PASS', 'Backend is responding');
  } else {
    logTest('Health Check', 'FAIL', result.error);
  }
};

const testUserRegistration = async () => {
  const result = await makeRequest('POST', '/users', testUser);
  if (result.success) {
    userId = result.data.id;
    logTest('User Registration', 'PASS', `User created with ID: ${userId}`);
  } else {
    logTest('User Registration', 'FAIL', result.error);
  }
};

const testAuthentication = async () => {
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };
  
  const result = await makeRequest('POST', '/auth/login', loginData);
  if (result.success && result.data.access_token) {
    authToken = result.data.access_token;
    logTest('Authentication', 'PASS', 'Login successful');
  } else {
    logTest('Authentication', 'FAIL', result.error);
  }
};

const testGetUsers = async () => {
  const result = await makeRequest('GET', '/users', null, authToken);
  if (result.success && Array.isArray(result.data)) {
    logTest('Get Users', 'PASS', `Retrieved ${result.data.length} users`);
  } else {
    logTest('Get Users', 'FAIL', result.error);
  }
};

const testUsersByGender = async () => {
  const result = await makeRequest('GET', '/users/count-by-gender', null, authToken);
  if (result.success) {
    logTest('Users by Gender', 'PASS', JSON.stringify(result.data));
  } else {
    logTest('Users by Gender', 'FAIL', result.error);
  }
};

const testUsersByRole = async () => {
  const result = await makeRequest('GET', '/users/count-by-role', null, authToken);
  if (result.success) {
    logTest('Users by Role', 'PASS', JSON.stringify(result.data));
  } else {
    logTest('Users by Role', 'FAIL', result.error);
  }
};

const testShiftCreation = async () => {
  const result = await makeRequest('POST', '/shifts', testShift, authToken);
  if (result.success) {
    logTest('Shift Creation', 'PASS', `Shift created with ID: ${result.data.id}`);
  } else {
    logTest('Shift Creation', 'FAIL', result.error);
  }
};

const testGetShifts = async () => {
  const result = await makeRequest('GET', '/shifts', null, authToken);
  if (result.success && Array.isArray(result.data)) {
    logTest('Get Shifts', 'PASS', `Retrieved ${result.data.length} shifts`);
  } else {
    logTest('Get Shifts', 'FAIL', result.error);
  }
};

const testAbsensiMasuk = async () => {
  const result = await makeRequest('POST', '/absensi/masuk', testAbsensi, authToken);
  if (result.success) {
    logTest('Absensi Masuk', 'PASS', `Attendance recorded with ID: ${result.data.id}`);
  } else {
    logTest('Absensi Masuk', 'FAIL', result.error);
  }
};

const testGetAbsensi = async () => {
  const result = await makeRequest('GET', '/absensi/my-attendance', null, authToken);
  if (result.success && Array.isArray(result.data)) {
    logTest('Get My Attendance', 'PASS', `Retrieved ${result.data.length} attendance records`);
  } else {
    logTest('Get My Attendance', 'FAIL', result.error);
  }
};

const testNotificationCreation = async () => {
  const notificationData = {
    userId: userId,
    judul: 'Test Notification',
    pesan: 'This is a test notification for QA',
    tipe: 'INFO'
  };
  
  const result = await makeRequest('POST', '/notifikasi', notificationData, authToken);
  if (result.success) {
    logTest('Notification Creation', 'PASS', `Notification created with ID: ${result.data.id}`);
  } else {
    logTest('Notification Creation', 'FAIL', result.error);
  }
};

const testGetNotifications = async () => {
  const result = await makeRequest('GET', '/notifikasi', null, authToken);
  if (result.success && Array.isArray(result.data)) {
    logTest('Get Notifications', 'PASS', `Retrieved ${result.data.length} notifications`);
  } else {
    logTest('Get Notifications', 'FAIL', result.error);
  }
};

const testEventCreation = async () => {
  const eventData = {
    judul: 'Test Event QA',
    deskripsi: 'This is a test event for QA',
    tanggal: '2025-07-15',
    waktuMulai: '09:00',
    waktuSelesai: '17:00',
    lokasi: 'Ruang Meeting',
    tipe: 'MEETING'
  };
  
  const result = await makeRequest('POST', '/events', eventData, authToken);
  if (result.success) {
    logTest('Event Creation', 'PASS', `Event created with ID: ${result.data.id}`);
  } else {
    logTest('Event Creation', 'FAIL', result.error);
  }
};

const testGetEvents = async () => {
  const result = await makeRequest('GET', '/events', null, authToken);
  if (result.success && Array.isArray(result.data)) {
    logTest('Get Events', 'PASS', `Retrieved ${result.data.length} events`);
  } else {
    logTest('Get Events', 'FAIL', result.error);
  }
};

const testTelegramBotInfo = async () => {
  const result = await makeRequest('GET', '/telegram/bot-info', null, authToken);
  if (result.success) {
    logTest('Telegram Bot Info', 'PASS', `Bot: ${result.data.username}`);
  } else {
    logTest('Telegram Bot Info', 'FAIL', result.error);
  }
};

const testUnauthorizedAccess = async () => {
  const result = await makeRequest('GET', '/users');
  if (!result.success && result.status === 401) {
    logTest('Unauthorized Access Prevention', 'PASS', 'Protected routes properly secured');
  } else {
    logTest('Unauthorized Access Prevention', 'FAIL', 'Security vulnerability detected');
  }
};

// Data integrity tests
const testDataIntegrity = async () => {
  // Test user data consistency
  const userResult = await makeRequest('GET', `/users/${userId}`, null, authToken);
  if (userResult.success && userResult.data.email === testUser.email) {
    logTest('User Data Integrity', 'PASS', 'User data remains consistent');
  } else {
    logTest('User Data Integrity', 'FAIL', 'User data inconsistency detected');
  }
};

// Main test execution
const runAllTests = async () => {
  console.log('\n🔍 Starting Comprehensive API Testing...\n');
  
  // Basic connectivity tests
  await testHealthCheck();
  await testUnauthorizedAccess();
  
  // User management tests
  await testUserRegistration();
  await testAuthentication();
  await testGetUsers();
  await testUsersByGender();
  await testUsersByRole();
  await testDataIntegrity();
  
  // Shift management tests
  await testShiftCreation();
  await testGetShifts();
  
  // Attendance tests
  await testAbsensiMasuk();
  await testGetAbsensi();
  
  // Notification tests
  await testNotificationCreation();
  await testGetNotifications();
  
  // Event management tests
  await testEventCreation();
  await testGetEvents();
  
  // Telegram integration tests
  await testTelegramBotInfo();
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error.test}: ${error.details}`);
    });
  }
  
  // Clean up test data
  if (userId > 0) {
    await makeRequest('DELETE', `/users/${userId}`, null, authToken);
    console.log('\n🧹 Test data cleaned up');
  }
  
  console.log('\n✨ Testing completed!');
};

// Run the tests
runAllTests().catch(console.error);
