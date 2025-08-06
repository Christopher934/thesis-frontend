/**
 * Test the improved conflict detection algorithm
 * This will verify that the enhanced hasShiftConflict method works correctly
 */

console.log('🧪 Testing Enhanced Conflict Detection Algorithm\n');

// Simulate the improved conflict detection logic
function parseTimeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function getShiftStartTime(shiftType) {
  const times = {
    'PAGI': '06:00',
    'SIANG': '14:00', 
    'MALAM': '22:00',
    'ON_CALL': '08:00',
    'JAGA': '00:00'
  };
  return times[shiftType] || '00:00';
}

function getShiftEndTime(shiftType) {
  const times = {
    'PAGI': '14:00',
    'SIANG': '22:00',
    'MALAM': '06:00', // Next day
    'ON_CALL': '17:00',
    'JAGA': '23:59'
  };
  return times[shiftType] || '23:59';
}

function hasTimeOverlap(start1, end1, start2, end2) {
  // Handle overnight shifts (end time is next day)
  if (end1 < start1) end1 += 24 * 60; // Add 24 hours
  if (end2 < start2) end2 += 24 * 60; // Add 24 hours

  const hasOverlap = start1 < end2 && start2 < end1;
  
  if (hasOverlap) {
    console.log(`⚠️ TIME OVERLAP: ${Math.floor(start1/60)}:${(start1%60).toString().padStart(2,'0')}-${Math.floor(end1/60)}:${(end1%60).toString().padStart(2,'0')} overlaps with ${Math.floor(start2/60)}:${(start2%60).toString().padStart(2,'0')}-${Math.floor(end2/60)}:${(end2%60).toString().padStart(2,'0')}`);
  }
  
  return hasOverlap;
}

function hasShiftConflict(userId, date, currentSolution, newShift) {
  const userShiftsOnDate = currentSolution.filter(
    assignment => assignment.userId === userId && assignment.date === date
  );

  // RULE 1: Maximum 2 shifts per person per day
  if (userShiftsOnDate.length >= 2) {
    console.log(`🚫 MAX SHIFTS EXCEEDED: User ${userId} already has ${userShiftsOnDate.length} shifts on ${date}`);
    return true;
  }

  // If no existing shifts on this date, no conflict
  if (userShiftsOnDate.length === 0) {
    return false;
  }

  // RULE 2: If we have a new shift to check, validate time conflicts
  if (newShift) {
    const newStartTime = parseTimeToMinutes(getShiftStartTime(newShift.shiftType));
    const newEndTime = parseTimeToMinutes(getShiftEndTime(newShift.shiftType));

    for (const existingAssignment of userShiftsOnDate) {
      const existingStart = parseTimeToMinutes(getShiftStartTime(existingAssignment.shiftType));
      const existingEnd = parseTimeToMinutes(getShiftEndTime(existingAssignment.shiftType));

      // Check for time overlap
      if (hasTimeOverlap(newStartTime, newEndTime, existingStart, existingEnd)) {
        console.log(`🚫 TIME CONFLICT: User ${userId} shift ${newShift.shiftType} (${getShiftStartTime(newShift.shiftType)}-${getShiftEndTime(newShift.shiftType)}) overlaps with existing ${existingAssignment.shiftType} (${getShiftStartTime(existingAssignment.shiftType)}-${getShiftEndTime(existingAssignment.shiftType)})`);
        return true;
      }
    }

    // RULE 3: Check for same location conflicts  
    for (const existingAssignment of userShiftsOnDate) {
      if (existingAssignment.location === newShift.location) {
        console.log(`🚫 LOCATION CONFLICT: User ${userId} already assigned to ${newShift.location} on ${date}`);
        return true;
      }
    }
  }

  return false;
}

// Test Cases
console.log('📋 Test Case 1: Valid 2 non-overlapping shifts');
const user1Shifts = [
  { userId: 1, date: '2025-08-06', shiftType: 'PAGI', location: 'ICU' }
];
const newShift1 = { shiftType: 'MALAM', location: 'Gawat Darurat' };
const conflict1 = hasShiftConflict(1, '2025-08-06', user1Shifts, newShift1);
console.log(`Result: ${conflict1 ? '❌ CONFLICT' : '✅ NO CONFLICT'}\n`);

console.log('📋 Test Case 2: Invalid - 3rd shift (exceeds maximum)');
const user2Shifts = [
  { userId: 2, date: '2025-08-06', shiftType: 'PAGI', location: 'ICU' },
  { userId: 2, date: '2025-08-06', shiftType: 'MALAM', location: 'Farmasi' }
];
const newShift2 = { shiftType: 'SIANG', location: 'Radiologi' };
const conflict2 = hasShiftConflict(2, '2025-08-06', user2Shifts, newShift2);
console.log(`Result: ${conflict2 ? '✅ CORRECTLY BLOCKED' : '❌ SHOULD BE BLOCKED'}\n`);

console.log('📋 Test Case 3: Valid - Adjacent shifts (PAGI + SIANG)');
console.log('  PAGI: 06:00-14:00, SIANG: 14:00-22:00');
console.log('  These should NOT overlap as 14:00 is the boundary (handover time)');
const user3Shifts = [
  { userId: 3, date: '2025-08-06', shiftType: 'PAGI', location: 'ICU' }
];
const newShift3 = { shiftType: 'SIANG', location: 'Gawat Darurat' };
const conflict3 = hasShiftConflict(3, '2025-08-06', user3Shifts, newShift3);
console.log(`Result: ${conflict3 ? '❌ INCORRECTLY BLOCKED' : '✅ CORRECTLY ALLOWED'}\n`);

console.log('📋 Test Case 3b: Invalid - True overlap (simulated with overlapping times)');
console.log('  Shift1: 06:00-15:00, Shift2: 14:00-22:00 (1 hour overlap)');
// Manually test real overlap
const overlap1Start = parseTimeToMinutes('06:00'); // 360
const overlap1End = parseTimeToMinutes('15:00');   // 900 (extended by 1 hour)
const overlap2Start = parseTimeToMinutes('14:00'); // 840
const overlap2End = parseTimeToMinutes('22:00');   // 1320

const trueOverlap = hasTimeOverlap(overlap1Start, overlap1End, overlap2Start, overlap2End);
console.log(`True overlap test result: ${trueOverlap ? '✅ CORRECTLY DETECTED' : '❌ MISSED OVERLAP'}\n`);

console.log('📋 Test Case 4: Invalid - Same location conflict');
const user4Shifts = [
  { userId: 4, date: '2025-08-06', shiftType: 'PAGI', location: 'ICU' }
];
const newShift4 = { shiftType: 'MALAM', location: 'ICU' };
const conflict4 = hasShiftConflict(4, '2025-08-06', user4Shifts, newShift4);
console.log(`Result: ${conflict4 ? '✅ CORRECTLY BLOCKED' : '❌ SHOULD BE BLOCKED'}\n`);

console.log('📋 Test Case 5: Valid - PAGI + MALAM (non-overlapping, different locations)');
const user5Shifts = [
  { userId: 5, date: '2025-08-06', shiftType: 'PAGI', location: 'ICU' }
];
const newShift5 = { shiftType: 'MALAM', location: 'Gawat Darurat' };
const conflict5 = hasShiftConflict(5, '2025-08-06', user5Shifts, newShift5);
console.log(`Result: ${conflict5 ? '❌ INCORRECTLY BLOCKED' : '✅ CORRECTLY ALLOWED'}\n`);

console.log('📊 Summary:');
console.log('- Test 1 (Valid non-overlap): ' + (conflict1 ? '❌ FAIL' : '✅ PASS'));
console.log('- Test 2 (3rd shift block): ' + (conflict2 ? '✅ PASS' : '❌ FAIL')); 
console.log('- Test 3 (Adjacent shifts PAGI+SIANG): ' + (conflict3 ? '❌ FAIL' : '✅ PASS'));
console.log('- Test 3b (True overlap detection): ' + (trueOverlap ? '✅ PASS' : '❌ FAIL'));
console.log('- Test 4 (Location conflict block): ' + (conflict4 ? '✅ PASS' : '❌ FAIL'));
console.log('- Test 5 (Valid PAGI+MALAM): ' + (conflict5 ? '❌ FAIL' : '✅ PASS'));

const passedTests = [!conflict1, conflict2, !conflict3, trueOverlap, conflict4, !conflict5].filter(Boolean).length;
console.log(`\n🎯 Overall: ${passedTests}/6 tests passed`);

if (passedTests === 6) {
  console.log('🎉 All tests passed! Algorithm should prevent conflicts correctly.');
} else {
  console.log('⚠️ Some tests failed. Algorithm needs adjustment.');
}
