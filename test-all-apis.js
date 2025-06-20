#!/usr/bin/env node

/**
 * Comprehensive API Test Suite for RSUD Anugerah Hospital Management System
 * Tests all major API endpoints with authentication
 */

const baseUrl = 'http://localhost:3001';
let authToken = null;

// Test credentials
const testCredentials = {
  email: 'admin@example.com',
  password: 'admin123'
};

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function makeRequest(method, endpoint, data = null, requireAuth = true) {
  const url = `${baseUrl}${endpoint}`;
  const options = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (requireAuth && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.text();
    
    let parsedData = null;
    try {
      parsedData = JSON.parse(responseData);
    } catch (e) {
      // Response is not JSON
    }

    return {
      status: response.status,
      ok: response.ok,
      data: parsedData || responseData,
      headers: response.headers
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null
    };
  }
}

async function testAuth() {
  log('\n=== AUTHENTICATION TESTS ===', 'cyan');
  
  // Test login
  logInfo('Testing login...');
  const loginResult = await makeRequest('POST', '/auth/login', testCredentials, false);
  
  if (loginResult.ok && loginResult.data && loginResult.data.access_token) {
    authToken = loginResult.data.access_token;
    logSuccess('Login successful');
    logInfo(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    logError(`Login failed: ${loginResult.status} - ${JSON.stringify(loginResult.data)}`);
    return false;
  }
}

async function testUsers() {
  log('\n=== USER API TESTS ===', 'cyan');
  
  // Test get all users
  logInfo('Testing GET /users...');
  const usersResult = await makeRequest('GET', '/users');
  if (usersResult.ok) {
    logSuccess(`GET /users - ${Array.isArray(usersResult.data) ? usersResult.data.length : 'N/A'} users found`);
  } else {
    logError(`GET /users failed: ${usersResult.status}`);
  }

  // Test user count by role
  logInfo('Testing GET /users/count-by-role...');
  const countByRoleResult = await makeRequest('GET', '/users/count-by-role');
  if (countByRoleResult.ok) {
    logSuccess('GET /users/count-by-role - Success');
    logInfo(`Roles: ${JSON.stringify(countByRoleResult.data)}`);
  } else {
    logError(`GET /users/count-by-role failed: ${countByRoleResult.status}`);
  }

  // Test user count by gender
  logInfo('Testing GET /users/count-by-gender...');
  const countByGenderResult = await makeRequest('GET', '/users/count-by-gender');
  if (countByGenderResult.ok) {
    logSuccess('GET /users/count-by-gender - Success');
  } else {
    logError(`GET /users/count-by-gender failed: ${countByGenderResult.status}`);
  }
}

async function testShifts() {
  log('\n=== SHIFTS API TESTS ===', 'cyan');
  
  // Test get all shifts
  logInfo('Testing GET /shifts...');
  const shiftsResult = await makeRequest('GET', '/shifts');
  if (shiftsResult.ok) {
    logSuccess(`GET /shifts - ${Array.isArray(shiftsResult.data) ? shiftsResult.data.length : 'N/A'} shifts found`);
  } else {
    logError(`GET /shifts failed: ${shiftsResult.status}`);
  }

  // Test create shift (if users exist)
  if (shiftsResult.ok && Array.isArray(shiftsResult.data)) {
    logInfo('Testing POST /shifts...');
    const newShift = {
      tanggal: '2025-06-25',
      jammulai: '08:00',
      jamselesai: '16:00',
      lokasishift: 'POLI_UMUM',
      tipeshift: 'PAGI',
      idpegawai: 'TEST001',
      userId: 1
    };
    
    const createResult = await makeRequest('POST', '/shifts', newShift);
    if (createResult.ok) {
      logSuccess('POST /shifts - Shift created successfully');
    } else {
      logWarning(`POST /shifts failed: ${createResult.status} - ${JSON.stringify(createResult.data)}`);
    }
  }
}

async function testEvents() {
  log('\n=== EVENTS API TESTS ===', 'cyan');
  
  // Test get all events
  logInfo('Testing GET /events...');
  const eventsResult = await makeRequest('GET', '/events');
  if (eventsResult.ok) {
    logSuccess(`GET /events - ${Array.isArray(eventsResult.data) ? eventsResult.data.length : 'N/A'} events found`);
  } else {
    logError(`GET /events failed: ${eventsResult.status}`);
  }
}

async function testAbsensi() {
  log('\n=== ABSENSI API TESTS ===', 'cyan');
  
  // Test get today's attendance
  logInfo('Testing GET /absensi/today...');
  const todayResult = await makeRequest('GET', '/absensi/today');
  if (todayResult.ok) {
    logSuccess('GET /absensi/today - Success');
  } else {
    logError(`GET /absensi/today failed: ${todayResult.status}`);
  }

  // Test get dashboard stats
  logInfo('Testing GET /absensi/dashboard-stats...');
  const statsResult = await makeRequest('GET', '/absensi/dashboard-stats');
  if (statsResult.ok) {
    logSuccess('GET /absensi/dashboard-stats - Success');
  } else {
    logError(`GET /absensi/dashboard-stats failed: ${statsResult.status}`);
  }

  // Test get all attendance
  logInfo('Testing GET /absensi/all...');
  const allResult = await makeRequest('GET', '/absensi/all');
  if (allResult.ok) {
    logSuccess(`GET /absensi/all - ${Array.isArray(allResult.data) ? allResult.data.length : 'N/A'} records found`);
  } else {
    logError(`GET /absensi/all failed: ${allResult.status}`);
  }
}

async function testShiftSwap() {
  log('\n=== SHIFT SWAP API TESTS ===', 'cyan');
  
  // Test get shift swap requests
  logInfo('Testing GET /shift-swap-requests...');
  const swapResult = await makeRequest('GET', '/shift-swap-requests');
  if (swapResult.ok) {
    logSuccess(`GET /shift-swap-requests - ${Array.isArray(swapResult.data) ? swapResult.data.length : 'N/A'} requests found`);
  } else {
    logError(`GET /shift-swap-requests failed: ${swapResult.status}`);
  }
}

async function testProfile() {
  log('\n=== PROFILE API TESTS ===', 'cyan');
  
  // Test frontend profile API
  logInfo('Testing GET /api/user/profile (Frontend API)...');
  const profileResult = await makeRequest('GET', '/api/user/profile');
  if (profileResult.ok) {
    logSuccess('GET /api/user/profile - Success');
  } else {
    logError(`GET /api/user/profile failed: ${profileResult.status}`);
  }
}

async function runAllTests() {
  log('🚀 Starting Comprehensive API Test Suite', 'magenta');
  log('==========================================', 'magenta');
  
  try {
    // Test authentication first
    const authSuccess = await testAuth();
    if (!authSuccess) {
      logError('Authentication failed. Stopping tests.');
      return;
    }

    // Run all API tests
    await testUsers();
    await testShifts();
    await testEvents();
    await testAbsensi();
    await testShiftSwap();
    await testProfile();

    log('\n==========================================', 'magenta');
    log('✅ API Test Suite Completed', 'green');
    log('==========================================', 'magenta');
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
  }
}

// Run the tests
runAllTests().catch(console.error);
