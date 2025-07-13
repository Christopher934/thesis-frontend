// Debug script to test managemen jadwal page API calls
const DEBUG_API = true;

// Mock localStorage for testing
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1MjQwMTgwMiwiZXhwIjoxNzUzMDA2NjAyfQ.MNLbw28oaijw7NivWjJC0Tv-RHC_TcDQf3YHVbrna1DA';

async function testManagemenJadwalAPI() {
    console.log('🔍 Testing Managemen Jadwal API endpoints...');
    
    const baseURL = 'http://localhost:3001';
    const headers = {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
    };
    
    try {
        // Test 1: Get shifts endpoint
        console.log('\n📋 Testing /shifts endpoint...');
        const shiftsResponse = await fetch(`${baseURL}/shifts`, { headers });
        console.log(`Status: ${shiftsResponse.status}`);
        
        if (shiftsResponse.ok) {
            const shiftsData = await shiftsResponse.json();
            console.log(`✅ Shifts data received: ${shiftsData.length} records`);
            console.log('First shift:', shiftsData[0]);
        } else {
            const errorText = await shiftsResponse.text();
            console.log(`❌ Shifts error: ${errorText}`);
        }
        
        // Test 2: Get users endpoint  
        console.log('\n👥 Testing /users endpoint...');
        const usersResponse = await fetch(`${baseURL}/users`, { headers });
        console.log(`Status: ${usersResponse.status}`);
        
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            console.log(`✅ Users data received: ${usersData.length} records`);
            console.log('First user:', usersData[0]);
        } else {
            const errorText = await usersResponse.text();
            console.log(`❌ Users error: ${errorText}`);
        }
        
        // Test 3: Check if backend is running
        console.log('\n🏥 Testing backend health...');
        try {
            const healthResponse = await fetch(`${baseURL}/`);
            console.log(`Health status: ${healthResponse.status}`);
            const healthText = await healthResponse.text();
            console.log('Backend response:', healthText);
        } catch (healthError) {
            console.log('❌ Backend not accessible:', healthError.message);
        }
        
    } catch (error) {
        console.error('❌ API Test failed:', error);
    }
}

// Test data processing issues
function testDataProcessing() {
    console.log('\n🔧 Testing data processing functions...');
    
    // Test date formatting
    const testDates = [
        '2025-01-13',
        '2025-01-13T00:00:00.000Z',
        '13/01/2025'
    ];
    
    testDates.forEach(date => {
        try {
            const result = formatDateForDisplay(date);
            console.log(`Date "${date}" → formatted: "${result.formatted}", original: "${result.original}"`);
        } catch (error) {
            console.log(`❌ Date format error for "${date}":`, error.message);
        }
    });
    
    // Test location formatting
    const testLocations = [
        'GEDUNG_ADMINISTRASI',
        'RAWAT_INAP_3_SHIFT',
        'UGD'
    ];
    
    testLocations.forEach(location => {
        try {
            const result = formatLokasiShift(location);
            console.log(`Location "${location}" → "${result}"`);
        } catch (error) {
            console.log(`❌ Location format error for "${location}":`, error.message);
        }
    });
}

// Copy the functions from the component for testing
function formatDateForDisplay(dateStr) {
    if (!dateStr) return { formatted: '', original: '' };
    
    let formattedDate = dateStr;
    let originalDate = dateStr;
    
    try {
        // Handle ISO format dates (YYYY-MM-DD)
        if (dateStr.includes('-') && !dateStr.includes('T')) {
            const [year, month, day] = dateStr.split('-');
            formattedDate = `${day}/${month}/${year}`;
            originalDate = dateStr; // Keep the YYYY-MM-DD format
        }
        // Handle ISO string format with T (e.g. "2025-06-10T00:00:00.000Z")
        else if (dateStr.includes('T')) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                formattedDate = `${day}/${month}/${year}`;
                originalDate = dateStr;
            }
        }
    } catch (error) {
        console.warn('Date formatting error:', error);
        return { formatted: dateStr, original: dateStr };
    }
    
    return { formatted: formattedDate, original: originalDate };
}

function formatLokasiShift(lokasi) {
    if (!lokasi) return '-';
    
    // Replace underscores with spaces and capitalize each word
    return lokasi
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Run tests
testManagemenJadwalAPI();
testDataProcessing();
