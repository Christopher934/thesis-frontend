console.log('=== Monthly Scheduling Duplication Debug ===');

// Simulate the monthly scheduling logic to find duplication issue
function debugMonthlyScheduling() {
  // From the screenshot: September 2025, only ICU selected, 4 staff per shift
  const year = 2025;
  const month = 9; // September
  const selectedLocations = ['ICU']; // Only ICU selected
  const avgStaffPerShift = 4;
  
  console.log(`Debugging monthly schedule for ${month}/${year}`);
  console.log(`Selected locations: ${selectedLocations.join(', ')}`);
  console.log(`Average staff per shift: ${avgStaffPerShift}`);
  
  const daysInMonth = new Date(year, month, 0).getDate();
  console.log(`Days in September 2025: ${daysInMonth}`);
  
  let totalShiftsCalculated = 0;
  let detailedBreakdown = [];
  
  // Simulate the loop from the monthly scheduling
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
    
    for (const location of selectedLocations) {
      // This is the logic from the monthly scheduling
      const shiftCounts = {
        PAGI: isWeekend ? Math.ceil(avgStaffPerShift * 0.7) : avgStaffPerShift,
        SIANG: isWeekend ? Math.ceil(avgStaffPerShift * 0.8) : avgStaffPerShift,
        MALAM: Math.ceil(avgStaffPerShift * 0.6) // Night shifts always have fewer staff
      };
      
      let dayTotal = 0;
      for (const [shiftType, count] of Object.entries(shiftCounts)) {
        const shiftCount = Number(count);
        if (shiftCount > 0) {
          totalShiftsCalculated += shiftCount;
          dayTotal += shiftCount;
        }
      }
      
      detailedBreakdown.push({
        day: day,
        dayName: dayName,
        isWeekend: isWeekend,
        location: location,
        PAGI: shiftCounts.PAGI,
        SIANG: shiftCounts.SIANG,
        MALAM: shiftCounts.MALAM,
        dayTotal: dayTotal
      });
    }
  }
  
  console.log('\n=== Calculation Results ===');
  console.log(`Total shifts calculated: ${totalShiftsCalculated}`);
  console.log(`Actual result from system: 93 shifts`);
  console.log(`Difference: ${93 - totalShiftsCalculated}`);
  
  console.log('\n=== First 7 days breakdown ===');
  detailedBreakdown.slice(0, 7).forEach(day => {
    console.log(`Day ${day.day} (${day.dayName}${day.isWeekend ? ' - Weekend' : ''}): PAGI=${day.PAGI}, SIANG=${day.SIANG}, MALAM=${day.MALAM}, Total=${day.dayTotal}`);
  });
  
  console.log('\n=== Analysis ===');
  const weekdays = detailedBreakdown.filter(d => !d.isWeekend).length;
  const weekends = detailedBreakdown.filter(d => d.isWeekend).length;
  
  console.log(`Weekdays: ${weekdays}, Weekends: ${weekends}`);
  console.log(`Expected weekday shifts per day: PAGI=4, SIANG=4, MALAM=3 = 11 total`);
  console.log(`Expected weekend shifts per day: PAGI=3, SIANG=4, MALAM=3 = 10 total`);
  console.log(`Expected total: (${weekdays} × 11) + (${weekends} × 10) = ${(weekdays * 11) + (weekends * 10)}`);
  
  return {
    calculated: totalShiftsCalculated,
    actual: 93,
    expected: (weekdays * 11) + (weekends * 10)
  };
}

const result = debugMonthlyScheduling();

console.log('\n=== DUPLICATION ANALYSIS ===');
if (result.actual > result.calculated) {
  console.log('🚨 DUPLICATION DETECTED!');
  console.log(`The system created ${result.actual - result.calculated} extra shifts`);
  console.log('Possible causes:');
  console.log('1. Multiple locations being processed despite only ICU selected');
  console.log('2. Database insertion happening multiple times');
  console.log('3. Shift assignment logic creating duplicate entries');
} else {
  console.log('✅ No duplication detected in calculation logic');
}
