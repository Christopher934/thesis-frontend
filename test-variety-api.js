const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// Test data
const testData = {
    // Token untuk admin (ganti dengan token yang valid)
    adminToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AaG9zcGl0YWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzM2MzQzNzgwLCJleHAiOjE3MzYzNDczODB9.O17xXdHFJzGGTWO3bGdUHhO6X1peFMKF5-_1F8yJlH8',
    
    // Tanggal untuk test
    startDate: '2025-01-09', // Besok
    endDate: '2025-01-15',   // Minggu depan
    
    // Untuk test monthly
    year: 2025,
    month: 1
};

async function clearOldShifts() {
    console.log('\n=== Menghapus Shift Lama ===');
    
    try {
        // Hapus shift yang ada untuk periode test
        const response = await fetch(`${BASE_URL}/admin/shift-optimization/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${testData.adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Dashboard API responding');
        } else {
            console.log('❌ Dashboard API error:', response.status);
        }
    } catch (error) {
        console.log('⚠️ Error clearing shifts:', error.message);
    }
}

async function testDailyScheduling() {
    console.log('\n=== Test Daily Scheduling Variety ===');
    
    try {
        const response = await fetch(`${BASE_URL}/admin/shift-optimization/create-optimal-shifts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${testData.adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate: testData.startDate,
                endDate: testData.startDate, // Same date for daily
                locations: ['ICU', 'NICU', 'GAWAT_DARURAT', 'BEDAH'],
                shiftTypes: ['PAGI', 'SIANG', 'MALAM']
            })
        });
        
        const result = await response.text();
        console.log('Daily Response Status:', response.status);
        console.log('Daily Response:', result.substring(0, 500));
        
        if (response.ok) {
            console.log('✅ Daily scheduling created successfully');
        } else {
            console.log('❌ Daily scheduling failed');
        }
    } catch (error) {
        console.log('❌ Daily scheduling error:', error.message);
    }
}

async function testWeeklyScheduling() {
    console.log('\n=== Test Weekly Scheduling Variety ===');
    
    try {
        const response = await fetch(`${BASE_URL}/admin/shift-optimization/create-weekly-schedule`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${testData.adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate: testData.startDate,
                locations: ['ICU', 'NICU', 'GAWAT_DARURAT', 'BEDAH', 'POLIKLINIK'],
                shiftTypes: ['PAGI', 'SIANG', 'MALAM', 'ON_CALL']
            })
        });
        
        const result = await response.text();
        console.log('Weekly Response Status:', response.status);
        console.log('Weekly Response:', result.substring(0, 500));
        
        if (response.ok) {
            console.log('✅ Weekly scheduling created successfully');
        } else {
            console.log('❌ Weekly scheduling failed');
        }
    } catch (error) {
        console.log('❌ Weekly scheduling error:', error.message);
    }
}

async function testMonthlyScheduling() {
    console.log('\n=== Test Monthly Scheduling Variety ===');
    
    try {
        const response = await fetch(`${BASE_URL}/admin/shift-optimization/create-monthly-schedule`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${testData.adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                year: testData.year,
                month: testData.month,
                locations: ['ICU', 'NICU', 'GAWAT_DARURAT', 'BEDAH', 'POLIKLINIK', 'LABORATORIUM'],
                shiftTypes: ['PAGI', 'SIANG', 'MALAM', 'ON_CALL']
            })
        });
        
        const result = await response.text();
        console.log('Monthly Response Status:', response.status);
        console.log('Monthly Response:', result.substring(0, 500));
        
        if (response.ok) {
            console.log('✅ Monthly scheduling created successfully');
        } else {
            console.log('❌ Monthly scheduling failed');
        }
    } catch (error) {
        console.log('❌ Monthly scheduling error:', error.message);
    }
}

async function analyzeScheduleVariety() {
    console.log('\n=== Analisis Variasi Jadwal ===');
    
    try {
        // Get shifts untuk periode yang di-test
        const response = await fetch(`${BASE_URL}/shifts?startDate=${testData.startDate}&endDate=${testData.endDate}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${testData.adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.log('❌ Failed to get shifts for analysis');
            return;
        }
        
        const shifts = await response.json();
        console.log(`📊 Total shifts created: ${shifts.length}`);
        
        if (shifts.length === 0) {
            console.log('⚠️ No shifts found for analysis');
            return;
        }
        
        // Analisis lokasi
        const locationCounts = {};
        const shiftTypeCounts = {};
        const timeCounts = {};
        
        shifts.forEach(shift => {
            // Count locations
            locationCounts[shift.lokasi] = (locationCounts[shift.lokasi] || 0) + 1;
            
            // Count shift types  
            shiftTypeCounts[shift.tipeShift] = (shiftTypeCounts[shift.tipeShift] || 0) + 1;
            
            // Count start times
            const startTime = shift.jamMulai;
            timeCounts[startTime] = (timeCounts[startTime] || 0) + 1;
        });
        
        console.log('\n📍 Distribusi Lokasi:');
        Object.entries(locationCounts).forEach(([location, count]) => {
            const percentage = ((count / shifts.length) * 100).toFixed(1);
            console.log(`  ${location}: ${count} shifts (${percentage}%)`);
        });
        
        console.log('\n⏰ Distribusi Tipe Shift:');
        Object.entries(shiftTypeCounts).forEach(([type, count]) => {
            const percentage = ((count / shifts.length) * 100).toFixed(1);
            console.log(`  ${type}: ${count} shifts (${percentage}%)`);
        });
        
        console.log('\n🕒 Distribusi Jam Mulai:');
        Object.entries(timeCounts).forEach(([time, count]) => {
            const percentage = ((count / shifts.length) * 100).toFixed(1);
            console.log(`  ${time}: ${count} shifts (${percentage}%)`);
        });
        
        // Evaluasi variasi
        const locationVariety = Object.keys(locationCounts).length;
        const shiftTypeVariety = Object.keys(shiftTypeCounts).length;
        const timeVariety = Object.keys(timeCounts).length;
        
        console.log('\n📈 Evaluasi Variasi:');
        console.log(`  Variasi Lokasi: ${locationVariety} lokasi berbeda`);
        console.log(`  Variasi Tipe Shift: ${shiftTypeVariety} tipe berbeda`);
        console.log(`  Variasi Waktu: ${timeVariety} waktu mulai berbeda`);
        
        if (locationVariety > 1 && shiftTypeVariety > 1) {
            console.log('✅ BERHASIL: Scheduling variety sudah bekerja!');
        } else {
            console.log('❌ MASALAH: Scheduling masih kurang variasi');
        }
        
    } catch (error) {
        console.log('❌ Analysis error:', error.message);
    }
}

async function runAllTests() {
    console.log('🚀 Starting Scheduling Variety Test');
    console.log('=====================================');
    
    // Wait for backend to be ready
    console.log('⏳ Waiting for backend...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await clearOldShifts();
    await testDailyScheduling();
    await testWeeklyScheduling();
    await testMonthlyScheduling();
    await analyzeScheduleVariety();
    
    console.log('\n✅ Test selesai!');
}

// Jalankan test
runAllTests().catch(console.error);
