console.log('=== Frontend Date Formatting Debug ===');

// Test various date inputs and formats
const testCases = [
  { input: '2025-08-04', description: 'Backend YYYY-MM-DD format' },
  { input: '04/08/2025', description: 'User input DD/MM/YYYY format' },
  { input: '08/04/2025', description: 'US MM/DD/YYYY format' },
];

testCases.forEach(testCase => {
  console.log(`\n--- Testing: ${testCase.description} ---`);
  console.log(`Input: "${testCase.input}"`);
  
  try {
    const dateObj = new Date(testCase.input);
    console.log(`Date object: ${dateObj}`);
    console.log(`ISO string: ${dateObj.toISOString()}`);
    console.log(`getTime(): ${dateObj.getTime()}`);
    console.log(`isNaN check: ${isNaN(dateObj.getTime())}`);
    
    if (!isNaN(dateObj.getTime())) {
      const formatted = dateObj.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      console.log(`Indonesian format: "${formatted}"`);
    }
  } catch (error) {
    console.error(`Error parsing "${testCase.input}":`, error);
  }
});

// Test the specific case from user's report
console.log('\n=== User Specific Case ===');
console.log('User input: "04/08/2025" (4 August 2025)');
console.log('Expected: "Sen, 04 Agu 2025" (Monday, 4 August 2025)');

// Manual parsing of DD/MM/YYYY format
const userInput = '04/08/2025';
const parts = userInput.split('/');
if (parts.length === 3) {
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  
  console.log(`Parsed as: day=${day}, month=${month}, year=${year}`);
  
  const correctDate = new Date(year, month, day);
  console.log(`Correct date object: ${correctDate}`);
  
  const correctFormatted = correctDate.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  console.log(`Correct Indonesian format: "${correctFormatted}"`);
}
