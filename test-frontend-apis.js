#!/usr/bin/env node

/**
 * Frontend API Test Suite for RSUD Anugerah Hospital Management System
 * Tests frontend API routes that proxy to backend
 */

const frontendUrl = 'http://localhost:3000';
const backendUrl = 'http://localhost:3001';
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

async function makeRequest(method, endpoint, data = null, requireAuth = true, useBackend = false) {
  const baseUrl = useBackend ? backendUrl : frontendUrl;
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
  
  // Test login with backend first
  logInfo('Testing backend login...');
  const loginResult = await makeRequest('POST', '/auth/login', testCredentials, false, true);
  
  if (loginResult.ok && loginResult.data && loginResult.data.access_token) {
    authToken = loginResult.data.access_token;
    logSuccess('Backend login successful');
    logInfo(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    logError(`Backend login failed: ${loginResult.status} - ${JSON.stringify(loginResult.data)}`);
    return false;
  }
}

async function testFrontendAPIs() {
  log('\n=== FRONTEND API TESTS ===', 'cyan');
  
  // Test user count by role API
  logInfo('Testing GET /api/users/count-by-role...');
  const roleCountResult = await makeRequest('GET', '/api/users/count-by-role');
  if (roleCountResult.ok) {
    logSuccess('GET /api/users/count-by-role - Success');
    logInfo(`Role counts: ${JSON.stringify(roleCountResult.data)}`);
  } else {
    logError(`GET /api/users/count-by-role failed: ${roleCountResult.status}`);
  }

  // Test user count by gender API
  logInfo('Testing GET /api/users/count-by-gender...');
  const genderCountResult = await makeRequest('GET', '/api/users/count-by-gender');
  if (genderCountResult.ok) {
    logSuccess('GET /api/users/count-by-gender - Success');
    logInfo(`Gender counts: ${JSON.stringify(genderCountResult.data)}`);
  } else {
    logError(`GET /api/users/count-by-gender failed: ${genderCountResult.status}`);
  }

  // Test profile API
  logInfo('Testing GET /api/user/profile...');
  const profileResult = await makeRequest('GET', '/api/user/profile');
  if (profileResult.ok) {
    logSuccess('GET /api/user/profile - Success');
    logInfo(`Profile: ${profileResult.data.name} (${profileResult.data.email})`);
    
    // Test profile update
    logInfo('Testing PUT /api/user/profile...');
    const updateData = {
      ...profileResult.data,
      name: 'Updated Test Name',
      phone: '081234567890'
    };
    
    const updateResult = await makeRequest('PUT', '/api/user/profile', updateData);
    if (updateResult.ok) {
      logSuccess('PUT /api/user/profile - Success');
      logInfo(`Updated profile: ${updateResult.data.name}`);
    } else {
      logError(`PUT /api/user/profile failed: ${updateResult.status}`);
    }
  } else {
    logError(`GET /api/user/profile failed: ${profileResult.status}`);
    if (profileResult.data) {
      logError(`Error: ${JSON.stringify(profileResult.data)}`);
    }
  }
}

async function runAllTests() {
  log('🚀 Starting Frontend API Test Suite', 'magenta');
  log('==========================================', 'magenta');
  
  try {
    // First authenticate with backend
    const authSuccess = await testAuth();
    if (!authSuccess) {
      logError('Authentication failed. Stopping tests.');
      return;
    }

    // Test frontend APIs
    await testFrontendAPIs();

    log('\n==========================================', 'magenta');
    log('✅ Frontend API Test Suite Completed', 'magenta');
    log('==========================================', 'magenta');
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
  }
}

// Run the tests
runAllTests();
