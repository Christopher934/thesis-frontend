const fetch = require('node-fetch');

async function loginAndTestAdmin() {
  console.log('🔐 Step 1: Login to get valid token...');
  
  try {
    // Step 1: Login untuk mendapatkan token
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@hospital.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log(`   Token: ${loginData.access_token.substring(0, 50)}...`);
    console.log(`   User: ${loginData.user.namaDepan} ${loginData.user.namaBelakang}`);
    console.log(`   Role: ${loginData.user.role}`);
    
    // Step 2: Test admin dashboard API dengan token yang valid
    console.log('\n🔧 Step 2: Testing admin dashboard API...');
    
    const dashboardResponse = await fetch('http://localhost:3001/admin/shift-optimization/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.access_token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`📊 Dashboard API Status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Admin Dashboard API successful!');
      console.log('📋 Dashboard Data:');
      console.log(`   Total Employees: ${dashboardData.summary?.totalEmployees || 'N/A'}`);
      console.log(`   Active Shifts: ${dashboardData.summary?.activeShifts || 'N/A'}`);
      console.log(`   Overworked Employees: ${dashboardData.summary?.overworkedEmployees || 'N/A'}`);
      console.log(`   Workload Alerts: ${dashboardData.workloadAlerts?.length || 0}`);
    } else {
      const errorData = await dashboardResponse.json();
      console.error('❌ Dashboard API failed:');
      console.error(`   Status: ${dashboardResponse.status}`);
      console.error(`   Error: ${JSON.stringify(errorData, null, 2)}`);
    }

    // Step 3: Setup frontend credentials
    console.log('\n🔧 Step 3: Frontend setup credentials...');
    console.log('Copy and paste this to your browser console:');
    console.log(`
localStorage.setItem('token', '${loginData.access_token}');
localStorage.setItem('role', '${loginData.user.role}');
localStorage.setItem('user', '${JSON.stringify(loginData.user)}');
localStorage.setItem('userId', '${loginData.user.id}');
localStorage.setItem('namaDepan', '${loginData.user.namaDepan}');
localStorage.setItem('namaBelakang', '${loginData.user.namaBelakang}');
console.log('✅ Admin credentials set! Refresh the page.');
    `);
    
    return {
      token: loginData.access_token,
      user: loginData.user
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Troubleshooting steps
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running on port 3001');
    console.log('2. Check if admin user exists with correct credentials');
    console.log('3. Verify API endpoints are accessible');
    
    return null;
  }
}

// Run the test
loginAndTestAdmin();
