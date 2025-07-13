const axios = require('axios');

async function testLoginRedirect() {
  console.log('🔍 Testing login redirect fix...\n');
  
  try {
    // Test login untuk staff
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'staff@hospital.com',
      password: 'password123'
    });

    console.log('✅ Login successful');
    console.log('📋 Role:', loginResponse.data.role);
    console.log('🔑 Token received\n');

    // Verify the redirect path in authUtils
    console.log('🚀 Expected redirect path for role "staf": /dashboard/pegawai');
    
    // Test accessing both endpoints
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      console.log('\n📍 Testing /pegawai endpoint (should redirect)...');
      const pegawaiResponse = await axios.get('http://localhost:3000/pegawai', { 
        maxRedirects: 0,
        validateStatus: function (status) {
          return status < 500; // Allow redirects
        }
      });
      console.log('Status:', pegawaiResponse.status);
      console.log('Headers:', pegawaiResponse.headers.location || 'No redirect header');
    } catch (err) {
      if (err.response && err.response.status >= 300 && err.response.status < 400) {
        console.log('✅ Redirect detected:', err.response.headers.location);
      } else {
        console.log('❌ Request failed:', err.message);
      }
    }

    try {
      console.log('\n📍 Testing /dashboard/pegawai endpoint...');
      const dashboardResponse = await axios.get('http://localhost:3000/dashboard/pegawai', { 
        maxRedirects: 0,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      console.log('Status:', dashboardResponse.status);
      if (dashboardResponse.status === 200) {
        console.log('✅ Dashboard pegawai accessible');
      }
    } catch (err) {
      console.log('❌ Dashboard access failed:', err.message);
    }

  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
  }
}

testLoginRedirect();
