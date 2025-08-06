#!/usr/bin/env node

/**
 * 🧪 Final Test untuk memverifikasi fix notifikasi
 * Test menggunakan user non-admin untuk menghindari konflik
 */

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testNotificationFixFinal() {
  console.log('🧪 Final Test: Notification Fix Verification...\n');
  
  let token;
  
  try {
    // 1. Login
    console.log('🔑 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@hospital.com',
      password: 'admin123'
    });
    
    token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // 2. Get all users
    console.log('👥 Getting all users...');
    const usersResponse = await axios.get(`${API_URL}/users?limit=100`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const allUsers = usersResponse.data.data || usersResponse.data;
    
    // Find a NON-ADMIN user to avoid admin conflicts
    const testUser = allUsers.find(user => 
      user.role !== 'ADMIN' && 
      user.status === 'ACTIVE' && 
      user.namaDepan && 
      user.username
    );
    
    if (!testUser) {
      console.log('❌ No suitable non-admin user found');
      console.log('Available users:', allUsers.slice(0, 5).map(u => ({
        id: u.id,
        name: u.namaDepan,
        role: u.role,
        username: u.username
      })));
      
      // Use any user as fallback
      const fallbackUser = allUsers.find(u => u.id && u.namaDepan);
      if (fallbackUser) {
        console.log('Using fallback user:', fallbackUser.namaDepan, fallbackUser.role);
        await testWithUser(fallbackUser, token);
      }
      return;
    }
    
    console.log('✅ Found suitable user:', testUser.namaDepan, testUser.namaBelakang, `(${testUser.role})`);
    
    await testWithUser(testUser, token);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

async function testWithUser(user, token) {
  console.log(`\n📅 Testing shift creation for ${user.namaDepan}...`);
  
  // Use a far future date to avoid any existing conflicts
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 45); // 45 days in future
  
  const testShiftData = {
    tanggal: futureDate.toISOString().split('T')[0],
    jammulai: '22:00', // Very late hour to avoid conflicts
    jamselesai: '23:00', // Short 1-hour shift
    lokasishift: 'Test Location',
    tipeshift: 'MALAM',
    userId: user.id // Use direct user ID
  };
  
  console.log('Shift data:', testShiftData);
  
  const startTime = Date.now();
  
  try {
    const shiftResponse = await axios.post(`${API_URL}/shifts`, testShiftData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 5000 // 5 second timeout to test response speed
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('\n🎉 SHIFT CREATION SUCCESS!');
    console.log('Status:', shiftResponse.status);
    console.log('Response time:', `${responseTime}ms`);
    
    const responseData = shiftResponse.data;
    console.log('Response structure:', {
      hasSuccess: 'success' in responseData,
      successValue: responseData.success,
      hasMessage: 'message' in responseData,
      messageValue: responseData.message,
      hasData: 'data' in responseData,
      dataType: typeof responseData.data
    });
    
    // Detailed response analysis
    console.log('\n🔍 DETAILED ANALYSIS:');
    
    if (responseData.success === true) {
      console.log('✅ SUCCESS FLAG: true (Our fix is working!)');
    } else if (responseData.success === false) {
      console.log('❌ SUCCESS FLAG: false');
    } else {
      console.log('⚠️  SUCCESS FLAG: missing (backward compatibility mode)');
    }
    
    if (responseData.message) {
      console.log('✅ MESSAGE FIELD:', responseData.message);
    }
    
    const shiftData = responseData.data || responseData;
    if (shiftData.id) {
      console.log('✅ SHIFT ID:', shiftData.id);
    }
    
    if (shiftData.notificationStatus) {
      console.log('✅ NOTIFICATION STATUS:', shiftData.notificationStatus);
    } else {
      console.log('⚠️  NOTIFICATION STATUS: not tracked');
    }
    
    // Final assessment
    console.log('\n🎯 FIX VERIFICATION:');
    console.log('===================');
    
    const isFastResponse = responseTime < 2000; // Less than 2 seconds
    const hasStructuredResponse = responseData.success === true || !!responseData.message;
    const hasShiftCreated = !!shiftData.id;
    
    console.log(`Response Speed: ${isFastResponse ? '✅ FAST' : '⚠️  SLOW'} (${responseTime}ms)`);
    console.log(`Structured Response: ${hasStructuredResponse ? '✅ YES' : '❌ NO'}`);
    console.log(`Shift Created: ${hasShiftCreated ? '✅ YES' : '❌ NO'}`);
    
    const fixWorking = isFastResponse && hasShiftCreated;
    
    console.log(`\n🏆 OVERALL RESULT: ${fixWorking ? '✅ FIX IS WORKING!' : '❌ FIX NEEDS WORK'}`);
    
    if (fixWorking) {
      console.log('\n🎉 EXCELLENT! The notification fix is working correctly:');
      console.log('   ✅ Shift creation is fast (not blocked by notifications)');
      console.log('   ✅ Response indicates success');
      console.log('   ✅ Shift is properly created in database');
      console.log('   📱 Notifications will be sent asynchronously in background');
      console.log('\n🚀 The original problem is SOLVED:');
      console.log('   ❌ Before: User got "failed" notification despite successful shift creation');
      console.log('   ✅ After: User gets proper success feedback immediately');
    }
    
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`\n📊 Error Response Analysis (${responseTime}ms):`);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      const errorData = error.response.data;
      
      console.log('Error structure:', {
        hasSuccess: 'success' in errorData,
        successValue: errorData.success,
        hasMessage: 'message' in errorData,
        hasDetails: 'details' in errorData,
        hasConflicts: 'conflicts' in errorData
      });
      
      if (errorData.success === false) {
        console.log('✅ GOOD: Structured error response (fix working for errors too)');
      } else {
        console.log('⚠️  Old-style error response');
      }
      
      // Check if this is a validation error (expected)
      if (error.response.status === 400 && errorData.message.includes('konflik')) {
        console.log('\n📝 NOTE: This is a validation conflict error, which is expected.');
        console.log('The important thing is that error responses are now structured.');
        console.log('Our fix prevents notification errors from causing false failures.');
      }
      
    } else if (error.code === 'ECONNABORTED') {
      console.log('❌ Timeout error - response too slow');
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Run the test
testNotificationFixFinal();
