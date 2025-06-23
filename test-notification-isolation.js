#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.text();
    
    let jsonData;
    try {
      jsonData = JSON.parse(responseData);
    } catch {
      jsonData = responseData;
    }

    return {
      ok: response.ok,
      status: response.status,
      data: jsonData
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message
    };
  }
}

async function loginUser(email, password) {
  log(`🔐 Logging in user: ${email}`, 'blue');
  const result = await makeRequest('POST', '/auth/login', {
    email: email,
    password: password
  });
  
  if (result.ok && result.data.access_token) {
    log(`✅ Login successful for ${email}`, 'green');
    return {
      token: result.data.access_token,
      user: result.data.user
    };
  } else {
    log(`❌ Login failed for ${email}: ${JSON.stringify(result.data)}`, 'red');
    return null;
  }
}

async function createTestNotification(token, userId, title, message) {
  log(`📝 Creating notification for user ${userId}`, 'blue');
  
  const result = await makeRequest('POST', '/notifikasi', {
    userId: userId,
    judul: title,
    pesan: message,
    jenis: 'SISTEM_INFO'
  }, token);
  
  if (result.ok) {
    log(`✅ Notification created with ID: ${result.data.id}`, 'green');
    return result.data;
  } else {
    log(`❌ Failed to create notification: ${JSON.stringify(result.data)}`, 'red');
    return null;
  }
}

async function getNotifications(token, userEmail) {
  log(`📋 Getting notifications for ${userEmail}`, 'blue');
  
  const result = await makeRequest('GET', '/notifikasi', null, token);
  
  if (result.ok) {
    log(`✅ Retrieved ${result.data.length} notifications for ${userEmail}`, 'green');
    return result.data;
  } else {
    log(`❌ Failed to get notifications: ${JSON.stringify(result.data)}`, 'red');
    return [];
  }
}

async function markNotificationAsRead(token, notificationId, userEmail) {
  log(`✅ Marking notification ${notificationId} as read for ${userEmail}`, 'blue');
  
  const result = await makeRequest('PUT', `/notifikasi/${notificationId}/read`, null, token);
  
  if (result.ok) {
    log(`✅ Notification ${notificationId} marked as read by ${userEmail}`, 'green');
    return true;
  } else {
    log(`❌ Failed to mark notification as read: ${JSON.stringify(result.data)}`, 'red');
    return false;
  }
}

async function testNotificationIsolation() {
  log('🧪 TESTING NOTIFICATION ISOLATION FIXES', 'bold');
  log('=========================================', 'bold');
  
  // Test users
  const testUsers = [
    { email: 'admin@example.com', password: 'admin123', role: 'ADMIN' },
    { email: 'perawat1@example.com', password: 'password123', role: 'PERAWAT' },
    { email: 'perawat2@example.com', password: 'password123', role: 'PERAWAT' }
  ];
  
  const users = {};
  
  // Step 1: Login all test users
  log('\n📝 Step 1: Logging in test users...', 'yellow');
  for (const user of testUsers) {
    const loginResult = await loginUser(user.email, user.password);
    if (loginResult) {
      users[user.email] = loginResult;
    } else {
      log(`❌ Cannot continue test - login failed for ${user.email}`, 'red');
      return;
    }
  }
  
  // Step 2: Create notifications for each user using admin token
  log('\n📝 Step 2: Creating test notifications...', 'yellow');
  const adminToken = users['admin@example.com'].token;
  const notifications = {};
  
  for (const [email, userData] of Object.entries(users)) {
    if (email !== 'admin@example.com') {
      const notification = await createTestNotification(
        adminToken,
        userData.user.id,
        `Test Notification for ${email}`,
        `This is a test notification created for ${email} to test isolation`
      );
      
      if (notification) {
        notifications[email] = notification;
      }
    }
  }
  
  // Step 3: Verify each user can see their own notifications
  log('\n📝 Step 3: Verifying users can see their own notifications...', 'yellow');
  for (const [email, userData] of Object.entries(users)) {
    if (email !== 'admin@example.com') {
      const userNotifications = await getNotifications(userData.token, email);
      const hasOwnNotification = userNotifications.some(n => 
        n.id === notifications[email]?.id && n.status === 'UNREAD'
      );
      
      if (hasOwnNotification) {
        log(`✅ ${email} can see their own UNREAD notification`, 'green');
      } else {
        log(`❌ ${email} cannot see their own notification or it's not UNREAD`, 'red');
      }
    }
  }
  
  // Step 4: Test isolation - User 1 marks their notification as read
  log('\n📝 Step 4: Testing notification isolation...', 'yellow');
  const user1Email = 'perawat1@example.com';
  const user2Email = 'perawat2@example.com';
  
  const user1Token = users[user1Email].token;
  const user2Token = users[user2Email].token;
  const user1NotificationId = notifications[user1Email]?.id;
  
  if (user1NotificationId) {
    // User 1 marks their notification as read
    const markSuccess = await markNotificationAsRead(user1Token, user1NotificationId, user1Email);
    
    if (markSuccess) {
      // Step 5: Verify that User 1's notification is marked as read
      log('\n📝 Step 5: Verifying User 1 notification is marked as read...', 'yellow');
      const user1Notifications = await getNotifications(user1Token, user1Email);
      const user1ReadStatus = user1Notifications.find(n => n.id === user1NotificationId)?.status;
      
      if (user1ReadStatus === 'READ') {
        log(`✅ User 1's notification is correctly marked as READ`, 'green');
      } else {
        log(`❌ User 1's notification is NOT marked as read (status: ${user1ReadStatus})`, 'red');
      }
      
      // Step 6: Verify that User 2's notification is still unread (ISOLATION TEST)
      log('\n📝 Step 6: Verifying User 2 notification remains UNREAD (isolation test)...', 'yellow');
      const user2Notifications = await getNotifications(user2Token, user2Email);
      const user2NotificationId = notifications[user2Email]?.id;
      const user2ReadStatus = user2Notifications.find(n => n.id === user2NotificationId)?.status;
      
      if (user2ReadStatus === 'UNREAD') {
        log(`✅ ISOLATION SUCCESS: User 2's notification remains UNREAD`, 'green');
        log(`✅ Fix confirmed: Users can only mark their own notifications as read`, 'green');
      } else {
        log(`❌ ISOLATION FAILED: User 2's notification status: ${user2ReadStatus}`, 'red');
        log(`❌ Bug still exists: Other user's notification was affected`, 'red');
      }
      
      // Step 7: Test cross-user attempt (should fail)
      log('\n📝 Step 7: Testing cross-user mark attempt (should fail)...', 'yellow');
      const user2NotificationId = notifications[user2Email]?.id;
      
      if (user2NotificationId) {
        log(`🔒 User 1 attempting to mark User 2's notification (${user2NotificationId}) as read...`, 'blue');
        const crossUserResult = await makeRequest('PUT', `/notifikasi/${user2NotificationId}/read`, null, user1Token);
        
        if (!crossUserResult.ok) {
          log(`✅ SECURITY SUCCESS: User 1 cannot mark User 2's notification as read`, 'green');
          log(`✅ Error message: ${JSON.stringify(crossUserResult.data)}`, 'green');
        } else {
          log(`❌ SECURITY FAILURE: User 1 was able to mark User 2's notification as read`, 'red');
        }
      }
    }
  }
  
  log('\n🎯 NOTIFICATION ISOLATION TEST COMPLETED', 'bold');
  log('==========================================', 'bold');
}

// Run the test
testNotificationIsolation().catch(console.error);
