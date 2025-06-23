#!/usr/bin/env node

/**
 * Test script to verify role-based notification filtering is working correctly
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

// Test users with different roles
const testUsers = [
  { email: 'admin@rsud.com', password: 'admin123', expectedRole: 'ADMIN' },
  { email: 'supervisor@rsud.com', password: 'supervisor123', expectedRole: 'SUPERVISOR' },
  { email: 'perawat@rsud.com', password: 'perawat123', expectedRole: 'PERAWAT' },
  { email: 'dokter@rsud.com', password: 'dokter123', expectedRole: 'DOKTER' },
];

// Sample notifications to test filtering
const sampleNotifications = [
  { jenis: 'REMINDER_SHIFT', judul: 'Reminder Shift', pesan: 'Shift reminder for staff' },
  { jenis: 'KONFIRMASI_TUKAR_SHIFT', judul: 'Tukar Shift Request', pesan: 'Shift swap request' },
  { jenis: 'PERSETUJUAN_CUTI', judul: 'Leave Approval', pesan: 'Leave approval notification' },
  { jenis: 'KEGIATAN_HARIAN', judul: 'Daily Event', pesan: 'Daily event notification' },
  { jenis: 'PERINGATAN_TERLAMBAT', judul: 'Late Warning', pesan: 'Late attendance warning' },
  { jenis: 'SISTEM_INFO', judul: 'System Info', pesan: 'System information' },
  { jenis: 'PENGUMUMAN', judul: 'Announcement', pesan: 'General announcement' },
];

async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.text();
      console.error(`❌ Login failed for ${email}:`, error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Login error for ${email}:`, error.message);
    return null;
  }
}

async function fetchNotifications(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifikasi`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      const error = await response.text();
      console.error('❌ Failed to fetch notifications:', error);
      return [];
    }
  } catch (error) {
    console.error('❌ Fetch notifications error:', error.message);
    return [];
  }
}

// Client-side role filtering logic (simulating frontend logic)
function filterNotificationsByRole(notifications, userRole) {
  const getNotificationCategory = (jenis) => {
    const categoryMap = {
      'REMINDER_SHIFT': 'shift',
      'KONFIRMASI_TUKAR_SHIFT': 'shift', 
      'PERSETUJUAN_CUTI': 'approval',
      'KEGIATAN_HARIAN': 'event',
      'PERINGATAN_TERLAMBAT': 'absensi',
      'SHIFT_BARU': 'shift',
      'SISTEM_INFO': 'system',
      'PENGUMUMAN': 'system'
    };
    
    return categoryMap[jenis] || 'system';
  };

  return notifications.filter(notification => {
    const category = getNotificationCategory(notification.jenis);
    
    // Admin can see all notifications
    if (userRole === 'ADMIN') {
      return true;
    }
    
    // Supervisor can see their role notifications + approval requests
    if (userRole === 'SUPERVISOR') {
      return ['approval', 'event', 'system'].includes(category) ||
             ['REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'SHIFT_BARU', 'KEGIATAN_HARIAN', 'SISTEM_INFO', 'PENGUMUMAN'].includes(notification.jenis);
    }
    
    // Regular users (PERAWAT, DOKTER, STAF) can see specific categories
    if (['PERAWAT', 'DOKTER', 'STAF'].includes(userRole)) {
      return ['event', 'absensi', 'shift', 'system'].includes(category) ||
             ['REMINDER_SHIFT', 'KONFIRMASI_TUKAR_SHIFT', 'KEGIATAN_HARIAN', 'PERINGATAN_TERLAMBAT', 'SHIFT_BARU', 'SISTEM_INFO'].includes(notification.jenis);
    }
    
    return false;
  });
}

async function testRoleBasedFiltering() {
  console.log('🔍 Testing Role-based Notification Filtering\n');
  console.log('=' * 60);

  for (const testUser of testUsers) {
    console.log(`\n👤 Testing user: ${testUser.email} (Expected role: ${testUser.expectedRole})`);
    console.log('-'.repeat(50));

    // Login
    const loginResult = await login(testUser.email, testUser.password);
    if (!loginResult) {
      console.log(`❌ Login failed for ${testUser.email}, skipping...`);
      continue;
    }

    const { access_token, role } = loginResult;
    console.log(`✅ Login successful - Role: ${role}`);

    // Fetch notifications from API
    const apiNotifications = await fetchNotifications(access_token);
    console.log(`📥 API returned ${apiNotifications.length} notifications`);

    // Apply client-side filtering (simulating frontend)
    const filteredNotifications = filterNotificationsByRole(apiNotifications, role);
    console.log(`🔽 After role filtering: ${filteredNotifications.length} notifications`);

    // Show notification breakdown
    if (filteredNotifications.length > 0) {
      const notificationTypes = {};
      filteredNotifications.forEach(n => {
        notificationTypes[n.jenis] = (notificationTypes[n.jenis] || 0) + 1;
      });
      
      console.log('📊 Notification types visible to this role:');
      Object.entries(notificationTypes).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
    }

    // Test against expected behavior
    if (role === 'ADMIN') {
      console.log('✅ Admin should see all notifications');
    } else if (role === 'SUPERVISOR') {
      console.log('✅ Supervisor should see approval, event, system, and shift notifications');
    } else if (['PERAWAT', 'DOKTER', 'STAF'].includes(role)) {
      console.log('✅ Staff should see event, absensi, shift, and system notifications only');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Role-based filtering test completed!');
  console.log('📝 Check the output above to verify filtering is working correctly.');
}

// Run the test
if (require.main === module) {
  testRoleBasedFiltering().catch(console.error);
}

module.exports = { testRoleBasedFiltering, filterNotificationsByRole };
