const baseUrl = 'http://localhost:3001';
let authToken = null;

// Test credentials
const testCredentials = {
  email: 'admin@example.com',
  password: 'admin123'
};

console.log('🚀 Starting CRUD API Tests');
console.log('==========================');

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

  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    let responseData = null;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    return {
      status: response.status,
      ok: response.ok,
      data: responseData
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function testAuth() {
  console.log('\n=== AUTHENTICATION ===');
  console.log('Testing login...');
  
  const loginResult = await makeRequest('POST', '/auth/login', testCredentials, false);
  
  if (loginResult.ok && loginResult.data && loginResult.data.access_token) {
    authToken = loginResult.data.access_token;
    console.log('✅ Login successful');
    return true;
  } else {
    console.log(`❌ Login failed: ${loginResult.status}`);
    console.log(JSON.stringify(loginResult.data, null, 2));
    return false;
  }
}

async function testShiftsCRUD() {
  console.log('\n=== SHIFTS CRUD TESTS ===');
  
  let createdShiftId = null;
  
  // 1. POST - Create shift
  console.log('\n1. Testing POST /shifts...');
  const newShift = {
    tanggal: '2025-07-01',
    jammulai: '08:00',
    jamselesai: '16:00',
    lokasishift: 'RAWAT_JALAN',
    tipeshift: 'PAGI',
    idpegawai: 'admin',
    nama: 'Admin User',
    userId: 1
  };
  
  const createResult = await makeRequest('POST', '/shifts', newShift);
  if (createResult.ok && createResult.data) {
    createdShiftId = createResult.data.id;
    console.log(`✅ POST /shifts - Created shift ID: ${createdShiftId}`);
  } else {
    console.log(`❌ POST /shifts failed: ${createResult.status}`);
    console.log(JSON.stringify(createResult.data, null, 2));
    return;
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. PUT - Update shift (using PATCH since that's what the API supports)
  if (createdShiftId) {
    console.log(`\n2. Testing PATCH /shifts/${createdShiftId}...`);
    const updatedShift = {
      jammulai: '09:00',
      jamselesai: '17:00',
      tipeshift: 'SIANG'
    };
    
    const updateResult = await makeRequest('PATCH', `/shifts/${createdShiftId}`, updatedShift);
    if (updateResult.ok) {
      console.log(`✅ PATCH /shifts/${createdShiftId} - Updated successfully`);
    } else {
      console.log(`❌ PATCH /shifts/${createdShiftId} failed: ${updateResult.status}`);
      console.log(JSON.stringify(updateResult.data, null, 2));
    }
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3. DELETE - Delete shift
  if (createdShiftId) {
    console.log(`\n3. Testing DELETE /shifts/${createdShiftId}...`);
    const deleteResult = await makeRequest('DELETE', `/shifts/${createdShiftId}`);
    if (deleteResult.ok) {
      console.log(`✅ DELETE /shifts/${createdShiftId} - Deleted successfully`);
    } else {
      console.log(`❌ DELETE /shifts/${createdShiftId} failed: ${deleteResult.status}`);
      console.log(JSON.stringify(deleteResult.data, null, 2));
    }
  }
}

async function testUsersCRUD() {
  console.log('\n=== USERS CRUD TESTS ===');
  
  let createdUserId = null;
  
  // 1. POST - Create user
  console.log('\n1. Testing POST /users...');
  const newUser = {
    username: 'test_crud_user',
    email: 'test.crud@example.com',
    password: 'testpassword123',
    namaDepan: 'Test',
    namaBelakang: 'CRUD User',
    alamat: 'Test Address for CRUD',
    noHp: '081234567890',
    jenisKelamin: 'L',
    tanggalLahir: '1990-05-15',
    role: 'PERAWAT',
    status: 'AKTIF'
  };
  
  const createResult = await makeRequest('POST', '/users', newUser);
  if (createResult.ok && createResult.data) {
    createdUserId = createResult.data.id;
    console.log(`✅ POST /users - Created user ID: ${createdUserId}`);
  } else {
    console.log(`❌ POST /users failed: ${createResult.status}`);
    console.log(JSON.stringify(createResult.data, null, 2));
    return;
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. PUT - Update user
  if (createdUserId) {
    console.log(`\n2. Testing PUT /users/${createdUserId}...`);
    const updatedUser = {
      username: 'test_crud_user',
      email: 'test.crud.updated@example.com',
      namaDepan: 'Test Updated',
      namaBelakang: 'CRUD User Modified',
      alamat: 'Updated Test Address',
      noHp: '082345678901',
      jenisKelamin: 'P',
      tanggalLahir: '1995-06-15',
      role: 'DOKTER',
      status: 'AKTIF'
    };
    
    const updateResult = await makeRequest('PUT', `/users/${createdUserId}`, updatedUser);
    if (updateResult.ok) {
      console.log(`✅ PUT /users/${createdUserId} - Updated successfully`);
    } else {
      console.log(`❌ PUT /users/${createdUserId} failed: ${updateResult.status}`);
      console.log(JSON.stringify(updateResult.data, null, 2));
    }
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3. DELETE - Delete user
  if (createdUserId) {
    console.log(`\n3. Testing DELETE /users/${createdUserId}...`);
    const deleteResult = await makeRequest('DELETE', `/users/${createdUserId}`);
    if (deleteResult.ok) {
      console.log(`✅ DELETE /users/${createdUserId} - Deleted successfully`);
    } else {
      console.log(`❌ DELETE /users/${createdUserId} failed: ${deleteResult.status}`);
      console.log(JSON.stringify(deleteResult.data, null, 2));
    }
  }
}

async function testEventsCRUD() {
  console.log('\n=== EVENTS CRUD TESTS ===');
  
  let createdEventId = null;
  
  // 1. POST - Create event
  console.log('\n1. Testing POST /events...');
  const newEvent = {
    nama: 'Test CRUD Event',
    jenisKegiatan: 'RAPAT',
    deskripsi: 'This is a test event for CRUD operations',
    tanggalMulai: '2025-07-15T14:00:00.000Z',
    tanggalSelesai: '2025-07-15T16:00:00.000Z',
    waktuMulai: '14:00',
    waktuSelesai: '16:00',
    lokasi: 'Meeting Room Test',
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
    console.log(`✅ POST /events - Created event ID: ${createdEventId}`);
  } else {
    console.log(`❌ POST /events failed: ${createResult.status}`);
    console.log(JSON.stringify(createResult.data, null, 2));
    return;
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. PUT - Update event
  if (createdEventId) {
    console.log(`\n2. Testing PUT /events/${createdEventId}...`);
    const updatedEvent = {
      nama: 'Updated Test CRUD Event',
      jenisKegiatan: 'TRAINING',
      deskripsi: 'This is an updated test event',
      tanggalMulai: '2025-07-16T15:30:00.000Z',
      tanggalSelesai: '2025-07-16T17:30:00.000Z',
      waktuMulai: '15:30',
      waktuSelesai: '17:30',
      lokasi: 'Updated Meeting Room',
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
      console.log(`✅ PUT /events/${createdEventId} - Updated successfully`);
    } else {
      console.log(`❌ PUT /events/${createdEventId} failed: ${updateResult.status}`);
      console.log(JSON.stringify(updateResult.data, null, 2));
    }
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3. DELETE - Delete event
  if (createdEventId) {
    console.log(`\n3. Testing DELETE /events/${createdEventId}...`);
    const deleteResult = await makeRequest('DELETE', `/events/${createdEventId}`);
    if (deleteResult.ok) {
      console.log(`✅ DELETE /events/${createdEventId} - Deleted successfully`);
    } else {
      console.log(`❌ DELETE /events/${createdEventId} failed: ${deleteResult.status}`);
      console.log(JSON.stringify(deleteResult.data, null, 2));
    }
  }
}

async function testAbsensiCRUD() {
  console.log('\n=== ABSENSI CRUD TESTS ===');
  
  let createdAbsensiId = null;
  
  // 1. POST - Create absensi (absen masuk)
  console.log('\n1. Testing POST /absensi/masuk...');
  const newAbsensi = {
    tanggal: '2025-06-07',
    jamMasuk: '08:00',
    status: 'HADIR',
    lokasi: 'RSUD Anugerah Tomohon',
    catatan: 'Test absen masuk for CRUD'
  };
  
  const createResult = await makeRequest('POST', '/absensi/masuk', newAbsensi);
  if (createResult.ok && createResult.data) {
    createdAbsensiId = createResult.data.id;
    console.log(`✅ POST /absensi/masuk - Created absensi ID: ${createdAbsensiId}`);
  } else {
    console.log(`❌ POST /absensi/masuk failed: ${createResult.status}`);
    console.log(JSON.stringify(createResult.data, null, 2));
    return;
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. PATCH - Update absensi (absen keluar)
  if (createdAbsensiId) {
    console.log(`\n2. Testing PATCH /absensi/keluar/${createdAbsensiId}...`);
    const updatedAbsensi = {
      jamKeluar: '17:00',
      catatan: 'Test absen keluar for CRUD - updated'
    };
    
    const updateResult = await makeRequest('PATCH', `/absensi/keluar/${createdAbsensiId}`, updatedAbsensi);
    if (updateResult.ok) {
      console.log(`✅ PATCH /absensi/keluar/${createdAbsensiId} - Updated successfully`);
    } else {
      console.log(`❌ PATCH /absensi/keluar/${createdAbsensiId} failed: ${updateResult.status}`);
      console.log(JSON.stringify(updateResult.data, null, 2));
    }
  }

  // 3. GET - Read user's attendance
  console.log('\n3. Testing GET /absensi/my-attendance...');
  const readResult = await makeRequest('GET', '/absensi/my-attendance');
  if (readResult.ok) {
    console.log(`✅ GET /absensi/my-attendance - Retrieved successfully`);
  } else {
    console.log(`❌ GET /absensi/my-attendance failed: ${readResult.status}`);
    console.log(JSON.stringify(readResult.data, null, 2));
  }

  // Note: We don't typically DELETE absensi records as they are permanent audit logs
  console.log('\n💡 Note: Absensi records are typically not deleted as they serve as permanent audit logs');
}

async function runAllCRUDTests() {
  try {
    // Test authentication first
    const authSuccess = await testAuth();
    if (!authSuccess) {
      console.log('❌ Authentication failed. Stopping tests.');
      return;
    }

    // Run CRUD tests
    await testShiftsCRUD();
    await testUsersCRUD();
    await testEventsCRUD();
    await testAbsensiCRUD();

    console.log('\n==========================');
    console.log('✅ CRUD Test Suite Completed');
    console.log('==========================');
    
  } catch (error) {
    console.log(`❌ Test suite failed: ${error.message}`);
    console.error(error);
  }
}

// Check if we're in Node.js environment
async function initializeAndRun() {
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment - use dynamic import for ESM modules
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
  }
  await runAllCRUDTests();
}

initializeAndRun().catch(console.error);
