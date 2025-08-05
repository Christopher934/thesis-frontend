console.log('=== Enhanced Date Parsing Fix Test ===');

// Simulate the fixed parsing logic from EnhancedShiftTable
function parseAndFormatDate(dateToUse) {
  try {
    let dateObj;
    
    // Check if it's in YYYY-MM-DD format (backend format)
    if (typeof dateToUse === 'string' && dateToUse.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log(`  → Detected YYYY-MM-DD format: ${dateToUse}`);
      dateObj = new Date(dateToUse);
    }
    // Check if it's in DD/MM/YYYY format (frontend display format)
    else if (typeof dateToUse === 'string' && dateToUse.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      console.log(`  → Detected DD/MM/YYYY format: ${dateToUse}`);
      const [day, month, year] = dateToUse.split('/').map(num => parseInt(num, 10));
      console.log(`  → Parsed as: day=${day}, month=${month-1}, year=${year}`);
      dateObj = new Date(year, month - 1, day); // month is 0-indexed
    }
    // Fallback to default Date parsing
    else {
      console.log(`  → Fallback parsing: ${dateToUse}`);
      dateObj = new Date(dateToUse);
    }
    
    if (isNaN(dateObj.getTime())) {
      return `INVALID DATE: ${dateToUse}`;
    }
    
    // Format like "Sen, 04 Agu 2025" (Monday, 4 August 2025)
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

// Test cases
const testCases = [
  { input: '2025-08-04', description: 'Backend format (should be Sen, 04 Agu 2025)' },
  { input: '04/08/2025', description: 'User input DD/MM/YYYY (should be Sen, 04 Agu 2025)' },
  { input: '08/04/2025', description: 'Ambiguous format (fallback parsing)' },
  { input: '2025-12-25', description: 'Backend Christmas (should be Kam, 25 Des 2025)' },
  { input: '25/12/2025', description: 'DD/MM/YYYY Christmas (should be Kam, 25 Des 2025)' },
];

testCases.forEach(testCase => {
  console.log(`\n--- ${testCase.description} ---`);
  console.log(`Input: "${testCase.input}"`);
  const result = parseAndFormatDate(testCase.input);
  console.log(`Result: "${result}"`);
});

console.log('\n=== User Specific Test Case ===');
console.log('User input: "04/08/2025" (expects 4 August 2025)');
console.log('Expected: "Sen, 04 Agu 2025"');
const userResult = parseAndFormatDate('04/08/2025');
console.log(`Actual: "${userResult}"`);
console.log(`✅ Fixed: ${userResult === 'Sen, 04 Agu 2025' ? 'YES' : 'NO'}`);
