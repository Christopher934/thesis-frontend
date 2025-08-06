/**
 * Test Enhanced 2-Shift Daily Limit Validation
 * This test specifically validates the enhanced checkDateConflict method
 * and the calculateEnhancedUserFitnessScore method
 */

console.log('🧪 Testing Enhanced Daily Shift Limit Validation');

// Mock user data simulating someone who already has shifts
const mockUserWithShifts = {
  id: 1,
  namaDepan: 'Tari',
  namaBelakang: 'Firmansyah',
  role: 'DOKTER',
  shifts: [
    {
      id: 1,
      tanggal: new Date('2025-08-07'),
      tipeshift: 'PAGI',
      lokasiEnum: 'ICU'
    },
    {
      id: 2,
      tanggal: new Date('2025-08-07'),
      tipeshift: 'SIANG',
      lokasiEnum: 'GAWAT_DARURAT'
    }
  ]
};

const mockUserWithOneShift = {
  id: 2,
  namaDepan: 'Test',
  namaBelakang: 'User',
  role: 'PERAWAT',
  shifts: [
    {
      id: 3,
      tanggal: new Date('2025-08-07'),
      tipeshift: 'PAGI',
      lokasiEnum: 'ICU'
    }
  ]
};

const mockUserWithNoShifts = {
  id: 3,
  namaDepan: 'Fresh',
  namaBelakang: 'User',
  role: 'PERAWAT',
  shifts: []
};

// Mock shift optimization service methods
class MockShiftOptimizationService {
  checkDateConflict(user, targetDate) {
    // Enhanced logic: Check if user already has 2 or more shifts on target date
    if (!user.shifts || user.shifts.length === 0) return false;
    
    const targetDateStr = targetDate;
    
    const shiftsOnDate = user.shifts.filter((shift) => {
      const shiftDateStr = shift.tanggal instanceof Date 
        ? shift.tanggal.toISOString().split('T')[0]
        : shift.tanggal.split('T')[0];
      
      return shiftDateStr === targetDateStr;
    });
    
    console.log(`🔍 Checking daily limit: User ${user.id} has ${shiftsOnDate.length} shifts on ${targetDateStr} (max 2 allowed)`);
    
    // Return true (conflict) if user already has 2 or more shifts on this date
    return shiftsOnDate.length >= 2;
  }

  calculateEnhancedUserFitnessScore(user, request, currentAssignments) {
    // Start with base score
    let score = 50;
    
    // Check if user already has 2+ shifts using the enhanced logic
    if (this.checkDateConflict(user, request.date)) {
      console.log(
        `🚫 ENHANCED VALIDATION: User ${user.id} already has 2+ shifts on ${request.date} - BLOCKING`,
      );
      return 0; // Completely block assignment
    }

    // Additional validation with current assignments context
    const userAssignmentsOnDate = currentAssignments.filter(
      assignment => assignment.userId === user.id && 
                   assignment.shiftDetails.date === request.date
    );

    // STRICT ENFORCEMENT: Maximum 2 shifts per day (including new assignments)
    if (userAssignmentsOnDate.length >= 2) {
      console.log(
        `🚫 CURRENT ASSIGNMENTS LIMIT: User ${user.id} already has ${userAssignmentsOnDate.length} current assignments on ${request.date}`,
      );
      return 0;
    }

    // Check total shifts for the day (existing + current assignments)
    const existingShiftsOnDate = user.shifts ? user.shifts.filter(shift => {
      const shiftDateStr = shift.tanggal instanceof Date 
        ? shift.tanggal.toISOString().split('T')[0]
        : shift.tanggal.split('T')[0];
      return shiftDateStr === request.date;
    }).length : 0;

    const totalShiftsOnDate = existingShiftsOnDate + userAssignmentsOnDate.length;
    
    if (totalShiftsOnDate >= 2) {
      console.log(
        `🚫 TOTAL DAILY LIMIT: User ${user.id} would have ${totalShiftsOnDate + 1} total shifts on ${request.date} (existing: ${existingShiftsOnDate}, current: ${userAssignmentsOnDate.length})`,
      );
      return 0;
    }

    console.log(`✅ User ${user.id} can receive shift on ${request.date} (existing: ${existingShiftsOnDate}, current: ${userAssignmentsOnDate.length})`);
    return score;
  }
}

const service = new MockShiftOptimizationService();

// Test cases
console.log('\n📋 Test Case 1: User with 2 existing shifts (should be blocked)');
const conflict1 = service.checkDateConflict(mockUserWithShifts, '2025-08-07');
console.log(`Result: ${conflict1 ? '✅ CORRECTLY BLOCKED' : '❌ SHOULD BE BLOCKED'}`);

const fitness1 = service.calculateEnhancedUserFitnessScore(
  mockUserWithShifts, 
  { date: '2025-08-07', shiftType: 'MALAM', location: 'RAWAT_INAP' },
  []
);
console.log(`Fitness Score: ${fitness1} (should be 0)`);

console.log('\n📋 Test Case 2: User with 1 existing shift (should be allowed for second)');
const conflict2 = service.checkDateConflict(mockUserWithOneShift, '2025-08-07');
console.log(`Result: ${conflict2 ? '❌ SHOULD NOT BE BLOCKED' : '✅ CORRECTLY ALLOWED'}`);

const fitness2 = service.calculateEnhancedUserFitnessScore(
  mockUserWithOneShift, 
  { date: '2025-08-07', shiftType: 'SIANG', location: 'GAWAT_DARURAT' },
  []
);
console.log(`Fitness Score: ${fitness2} (should be > 0)`);

console.log('\n📋 Test Case 3: User with no existing shifts (should be allowed)');
const conflict3 = service.checkDateConflict(mockUserWithNoShifts, '2025-08-07');
console.log(`Result: ${conflict3 ? '❌ SHOULD NOT BE BLOCKED' : '✅ CORRECTLY ALLOWED'}`);

const fitness3 = service.calculateEnhancedUserFitnessScore(
  mockUserWithNoShifts, 
  { date: '2025-08-07', shiftType: 'PAGI', location: 'ICU' },
  []
);
console.log(`Fitness Score: ${fitness3} (should be > 0)`);

console.log('\n📋 Test Case 4: User with 1 existing + 1 current assignment (should be blocked for 3rd)');
const currentAssignments = [
  {
    userId: 2,
    shiftDetails: { date: '2025-08-07', shiftType: 'SIANG', location: 'GAWAT_DARURAT' }
  }
];

const fitness4 = service.calculateEnhancedUserFitnessScore(
  mockUserWithOneShift,
  { date: '2025-08-07', shiftType: 'MALAM', location: 'RAWAT_INAP' },
  currentAssignments
);
console.log(`Result: ${fitness4 === 0 ? '✅ CORRECTLY BLOCKED' : '❌ SHOULD BE BLOCKED'}`);
console.log(`Fitness Score: ${fitness4} (should be 0)`);

console.log('\n📊 Summary:');
console.log(`- Test 1 (2 existing, block 3rd): ${conflict1 && fitness1 === 0 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`- Test 2 (1 existing, allow 2nd): ${!conflict2 && fitness2 > 0 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`- Test 3 (0 existing, allow 1st): ${!conflict3 && fitness3 > 0 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`- Test 4 (1 existing + 1 current, block 3rd): ${fitness4 === 0 ? '✅ PASS' : '❌ FAIL'}`);

const allPassed = (conflict1 && fitness1 === 0) && 
                 (!conflict2 && fitness2 > 0) && 
                 (!conflict3 && fitness3 > 0) && 
                 (fitness4 === 0);

console.log(`\n🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
console.log('🎉 Enhanced validation should prevent Tari from getting more than 2 shifts per day!');
