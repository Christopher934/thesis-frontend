// Test login redirect 
const testLoginRedirect = async () => {
  console.log('Testing login redirect behavior...');
  
  // Test API login
  const apiUrl = 'http://localhost:3001';
  const loginData = {
    email: 'staff1@rsud.id',
    password: 'password123'
  };
  
  try {
    const response = await fetch(apiUrl + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });
    
    if (!response.ok) {
      console.error('Login failed:', response.status);
      return;
    }
    
    const data = await response.json();
    console.log('Login successful:', {
      role: data.user.role,
      email: data.user.email,
      token: data.access_token ? 'Present' : 'Missing'
    });
    
    // Test role normalization 
    const role = data.user.role.toLowerCase();
    console.log('Normalized role:', role);
    
    // Test redirect logic
    if (role === 'perawat' || role === 'dokter' || role === 'staf') {
      console.log('Should redirect to: /dashboard/pegawai');
    } else {
      console.log('Should redirect to: /dashboard/admin');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testLoginRedirect();
