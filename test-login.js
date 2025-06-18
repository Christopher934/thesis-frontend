#!/usr/bin/env node
/**
 * Test login script for debugging authentication issues
 */
// Using native fetch in Node.js instead of requiring node-fetch

// Test credentials
const testUsers = [
  { email: 'admin@example.com', password: 'admin123' },
  { email: 'dokter@example.com', password: 'dokter123' },
  { email: 'perawat@example.com', password: 'perawat123' }
];

// API URL from environment or default
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function testLogin(user) {
  console.log(`\nTesting login with ${user.email}...`);
  console.log(`API URL: ${apiUrl}`);
  
  const url = `${apiUrl}/auth/login`;
  console.log(`Full login URL: ${url}`);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    
    const status = res.status;
    console.log(`Response status: ${status}`);
    
    const contentType = res.headers.get('content-type');
    console.log(`Response content type: ${contentType}`);
    
    try {
      const data = await res.json();
      console.log('Response body:', JSON.stringify(data, null, 2));
      
      if (res.ok) {
        console.log(`✅ Login successful with ${user.email}`);
      } else {
        console.log(`❌ Login failed with ${user.email}`);
      }
    } catch (jsonError) {
      console.error('Error parsing response as JSON:', jsonError);
      const text = await res.text();
      console.log('Raw response:', text);
    }
  } catch (err) {
    console.error(`❌ Fetch error with ${user.email}:`, err);
  }
}

async function runTests() {
  console.log('🔍 Starting login tests...');
  for (const user of testUsers) {
    await testLogin(user);
  }
  console.log('\n✨ Login tests completed');
}

runTests();
