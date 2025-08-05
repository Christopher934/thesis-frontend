#!/usr/bin/env node

const axios = require('axios');

// Test delete-all endpoint
async function testDeleteAllEndpoint() {
    console.log('🧪 Testing Delete All Shifts Endpoint\n');
    
    try {
        // First, test if backend is running
        console.log('1. Testing backend connectivity...');
        const healthCheck = await axios.get('http://localhost:3001/health').catch(() => null);
        
        if (!healthCheck) {
            console.log('❌ Backend is not running on port 3001');
            console.log('📝 Please start backend with: cd backend && npm run start:dev');
            return;
        }
        
        console.log('✅ Backend is running');
        
        // Test login to get token
        console.log('\n2. Testing login to get token...');
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            username: 'admin',
            password: 'admin123'
        }).catch(err => {
            console.log('❌ Login failed:', err.response?.data?.message || err.message);
            return null;
        });
        
        if (!loginResponse) {
            console.log('❌ Cannot get authentication token');
            return;
        }
        
        const token = loginResponse.data.access_token;
        console.log('✅ Login successful, token obtained');
        
        // Test delete-all endpoint
        console.log('\n3. Testing DELETE /shifts/delete-all endpoint...');
        const deleteResponse = await axios.delete('http://localhost:3001/shifts/delete-all', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            console.log('❌ Delete-all failed:', err.response?.data?.message || err.message);
            if (err.response?.status === 404) {
                console.log('💡 Endpoint not found - check if route is properly registered');
            }
            return null;
        });
        
        if (deleteResponse) {
            console.log('✅ Delete-all endpoint is working');
            console.log('📊 Response:', deleteResponse.data);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

// Check if axios is available
try {
    require('axios');
    testDeleteAllEndpoint();
} catch (err) {
    console.log('📦 Installing axios for testing...');
    const { execSync } = require('child_process');
    try {
        execSync('npm install axios', { stdio: 'inherit' });
        testDeleteAllEndpoint();
    } catch (installErr) {
        console.log('❌ Could not install axios. Please install manually: npm install axios');
    }
}
