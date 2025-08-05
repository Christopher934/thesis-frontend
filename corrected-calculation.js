// Recalculate properly
console.log('=== CORRECTED CALCULATION ===');

// September 2025 details
const year = 2025;
const month = 9; // September
const daysInMonth = new Date(year, month, 0).getDate(); // 30 days

console.log(`September ${year} has ${daysInMonth} days`);

// From the UI: 4 staff per shift average
const avgStaffPerShift = 4;

let totalShifts = 0;
let weekdays = 0;
let weekends = 0;

for (let day = 1; day <= daysInMonth; day++) {
  // Correct month index: September = 8 (0-indexed)
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // From backend logic:
  const shiftCounts = {
    PAGI: isWeekend ? Math.ceil(avgStaffPerShift * 0.7) : avgStaffPerShift,
    SIANG: isWeekend ? Math.ceil(avgStaffPerShift * 0.8) : avgStaffPerShift,
    MALAM: Math.ceil(avgStaffPerShift * 0.6)
  };
  
  const dayTotal = shiftCounts.PAGI + shiftCounts.SIANG + shiftCounts.MALAM;
  totalShifts += dayTotal;
  
  if (isWeekend) {
    weekends++;
  } else {
    weekdays++;
  }
  
  if (day <= 7) {
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
    console.log(`Day ${day} (${dayName}${isWeekend ? ' - Weekend' : ''}): PAGI=${shiftCounts.PAGI}, SIANG=${shiftCounts.SIANG}, MALAM=${shiftCounts.MALAM} = ${dayTotal} total`);
  }
}

console.log(`\nWeekdays: ${weekdays}, Weekends: ${weekends}`);
console.log(`Total shifts calculated: ${totalShifts}`);
console.log(`System created: 93 shifts`);

// The key insight: Each shift count represents REQUIRED STAFF, not NUMBER OF SHIFTS
console.log(`\n=== KEY INSIGHT ===`);
console.log('Each "shift" in the calculation represents ONE PERSON working that shift');
console.log('So 4 PAGI shifts means 4 PEOPLE working the morning shift, not 4 separate shifts');
console.log(`${totalShifts} represents the total number of PERSON-SHIFTS (individual assignments)`);
console.log('But the UI shows "93 shift dibuat" which could mean 93 database records');

if (totalShifts > 93) {
  console.log(`\n🤔 ANALYSIS:`);
  console.log(`Expected ${totalShifts} person-shifts but only ${93} were created`);
  console.log('This suggests the scheduling algorithm couldn\'t find enough available staff');
  console.log('OR there\'s an issue with the assignment logic');
}
