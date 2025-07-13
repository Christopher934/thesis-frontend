// Comprehensive test untuk semua shift types
console.log('🔍 Comprehensive Shift Name Analysis...\n');

// Backend shift names (dari shift-type.config.ts)
const backendShiftNames = {
  'GEDUNG_ADMINISTRASI': ['Reguler Senin-Kamis', 'Jumat'],
  'RAWAT_JALAN': ['Senin-Jumat', 'Sabtu'],
  'RAWAT_INAP_3_SHIFT': ['Shift Pagi', 'Shift Sore', 'Shift Malam'],
  'GAWAT_DARURAT_3_SHIFT': ['Shift Pagi', 'Shift Sore', 'Shift Malam'],
  'LABORATORIUM_2_SHIFT': ['Shift Pagi', 'Shift Malam'],
  'FARMASI_2_SHIFT': ['Shift Pagi', 'Shift Malam'],
  'RADIOLOGI_2_SHIFT': ['Shift Pagi', 'Shift Malam'],
  'GIZI_2_SHIFT': ['Shift Pagi', 'Shift Malam'],
  'KEAMANAN_2_SHIFT': ['Shift Pagi', 'Shift Malam'],
  'LAUNDRY_REGULER': ['Senin-Jumat', 'Sabtu'],
  'CLEANING_SERVICE': ['Senin-Jumat', 'Sabtu'],
  'SUPIR_2_SHIFT': ['Shift Pagi', 'Shift Malam']
};

// Frontend shift names (dari RSUD_SHIFT_TYPES)
const frontendShiftNames = {
  'GEDUNG_ADMINISTRASI': ['SHIFT_PAGI'],
  'RAWAT_JALAN': ['SHIFT_PAGI'],
  'RAWAT_INAP_3_SHIFT': ['SHIFT_PAGI', 'SHIFT_SIANG', 'SHIFT_MALAM'],
  'GAWAT_DARURAT_3_SHIFT': ['SHIFT_PAGI', 'SHIFT_SIANG', 'SHIFT_MALAM'],
  'LABORATORIUM_2_SHIFT': ['SHIFT_PAGI', 'SHIFT_MALAM'],
  'FARMASI_2_SHIFT': ['SHIFT_PAGI', 'SHIFT_MALAM']
};

// Current conversion function
function convertShiftNameForBackend(frontendShiftName) {
  const shiftNameMapping = {
    'SHIFT_PAGI': 'Shift Pagi',
    'SHIFT_SIANG': 'Shift Sore', // Backend uses "Shift Sore"
    'SHIFT_MALAM': 'Shift Malam',
    'SHIFT_SORE': 'Shift Sore'
  };
  
  return shiftNameMapping[frontendShiftName] || frontendShiftName;
}

console.log('📋 MISMATCH ANALYSIS BY SHIFT TYPE:');
console.log('=====================================');

Object.keys(frontendShiftNames).forEach(shiftType => {
  console.log(`\n🏢 ${shiftType}:`);
  console.log(`Backend: [${backendShiftNames[shiftType].join(', ')}]`);
  console.log(`Frontend: [${frontendShiftNames[shiftType].join(', ')}]`);
  
  const mismatches = [];
  frontendShiftNames[shiftType].forEach(frontendName => {
    const convertedName = convertShiftNameForBackend(frontendName);
    const isValid = backendShiftNames[shiftType].includes(convertedName);
    
    if (!isValid) {
      mismatches.push(`${frontendName} → "${convertedName}" ❌ NOT FOUND`);
    } else {
      console.log(`  ✅ ${frontendName} → "${convertedName}" MATCH`);
    }
  });
  
  if (mismatches.length > 0) {
    console.log(`  ❌ MISMATCHES:`);
    mismatches.forEach(mismatch => console.log(`    ${mismatch}`));
  }
});

console.log('\n🔍 SPECIAL CASES DETECTED:');
console.log('=========================');

// GEDUNG_ADMINISTRASI issue
console.log('1. GEDUNG_ADMINISTRASI:');
console.log('   Frontend: SHIFT_PAGI');
console.log('   Backend: Reguler Senin-Kamis, Jumat');
console.log('   ❌ COMPLETELY DIFFERENT NAMING SYSTEM');

// RAWAT_JALAN issue  
console.log('\n2. RAWAT_JALAN:');
console.log('   Frontend: SHIFT_PAGI');
console.log('   Backend: Senin-Jumat, Sabtu');
console.log('   ❌ COMPLETELY DIFFERENT NAMING SYSTEM');

// SHIFT_SIANG vs Shift Sore
console.log('\n3. 3-SHIFT SYSTEMS:');
console.log('   Frontend: SHIFT_SIANG');
console.log('   Backend: Shift Sore');
console.log('   ✅ HANDLED BY CONVERSION FUNCTION');

console.log('\n🚨 CRITICAL ISSUES FOUND:');
console.log('=========================');
console.log('❌ GEDUNG_ADMINISTRASI: Frontend uses generic SHIFT_PAGI, Backend has specific schedule names');
console.log('❌ RAWAT_JALAN: Frontend uses generic SHIFT_PAGI, Backend has specific schedule names');
console.log('❌ Missing shift types in frontend: RADIOLOGI, GIZI, KEAMANAN, LAUNDRY, CLEANING, SUPIR');

console.log('\n💡 RECOMMENDATIONS:');
console.log('===================');
console.log('1. ✅ Keep current conversion for 3-shift and 2-shift systems');
console.log('2. ❌ Need special handling for GEDUNG_ADMINISTRASI and RAWAT_JALAN');
console.log('3. 📝 Add missing shift types to frontend configuration');
console.log('4. 🔧 Update conversion function to handle all cases');
