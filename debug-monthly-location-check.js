// Debug script to check monthly scheduling duplication
console.log('=== Monthly Scheduling Duplication Analysis ===');

// Simulate September 2025 with only ICU selected
const year = 2025;
const month = 9; // September  
const selectedLocations = ['ICU']; // Only ICU was selected in the UI
const avgStaffPerShift = 4;

console.log(`\nAnalyzing monthly schedule for ${month}/${year}`);
console.log(`Selected locations: [${selectedLocations.join(', ')}]`);
console.log(`Average staff per shift: ${avgStaffPerShift}`);

const daysInMonth = new Date(year, month, 0).getDate();
console.log(`Days in September 2025: ${daysInMonth}`);

let totalExpectedShifts = 0;
let breakdown = [];

// Simulate the exact logic from createMonthlySchedule
for (let day = 1; day <= daysInMonth; day++) {
  const currentDate = new Date(year, month - 1, day);
  const dayOfWeek = currentDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // THIS IS THE KEY - check if locations are being processed correctly
  for (const location of selectedLocations) {
    const shiftCounts = {
      PAGI: isWeekend ? Math.ceil(avgStaffPerShift * 0.7) : avgStaffPerShift,
      SIANG: isWeekend ? Math.ceil(avgStaffPerShift * 0.8) : avgStaffPerShift, 
      MALAM: Math.ceil(avgStaffPerShift * 0.6)
    };
    
    let dayShifts = 0;
    for (const [shiftType, count] of Object.entries(shiftCounts)) {
      const shiftCount = Number(count);
      if (shiftCount > 0) {
        totalExpectedShifts += shiftCount;
        dayShifts += shiftCount;
      }
    }
    
    breakdown.push({
      day,
      location,
      isWeekend,
      shifts: shiftCounts,
      total: dayShifts
    });
  }
}

console.log(`\n=== CALCULATION RESULTS ===`);
console.log(`Expected total shifts: ${totalExpectedShifts}`);
console.log(`Actual system result: 93 shifts`);
console.log(`Difference: ${93 - totalExpectedShifts} extra shifts`);

console.log(`\n=== PROBLEM ANALYSIS ===`);
if (93 > totalExpectedShifts) {
  const ratio = 93 / totalExpectedShifts;
  console.log(`Ratio: ${ratio.toFixed(2)}x more than expected`);
  
  // Check common duplication patterns
  if (Math.abs(ratio - 2) < 0.1) {
    console.log('🚨 LIKELY CAUSE: Double execution or duplicate database inserts');
  } else if (Math.abs(ratio - 3) < 0.1) {
    console.log('🚨 LIKELY CAUSE: Processing 3 locations instead of 1 (ICU, RAWAT_INAP, GAWAT_DARURAT)');
  } else if (Math.abs(ratio - 4) < 0.1) {
    console.log('🚨 LIKELY CAUSE: Processing all 4 default locations');
  } else {
    console.log('🚨 UNKNOWN DUPLICATION PATTERN');
  }
}

console.log(`\n=== LOCATION FILTERING CHECK ===`);
console.log('In createMonthlySchedule method, locations are set as:');
console.log('const locations = request.locations || [\'ICU\', \'RAWAT_INAP\', \'GAWAT_DARURAT\', \'RAWAT_JALAN\'];');
console.log('');
console.log('If request.locations is undefined/empty, it defaults to ALL 4 locations!');
console.log('This could be the source of the duplication.');
