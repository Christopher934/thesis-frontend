const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Login admin untuk mendapatkan token
async function loginAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@rsud.id',
      password: 'admin123'  // Correct password
    });
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test automatic scheduling untuk melihat variety
async function testSchedulingVariety() {
  console.log('🧪 Testing Automatic Scheduling Variety...\n');
  
  // Login admin
  console.log('🔐 Logging in as admin...');
  const token = await loginAdmin();
  if (!token) {
    console.error('❌ Cannot proceed without token');
    return;
  }
  console.log('✅ Admin login successful\n');
  
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Test 1: Daily scheduling
    console.log('1️⃣ Testing Daily Automatic Scheduling...');
    const dailyResponse = await axios.post(`${BASE_URL}/admin/shift-optimization/create-optimal-shifts`, {
      startDate: '2025-09-15',
      endDate: '2025-09-15', // 1 hari - tanggal bersih
      schedulingType: 'daily'
    }, { headers });
    
    console.log('Daily Shifts Created:', dailyResponse.data.createdShifts?.length || 0);
    if (dailyResponse.data.createdShifts) {
      const locations = [...new Set(dailyResponse.data.createdShifts.map(s => s.lokasiEnum || s.lokasishift))];
      const shiftTypes = [...new Set(dailyResponse.data.createdShifts.map(s => s.tipeEnum || s.tipeshift))];
      console.log('Locations:', locations);
      console.log('Shift Types:', shiftTypes);
    }
    console.log('');

        // Test 2: Weekly scheduling
    console.log('\n2️⃣ Testing Weekly Automatic Scheduling...');
    const weeklyResponse = await axios.post(`${BASE_URL}/admin/shift-optimization/create-optimal-shifts`, {
      startDate: '2025-09-01',
      endDate: '2025-09-07', // 1 minggu
      schedulingType: 'weekly'    }, { headers });
    
    console.log('Weekly Shifts Created:', weeklyResponse.data.createdShifts?.length || 0);
    if (weeklyResponse.data.createdShifts) {
      const locations = [...new Set(weeklyResponse.data.createdShifts.map(s => s.lokasiEnum || s.lokasishift))];
      const shiftTypes = [...new Set(weeklyResponse.data.createdShifts.map(s => s.tipeEnum || s.tipeshift))];
      console.log('Locations:', locations);
      console.log('Shift Types:', shiftTypes);
      
      // Analyze variety by day
      const shiftsByDay = {};
      weeklyResponse.data.createdShifts.forEach(shift => {
        const day = shift.tanggal.split('T')[0];
        if (!shiftsByDay[day]) shiftsByDay[day] = [];
        shiftsByDay[day].push({ 
          lokasi: shift.lokasiEnum || shift.lokasishift, 
          tipeShift: shift.tipeEnum || shift.tipeshift 
        });
      });
      
      console.log('\n📊 Daily Breakdown:');
      Object.entries(shiftsByDay).forEach(([day, shifts]) => {
        const locations = [...new Set(shifts.map(s => s.lokasi))];
        const types = [...new Set(shifts.map(s => s.tipeShift))];
        console.log(`${day}: ${locations.join(', ')} | ${types.join(', ')}`);
      });
    }
    console.log('');

// Test 3: Monthly scheduling  
    console.log('3️⃣ Testing Monthly Automatic Scheduling...');
    const monthlyResponse = await axios.post(`${BASE_URL}/admin/shift-optimization/create-monthly-schedule`, {
      year: 2025,
      month: 10, // Oktober 2025 - bulan bersih
      schedulingType: 'monthly'
    }, { headers });    console.log('Monthly Shifts Created:', monthlyResponse.data.monthlySchedule?.createdShifts || monthlyResponse.data.createdShifts?.length || 0);
    const monthlyShifts = monthlyResponse.data.monthlySchedule || monthlyResponse.data;
    if (monthlyShifts.createdShifts) {
      // For monthly, we might not have the detailed shift array, but we have the count
      console.log('Total Monthly Shifts:', monthlyShifts.createdShifts);
      console.log('Month/Year:', `${monthlyResponse.data.monthlySchedule?.month || 10}/${monthlyResponse.data.monthlySchedule?.year || 2025}`);
      console.log('Days in Month:', monthlyResponse.data.monthlySchedule?.daysInMonth || 31);
      
      if (monthlyResponse.data.monthlySchedule?.schedule) {
        const schedule = monthlyResponse.data.monthlySchedule.schedule;
        const locations = [...new Set(schedule.map(s => s.location))];
        const shiftTypes = [...new Set(schedule.map(s => s.shiftType))];
        console.log('Total Unique Locations:', locations.length, locations);
        console.log('Total Unique Shift Types:', shiftTypes.length, shiftTypes);
        
        // Sample first week analysis
        const firstWeek = schedule.filter(s => new Date(s.date) <= new Date('2025-10-07')).slice(0, 20);
        console.log('\n📋 First Week Sample (20 shifts):');
        firstWeek.forEach((shift, i) => {
          console.log(`${i+1}. ${shift.date} - ${shift.location} - ${shift.shiftType} - User ${shift.userId}`);
        });
      }
    }
    
    console.log('\n✅ Scheduling Variety Test Complete!');
    
  } catch (error) {
    console.error('❌ Error testing scheduling variety:', error.response?.data || error.message);
  }
}

testSchedulingVariety();
