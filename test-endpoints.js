#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';
let authToken = null;
let userId = null;

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const options = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const responseData = await response.text();
        
        let parsedData;
        try {
            parsedData = JSON.parse(responseData);
        } catch {
            parsedData = responseData;
        }
        
        return {
            status: response.status,
            data: parsedData,
            success: response.ok
        };
    } catch (error) {
        return {
            status: 0,
            data: error.message,
            success: false
        };
    }
}

// Test results storage
const testResults = [];

function logTest(category, endpoint, method, result) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const message = `${status} [${method}] ${endpoint} - Status: ${result.status}`;
    
    console.log(`[${category}] ${message}`);
    
    testResults.push({
        category,
        endpoint,
        method,
        status: result.status,
        success: result.success,
        message: result.data
    });
}

// Test authentication first
async function testAuthentication() {
    console.log('\n=== Testing Authentication ===');
    
    // Test login
    const loginResult = await makeRequest('POST', '/auth/login', {
        email: 'admin@rsud.id',
        password: 'password123'
    });
    
    logTest('Authentication', '/auth/login', 'POST', loginResult);
    
    if (loginResult.success && loginResult.data.access_token) {
        authToken = loginResult.data.access_token;
        userId = loginResult.data.user?.id;
        console.log(`✅ Authentication successful. Token obtained. User ID: ${userId}`);
    } else {
        console.log('❌ Authentication failed. Some tests may fail.');
    }
    
    return authToken;
}

// Test basic endpoints
async function testBasicEndpoints() {
    console.log('\n=== Testing Basic Endpoints ===');
    
    // Test root endpoint
    const rootResult = await makeRequest('GET', '/');
    logTest('Basic', '/', 'GET', rootResult);
}

// Test user management endpoints
async function testUserEndpoints() {
    console.log('\n=== Testing User Management Endpoints ===');
    
    const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    // GET /users
    const usersResult = await makeRequest('GET', '/users', null, authHeaders);
    logTest('User Management', '/users', 'GET', usersResult);
    
    // GET /users/count-by-gender
    const genderCountResult = await makeRequest('GET', '/users/count-by-gender', null, authHeaders);
    logTest('User Management', '/users/count-by-gender', 'GET', genderCountResult);
    
    // GET /users/count-by-role
    const roleCountResult = await makeRequest('GET', '/users/count-by-role', null, authHeaders);
    logTest('User Management', '/users/count-by-role', 'GET', roleCountResult);
    
    // Test creating a user
    const createUserResult = await makeRequest('POST', '/users', {
        namaDepan: 'Test',
        namaBelakang: 'User',
        email: 'testuser@test.com',
        password: 'testpass123',
        role: 'STAFF',
        jenisKelamin: 'L'
    }, authHeaders);
    logTest('User Management', '/users', 'POST', createUserResult);
    
    // If user was created successfully, test GET by ID and UPDATE
    if (createUserResult.success && createUserResult.data.id) {
        const newUserId = createUserResult.data.id;
        
        // GET /users/:id
        const getUserResult = await makeRequest('GET', `/users/${newUserId}`, null, authHeaders);
        logTest('User Management', `/users/${newUserId}`, 'GET', getUserResult);
        
        // PUT /users/:id
        const updateUserResult = await makeRequest('PUT', `/users/${newUserId}`, {
            namaDepan: 'Updated Test',
            namaBelakang: 'User Updated'
        }, authHeaders);
        logTest('User Management', `/users/${newUserId}`, 'PUT', updateUserResult);
        
        // DELETE /users/:id
        const deleteUserResult = await makeRequest('DELETE', `/users/${newUserId}`, null, authHeaders);
        logTest('User Management', `/users/${newUserId}`, 'DELETE', deleteUserResult);
    }
}

// Test shift management endpoints
async function testShiftEndpoints() {
    console.log('\n=== Testing Shift Management Endpoints ===');
    
    const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    // GET /shifts
    const shiftsResult = await makeRequest('GET', '/shifts', null, authHeaders);
    logTest('Shift Management', '/shifts', 'GET', shiftsResult);
    
    // GET /shifts/types
    const shiftTypesResult = await makeRequest('GET', '/shifts/types', null, authHeaders);
    logTest('Shift Management', '/shifts/types', 'GET', shiftTypesResult);
    
    // Test creating a shift
    const createShiftResult = await makeRequest('POST', '/shifts', {
        userId: userId || 1,
        tanggal: '2025-07-12',
        jammulai: '08:00',
        jamselesai: '17:00',
        installasi: 'RAWAT_JALAN'
    }, authHeaders);
    logTest('Shift Management', '/shifts', 'POST', createShiftResult);
    
    // If shift was created successfully, test other operations
    if (createShiftResult.success && createShiftResult.data.id) {
        const shiftId = createShiftResult.data.id;
        
        // GET /shifts/:id
        const getShiftResult = await makeRequest('GET', `/shifts/${shiftId}`, null, authHeaders);
        logTest('Shift Management', `/shifts/${shiftId}`, 'GET', getShiftResult);
        
        // PATCH /shifts/:id
        const updateShiftResult = await makeRequest('PATCH', `/shifts/${shiftId}`, {
            jammulai: '09:00'
        }, authHeaders);
        logTest('Shift Management', `/shifts/${shiftId}`, 'PATCH', updateShiftResult);
        
        // DELETE /shifts/:id
        const deleteShiftResult = await makeRequest('DELETE', `/shifts/${shiftId}`, null, authHeaders);
        logTest('Shift Management', `/shifts/${shiftId}`, 'DELETE', deleteShiftResult);
    }
}

// Test events endpoints
async function testEventEndpoints() {
    console.log('\n=== Testing Events Endpoints ===');
    
    const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    // GET /events
    const eventsResult = await makeRequest('GET', '/events', null, authHeaders);
    logTest('Events', '/events', 'GET', eventsResult);
    
    // Test creating an event
    const createEventResult = await makeRequest('POST', '/events', {
        judul: 'Test Event',
        deskripsi: 'Test event description',
        tanggal: '2025-07-15',
        waktu: '10:00',
        lokasi: 'Test Location'
    }, authHeaders);
    logTest('Events', '/events', 'POST', createEventResult);
    
    // If event was created successfully, test other operations
    if (createEventResult.success && createEventResult.data.id) {
        const eventId = createEventResult.data.id;
        
        // GET /events/:id
        const getEventResult = await makeRequest('GET', `/events/${eventId}`, null, authHeaders);
        logTest('Events', `/events/${eventId}`, 'GET', getEventResult);
        
        // PUT /events/:id
        const updateEventResult = await makeRequest('PUT', `/events/${eventId}`, {
            judul: 'Updated Test Event'
        }, authHeaders);
        logTest('Events', `/events/${eventId}`, 'PUT', updateEventResult);
        
        // DELETE /events/:id
        const deleteEventResult = await makeRequest('DELETE', `/events/${eventId}`, null, authHeaders);
        logTest('Events', `/events/${eventId}`, 'DELETE', deleteEventResult);
    }
}

// Test notification endpoints
async function testNotificationEndpoints() {
    console.log('\n=== Testing Notification Endpoints ===');
    
    const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    // GET /notifikasi
    const notificationsResult = await makeRequest('GET', '/notifikasi', null, authHeaders);
    logTest('Notifications', '/notifikasi', 'GET', notificationsResult);
    
    // GET /notifikasi/unread-count
    const unreadCountResult = await makeRequest('GET', '/notifikasi/unread-count', null, authHeaders);
    logTest('Notifications', '/notifikasi/unread-count', 'GET', unreadCountResult);
    
    // Test creating a notification
    const createNotificationResult = await makeRequest('POST', '/notifikasi', {
        judulNotifikasi: 'Test Notification',
        isiNotifikasi: 'This is a test notification',
        jenisNotifikasi: 'INFO',
        targetUserId: userId || 1
    }, authHeaders);
    logTest('Notifications', '/notifikasi', 'POST', createNotificationResult);
}

// Test attendance endpoints
async function testAttendanceEndpoints() {
    console.log('\n=== Testing Attendance Endpoints ===');
    
    const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    // GET /absensi/dashboard-stats
    const dashboardStatsResult = await makeRequest('GET', '/absensi/dashboard-stats', null, authHeaders);
    logTest('Attendance', '/absensi/dashboard-stats', 'GET', dashboardStatsResult);
    
    // GET /absensi/today
    const todayAttendanceResult = await makeRequest('GET', '/absensi/today', null, authHeaders);
    logTest('Attendance', '/absensi/today', 'GET', todayAttendanceResult);
    
    // GET /absensi/my-attendance
    const myAttendanceResult = await makeRequest('GET', '/absensi/my-attendance', null, authHeaders);
    logTest('Attendance', '/absensi/my-attendance', 'GET', myAttendanceResult);
}

// Test telegram endpoints
async function testTelegramEndpoints() {
    console.log('\n=== Testing Telegram Endpoints ===');
    
    const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    // GET /telegram/bot-info
    const botInfoResult = await makeRequest('GET', '/telegram/bot-info', null, authHeaders);
    logTest('Telegram', '/telegram/bot-info', 'GET', botInfoResult);
    
    // PUT /user/telegram-chat-id
    const updateChatIdResult = await makeRequest('PUT', '/user/telegram-chat-id', {
        telegramChatId: '123456789'
    }, authHeaders);
    logTest('Telegram', '/user/telegram-chat-id', 'PUT', updateChatIdResult);
}

// Generate test report
function generateReport() {
    console.log('\n=== TEST REPORT ===');
    
    const categories = [...new Set(testResults.map(r => r.category))];
    
    categories.forEach(category => {
        const categoryTests = testResults.filter(r => r.category === category);
        const passed = categoryTests.filter(r => r.success).length;
        const total = categoryTests.length;
        
        console.log(`\n${category}: ${passed}/${total} tests passed`);
        
        categoryTests.forEach(test => {
            const status = test.success ? '✅' : '❌';
            console.log(`  ${status} [${test.method}] ${test.endpoint} (${test.status})`);
        });
    });
    
    const totalPassed = testResults.filter(r => r.success).length;
    const totalTests = testResults.length;
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
}

// Main test function
async function runTests() {
    console.log('🚀 Starting API Endpoint Testing...\n');
    
    // Import fetch for Node.js
    const fetch = (await import('node-fetch')).default;
    global.fetch = fetch;
    
    try {
        await testAuthentication();
        await testBasicEndpoints();
        await testUserEndpoints();
        await testShiftEndpoints();
        await testEventEndpoints();
        await testNotificationEndpoints();
        await testAttendanceEndpoints();
        await testTelegramEndpoints();
        
        generateReport();
        
    } catch (error) {
        console.error('Test execution failed:', error);
    }
}

// Run the tests
runTests();
