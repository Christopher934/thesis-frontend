// Test shift name conversion fix
console.log('🔍 Testing Shift Name Conversion Fix...\n');

// Fungsi konversi yang sama seperti di frontend
function convertShiftNameForBackend(frontendShiftName) {
  const shiftNameMapping = {
    'SHIFT_PAGI': 'Shift Pagi',
    'SHIFT_SIANG': 'Shift Sore', // Backend menggunakan "Shift Sore"
    'SHIFT_MALAM': 'Shift Malam',
    'SHIFT_SORE': 'Shift Sore'
  };
  
  return shiftNameMapping[frontendShiftName] || frontendShiftName;
}

// Backend shift names dari konfigurasi
const backendShiftNames = {
  'RAWAT_INAP_3_SHIFT': ['Shift Pagi', 'Shift Sore', 'Shift Malam'],
  'GAWAT_DARURAT_3_SHIFT': ['Shift Pagi', 'Shift Sore', 'Shift Malam'],
  'GEDUNG_ADMINISTRASI': ['Reguler Senin-Kamis', 'Jumat']
};

console.log('📋 Shift Name Conversion Results:');
console.log('=================================');

const testCases = [
  { frontend: 'SHIFT_PAGI', shiftType: 'RAWAT_INAP_3_SHIFT' },
  { frontend: 'SHIFT_SIANG', shiftType: 'RAWAT_INAP_3_SHIFT' },
  { frontend: 'SHIFT_MALAM', shiftType: 'RAWAT_INAP_3_SHIFT' },
  { frontend: 'SHIFT_PAGI', shiftType: 'GAWAT_DARURAT_3_SHIFT' }
];

testCases.forEach(testCase => {
  const converted = convertShiftNameForBackend(testCase.frontend);
  const availableShifts = backendShiftNames[testCase.shiftType] || [];
  const isValid = availableShifts.includes(converted);
  
  const status = isValid ? '✅ VALID' : '❌ INVALID';
  console.log(`${status} ${testCase.frontend} → "${converted}" (${testCase.shiftType})`);
});

console.log('\n🎯 Specific Problem Test:');
console.log('Frontend sends: "SHIFT_PAGI"');
console.log('Backend expects: "Shift Pagi"');
console.log('Converted result:', convertShiftNameForBackend('SHIFT_PAGI'));
console.log('Match with backend:', backendShiftNames['RAWAT_INAP_3_SHIFT'].includes(convertShiftNameForBackend('SHIFT_PAGI')) ? '✅ YES' : '❌ NO');

console.log('\n🔧 Fix Summary:');
console.log('- Added convertShiftNameForBackend() function');
console.log('- Maps frontend names to backend names');
console.log('- shiftOption now sends converted name');
console.log('- Should resolve "not available" errors');
