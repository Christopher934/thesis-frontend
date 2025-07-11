#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1MjIyMzYyOCwiZXhwIjoxNzUyODI4NDI4fQ.KE-JWmkC3opU82isje0y75J1ZoqCb99ffgUN2Y2UOkc';

async function testEndpoint(method, endpoint, data = null, description = '') {
    const url = `${BASE_URL}${endpoint}`;
    
    const options = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const status = response.status;
        const success = response.ok;
        
        console.log(`${success ? '✅' : '❌'} [${method}] ${endpoint} - ${status} - ${description}`);
        
        return { success, status, endpoint, method, description };
    } catch (error) {
        console.log(`❌ [${method}] ${endpoint} - ERROR - ${description}: ${error.message}`);
        return { success: false, status: 'ERROR', endpoint, method, description, error: error.message };
    }
}

async function testPostEndpoints() {
    console.log('🚀 Testing POST Endpoints After Fixes...\n');
    
    // Import fetch for Node.js
    const fetch = (await import('node-fetch')).default;
    global.fetch = fetch;
    
    const results = [];
    
    console.log('=== POST Endpoints ===');
    
    // Test authentication (no auth required)
    results.push(await testEndpoint('POST', '/auth/login', {
        email: 'admin@rsud.id',
        password: 'password123'
    }, 'User login'));
    
    // Test shift creation
    results.push(await testEndpoint('POST', '/shifts', {
        userId: 1,
        tanggal: '2025-07-12',
        jammulai: '08:00',
        jamselesai: '17:00',
        lokasishift: 'Test Location',
        tipeshift: 'PAGI'
    }, 'Create shift'));
    
    // Test event creation
    results.push(await testEndpoint('POST', '/events', {
        judul: 'Test Event',
        deskripsi: 'Test event description',
        tanggal: '2025-07-15',
        waktu: '10:00',
        lokasi: 'Test Location'
    }, 'Create event'));
    
    // Test user creation
    results.push(await testEndpoint('POST', '/users', {
        namaDepan: 'Test',
        namaBelakang: 'User',
        email: 'testuser456@test.com',
        password: 'testpass123',
        role: 'STAF',
        jenisKelamin: 'L'
    }, 'Create user'));
    
    // Test notification creation
    results.push(await testEndpoint('POST', '/notifikasi', {
        userId: 1,
        judul: 'Test Notification',
        pesan: 'This is a test notification',
        jenis: 'SISTEM_INFO'
    }, 'Create notification'));
    
    // Test attendance check-in
    results.push(await testEndpoint('POST', '/absensi/masuk', {
        latitude: -6.2088,
        longitude: 106.8456,
        locationName: 'RSUD Anugerah'
    }, 'Attendance check-in'));
    
    // Summary
    console.log('\n=== POST ENDPOINTS SUMMARY ===');
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`Total POST Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    // Failed tests
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
        console.log('\n=== FAILED POST TESTS ===');
        failed.forEach(test => {
            console.log(`❌ [${test.method}] ${test.endpoint} - ${test.status} - ${test.description}`);
        });
    } else {
        console.log('\n🎉 All POST endpoints are working correctly!');
    }
}

testPostEndpoints();
