const fetch = require('node-fetch');

async function loginAsAdmin() {
  console.log('🔐 Attempting to login as admin...');
  
  try {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@hospital.com',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Login successful!');
    console.log('📋 Response data:');
    console.log(`   Access Token: ${data.access_token}`);
    console.log(`   User ID: ${data.user.id}`);
    console.log(`   Name: ${data.user.namaDepan} ${data.user.namaBelakang}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Role: ${data.user.role}`);
    console.log(`   Employee ID: ${data.user.employeeId}`);
    console.log('');
    console.log('🎯 Admin panel access confirmed!');
    console.log('🔗 You can now access: http://localhost:3000/dashboard/admin');
    
    return data;
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure backend server is running (port 3001)');
    console.log('   2. Check if user exists in database');
    console.log('   3. Verify credentials are correct');
    
    return null;
  }
}

// Test the admin login
loginAsAdmin();
