const axios = require('axios');

async function debugLogin() {
  console.log('🔍 Debug Login Process...\n');
  
  // Test 1: Check if backend is running
  try {
    const healthCheck = await axios.get('http://localhost:3001/');
    console.log('✅ Backend is running:', healthCheck.data);
  } catch (error) {
    console.log('❌ Backend not running:', error.message);
    return;
  }
  
  // Test 2: Try different password combinations
  const credentials = [
    { email: 'admin@rsud.id', password: 'password123' },
    { email: 'admin@rsud.id', password: 'admin123' },
    { email: 'admin@rsud.id', password: 'admin' },
    { email: 'staff1@rsud.id', password: 'password123' },
  ];
  
  for (const cred of credentials) {
    try {
      console.log(`🔐 Trying: ${cred.email} / ${cred.password}`);
      const response = await axios.post('http://localhost:3001/auth/login', cred);
      console.log('✅ SUCCESS! Token:', response.data.access_token.substring(0, 50) + '...');
      
      // Test a protected endpoint
      try {
        const testResponse = await axios.get('http://localhost:3001/admin/shift-optimization/dashboard', {
          headers: { Authorization: `Bearer ${response.data.access_token}` }
        });
        console.log('✅ Protected endpoint works!');
        return response.data.access_token;
      } catch (error) {
        console.log('❌ Protected endpoint failed:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.log('❌ Failed:', error.response?.data?.message || error.message);
    }
  }
  
  console.log('\n🤔 All login attempts failed. Checking users in database...');
  return null;
}

debugLogin();
