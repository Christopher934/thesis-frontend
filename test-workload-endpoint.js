const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Generate a test token (gunakan JWT_SECRET yang sama dengan backend)
const testToken = jwt.sign(
  { 
    id: 1, 
    username: 'admin', 
    role: 'ADMIN' 
  }, 
  'your-secret-key', // Ganti dengan JWT_SECRET yang sebenarnya
  { expiresIn: '1h' }
);

async function testWorkloadEndpoint() {
  try {
    console.log('Testing workload-analysis endpoint...');
    
    const response = await fetch('http://localhost:3001/laporan/workload-analysis', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Data received:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('Error response:', error);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testWorkloadEndpoint();
