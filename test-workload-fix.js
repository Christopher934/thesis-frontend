// Test script untuk workload enforcement fix

const testMonthlyWorkloadLimits = async () => {
  try {
    console.log('🧪 Testing Monthly Workload Limits Fix...');
    
    const testRequest = {
      month: 8,
      year: 2025,
      locations: ['ICU'], // Hanya ICU yang dipilih
      averageStaffPerShift: { ICU: 4 },
      workloadLimits: {
        maxShiftsPerPerson: 18, // User setting from screenshot
        maxConsecutiveDays: 4
      },
      shiftPattern: {
        ICU: { PAGI: 4, SIANG: 4, MALAM: 3 }
      }
    };
    
    console.log('📋 Test Configuration:');
    console.log('   - Bulan: Agustus 2025');
    console.log('   - Lokasi: ICU saja');
    console.log('   - Max shifts per person: 18');
    console.log('   - Staff per shift: 4 orang');
    
    // Calculate expected numbers
    const today = new Date();
    const isCurrentMonth = testRequest.year === today.getFullYear() && testRequest.month === (today.getMonth() + 1);
    const currentDay = today.getDate();
    
    const startDay = isCurrentMonth ? Math.max(currentDay + 1, 5) : 5; // Skip past dates
    const daysInMonth = new Date(testRequest.year, testRequest.month, 0).getDate();
    const activeDays = daysInMonth - startDay + 1;
    
    console.log(`📅 Active days: ${startDay}-${daysInMonth} (${activeDays} days)`);
    
    // Weekday/weekend calculation
    let weekdays = 0, weekends = 0;
    for (let day = startDay; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(testRequest.year, testRequest.month - 1, day).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) weekends++;
      else weekdays++;
    }
    
    console.log(`📊 Breakdown: ${weekdays} weekdays, ${weekends} weekends`);
    
    // Calculate total shifts needed
    const shiftsPerWeekday = 4 + 4 + 3; // PAGI + SIANG + MALAM
    const shiftsPerWeekend = Math.ceil(4*0.7) + Math.ceil(4*0.8) + Math.ceil(4*0.6); // Reduced weekend staffing
    
    const totalShiftsNeeded = (weekdays * shiftsPerWeekday) + (weekends * shiftsPerWeekend);
    
    console.log(`🎯 Expected shifts needed: ${totalShiftsNeeded}`);
    
    // Calculate minimum users needed
    const minUsersNeeded = Math.ceil(totalShiftsNeeded / 18);
    
    console.log(`👥 Minimum users needed: ${minUsersNeeded} (${totalShiftsNeeded} shifts ÷ 18 max per person)`);
    
    // Test API call
    const token = 'your-test-token-here'; // You would need to get this from actual login
    
    console.log('\n🔧 EXPECTED BEHAVIOR AFTER FIX:');
    console.log('1. ✅ Backend should detect insufficient users');
    console.log('2. ✅ Response should include success: false');
    console.log('3. ✅ Error message should mention workload limits');
    console.log('4. ✅ Frontend should show proper error modal');
    console.log('5. ✅ No shifts should be created if insufficient staff');
    
    console.log('\n📈 BEFORE FIX (BUGGY BEHAVIOR):');
    console.log('❌ Created 300 shifts anyway');
    console.log('❌ Users got 27+ shifts (50% overwork)');
    console.log('❌ Modal showed "Gagal" but shifts were created');
    console.log('❌ Workload limits completely ignored');
    
    return testRequest;
    
  } catch (error) {
    console.error('❌ Test setup error:', error);
  }
};

// Run the test
testMonthlyWorkloadLimits();
