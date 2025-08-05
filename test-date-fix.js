#!/usr/bin/env node

/**
 * Test script untuk memverifikasi fix tanggal pada bulk scheduling
 * Memastikan tanggal yang dipilih user sama dengan hasil yang dibuat sistem
 */

const API_URL = 'http://localhost:3001';

async function testDateFix() {
    console.log('🧪 Testing Date Format Fix');
    console.log('==========================');
    
    // Test case: User pilih 04/08/2025 (4 Agustus 2025)
    const testDate = '2025-08-04'; // Format HTML date input
    
    console.log('📅 User input date:', testDate);
    console.log('📅 Expected result: Shifts untuk 4-10 Agustus 2025');
    console.log('📅 Days should be: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu');
    
    // Test local date parsing
    const localDate = new Date(testDate + 'T00:00:00.000+08:00');
    console.log('📅 Local date parsed:', localDate.toDateString());
    
    // Test backend logic simulation
    console.log('\n🖥️ Simulating Backend Date Processing:');
    
    // Simulate backend date parsing (our fix)
    const dateParts = testDate.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-based
    const day = parseInt(dateParts[2]);
    const startDate = new Date(year, month, day, 0, 0, 0, 0);
    
    console.log('✅ Backend parsed startDate:', startDate.toDateString());
    console.log('✅ ISO format:', startDate.toISOString().split('T')[0]);
    
    // Simulate 7 days generation
    console.log('\n📅 Expected 7 days schedule:');
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + dayIndex);
        
        const localYear = currentDate.getFullYear();
        const localMonth = currentDate.getMonth();
        const localDay = currentDate.getDate();
        const finalDate = new Date(localYear, localMonth, localDay, 0, 0, 0, 0);
        
        const dayName = finalDate.toLocaleDateString('id-ID', { weekday: 'long' });
        const dateStr = finalDate.toISOString().split('T')[0];
        
        console.log(`Day ${dayIndex + 1}: ${dateStr} (${dayName})`);
    }
    
    // Test API call if backend is running
    console.log('\n🔗 Testing API Call (if backend running):');
    
    const testRequest = {
        startDate: testDate,
        locations: ['ICU'],
        shiftPattern: {
            ICU: { PAGI: 2, SIANG: 2, MALAM: 1 }
        },
        priority: 'NORMAL'
    };
    
    try {
        const response = await fetch(`${API_URL}/admin/shift-optimization/create-weekly-schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(testRequest)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ API Response received');
            
            if (result.weeklySchedule?.assignments) {
                console.log('📊 Created shifts count:', result.weeklySchedule.assignments.length);
                
                // Analyze dates in created shifts
                const createdDates = [...new Set(result.weeklySchedule.assignments.map(a => a.date))].sort();
                console.log('📅 Dates in created shifts:', createdDates);
                
                // Check if first date matches input
                if (createdDates[0] === testDate) {
                    console.log('🎉 SUCCESS: First shift date matches input date!');
                } else {
                    console.log('❌ FAILED: Date mismatch detected');
                    console.log('Expected first date:', testDate);
                    console.log('Actual first date:', createdDates[0]);
                }
            }
        } else {
            console.log('⚠️ API call failed:', response.status);
            const error = await response.text();
            console.log('Error:', error.substring(0, 200));
        }
    } catch (error) {
        console.log('⚠️ API test skipped:', error.message);
        console.log('Make sure backend is running at', API_URL);
    }
}

// Test format tanggal Indonesia
function testIndonesianDateFormat() {
    console.log('\n🇮🇩 Testing Indonesian Date Format:');
    
    const testDate = '2025-08-04';
    const date = new Date(testDate + 'T00:00:00.000+08:00');
    
    console.log('Input:', testDate);
    console.log('toLocaleDateString("id-ID"):', date.toLocaleDateString('id-ID'));
    console.log('toLocaleDateString("id-ID", {weekday: "long"}):', date.toLocaleDateString('id-ID', { weekday: 'long' }));
    console.log('toLocaleDateString("id-ID", {day: "2-digit", month: "short", year: "numeric"}):', 
        date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }));
}

async function runTests() {
    console.log('🔍 Testing Fix untuk Masalah Format Tanggal');
    console.log('============================================');
    console.log('Problem: User pilih 04/08/2025, sistem buat shift untuk 08 Apr 2025');
    console.log('Solution: Fix timezone handling dan date parsing di backend');
    console.log('');
    
    await testDateFix();
    testIndonesianDateFormat();
    
    console.log('\n📋 Summary:');
    console.log('Jika test berhasil, tanggal yang dipilih user akan sama');
    console.log('dengan tanggal shifts yang dibuat sistem.');
}

runTests().catch(console.error);
