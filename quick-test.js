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

async function runQuickTests() {
    console.log('🚀 Quick API Endpoint Testing...\n');
    
    // Import fetch for Node.js
    const fetch = (await import('node-fetch')).default;
    global.fetch = fetch;
    
    const results = [];
    
    // Authentication
    console.log('=== Authentication ===');
    results.push(await testEndpoint('POST', '/auth/login', {
        email: 'admin@rsud.id',
        password: 'password123'
    }, 'User login'));
    
    // Basic endpoints
    console.log('\n=== Basic Endpoints ===');
    results.push(await testEndpoint('GET', '/', null, 'Root endpoint'));
    
    // User Management
    console.log('\n=== User Management ===');
    results.push(await testEndpoint('GET', '/users', null, 'Get all users'));
    results.push(await testEndpoint('GET', '/users/count-by-gender', null, 'Count by gender'));
    results.push(await testEndpoint('GET', '/users/count-by-role', null, 'Count by role'));
    results.push(await testEndpoint('GET', '/users/1', null, 'Get user by ID'));
    
    // Shift Management
    console.log('\n=== Shift Management ===');
    results.push(await testEndpoint('GET', '/shifts', null, 'Get all shifts'));
    results.push(await testEndpoint('GET', '/shifts/types', null, 'Get shift types'));
    
    // Events
    console.log('\n=== Events ===');
    results.push(await testEndpoint('GET', '/events', null, 'Get all events'));
    
    // Notifications
    console.log('\n=== Notifications ===');
    results.push(await testEndpoint('GET', '/notifikasi', null, 'Get notifications'));
    results.push(await testEndpoint('GET', '/notifikasi/unread-count', null, 'Get unread count'));
    
    // Attendance
    console.log('\n=== Attendance ===');
    results.push(await testEndpoint('GET', '/absensi/dashboard-stats', null, 'Dashboard stats'));
    results.push(await testEndpoint('GET', '/absensi/today', null, 'Today attendance'));
    results.push(await testEndpoint('GET', '/absensi/my-attendance', null, 'My attendance'));
    
    // Telegram
    console.log('\n=== Telegram ===');
    results.push(await testEndpoint('GET', '/telegram/bot-info', null, 'Bot info'));
    
    // Summary
    console.log('\n=== SUMMARY ===');
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    // Failed tests
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
        console.log('\n=== FAILED TESTS ===');
        failed.forEach(test => {
            console.log(`❌ [${test.method}] ${test.endpoint} - ${test.status} - ${test.description}`);
        });
    }
}

runQuickTests();
