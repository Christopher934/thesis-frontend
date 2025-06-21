const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3001';
let authToken = '';

async function makeRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    });

    const responseData = await response.json();
    return {
      ok: response.ok,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error(`Request failed:`, error);
    return { ok: false, status: 500, data: { error: error.message } };
  }
}

async function login() {
  console.log('🔐 Logging in...');
  const loginData = {
    username: 'adminrsud',
    password: 'adminpassword'
  };
  
  const result = await makeRequest('POST', '/auth/login', loginData);
  if (result.ok && result.data.accessToken) {
    authToken = result.data.accessToken;
    console.log('✅ Login successful');
    return true;
  } else {
    console.log('❌ Login failed:', result);
    return false;
  }
}

async function debugUserUpdate() {
  console.log('\n🔍 DEBUG: User UPDATE Operation');
  console.log('=====================================');
  
  if (!(await login())) return;
  
  // 1. Create a user first
  console.log('\n1️⃣ Creating test user...');
  const newUser = {
    username: 'debug_user_test',
    email: 'debug.test@example.com',
    password: 'testpassword123',
    namaDepan: 'Debug',
    namaBelakang: 'Test User',
    alamat: 'Debug Address',
    noHp: '081234567890',
    jenisKelamin: 'L',
    tanggalLahir: '1990-05-15',
    role: 'PERAWAT',
    status: 'AKTIF'
  };
  
  const createResult = await makeRequest('POST', '/users', newUser);
  if (!createResult.ok) {
    console.log('❌ Failed to create user:', createResult);
    return;
  }
  
  const userId = createResult.data.id;
  console.log(`✅ User created with ID: ${userId}`);
  console.log('User data:', JSON.stringify(createResult.data, null, 2));
  
  // 2. Try different update scenarios
  console.log('\n2️⃣ Testing minimal update...');
  const minimalUpdate = {
    namaDepan: 'Updated Debug'
  };
  
  const result1 = await makeRequest('PUT', `/users/${userId}`, minimalUpdate);
  console.log('Minimal update result:', result1);
  
  if (!result1.ok) {
    console.log('\n3️⃣ Testing update without phone validation...');
    const updateWithoutPhone = {
      namaDepan: 'Updated Debug 2',
      namaBelakang: 'Updated Test User'
    };
    
    const result2 = await makeRequest('PUT', `/users/${userId}`, updateWithoutPhone);
    console.log('Update without phone result:', result2);
    
    console.log('\n4️⃣ Testing update with valid Indonesian phone...');
    const updateWithValidPhone = {
      namaDepan: 'Updated Debug 3',
      noHp: '+6281234567890'
    };
    
    const result3 = await makeRequest('PUT', `/users/${userId}`, updateWithValidPhone);
    console.log('Update with valid phone result:', result3);
    
    console.log('\n5️⃣ Testing original problematic data...');
    const problematicUpdate = {
      username: 'debug_user_test',
      email: 'debug.test.updated@example.com',
      namaDepan: 'Debug Updated',
      namaBelakang: 'Test User Modified',
      alamat: 'Updated Debug Address',
      noHp: '082345678901',
      jenisKelamin: 'P',
      tanggalLahir: '1995-08-20',
      role: 'DOKTER',
      status: 'AKTIF'
    };
    
    const result4 = await makeRequest('PUT', `/users/${userId}`, problematicUpdate);
    console.log('Problematic update result:', result4);
  }
  
  // 6. Clean up
  console.log('\n6️⃣ Cleaning up test user...');
  const deleteResult = await makeRequest('DELETE', `/users/${userId}`);
  console.log('Delete result:', deleteResult.ok ? '✅ Deleted' : '❌ Delete failed');
}

debugUserUpdate().catch(console.error);
