#!/usr/bin/env node

// Test script to verify workload endpoints
const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3001';

async function testWorkloadEndpoints() {
    console.log('🧪 Testing workload endpoints...\n');
    
    // Test 1: Test overwork workload-status endpoint
    try {
        console.log('1. Testing /overwork/workload-status...');
        const response1 = await fetch(`${BACKEND_URL}/overwork/workload-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Note: In real scenario, you'd need a valid JWT token
                'Authorization': 'Bearer test-token'
            }
        });
        
        if (response1.ok) {
            const data1 = await response1.json();
            console.log('✅ /overwork/workload-status works');
            console.log('   Sample data:', JSON.stringify(data1.slice(0, 1), null, 2));
        } else {
            console.log('❌ /overwork/workload-status failed:', response1.status, response1.statusText);
        }
    } catch (error) {
        console.log('❌ /overwork/workload-status error:', error.message);
    }
    
    console.log();
    
    // Test 2: Test admin workload analysis endpoint
    try {
        console.log('2. Testing /overwork/admin/workload/analysis...');
        const response2 = await fetch(`${BACKEND_URL}/overwork/admin/workload/analysis`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        });
        
        if (response2.ok) {
            const data2 = await response2.json();
            console.log('✅ /overwork/admin/workload/analysis works');
            console.log('   Sample data:', JSON.stringify(data2.slice(0, 1), null, 2));
        } else {
            console.log('❌ /overwork/admin/workload/analysis failed:', response2.status, response2.statusText);
        }
    } catch (error) {
        console.log('❌ /overwork/admin/workload/analysis error:', error.message);
    }
    
    console.log();
    
    // Test 3: Test users endpoint (to verify connection)
    try {
        console.log('3. Testing /users endpoint...');
        const response3 = await fetch(`${BACKEND_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        });
        
        if (response3.ok) {
            const data3 = await response3.json();
            console.log('✅ /users works');
            console.log('   Users count:', Array.isArray(data3.data) ? data3.data.length : 'Unknown');
        } else {
            console.log('❌ /users failed:', response3.status, response3.statusText);
        }
    } catch (error) {
        console.log('❌ /users error:', error.message);
    }
}

// Run the tests
testWorkloadEndpoints().catch(console.error);
