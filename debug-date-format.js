#!/usr/bin/env node

/**
 * Test script untuk menganalisis masalah format tanggal
 * User input: 04/08/2025 (kemungkinan 4 Agustus 2025)
 * System output: 08 Apr 2025 (8 April 2025)
 */

console.log('🔍 ANALISIS MASALAH FORMAT TANGGAL');
console.log('=================================');

// Simulasi input user dari date picker HTML
const userInput = '2025-08-04'; // Format ISO yang dikirim HTML date input
console.log('Input dari HTML date picker:', userInput);

// Bagaimana JavaScript memproses ini
const jsDate = new Date(userInput);
console.log('JavaScript Date object:', jsDate);
console.log('toISOString():', jsDate.toISOString());
console.log('toLocaleDateString("id-ID"):', jsDate.toLocaleDateString('id-ID'));
console.log('toLocaleDateString("id-ID", { weekday: "long" }):', jsDate.toLocaleDateString('id-ID', { weekday: 'long' }));

console.log('\n🌍 TIMEZONE ANALYSIS:');
console.log('Date toString():', jsDate.toString());
console.log('Date toUTCString():', jsDate.toUTCString());
console.log('getTimezoneOffset():', jsDate.getTimezoneOffset(), 'minutes');

// Test different date interpretations
console.log('\n📅 BERBAGAI INTERPRETASI TANGGAL:');

const testDates = [
    '2025-08-04',  // ISO format (YYYY-MM-DD)
    '2025-04-08',  // ISO format terbalik
    '04/08/2025',  // US format (MM/DD/YYYY) 
    '08/04/2025',  // US format terbalik
];

testDates.forEach(dateStr => {
    const d = new Date(dateStr);
    console.log(`${dateStr} -> ${d.toLocaleDateString('id-ID')} (${d.toLocaleDateString('id-ID', { weekday: 'long' })})`);
});

console.log('\n🔧 SOLUSI YANG DISARANKAN:');
console.log('1. Pastikan frontend mengirim format ISO (YYYY-MM-DD)');
console.log('2. Backend harus handle timezone dengan konsisten');
console.log('3. Gunakan explicit date parsing untuk menghindari ambiguitas');

// Test bagaimana backend memproses tanggal
console.log('\n🖥️ SIMULASI BACKEND PROCESSING:');
const backendStartDate = new Date('2025-08-04');
console.log('Backend startDate:', backendStartDate);

for (let day = 0; day < 3; day++) {
    const currentDate = new Date(backendStartDate);
    currentDate.setDate(currentDate.getDate() + day);
    currentDate.setHours(0, 0, 0, 0);
    
    console.log(`Day ${day + 1}: ${currentDate.toISOString().split('T')[0]} (${currentDate.toLocaleDateString('id-ID', { weekday: 'long' })})`);
}

// Recommended fix
console.log('\n✅ REKOMENDASI FIX:');
console.log('Gunakan explicit UTC parsing untuk konsistensi:');

function parseUserDate(dateString) {
    // Pastikan format YYYY-MM-DD dan parse sebagai UTC
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

const fixedDate = parseUserDate('2025-08-04');
console.log('Fixed parsing result:', fixedDate.toISOString().split('T')[0]);
console.log('Fixed display (id-ID):', fixedDate.toLocaleDateString('id-ID', { weekday: 'long' }));
