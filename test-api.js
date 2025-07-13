// Test script to check API endpoints
const testAPI = async () => {
  // Test login first
  try {
    console.log('Testing login...');
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'jojostaf@rsud.com', // Use email format
        password: 'password123' // Use common test password
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData);
      
      const token = loginData.token;
      
      // Test shifts endpoint
      console.log('Testing shifts endpoint...');
      const shiftsResponse = await fetch('http://localhost:3001/shifts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (shiftsResponse.ok) {
        const shiftsData = await shiftsResponse.json();
        console.log('Shifts data:', shiftsData);
        console.log('Number of shifts:', shiftsData.length);
      } else {
        console.error('Shifts request failed:', shiftsResponse.status, await shiftsResponse.text());
      }
      
    } else {
      console.error('Login failed:', loginResponse.status, await loginResponse.text());
    }
    
  } catch (error) {
    console.error('API test error:', error);
  }
};

// Run the test
testAPI();
