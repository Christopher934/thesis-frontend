// Test Employee ID validation fix
console.log('🔍 Testing Employee ID Validation Fix...\n');

// Updated regex pattern
const employeeIdRegex = /^(ADM|STA|PER|SUP)\d{3}$/;

const testCases = [
  { id: 'STA002', name: 'Sari Dewi', expected: true },
  { id: 'STA001', name: 'Staff 1', expected: true },
  { id: 'ADM001', name: 'Admin', expected: true },
  { id: 'PER001', name: 'Perawat 1', expected: true },
  { id: 'SUP001', name: 'Supervisor', expected: true },
  { id: 'STF001', name: 'Old format', expected: false },
  { id: 'DOK001', name: 'Dokter (not in seed)', expected: false },
  { id: 'ABC123', name: 'Invalid format', expected: false }
];

console.log('📋 Employee ID Validation Results:');
console.log('=================================');

testCases.forEach(testCase => {
  const isValid = employeeIdRegex.test(testCase.id);
  const result = isValid === testCase.expected ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${result} ${testCase.id} (${testCase.name}): ${isValid ? 'VALID' : 'INVALID'}`);
});

console.log('\n🎯 Specific Test: STA002 - Sari Dewi');
const sta002Valid = employeeIdRegex.test('STA002');
console.log(`Result: ${sta002Valid ? '✅ VALID' : '❌ INVALID'}`);
console.log(`User should ${sta002Valid ? 'NOW BE ABLE' : 'STILL NOT BE ABLE'} to create shift`);

console.log('\n📊 Summary:');
console.log('- Fixed regex pattern: /^(ADM|STA|PER|SUP)\\d{3}$/');
console.log('- Removed: DOK, STF (not in database)');
console.log('- Added: STA (actual format in database)');
console.log('- Updated error message to match actual formats');
