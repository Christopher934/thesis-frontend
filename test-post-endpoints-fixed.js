#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(method, endpoint, data = null, description = '', token = null) {
    const url = `${BASE_URL}${endpoint}`;
    
    const options = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const status = response.status;
        const success = response.ok;
        
        let responseData = null;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
        }
        
        console.log(`${success ? '✅' : '❌'} [${method}] ${endpoint} - ${status} - ${description}`);
        
        return { success, status, endpoint, method, description, data: responseData };
    } catch (error) {
        console.log(`❌ [${method}] ${endpoint} - ERROR - ${description}: ${error.message}`);
        return { success: false, status: 'ERROR', endpoint, method, description, error: error.message };
    }
}

async function main() {
    console.log('🚀 Testing POST Endpoints After All Fixes...\n');
    
    const results = [];
    
    console.log('=== POST Endpoints ===');
    
    // Test 1: Login
    const loginResult = await testEndpoint('POST', '/auth/login', {
        email: 'admin@rsud.id',
        password: 'password123'
    }, 'User login');
    results.push(loginResult);
    
    let authToken = null;
    if (loginResult.success && loginResult.data && loginResult.data.access_token) {
        authToken = loginResult.data.access_token;
        console.log('   🔑 Auth token obtained');
    }
    
    // Test 2: Create User
    const timestamp = Date.now();
    const userResult = await testEndpoint('POST', '/users', {
        namaDepan: 'Test',
        namaBelakang: 'User',
        email: `testuser${timestamp}@example.com`,
        password: 'password123',
        noHp: '08123456789',
        jenisKelamin: 'L',
        role: 'STAF'
    }, 'Create user');
    results.push(userResult);
    
    let newUserId = null;
    if (userResult.success && userResult.data && userResult.data.id) {
        newUserId = userResult.data.id;
        console.log(`   👤 New user created with ID: ${newUserId}`);
    }
    
    // Test 3: Create Shift for today
    const shiftResult = await testEndpoint('POST', '/shifts', {
        userId: newUserId || 1,
        tanggal: '2025-07-11',
        jammulai: '08:00',
        jamselesai: '17:00',
        lokasishift: 'IGD',
        status: 'SCHEDULED'
    }, 'Create shift', authToken);
    results.push(shiftResult);
    
    let newShiftId = null;
    if (shiftResult.success && shiftResult.data && shiftResult.data.id) {
        newShiftId = shiftResult.data.id;
        console.log(`   📅 New shift created with ID: ${newShiftId}`);
    }
    
    // Test 4: Create Event
    const eventResult = await testEndpoint('POST', '/events', {
        nama: 'Test Event',
        waktuMulai: '10:00',
        waktuSelesai: '12:00',
        lokasi: 'Meeting Room',
        tanggal: '2025-07-12',
        keterangan: 'Test event description'
    }, 'Create event', authToken);
    results.push(eventResult);
    
    // Test 5: Create Notification
    const notificationResult = await testEndpoint('POST', '/notifikasi', {
        userId: newUserId || 1,
        judul: 'Test Notification',
        pesan: 'This is a test notification',
        jenis: 'SISTEM_INFO',
        targetUserId: newUserId || 1
    }, 'Create notification', authToken);
    results.push(notificationResult);
    
    // Test 6: Attendance Check-in (need to login with the new user first)
    let newUserToken = null;
    if (newUserId) {
        const newUserLoginResult = await testEndpoint('POST', '/auth/login', {
            email: `testuser${timestamp}@example.com`,
            password: 'password123'
        }, 'New user login');
        
        if (newUserLoginResult.success && newUserLoginResult.data && newUserLoginResult.data.access_token) {
            newUserToken = newUserLoginResult.data.access_token;
            console.log('   🔑 New user auth token obtained');
        }
    }
    
    const absensiResult = await testEndpoint('POST', '/absensi/masuk', {
        lokasi: 'IGD',
        catatan: 'Masuk tepat waktu'
    }, 'Attendance check-in', newUserToken || authToken);
    results.push(absensiResult);
    
    // Summary
    console.log('\n=== POST ENDPOINTS SUMMARY ===');
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total POST Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${(passedTests / totalTests * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
        console.log('\n=== FAILED POST TESTS ===');
        results.filter(r => !r.success).forEach(result => {
            console.log(`❌ [${result.method}] ${result.endpoint} - ${result.status} - ${result.description}`);
        });
    }
}

main().catch(console.error);
