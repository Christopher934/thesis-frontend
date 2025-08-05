#!/usr/bin/env node

/**
 * Test script untuk memverifikasi fix masalah lokasi pada bulk scheduling
 * Problem: User hanya pilih ICU tapi sistem buat shift untuk RAWAT_INAP juga
 * Solution: Pastikan hanya lokasi yang dipilih user yang diproses
 */

const API_URL = 'http://localhost:3001';

async function testLocationFiltering() {
    console.log('🧪 Testing Location Filtering Fix');
    console.log('================================');
    
    // Test case 1: Hanya ICU dipilih
    const testRequest1 = {
        startDate: '2025-08-04',
        locations: ['ICU'], // Hanya ICU
        shiftPattern: {
            ICU: { PAGI: 2, SIANG: 2, MALAM: 2 }
            // Tidak ada RAWAT_INAP di sini
        },
        priority: 'HIGH'
    };
    
    console.log('\n📋 Test Case 1: Hanya ICU dipilih');
    console.log('Request:', JSON.stringify(testRequest1, null, 2));
    
    try {
        const response = await fetch(`${API_URL}/admin/shift-optimization/create-weekly-schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(testRequest1)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('\n✅ Response received');
            console.log('Total shifts created:', result.weeklySchedule?.totalShifts || 0);
            
            // Analyze locations in created shifts
            if (result.weeklySchedule?.assignments) {
                const locations = [...new Set(result.weeklySchedule.assignments.map(a => a.location))];
                console.log('Locations with shifts:', locations);
                
                if (locations.length === 1 && locations[0] === 'ICU') {
                    console.log('🎉 SUCCESS: Hanya ICU yang dibuat shifts!');
                } else {
                    console.log('❌ FAILED: Masih ada lokasi lain:', locations);
                }
            }
        } else {
            console.log('❌ API call failed:', response.status);
            const error = await response.text();
            console.log('Error:', error.substring(0, 200));
        }
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('Pastikan backend berjalan di', API_URL);
    }
}

// Test case 2: Multiple locations dipilih
async function testMultipleLocations() {
    console.log('\n📋 Test Case 2: Multiple locations dipilih');
    
    const testRequest2 = {
        startDate: '2025-08-04',
        locations: ['ICU', 'NICU'], // Dua lokasi
        shiftPattern: {
            ICU: { PAGI: 2, SIANG: 2, MALAM: 1 },
            NICU: { PAGI: 1, SIANG: 1, MALAM: 1 }
            // Tidak ada RAWAT_INAP atau yang lain
        },
        priority: 'NORMAL'
    };
    
    console.log('Request:', JSON.stringify(testRequest2, null, 2));
    
    try {
        const response = await fetch(`${API_URL}/admin/shift-optimization/create-weekly-schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(testRequest2)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('\n✅ Response received');
            console.log('Total shifts created:', result.weeklySchedule?.totalShifts || 0);
            
            if (result.weeklySchedule?.assignments) {
                const locations = [...new Set(result.weeklySchedule.assignments.map(a => a.location))];
                console.log('Locations with shifts:', locations);
                
                const expectedLocations = ['ICU', 'NICU'];
                const hasOnlyExpected = locations.every(loc => expectedLocations.includes(loc)) && 
                                       expectedLocations.every(loc => locations.includes(loc));
                
                if (hasOnlyExpected) {
                    console.log('🎉 SUCCESS: Hanya ICU dan NICU yang dibuat shifts!');
                } else {
                    console.log('❌ FAILED: Ada lokasi tidak diharapkan:', locations);
                }
            }
        } else {
            console.log('❌ API call failed:', response.status);
        }
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

async function runTests() {
    console.log('🔍 Testing Fix untuk Masalah 91 Shifts dengan Lokasi Salah');
    console.log('==========================================================');
    console.log('Problem: User pilih ICU saja, tapi sistem buat shift untuk RAWAT_INAP juga');
    console.log('Solution: Backend harus respect request.locations, bukan shiftPattern keys');
    console.log('');
    
    await testLocationFiltering();
    await testMultipleLocations();
    
    console.log('\n📋 Summary:');
    console.log('Jika test berhasil, maka fix sudah benar dan user tidak akan lagi');
    console.log('mendapat 91 shifts saat hanya memilih ICU.');
}

runTests().catch(console.error);
