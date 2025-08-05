// Simple calculation of expected September 2025 shifts for ICU only
const year = 2025;
const month = 9; // September
const daysInMonth = new Date(year, month, 0).getDate(); // 30 days
const avgStaff = 4;

console.log('September 2025 has ' + daysInMonth + ' days');

let totalShifts = 0;
let weekdayCount = 0;
let weekendCount = 0;

for (let day = 1; day <= daysInMonth; day++) {
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (isWeekend) {
    weekendCount++;
    // Weekend: PAGI=3, SIANG=4, MALAM=3 = 10 shifts per day
    totalShifts += 3 + 4 + 3;
  } else {
    weekdayCount++;
    // Weekday: PAGI=4, SIANG=4, MALAM=3 = 11 shifts per day  
    totalShifts += 4 + 4 + 3;
  }
}

console.log('Weekdays: ' + weekdayCount);
console.log('Weekends: ' + weekendCount);
console.log('Expected total shifts for ICU only: ' + totalShifts);
console.log('Actual system result: 93');

if (totalShifts < 93) {
  const multiplier = 93 / totalShifts;
  console.log('System created ' + multiplier.toFixed(2) + 'x more shifts than expected');
  
  if (multiplier >= 2.9 && multiplier <= 3.1) {
    console.log('LIKELY CAUSE: Processing 3 locations instead of 1');
  } else if (multiplier >= 3.9 && multiplier <= 4.1) {
    console.log('LIKELY CAUSE: Processing all 4 locations instead of 1');
  }
}
