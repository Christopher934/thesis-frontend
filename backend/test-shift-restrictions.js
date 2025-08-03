import axios from 'axios';

const API_BASE = 'http://localhost:3001';
const AUTH_TOKEN = 'your-jwt-token-here'; // Replace with actual token

// Helper function to make authenticated requests
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testShiftRestrictions() {
  console.log('🔍 TESTING SHIFT RESTRICTIONS SYSTEM');
  console.log('=======================================\n');

  try {
    // 1. Test Single Shift Validation
    console.log('1️⃣ Testing Single Shift Validation...');
    const shiftRequest = {
      userId: 1,
      date: '2024-07-31',
      startTime: '2024-07-31T07:00:00',
      endTime: '2024-07-31T15:00:00',
      location: 'ICU',
      shiftType: 'PAGI',
      requiredRole: 'DOKTER'
    };

    const validationResponse = await api.post('/shift-restrictions/validate', shiftRequest);
    console.log('✅ Validation Response:', JSON.stringify(validationResponse.data, null, 2));
    console.log('');

    // 2. Test Bulk Shift Validation
    console.log('2️⃣ Testing Bulk Shift Validation...');
    const bulkRequest = {
      shifts: [
        {
          userId: 1,
          date: '2024-07-31',
          startTime: '2024-07-31T07:00:00',
          endTime: '2024-07-31T15:00:00',
          location: 'ICU',
          shiftType: 'PAGI'
        },
        {
          userId: 2,
          date: '2024-07-31',
          startTime: '2024-07-31T15:00:00',
          endTime: '2024-07-31T23:00:00',
          location: 'GAWAT_DARURAT',
          shiftType: 'SIANG'
        },
        {
          userId: 3,
          date: '2024-07-31',
          startTime: '2024-07-31T23:00:00',
          endTime: '2024-08-01T07:00:00',
          location: 'RAWAT_INAP',
          shiftType: 'MALAM'
        }
      ]
    };

    const bulkResponse = await api.post('/shift-restrictions/validate-bulk', bulkRequest);
    console.log('✅ Bulk Validation Response:', JSON.stringify(bulkResponse.data, null, 2));
    console.log('');

    // 3. Test Shift Optimization
    console.log('3️⃣ Testing Shift Optimization...');
    const optimizeRequest = {
      date: '2024-08-01',
      location: 'ICU',
      shiftType: 'PAGI',
      requiredRole: 'DOKTER'
    };

    const optimizeResponse = await api.post('/shift-restrictions/optimize', optimizeRequest);
    console.log('✅ Optimization Response:', JSON.stringify(optimizeResponse.data, null, 2));
    console.log('');

    // 4. Test Getting Restriction Rules
    console.log('4️⃣ Testing Get Restriction Rules...');
    const rulesResponse = await api.get('/shift-restrictions/rules');
    console.log('✅ Rules Response:', JSON.stringify(rulesResponse.data, null, 2));
    console.log('');

    // 5. Test Compliance Report
    console.log('5️⃣ Testing Compliance Report...');
    const complianceResponse = await api.get('/shift-restrictions/compliance-report', {
      params: {
        startDate: '2024-07-01',
        endDate: '2024-07-31'
      }
    });
    console.log('✅ Compliance Report:', JSON.stringify(complianceResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

// Test specific restriction scenarios
async function testSpecificScenarios() {
  console.log('\n🎯 TESTING SPECIFIC RESTRICTION SCENARIOS');
  console.log('==========================================\n');

  const scenarios = [
    {
      name: 'Workload Limit Test',
      description: 'User with too many shifts this month',
      request: {
        userId: 1,
        date: '2024-07-31',
        startTime: '2024-07-31T07:00:00',
        endTime: '2024-07-31T15:00:00',
        location: 'ICU',
        shiftType: 'PAGI'
      }
    },
    {
      name: 'Time Conflict Test',
      description: 'User already has shift at the same time',
      request: {
        userId: 1,
        date: '2024-07-31',
        startTime: '2024-07-31T08:00:00',
        endTime: '2024-07-31T16:00:00',
        location: 'GAWAT_DARURAT',
        shiftType: 'PAGI'
      }
    },
    {
      name: 'Role Mismatch Test',
      description: 'Assigning user to incompatible role',
      request: {
        userId: 3,
        date: '2024-08-01',
        startTime: '2024-08-01T07:00:00',
        endTime: '2024-08-01T15:00:00',
        location: 'KAMAR_OPERASI',
        shiftType: 'PAGI',
        requiredRole: 'DOKTER_SPESIALIS'
      }
    },
    {
      name: 'Location Access Test',
      description: 'User without access to specific location',
      request: {
        userId: 2,
        date: '2024-08-01',
        startTime: '2024-08-01T15:00:00',
        endTime: '2024-08-01T23:00:00',
        location: 'KAMAR_OPERASI',
        shiftType: 'SIANG'
      }
    },
    {
      name: 'Consecutive Days Test',
      description: 'User working too many consecutive days',
      request: {
        userId: 1,
        date: '2024-08-05',
        startTime: '2024-08-05T07:00:00',
        endTime: '2024-08-05T15:00:00',
        location: 'ICU',
        shiftType: 'PAGI'
      }
    }
  ];

  for (const scenario of scenarios) {
    try {
      console.log(`🧪 ${scenario.name}:`);
      console.log(`   ${scenario.description}`);
      
      const response = await api.post('/shift-restrictions/validate', scenario.request);
      
      console.log(`   Result: ${response.data.data.isValid ? '✅ VALID' : '❌ INVALID'}`);
      console.log(`   Score: ${response.data.data.score}/100`);
      
      if (response.data.data.violations.length > 0) {
        console.log('   Violations:');
        response.data.data.violations.forEach(violation => {
          console.log(`     - ${violation}`);
        });
      }
      
      if (response.data.data.warnings.length > 0) {
        console.log('   Warnings:');
        response.data.data.warnings.forEach(warning => {
          console.log(`     - ${warning}`);
        });
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Error testing ${scenario.name}:`);
      console.error('   ', error.response?.data?.message || error.message);
      console.log('');
    }
  }
}

// Performance test
async function performanceTest() {
  console.log('\n⚡ PERFORMANCE TEST');
  console.log('==================\n');

  const startTime = Date.now();
  const testRequests = [];

  // Generate 50 random shift validation requests
  for (let i = 0; i < 50; i++) {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30));
    
    testRequests.push({
      userId: Math.floor(Math.random() * 10) + 1,
      date: randomDate.toISOString().split('T')[0],
      startTime: randomDate.toISOString().split('T')[0] + 'T07:00:00',
      endTime: randomDate.toISOString().split('T')[0] + 'T15:00:00',
      location: ['ICU', 'GAWAT_DARURAT', 'RAWAT_INAP'][Math.floor(Math.random() * 3)],
      shiftType: ['PAGI', 'SIANG', 'MALAM'][Math.floor(Math.random() * 3)]
    });
  }

  try {
    const bulkResponse = await api.post('/shift-restrictions/validate-bulk', {
      shifts: testRequests
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  Processed ${testRequests.length} validations in ${duration}ms`);
    console.log(`📊 Average: ${(duration / testRequests.length).toFixed(2)}ms per validation`);
    console.log(`✅ Valid shifts: ${bulkResponse.data.data.summary.validShifts}`);
    console.log(`❌ Invalid shifts: ${bulkResponse.data.data.summary.invalidShifts}`);
    console.log(`📈 Overall compliance: ${bulkResponse.data.data.summary.overallCompliance.toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Performance test failed:', error.response?.data?.message || error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE SHIFT RESTRICTIONS TESTS\n');
  
  await testShiftRestrictions();
  await testSpecificScenarios();
  await performanceTest();
  
  console.log('\n🎉 ALL TESTS COMPLETED!');
}

// Execute tests
runAllTests().catch(console.error);
