// Test managemen jadwal page with fresh token
const axios = require('axios');

async function testWithFreshToken() {
    console.log('🔑 Getting fresh token...');
    
    const baseURL = 'http://localhost:3001';
    
    try {
        // Login to get fresh token
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@rsud.id',
            password: 'password123'
        });
        
        const token = loginResponse.data.access_token;
        console.log('✅ Got fresh token');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Test shifts endpoint
        console.log('\n📋 Testing /shifts endpoint...');
        try {
            const shiftsResponse = await axios.get(`${baseURL}/shifts`, { headers });
            console.log(`✅ Shifts: ${shiftsResponse.data.length} records`);
            
            if (shiftsResponse.data.length > 0) {
                console.log('Sample shift:', JSON.stringify(shiftsResponse.data[0], null, 2));
            }
        } catch (error) {
            console.log('❌ Shifts error:', error.response?.data || error.message);
        }
        
        // Test users endpoint
        console.log('\n👥 Testing /users endpoint...');
        try {
            const usersResponse = await axios.get(`${baseURL}/users`, { headers });
            console.log(`✅ Users: ${usersResponse.data.length} records`);
            
            if (usersResponse.data.length > 0) {
                console.log('Sample user:', JSON.stringify(usersResponse.data[0], null, 2));
            }
        } catch (error) {
            console.log('❌ Users error:', error.response?.data || error.message);
        }
        
        // Test creating a shift to see if that works
        console.log('\n🔧 Testing shift creation...');
        try {
            const createResponse = await axios.post(`${baseURL}/shifts`, {
                idpegawai: 'STA002',
                shiftType: 'RAWAT_INAP_3_SHIFT',
                shiftName: 'Shift Pagi',
                startDate: '2025-01-14',
                endDate: '2025-01-14'
            }, { headers });
            
            console.log('✅ Shift created successfully:', createResponse.data);
        } catch (error) {
            console.log('❌ Shift creation error:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.response?.data || error.message);
    }
}

testWithFreshToken();
