console.log('=== ANALISIS DUPLIKASI MONTHLY SCHEDULING ===');
console.log('');

// Dari screenshot: Agustus 2025, ICU saja, 4 staff per shift
const month = 8; // Agustus
const year = 2025;
const selectedLocations = ['ICU'];
const staffPerShift = 4;

// Hitung hari dalam Agustus 2025
const daysInMonth = new Date(year, month, 0).getDate(); // 31 hari
console.log(`Agustus ${year} memiliki ${daysInMonth} hari`);

// Simulasi perhitungan berdasarkan logika backend
let totalExpected = 0;
let weekdays = 0;
let weekends = 0;

for (let day = 1; day <= daysInMonth; day++) {
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (isWeekend) {
    weekends++;
  } else {
    weekdays++;
  }
  
  // Berdasarkan logika backend:
  const shiftCounts = {
    PAGI: isWeekend ? Math.ceil(staffPerShift * 0.7) : staffPerShift,   // 3 atau 4
    SIANG: isWeekend ? Math.ceil(staffPerShift * 0.8) : staffPerShift,  // 4 atau 4  
    MALAM: Math.ceil(staffPerShift * 0.6)  // 3
  };
  
  totalExpected += shiftCounts.PAGI + shiftCounts.SIANG + shiftCounts.MALAM;
}

console.log(`Weekdays: ${weekdays}, Weekends: ${weekends}`);
console.log(`Expected total shifts untuk ICU saja: ${totalExpected}`);
console.log('');

console.log('=== HASIL DARI SISTEM ===');
console.log('Modal result: 218 shifts untuk 8/2025');
console.log('Dashboard total: 549 shifts');
console.log('');

console.log('=== ANALISIS MASALAH ===');
const ratio = 549 / 218;
console.log(`Ratio duplikasi: ${ratio.toFixed(2)}x`);

if (Math.abs(ratio - 2.5) < 0.2) {
  console.log('🚨 KEMUNGKINAN: Shifts dibuat 2-3 kali (double/triple execution)');
} else if (Math.abs(ratio - 3) < 0.2) {
  console.log('🚨 KEMUNGKINAN: Processing 3 locations meski hanya ICU dipilih');
} else {
  console.log('🚨 KEMUNGKINAN: Multiple executions atau logic error');
}

console.log('');
console.log('=== MASALAH BULAN BERJALAN ===');
console.log('User bertanya: "apa yang terjadi bila membuat jadwal bulan yang sedang berjalan di pertengahan bulan"');
console.log('');
console.log('POTENTIAL ISSUES:');
console.log('1. Sistem mungkin membuat shifts untuk hari yang sudah lewat');
console.log('2. Conflicts dengan shifts existing di database');
console.log('3. Duplikasi karena ada shifts manual yang sudah dibuat sebelumnya');
console.log('4. Logika tidak memfilter tanggal yang sudah lewat');
console.log('');
console.log('CURRENT DATE: 4 Agustus 2025 (pertengahan bulan)');
console.log('Jika sistem membuat shifts untuk 1-31 Agustus, maka:');
console.log('- Tanggal 1-4 Agustus sudah lewat (harus di-skip)');
console.log('- Hanya tanggal 5-31 yang perlu dijadwalkan');
console.log('- Tapi sistem mungkin tetap membuat untuk 1-31 (causing duplicates)');
