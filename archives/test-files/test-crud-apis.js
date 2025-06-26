#!/usr/bin/env node

/**
 * POST, PUT, DELETE API Test Suite for RSUD Anugerah Hospital Management System
 * Comprehensive testing of create, update, and delete operations
 */

const baseUrl = 'http://localhost:3001';
let authToken = null;

// Test credentials
const testCredentials = {
  email: 'admin@rsud.id',
  password: 'password123'
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
  log('\n=== AUTHENTICATION SETUP ===', 'cyan');
  
  logInfo('Testing login for API access...');
  const loginResult = await makeRequest('POST', '/auth/login', testCredentials, false);
  
  if (loginResult.ok && loginResult.data && loginResult.data.access_token) {
    authToken = loginResult.data.access_token;
    logSuccess('Login successful - Authentication token obtained');
    return true;
  } else {
    logError(`Login failed: ${loginResult.status} - ${JSON.stringify(loginResult.data)}`);
    return false;
  }
}

async function testShiftsCRUD() {
  log('\n=== SHIFTS CRUD OPERATIONS ===', 'cyan');
  
  let createdShiftId = null;
  
  // 1. POST - Create new shift
  logInfo('Testing POST /shifts - Create new shift...');
  const newShift = {
    tanggal: '2025-07-01',
    jammulai: '08:00',
    jamselesai: '16:00',
    lokasishift: 'RAWAT_JALAN',
    tipeshift: 'PAGI',
    idpegawai: 'TEST_SHIFT_001',
    nama: 'Test Pegawai Shift',
    userId: 1
  };
  
  const createResult = await makeRequest('POST', '/shifts', newShift);
  if (createResult.ok && createResult.data) {
    createdShiftId = createResult.data.id;
    logSuccess(`POST /shifts - Shift created successfully (ID: ${createdShiftId})`);
    logInfo(`Created shift: ${JSON.stringify(createResult.data, null, 2)}`);
  } else {
    logError(`POST /shifts failed: ${createResult.status} - ${JSON.stringify(createResult.data)}`);
    return;
  }

  // Small delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // 2. PATCH - Update the created shift
  if (createdShiftId) {
    logInfo(`Testing PATCH /shifts/${createdShiftId} - Update shift...`);
    const updatedShift = {
      jammulai: '09:00', // Changed time
      jamselesai: '17:00', // Changed time
      tipeshift: 'SIANG' // Changed type
    };
    
    const updateResult = await makeRequest('PATCH', `/shifts/${createdShiftId}`, updatedShift);
    if (updateResult.ok) {
      logSuccess(`PATCH /shifts/${createdShiftId} - Shift updated successfully`);
      logInfo(`Updated shift: ${JSON.stringify(updateResult.data, null, 2)}`);
    } else {
      logError(`PATCH /shifts/${createdShiftId} failed: ${updateResult.status} - ${JSON.stringify(updateResult.data)}`);
    }
  }

  // Small delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. DELETE - Delete the created shift
  if (createdShiftId) {
    logInfo(`Testing DELETE /shifts/${createdShiftId} - Delete shift...`);
    const deleteResult = await makeRequest('DELETE', `/shifts/${createdShiftId}`);
    if (deleteResult.ok) {
      logSuccess(`DELETE /shifts/${createdShiftId} - Shift deleted successfully`);
    } else {
      logError(`DELETE /shifts/${createdShiftId} failed: ${deleteResult.status} - ${JSON.stringify(deleteResult.data)}`);
    }
  }
}

async function testUsersCRUD() {
  log('\n=== USERS CRUD OPERATIONS ===', 'cyan');
  
  let createdUserId = null;
  
  // 1. POST - Create new user
  logInfo('Testing POST /users - Create new user...');
  const newUser = {
    username: 'test_user_crud',
    email: 'test.crud@example.com',
    password: 'testpassword123',
    namaDepan: 'Test',
    namaBelakang: 'CRUD User',
    alamat: 'Test Address',
    noHp: '081234567890',
    jenisKelamin: 'L', // Fixed: should be "L" or "P"
    tanggalLahir: '1990-05-15',
    role: 'PERAWAT',
    status: 'AKTIF'
  };
  
  const createResult = await makeRequest('POST', '/users', newUser);
  if (createResult.ok && createResult.data) {
    createdUserId = createResult.data.id;
    logSuccess(`POST /users - User created successfully (ID: ${createdUserId})`);
    logInfo(`Created user: ${JSON.stringify(createResult.data, null, 2)}`);
  } else {
    logError(`POST /users failed: ${createResult.status} - ${JSON.stringify(createResult.data)}`);
    return;
  }

  // Small delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // 2. PUT - Update the created user
  if (createdUserId) {
    logInfo(`Testing PUT /users/${createdUserId} - Update user...`);
    const timestamp = Date.now();
    const updatedUser = {
      username: 'test_user_crud',
      email: `test.crud.updated.${timestamp}@example.com`, // Unique email with timestamp
      namaDepan: 'Test Updated',
      namaBelakang: 'CRUD User Modified',
      alamat: 'Updated Test Address',
      noHp: '082345678901',
      jenisKelamin: 'P', // Fixed: should be "L" or "P"
      tanggalLahir: '1995-08-20',
      role: 'DOKTER', // Changed role
      status: 'AKTIF'
    };
    
    const updateResult = await makeRequest('PUT', `/users/${createdUserId}`, updatedUser);
    if (updateResult.ok) {
      logSuccess(`PUT /users/${createdUserId} - User updated successfully`);
      logInfo(`Updated user: ${JSON.stringify(updateResult.data, null, 2)}`);
    } else {
      logError(`PUT /users/${createdUserId} failed: ${updateResult.status} - ${JSON.stringify(updateResult.data)}`);
    }
  }

  // Small delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. DELETE - Delete the created user
  if (createdUserId) {
    logInfo(`Testing DELETE /users/${createdUserId} - Delete user...`);
    const deleteResult = await makeRequest('DELETE', `/users/${createdUserId}`);
    if (deleteResult.ok) {
      logSuccess(`DELETE /users/${createdUserId} - User deleted successfully`);
    } else {
      logError(`DELETE /users/${createdUserId} failed: ${deleteResult.status} - ${JSON.stringify(deleteResult.data)}`);
    }
  }
}

async function testAbsensiOperations() {
  log('\n=== ABSENSI OPERATIONS ===', 'cyan');
  
  let createdAbsensiId = null;
  let createdShiftForAbsensi = null;
  
  // 0. First create a shift for today to enable attendance
  logInfo('Setting up shift for today to enable attendance...');
  const todayShift = {
    tanggal: new Date().toISOString().split('T')[0], // Today's date
    jammulai: '08:00',
    jamselesai: '16:00',
    lokasishift: 'RAWAT_JALAN',
    tipeshift: 'PAGI',
    idpegawai: 'ABSENSI_TEST_001',
    nama: 'Absensi Test Pegawai',
    userId: 1
  };
  
  const shiftResult = await makeRequest('POST', '/shifts', todayShift);
  if (shiftResult.ok && shiftResult.data) {
    createdShiftForAbsensi = shiftResult.data.id;
    logInfo(`✅ Shift created for today (ID: ${createdShiftForAbsensi})`);
  } else {
    logError('❌ Failed to create shift for absensi test, skipping attendance test');
    logInfo('Note: Absensi records are typically not deleted as they serve as permanent audit logs');
    return;
  }

  // Small delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 1. POST - Create new attendance record (absen masuk)
  logInfo('Testing POST /absensi/masuk - Create attendance record...');
  const newAbsensi = {
    lokasi: 'RSUD Anugerah Tomohon',
    catatan: 'Test absen masuk for CRUD'
  };
  
  const createResult = await makeRequest('POST', '/absensi/masuk', newAbsensi);
  if (createResult.ok && createResult.data) {
    createdAbsensiId = createResult.data.id;
    logSuccess(`POST /absensi/masuk - Attendance record created successfully (ID: ${createdAbsensiId})`);
    logInfo(`Created attendance: ${JSON.stringify(createResult.data, null, 2)}`);
  } else {
    logError(`POST /absensi/masuk failed: ${createResult.status} - ${JSON.stringify(createResult.data)}`);
  }

  // 2. PATCH - Update attendance record (absen keluar)
  if (createdAbsensiId) {
    logInfo(`Testing PATCH /absensi/keluar/${createdAbsensiId} - Update attendance...`);
    const updatedAbsensi = {
      catatan: 'Test absen keluar for CRUD'
    };
    
    const updateResult = await makeRequest('PATCH', `/absensi/keluar/${createdAbsensiId}`, updatedAbsensi);
    if (updateResult.ok) {
      logSuccess(`PATCH /absensi/keluar/${createdAbsensiId} - Attendance updated successfully`);
    } else {
      logError(`PATCH /absensi/keluar/${createdAbsensiId} failed: ${updateResult.status} - ${JSON.stringify(updateResult.data)}`);
    }
  }

  // 3. GET - Read user's attendance
  logInfo('Testing GET /absensi/my-attendance - Get user attendance...');
  const readResult = await makeRequest('GET', '/absensi/my-attendance');
  if (readResult.ok) {
    logSuccess('GET /absensi/my-attendance - Attendance data retrieved successfully');
  } else {
    logError(`GET /absensi/my-attendance failed: ${readResult.status} - ${JSON.stringify(readResult.data)}`);
  }

  // Note: We don't typically DELETE absensi records as they are permanent audit logs
  logInfo('Note: Absensi records are typically not deleted as they serve as permanent audit logs');
  
  // Clean up the test shift
  if (createdShiftForAbsensi) {
    logInfo(`Cleaning up test shift (ID: ${createdShiftForAbsensi})...`);
    const deleteShiftResult = await makeRequest('DELETE', `/shifts/${createdShiftForAbsensi}`);
    if (deleteShiftResult.ok) {
      logInfo('✅ Test shift cleaned up successfully');
    } else {
      logInfo('ℹ️ Test shift cleanup failed (may have been used in attendance record)');
    }
  }
}

async function testEventsOperations() {
  log('\n=== EVENTS OPERATIONS ===', 'cyan');
  
  let createdEventId = null;
  
  // 1. POST - Create new event
  logInfo('Testing POST /events - Create event...');
  const newEvent = {
    nama: 'Test Hospital Event',
    jenisKegiatan: 'RAPAT',
    deskripsi: 'This is a test event for CRUD operations',
    tanggalMulai: '2025-07-01T14:00:00.000Z',
    tanggalSelesai: '2025-07-01T16:00:00.000Z',
    waktuMulai: '14:00',
    waktuSelesai: '16:00',
    lokasi: 'Meeting Room A',
    kapasitas: 50,
    lokasiDetail: 'Conference Room A, 2nd Floor',
    penanggungJawab: 'Test Admin',
    kontak: '081234567890',
    departemen: 'IT',
    prioritas: 'TINGGI',
    targetPeserta: ['DOKTER', 'PERAWAT'],
    anggaran: 500000,
    status: 'DRAFT',
    catatan: 'Test event for CRUD operations'
  };
  
  const createResult = await makeRequest('POST', '/events', newEvent);
  if (createResult.ok && createResult.data) {
    createdEventId = createResult.data.id;
    logSuccess(`POST /events - Event created successfully (ID: ${createdEventId})`);
    logInfo(`Created event: ${JSON.stringify(createResult.data, null, 2)}`);
  } else {
    logError(`POST /events failed: ${createResult.status} - ${JSON.stringify(createResult.data)}`);
  }

  // 2. PUT - Update event
  if (createdEventId) {
    logInfo(`Testing PUT /events/${createdEventId} - Update event...`);
    const updatedEvent = {
      nama: 'Updated Test Hospital Event',
      jenisKegiatan: 'TRAINING',
      deskripsi: 'This is an updated test event for CRUD operations',
      tanggalMulai: '2025-07-02T15:30:00.000Z',
      tanggalSelesai: '2025-07-02T17:30:00.000Z',
      waktuMulai: '15:30',
      waktuSelesai: '17:30',
      lokasi: 'Conference Room B',
      kapasitas: 75,
      lokasiDetail: 'Training Room B, 3rd Floor',
      penanggungJawab: 'Updated Admin',
      kontak: '081987654321',
      departemen: 'HR',
      prioritas: 'SEDANG',
      targetPeserta: ['ADMIN', 'SUPERVISOR'],
      anggaran: 750000,
      status: 'AKTIF',
      catatan: 'Updated test event for CRUD operations'
    };
    
    const updateResult = await makeRequest('PUT', `/events/${createdEventId}`, updatedEvent);
    if (updateResult.ok) {
      logSuccess(`PUT /events/${createdEventId} - Event updated successfully`);
    } else {
      logError(`PUT /events/${createdEventId} failed: ${updateResult.status} - ${JSON.stringify(updateResult.data)}`);
    }
  }

  // 3. DELETE - Delete event
  if (createdEventId) {
    logInfo(`Testing DELETE /events/${createdEventId} - Delete event...`);
    const deleteResult = await makeRequest('DELETE', `/events/${createdEventId}`);
    if (deleteResult.ok) {
      logSuccess(`DELETE /events/${createdEventId} - Event deleted successfully`);
    } else {
      logError(`DELETE /events/${createdEventId} failed: ${deleteResult.status} - ${JSON.stringify(deleteResult.data)}`);
    }
  }
}

async function runCRUDTests() {
  log('🚀 Starting POST, PUT, DELETE API Test Suite', 'magenta');
  log('===============================================', 'magenta');
  
  try {
    // Test authentication first
    const authSuccess = await testAuth();
    if (!authSuccess) {
      logError('Authentication failed. Stopping tests.');
      return;
    }

    // Run CRUD tests for each module
    await testShiftsCRUD();
    await testUsersCRUD();
    await testAbsensiOperations();
    await testEventsOperations();

    log('\n===============================================', 'magenta');
    log('✅ POST, PUT, DELETE Test Suite Completed', 'green');
    log('===============================================', 'magenta');
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    console.error(error);
  }
}

// Run the tests
async function initializeAndRun() {
  // Import fetch for Node.js environment
  if (typeof fetch === 'undefined') {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
  }
  await runCRUDTests();
}

initializeAndRun().catch(console.error);
