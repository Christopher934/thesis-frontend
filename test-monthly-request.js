// Create a test API call to check what's being sent to the backend
console.log('=== Testing Monthly Schedule Request ===');

// Simulate the exact request that would be sent from the frontend
const monthlyRequest = {
  year: 2025,
  month: 9, // September
  locations: ['ICU'], // Only ICU selected
  averageStaffPerShift: {
    'ICU': 4 // 4 staff per shift for ICU
  },
  workloadLimits: {
    maxShiftsPerPerson: 18,
    maxConsecutiveDays: 4
  }
};

console.log('Request being sent to backend:');
console.log(JSON.stringify(monthlyRequest, null, 2));

// Simulate what the backend should process
const locations = monthlyRequest.locations || ['ICU', 'RAWAT_INAP', 'GAWAT_DARURAT', 'RAWAT_JALAN'];
console.log('\nLocations that backend will process:');
console.log(locations);

if (locations.length > 1) {
  console.log('\n🚨 PROBLEM FOUND!');
  console.log('Backend is processing multiple locations even though only ICU was selected');
  console.log('This explains why 93 shifts were created instead of ~31');
} else {
  console.log('\n✅ Location filtering looks correct');
}

// Calculate expected shifts for September 2025
const daysInMonth = new Date(2025, 9, 0).getDate(); // 30 days
let expectedShifts = 0;

for (let day = 1; day <= daysInMonth; day++) {
  const date = new Date(2025, 8, day); // September = month 8 (0-indexed)
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  const avgStaff = 4; // From the UI
  const shiftCounts = {
    PAGI: isWeekend ? Math.ceil(avgStaff * 0.7) : avgStaff,
    SIANG: isWeekend ? Math.ceil(avgStaff * 0.8) : avgStaff,
    MALAM: Math.ceil(avgStaff * 0.6)
  };
  
  expectedShifts += shiftCounts.PAGI + shiftCounts.SIANG + shiftCounts.MALAM;
}

console.log(`\n=== CALCULATION FOR ICU ONLY ===`);
console.log(`Expected shifts for September 2025: ${expectedShifts}`);
console.log(`Actual system result: 93`);
console.log(`Ratio: ${(93 / expectedShifts).toFixed(2)}x`);

if (93 > expectedShifts) {
  console.log('\n🚨 DUPLICATION CONFIRMED');
  console.log('The system is creating more shifts than expected');
}
