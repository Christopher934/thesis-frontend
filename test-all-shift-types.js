const axios = require('axios');

// Test all shift types with proper date and name conversion
async function testAllShiftTypes() {
  const baseURL = 'http://localhost:3001';
  
  // Login first
  const loginResponse = await axios.post(`${baseURL}/auth/login`, {
    email: 'admin@rsud.id',
    password: 'password123'
  });
  
  const token = loginResponse.data.access_token;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test configurations based on our analysis
  const shiftConfigs = [
    {
      name: 'GEDUNG_ADMINISTRASI',
      shifts: ['Reguler Senin-Kamis', 'Jumat'],
      testDate: '2025-01-13', // Monday
      employee: 'ADM001'
    },
    {
      name: 'RAWAT_JALAN',
      shifts: ['Senin-Jumat', 'Sabtu'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'RAWAT_INAP_3_SHIFT',
      shifts: ['Shift Pagi', 'Shift Sore', 'Shift Malam'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'GAWAT_DARURAT_3_SHIFT',
      shifts: ['Shift Pagi', 'Shift Sore', 'Shift Malam'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'LABORATORIUM_2_SHIFT',
      shifts: ['Shift Pagi', 'Shift Sore'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'FARMASI_2_SHIFT',
      shifts: ['Shift Pagi', 'Shift Sore'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'RADIOLOGI_2_SHIFT',
      shifts: ['Shift Pagi', 'Shift Sore'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'GIZI_2_SHIFT',
      shifts: ['Shift Pagi', 'Shift Sore'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'KEAMANAN_2_SHIFT',
      shifts: ['Shift Pagi', 'Shift Sore'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'LAUNDRY_REGULER',
      shifts: ['Reguler'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'CLEANING_SERVICE',
      shifts: ['Reguler'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    },
    {
      name: 'SUPIR_2_SHIFT',
      shifts: ['Shift Pagi', 'Shift Sore'],
      testDate: '2025-01-13', // Monday
      employee: 'STA002'
    }
  ];
  
  console.log('Testing all shift types with backend naming...\n');
  
  for (const config of shiftConfigs) {
    console.log(`\n=== Testing ${config.name} ===`);
    
    for (const shift of config.shifts) {
      try {
        const response = await axios.post(`${baseURL}/shifts`, {
          idpegawai: config.employee,
          shiftType: config.name,
          shiftName: shift, // Use backend naming directly
          startDate: config.testDate,
          endDate: config.testDate
        }, { headers });
        
        console.log(`✅ ${config.name} - ${shift}: SUCCESS`);
      } catch (error) {
        console.log(`❌ ${config.name} - ${shift}: ERROR`);
        console.log(`   Response: ${error.response?.data?.message || error.message}`);
      }
    }
  }
  
  console.log('\n=== Testing Frontend Conversion ===');
  
  // Test frontend to backend conversion
  const frontendToBackend = {
    'SHIFT_PAGI': {
      'GEDUNG_ADMINISTRASI': 'Reguler Senin-Kamis',
      'RAWAT_JALAN': 'Senin-Jumat',
      'RAWAT_INAP_3_SHIFT': 'Shift Pagi',
      'GAWAT_DARURAT_3_SHIFT': 'Shift Pagi',
      'LABORATORIUM_2_SHIFT': 'Shift Pagi',
      'FARMASI_2_SHIFT': 'Shift Pagi',
      'RADIOLOGI_2_SHIFT': 'Shift Pagi',
      'GIZI_2_SHIFT': 'Shift Pagi',
      'KEAMANAN_2_SHIFT': 'Shift Pagi',
      'SUPIR_2_SHIFT': 'Shift Pagi'
    },
    'SHIFT_SORE': {
      'RAWAT_INAP_3_SHIFT': 'Shift Sore',
      'GAWAT_DARURAT_3_SHIFT': 'Shift Sore',
      'LABORATORIUM_2_SHIFT': 'Shift Sore',
      'FARMASI_2_SHIFT': 'Shift Sore',
      'RADIOLOGI_2_SHIFT': 'Shift Sore',
      'GIZI_2_SHIFT': 'Shift Sore',
      'KEAMANAN_2_SHIFT': 'Shift Sore',
      'SUPIR_2_SHIFT': 'Shift Sore'
    },
    'SHIFT_MALAM': {
      'RAWAT_INAP_3_SHIFT': 'Shift Malam',
      'GAWAT_DARURAT_3_SHIFT': 'Shift Malam'
    }
  };
  
  for (const [frontendShift, typeMap] of Object.entries(frontendToBackend)) {
    console.log(`\n--- Testing ${frontendShift} conversion ---`);
    
    for (const [shiftType, expectedBackendName] of Object.entries(typeMap)) {
      try {
        const response = await axios.post(`${baseURL}/shifts`, {
          idpegawai: 'STA002',
          shiftType: shiftType,
          shiftName: expectedBackendName,
          startDate: '2025-01-13',
          endDate: '2025-01-13'
        }, { headers });
        
        console.log(`✅ ${shiftType} - ${frontendShift} → ${expectedBackendName}: SUCCESS`);
      } catch (error) {
        console.log(`❌ ${shiftType} - ${frontendShift} → ${expectedBackendName}: ERROR`);
        console.log(`   Response: ${error.response?.data?.message || error.message}`);
      }
    }
  }
}

testAllShiftTypes().catch(console.error);
