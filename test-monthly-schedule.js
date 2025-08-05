/**
 * Test script untuk monthly schedule
 */

// Test payload untuk monthly scheduling
const testMonthlySchedule = {
  year: 2025,
  month: 8,  // August
  locations: ['ICU', 'GAWAT_DARURAT'],
  staffPattern: {
    'ICU': {
      PAGI: { DOKTER: 2, PERAWAT: 3, STAFF: 1 },
      SIANG: { DOKTER: 1, PERAWAT: 2, STAFF: 1 },
      MALAM: { DOKTER: 1, PERAWAT: 2, STAFF: 0 }
    },
    'GAWAT_DARURAT': {
      PAGI: { DOKTER: 3, PERAWAT: 4, STAFF: 2 },
      SIANG: { DOKTER: 2, PERAWAT: 3, STAFF: 1 },
      MALAM: { DOKTER: 1, PERAWAT: 2, STAFF: 1 }
    }
  },
  workloadLimits: {
    maxShiftsPerPerson: 15,
    maxConsecutiveDays: 4
  }
};

console.log('🧪 Test Monthly Schedule Payload:');
console.log(JSON.stringify(testMonthlySchedule, null, 2));

// Test API call
async function testMonthlyAPI() {
  try {
    const response = await fetch('http://localhost:3001/admin/scheduling/monthly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify(testMonthlySchedule)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Monthly Schedule Result:', result);
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// Uncomment to test (make sure backend is running)
// testMonthlyAPI();

module.exports = { testMonthlySchedule };
