#!/usr/bin/env node

/**
 * Test Admin Dashboard API Endpoints
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

// Test endpoints
const endpoints = [
  {
    name: 'Admin Dashboard',
    url: '/admin/shift-optimization/dashboard',
    method: 'GET'
  },
  {
    name: 'Workload Alerts',
    url: '/admin/shift-optimization/workload-alerts',
    method: 'GET'
  },
  {
    name: 'Location Capacity',
    url: '/admin/shift-optimization/location-capacity?location=ICU&date=2025-07-22',
    method: 'GET'
  },
  {
    name: 'Overworked Report',
    url: '/admin/shift-optimization/overworked-report',
    method: 'GET'
  },
  {
    name: 'Capacity Analysis',
    url: '/admin/shift-optimization/capacity-analysis',
    method: 'GET'
  }
];

// Mock admin token (you would get this from login in real scenario)
const mockAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MzQ3OTU2MDAsImV4cCI6MTczNDg4MjAwMH0.mocktoken';

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Testing: ${endpoint.name}`);
    console.log(`📡 ${endpoint.method} ${endpoint.url}`);
    
    const response = await fetch(`${API_BASE}${endpoint.url}`, {
      method: endpoint.method,
      headers: {
        'Authorization': `Bearer ${mockAdminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const status = response.status;
    console.log(`📊 Status: ${status}`);
    
    if (status === 200) {
      const data = await response.json();
      console.log(`✅ Success! Response sample:`, JSON.stringify(data, null, 2).slice(0, 500) + '...');
    } else if (status === 401) {
      console.log('🔐 Unauthorized - This is expected without proper authentication');
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`🔥 Network Error: ${error.message}`);
  }
}

async function testOptimalShiftCreation() {
  try {
    console.log(`\n🧪 Testing: Optimal Shift Creation (Hybrid Algorithm)`);
    
    const testRequests = [
      {
        date: '2025-07-22',
        location: 'ICU',
        shiftType: 'PAGI',
        requiredCount: 5,
        preferredRoles: ['PERAWAT', 'DOKTER'],
        priority: 'HIGH'
      },
      {
        date: '2025-07-22',
        location: 'GAWAT_DARURAT',
        shiftType: 'MALAM',
        requiredCount: 8,
        preferredRoles: ['PERAWAT'],
        priority: 'URGENT'
      }
    ];
    
    console.log(`📡 POST /admin/shift-optimization/create-optimal-shifts`);
    console.log(`📋 Request:`, JSON.stringify(testRequests, null, 2));
    
    const response = await fetch(`${API_BASE}/admin/shift-optimization/create-optimal-shifts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequests)
    });

    const status = response.status;
    console.log(`📊 Status: ${status}`);
    
    if (status === 200 || status === 201) {
      const data = await response.json();
      console.log(`✅ Hybrid Algorithm Success!`);
      console.log(`🎯 Assignments: ${data.assignments?.length || 0}`);
      console.log(`⚠️ Conflicts: ${data.conflicts?.length || 0}`);
      console.log(`📈 Fulfillment Rate: ${data.fulfillmentRate}%`);
      console.log(`💡 Recommendations:`, data.recommendations);
    } else if (status === 401) {
      console.log('🔐 Unauthorized - This is expected without proper authentication');
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`🔥 Network Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing Admin Dashboard & Hybrid Algorithm API...');
  console.log('====================================================');
  
  // Test basic endpoints
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
  }
  
  // Test hybrid algorithm
  await testOptimalShiftCreation();
  
  console.log('\n🏁 Testing completed!');
  console.log('💡 Note: Unauthorized responses are expected without proper JWT token');
  console.log('🎯 The important thing is that routes are registered and responding');
}

runTests();
