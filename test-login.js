// Test login endpoint dengan data yang ada
console.log('🔑 Testing login endpoint...');

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@rsud.com',
        password: 'admin123'
      })
    });
    
    console.log('Login response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
      
      // Test dengan token
      console.log('\n🔍 Testing authenticated endpoints...');
      
      const shiftsResponse = await fetch('http://localhost:3001/shifts', {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Shifts endpoint status:', shiftsResponse.status);
      
      if (shiftsResponse.ok) {
        const shifts = await shiftsResponse.json();
        console.log('✅ Shifts data:', shifts.length, 'items');
        if (shifts.length > 0) {
          console.log('Sample shift:', shifts[0]);
        }
      } else {
        const errorText = await shiftsResponse.text();
        console.log('❌ Shifts error:', errorText);
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Login failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testLogin();
