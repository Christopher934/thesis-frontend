// Simple test to check if backend has any data at all
const testBackendData = async () => {
  try {
    // Test general endpoints
    console.log('=== Backend Health Check ===');
    
    // Test root endpoint
    const rootResponse = await fetch('http://localhost:3001/');
    if (rootResponse.ok) {
      const rootData = await rootResponse.text();
      console.log('✅ Root endpoint working:', rootData);
    } else {
      console.log('❌ Root endpoint failed:', rootResponse.status);
    }
    
    // Test if shifts endpoint exists (should return 401 without auth)
    const shiftsResponse = await fetch('http://localhost:3001/shifts');
    console.log('Shifts endpoint status:', shiftsResponse.status);
    if (shiftsResponse.status === 401) {
      console.log('✅ Shifts endpoint exists (requires auth)');
    } else {
      console.log('❌ Unexpected shifts endpoint response');
    }
    
    // Test login endpoint structure
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });
    
    const loginText = await loginResponse.text();
    console.log('Login endpoint response:', loginResponse.status, loginText);
    
  } catch (error) {
    console.error('Backend test error:', error);
  }
};

testBackendData();
