const axios = require('axios');

// Test shift type configurations without authentication
async function testShiftTypeConfigurations() {
  const baseURL = 'http://localhost:3001';
  
  console.log('Testing shift type configurations...\n');
  
  try {
    // Test getting shift types
    const response = await axios.get(`${baseURL}/shift-types`);
    console.log('✅ Shift types endpoint accessible');
    console.log('Available shift types:', Object.keys(response.data));
    
    // Test each shift type configuration
    for (const [shiftType, config] of Object.entries(response.data)) {
      console.log(`\n--- ${shiftType} ---`);
      console.log(`Days: ${config.days?.join(', ') || 'N/A'}`);
      console.log(`Shifts: ${config.shifts?.map(s => s.name).join(', ') || 'N/A'}`);
    }
    
  } catch (error) {
    console.log('❌ Error accessing shift types');
    console.log('Response:', error.response?.data || error.message);
  }
  
  // Test specific shift validation
  console.log('\n=== Testing Shift Validation ===');
  
  const testCases = [
    {
      shiftType: 'GEDUNG_ADMINISTRASI',
      shiftName: 'SHIFT_PAGI',
      date: '2025-01-13' // Monday
    },
    {
      shiftType: 'GEDUNG_ADMINISTRASI',
      shiftName: 'Reguler Senin-Kamis',
      date: '2025-01-13' // Monday
    },
    {
      shiftType: 'RAWAT_JALAN',
      shiftName: 'SHIFT_PAGI',
      date: '2025-01-13' // Monday
    },
    {
      shiftType: 'RAWAT_JALAN',
      shiftName: 'Senin-Jumat',
      date: '2025-01-13' // Monday
    },
    {
      shiftType: 'RAWAT_INAP_3_SHIFT',
      shiftName: 'SHIFT_PAGI',
      date: '2025-01-13' // Monday
    },
    {
      shiftType: 'RAWAT_INAP_3_SHIFT',
      shiftName: 'Shift Pagi',
      date: '2025-01-13' // Monday
    }
  ];
  
  for (const test of testCases) {
    try {
      const response = await axios.get(`${baseURL}/shift-types/${test.shiftType}/validate`, {
        params: {
          shiftName: test.shiftName,
          date: test.date
        }
      });
      
      console.log(`✅ ${test.shiftType} - ${test.shiftName}: Valid`);
    } catch (error) {
      console.log(`❌ ${test.shiftType} - ${test.shiftName}: Invalid`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
  }
}

testShiftTypeConfigurations().catch(console.error);
