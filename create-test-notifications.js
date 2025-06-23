#!/usr/bin/env node

/**
 * Script to create test notifications in the database
 */

const API_BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function login(email, password) {
  try {
    console.log(`🔐 Logging in as ${email}...`);
    const response = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 200) {
      console.log(`   ✅ Login successful - Role: ${response.data.role}`);
      return response.data;
    } else {
      console.log(`   ❌ Login failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Login error: ${error.message}`);
    return null;
  }
}

async function createTestNotification(token, userId, notification) {
  try {
    console.log(`📝 Creating notification: ${notification.judul}...`);
    
    const response = await makeRequest(`${API_BASE_URL}/notifikasi`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        judul: notification.judul,
        pesan: notification.pesan,
        jenis: notification.jenis,
        data: notification.data || {},
      }),
    });

    if (response.status === 201 || response.status === 200) {
      console.log(`   ✅ Notification created successfully`);
      return response.data;
    } else {
      console.log(`   ❌ Failed to create notification: ${response.status} - ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error creating notification: ${error.message}`);
    return null;
  }
}

async function createTestNotifications() {
  console.log('🧪 Creating Test Notifications for Role-Based Filtering\n');
  console.log('='.repeat(70));

  // Login as admin to create notifications
  const adminLogin = await login('admin@example.com', 'admin123');
  if (!adminLogin) {
    console.log('❌ Cannot create notifications without admin access');
    return;
  }

  const { access_token } = adminLogin;

  // Sample test notifications for different types
  const testNotifications = [
    {
      userId: 1, // Assume admin user ID is 1
      judul: 'Reminder Shift Pagi',
      pesan: 'Jangan lupa hadir untuk shift pagi hari ini pukul 08:00',
      jenis: 'REMINDER_SHIFT'
    },
    {
      userId: 1,
      judul: 'Permintaan Tukar Shift',
      pesan: 'Anda memiliki permintaan tukar shift yang perlu dikonfirmasi',
      jenis: 'KONFIRMASI_TUKAR_SHIFT'
    },
    {
      userId: 1,
      judul: 'Persetujuan Cuti Diperlukan',
      pesan: 'Terdapat 2 pengajuan cuti yang memerlukan persetujuan Anda',
      jenis: 'PERSETUJUAN_CUTI'
    },
    {
      userId: 1,
      judul: 'Event: Rapat Bulanan',
      pesan: 'Rapat evaluasi bulanan akan diadakan besok pukul 14:00',
      jenis: 'KEGIATAN_HARIAN'
    },
    {
      userId: 1,
      judul: 'Peringatan Keterlambatan',
      pesan: 'Anda terlambat check-in pada shift kemarin',
      jenis: 'PERINGATAN_TERLAMBAT'
    },
    {
      userId: 1,
      judul: 'Shift Baru Ditambahkan',
      pesan: 'Shift tambahan telah ditambahkan untuk minggu depan',
      jenis: 'SHIFT_BARU'
    },
    {
      userId: 1,
      judul: 'Informasi Sistem',
      pesan: 'Sistem akan melakukan maintenance pada Minggu pagi',
      jenis: 'SISTEM_INFO'
    },
    {
      userId: 1,
      judul: 'Pengumuman Penting',
      pesan: 'Kebijakan baru mengenai protokol kesehatan telah diterapkan',
      jenis: 'PENGUMUMAN'
    }
  ];

  console.log(`\n📝 Creating ${testNotifications.length} test notifications...\n`);

  for (const notification of testNotifications) {
    await createTestNotification(access_token, notification.userId, notification);
    // Add small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 Test notifications created successfully!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Open http://localhost:3000 in your browser');
  console.log('   2. Login with different user roles');
  console.log('   3. Check the notification center in dashboard');
  console.log('   4. Verify that notifications are filtered by role');
  console.log('   5. Test the notification dropdown in header');
  
  console.log('\n🔍 Expected Behavior:');
  console.log('   • ADMIN: Should see all 8 notification types');
  console.log('   • SUPERVISOR: Should see 7 types (excluding none)');
  console.log('   • STAFF: Should see 6 types (excluding PERSETUJUAN_CUTI)');
}

// Run the script
createTestNotifications().catch(console.error);
