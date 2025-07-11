#!/usr/bin/env node

/**
 * Test script for Profile Page API
 * This script tests the user profile functionality
 */

const token = process.env.TEST_TOKEN || 'your-test-token-here';
const apiUrl = process.env.API_URL || 'http://localhost:3000/api/user/profile';

async function testProfileAPI() {
  console.log('🧪 Testing Profile Page API...\n');

  try {
    // Test GET profile
    console.log('1. Testing GET /api/user/profile...');
    const getResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (getResponse.ok) {
      const profileData = await getResponse.json();
      console.log('✅ GET Profile successful:');
      console.log('   - Name:', profileData.name);
      console.log('   - Email:', profileData.email);
      console.log('   - Phone:', profileData.phone);
      console.log('   - Telegram Chat ID:', profileData.telegramChatId || 'Not set');
      console.log('   - Occupation:', profileData.occupation);
      console.log('   - Birth Date:', profileData.birthDate);
      console.log('   - Address:', profileData.address);
    } else {
      console.log('❌ GET Profile failed:', getResponse.status, getResponse.statusText);
      const errorData = await getResponse.text();
      console.log('   Error:', errorData);
    }

    console.log('\n2. Testing PUT /api/user/profile...');
    
    // Test PUT profile (update telegram chat id)
    const updateData = {
      telegramChatId: '123456789' // Test chat ID
    };

    const putResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (putResponse.ok) {
      const updatedProfile = await putResponse.json();
      console.log('✅ PUT Profile successful:');
      console.log('   - Updated Telegram Chat ID:', updatedProfile.telegramChatId);
    } else {
      console.log('❌ PUT Profile failed:', putResponse.status, putResponse.statusText);
      const errorData = await putResponse.text();
      console.log('   Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Instructions for manual testing
console.log('=== Profile Page Test Script ===\n');
console.log('📋 Manual Test Steps:');
console.log('1. Start backend server: cd backend && npm run start:dev');
console.log('2. Start frontend server: cd frontend && npm run dev');
console.log('3. Open browser: http://localhost:3000/dashboard/list/profile');
console.log('4. Login with test credentials');
console.log('5. Test profile editing functionality');
console.log('6. Test Telegram Chat ID setup');
console.log('7. Verify profile data is saved correctly\n');

console.log('🔧 Profile Page Features to Test:');
console.log('✓ Profile data loading from backend');
console.log('✓ Edit profile functionality');
console.log('✓ Telegram Chat ID configuration');
console.log('✓ Profile data validation');
console.log('✓ Save/Cancel profile changes');
console.log('✓ Avatar upload (if implemented)');
console.log('✓ Date formatting');
console.log('✓ Error handling and loading states\n');

console.log('📊 Expected Profile Fields:');
console.log('- Name (namaDepan + namaBelakang)');
console.log('- Email');
console.log('- Phone (noHp)');
console.log('- Birth Date (tanggalLahir)');
console.log('- Address (alamat)');
console.log('- Occupation (role)');
console.log('- Telegram Chat ID (telegramChatId)');
console.log('- Bio (auto-generated from role)\n');

console.log('🔗 Profile Page URL: http://localhost:3000/dashboard/list/profile');
console.log('🔗 Backend API: http://localhost:3001/users/:id');
console.log('🔗 Frontend API: http://localhost:3000/api/user/profile\n');

console.log('To run API tests, set TEST_TOKEN environment variable and run:');
console.log('node test-profile-page.js\n');

// Only run API tests if token is provided
if (token !== 'your-test-token-here') {
  testProfileAPI();
}
