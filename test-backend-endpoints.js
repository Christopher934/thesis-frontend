// Test backend endpoints untuk mengetahui endpoint yang tersedia
console.log('🔍 Testing backend endpoints...');

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3001';
  
  const endpoints = [
    '/auth/login',
    '/auth/register',
    '/users',
    '/shifts',
    '/api/auth/login',
    '/api/auth/register',
    '/api/users',
    '/api/shifts'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint}...`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status !== 404) {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  // Test root endpoint
  try {
    console.log('\n📡 Testing root endpoint /...');
    const response = await fetch(`${baseUrl}/`);
    console.log(`   Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
};

testEndpoints();
