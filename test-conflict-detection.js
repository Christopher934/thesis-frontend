/**
 * Test script to verify the improved conflict detection algorithm
 * Tests whether the enhanced hasShiftConflict method prevents multiple shifts on same day
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testConflictDetection() {
  console.log('🧪 Testing Enhanced Conflict Detection Algorithm...\n');

  try {
    // Test 1: Use the test-enhanced-algorithm endpoint
    console.log('📋 Test 1: Testing enhanced algorithm with potential conflicts...');
    
    const testShifts = [
      {
        date: '2025-08-06',
        location: 'ICU',
        shiftType: 'PAGI',
        requiredCount: 1,
        priority: 'HIGH'
      },
      {
        date: '2025-08-06', // Same date
        location: 'ICU', // Same location
        shiftType: 'SIANG', // Different shift type (should conflict)
        requiredCount: 1,
        priority: 'HIGH'
      },
      {
        date: '2025-08-06', // Same date again
        location: 'Gawat Darurat',
        shiftType: 'MALAM', // Different location and time (should still conflict)
        requiredCount: 1,
        priority: 'HIGH'
      }
    ];

    // Test with enhanced algorithm
    console.log('🤖 Testing enhanced algorithm with conflict detection...');
    
    const enhancedAlgorithmResponse = await axios.post(`${API_BASE}/admin-shift-optimization/test-enhanced-algorithm`, {
      requests: testShifts,
      options: {
        enableConflictDetection: true,
        maxIterations: 50,
        workloadBalancing: true
      }
    });

    console.log('✅ Enhanced algorithm response received');
    console.log('📊 Results Summary:');
    console.log(`- Total shifts created: ${enhancedAlgorithmResponse.data.assignments?.length || 0}`);
    console.log(`- Success rate: ${enhancedAlgorithmResponse.data.successRate || 0}%`);
    
    // Analyze assignments for conflicts
    const assignments = enhancedAlgorithmResponse.data.assignments || [];
    const userShiftsByDate = {};
    let conflictCount = 0;

    assignments.forEach(assignment => {
      const userId = assignment.userId;
      const date = assignment.shiftDetails.date;
      const key = `${userId}-${date}`;
      
      if (!userShiftsByDate[key]) {
        userShiftsByDate[key] = [];
      }
      userShiftsByDate[key].push(assignment);
    });

    // Check for conflicts
    Object.entries(userShiftsByDate).forEach(([key, shifts]) => {
      if (shifts.length > 1) {
        conflictCount++;
        const [userId, date] = key.split('-');
        console.log(`🚫 CONFLICT DETECTED: User ${userId} has ${shifts.length} shifts on ${date}`);
        shifts.forEach((shift, index) => {
          console.log(`   ${index + 1}. ${shift.shiftDetails.shiftType} at ${shift.shiftDetails.location}`);
        });
      }
    });

    if (conflictCount === 0) {
      console.log('✅ SUCCESS: No conflicts detected! Algorithm working correctly.');
    } else {
      console.log(`❌ FAILED: ${conflictCount} conflicts still exist.`);
    }

    // Test 2: Check existing data for conflicts
    console.log('\n📋 Test 2: Checking existing shifts for conflicts...');
    
    const existingShiftsResponse = await axios.get(`${API_BASE}/shift`);
    const existingShifts = existingShiftsResponse.data;
    
    console.log(`📊 Analyzing ${existingShifts.length} existing shifts...`);
    
    const existingConflicts = {};
    existingShifts.forEach(shift => {
      const key = `${shift.idpegawai}-${shift.tanggal}`;
      if (!existingConflicts[key]) {
        existingConflicts[key] = [];
      }
      existingConflicts[key].push(shift);
    });

    let existingConflictCount = 0;
    Object.entries(existingConflicts).forEach(([key, shifts]) => {
      if (shifts.length > 1) {
        existingConflictCount++;
        const [userId, date] = key.split('-');
        console.log(`🚫 EXISTING CONFLICT: User ${userId} has ${shifts.length} shifts on ${date}`);
        shifts.forEach((shift, index) => {
          console.log(`   ${index + 1}. ${shift.tipeshift} (${shift.jammulai}-${shift.jamselesai}) at ${shift.lokasishift}`);
        });
      }
    });

    if (existingConflictCount === 0) {
      console.log('✅ No existing conflicts found in database.');
    } else {
      console.log(`⚠️  Found ${existingConflictCount} existing conflicts in database.`);
      console.log('💡 Consider running cleanup to remove duplicate shifts.');
    }

    // Test 3: Try create-optimal-shifts endpoint
    console.log('\n📋 Test 3: Testing create-optimal-shifts endpoint...');
    
    try {
      const optimalShiftsResponse = await axios.post(`${API_BASE}/admin-shift-optimization/create-optimal-shifts`, {
        requests: testShifts.slice(0, 1), // Only test with one shift first
        constraints: {
          maxShiftsPerMonth: 20,
          maxConsecutiveDays: 3,
          maxConsecutiveNightShifts: 2,
          maxWeeklyShifts: 5,
          minRestBetweenShifts: 8
        }
      });

      console.log('✅ Optimal shifts endpoint working');
      console.log(`📊 Created ${optimalShiftsResponse.data.assignments?.length || 0} optimal shifts`);
      
    } catch (optimalError) {
      console.log('⚠️  Optimal shifts endpoint error:', optimalError.response?.data?.message || optimalError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    // If main test fails, let's at least check existing data
    try {
      console.log('\n🔍 Fallback: Checking existing shifts only...');
      const existingShiftsResponse = await axios.get(`${API_BASE}/shift`);
      const existingShifts = existingShiftsResponse.data;
      
      console.log(`📊 Found ${existingShifts.length} existing shifts`);
      
      // Look specifically for Tari Firmansyah's shifts
      const tariShifts = existingShifts.filter(shift => shift.nama && shift.nama.includes('Tari'));
      console.log(`👤 Tari Firmansyah has ${tariShifts.length} shifts`);
      
      // Group by date
      const tariByDate = {};
      tariShifts.forEach(shift => {
        const date = shift.tanggal;
        if (!tariByDate[date]) {
          tariByDate[date] = [];
        }
        tariByDate[date].push(shift);
      });
      
      // Check for conflicts
      Object.entries(tariByDate).forEach(([date, shifts]) => {
        if (shifts.length > 1) {
          console.log(`🚫 TARI CONFLICT on ${date}: ${shifts.length} shifts`);
          shifts.forEach((shift, index) => {
            console.log(`   ${index + 1}. ${shift.tipeshift} (${shift.jammulai}-${shift.jamselesai}) at ${shift.lokasishift}`);
          });
        }
      });
      
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError.message);
    }
  }
}

// Run the test
testConflictDetection();
