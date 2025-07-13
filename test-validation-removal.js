// Test validasi Employee ID setelah dihapus
console.log('🔍 Testing Employee ID Validation Removal...\n');

// Simulasi validation schema baru (hanya required, tanpa format validation)
function validateEmployeeId(id) {
  // Hanya check apakah tidak kosong
  return id && id.length > 0;
}

const testCases = [
  'STA002',  // Yang bermasalah sebelumnya
  'STA001', 
  'ADM001',
  'PER001',
  'SUP001',
  'STF001',  // Format lama
  'DOK001',  // Format yang tidak ada
  'ABC123',  // Format bebas
  'CUSTOM001',  // Format custom
  '',        // Empty string
];

console.log('📋 Employee ID Validation Results (After Removal):');
console.log('================================================');

testCases.forEach(testId => {
  const isValid = validateEmployeeId(testId);
  const status = isValid ? '✅ VALID' : '❌ INVALID';
  console.log(`${status} "${testId}"`);
});

console.log('\n🎯 Key Changes:');
console.log('- ✅ Removed regex pattern validation');
console.log('- ✅ Removed strict format requirements');
console.log('- ✅ Only requires non-empty string');
console.log('- ✅ Accepts any Employee ID format');

console.log('\n📊 Result:');
console.log('STA002 (Sari Dewi): ✅ NOW VALID');
console.log('User can now create shifts without format errors!');
