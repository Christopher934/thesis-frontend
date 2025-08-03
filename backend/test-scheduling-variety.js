const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSchedulingVariety() {
  try {
    console.log('🧪 Testing scheduling variety...\n');

    // Clear previous test shifts
    console.log('🗑️  Clearing previous test shifts...');
    await prisma.shift.deleteMany({
      where: {
        tanggal: {
          gte: new Date('2025-08-02'),
          lte: new Date('2025-08-08')
        }
      }
    });

    // Test API endpoint for weekly schedule creation
    console.log('📅 Testing weekly schedule creation with variety...\n');
    
    const testRequest = {
      startDate: '2025-08-02',
      locations: ['ICU', 'GAWAT_DARURAT', 'RAWAT_INAP'],
      shiftPattern: {
        ICU: { PAGI: 3, SIANG: 2, MALAM: 2 },
        GAWAT_DARURAT: { PAGI: 4, SIANG: 3, MALAM: 2 },
        RAWAT_INAP: { PAGI: 2, SIANG: 2, MALAM: 1 }
      },
      priority: 'NORMAL'
    };

    // Call the endpoint
    const response = await fetch('http://localhost:3001/admin/shift-optimization/create-weekly-schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Mock token
      },
      body: JSON.stringify(testRequest)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Weekly schedule created successfully!');
      console.log('Total shifts:', result.weeklySchedule?.totalShifts || 0);
      console.log('Successful assignments:', result.weeklySchedule?.successfulAssignments || 0);
    } else {
      console.log('❌ API call failed, testing service directly...\n');
      
      // Test service directly
      const { AdminShiftOptimizationService } = require('../dist/shift/admin-shift-optimization.service');
      const service = new AdminShiftOptimizationService(prisma);
      
      const result = await service.createWeeklySchedule(testRequest);
      console.log('✅ Service test completed!');
      console.log('Result:', result);
    }

    // Check created shifts for variety
    console.log('\n🔍 Checking shift variety...');
    
    const createdShifts = await prisma.shift.findMany({
      where: {
        tanggal: {
          gte: new Date('2025-08-02'),
          lte: new Date('2025-08-08')
        }
      },
      include: {
        user: {
          select: {
            namaDepan: true,
            namaBelakang: true,
            role: true
          }
        }
      },
      orderBy: [
        { tanggal: 'asc' },
        { lokasishift: 'asc' },
        { tipeshift: 'asc' }
      ]
    });

    console.log(`\n📊 Found ${createdShifts.length} shifts:`);
    
    // Analyze variety
    const locationVariety = new Set();
    const shiftTypeVariety = new Set();
    const timeVariety = new Set();
    
    const analysisData = [];
    
    createdShifts.forEach(shift => {
      locationVariety.add(shift.lokasishift);
      shiftTypeVariety.add(shift.tipeshift);
      
      const startTime = shift.jammulai.toTimeString().slice(0, 5);
      const endTime = shift.jamselesai.toTimeString().slice(0, 5);
      timeVariety.add(`${startTime}-${endTime}`);
      
      analysisData.push({
        date: shift.tanggal.toISOString().split('T')[0],
        location: shift.lokasishift,
        shiftType: shift.tipeshift,
        time: `${startTime}-${endTime}`,
        employee: `${shift.user?.namaDepan} ${shift.user?.namaBelakang}`,
        role: shift.user?.role
      });
    });

    console.log('\n📈 Variety Analysis:');
    console.log(`🏥 Locations (${locationVariety.size}):`, Array.from(locationVariety));
    console.log(`⏰ Shift Types (${shiftTypeVariety.size}):`, Array.from(shiftTypeVariety));
    console.log(`🕐 Time Variations (${timeVariety.size}):`, Array.from(timeVariety));
    
    console.log('\n📋 Sample shifts by day:');
    const groupedByDate = {};
    analysisData.forEach(shift => {
      if (!groupedByDate[shift.date]) {
        groupedByDate[shift.date] = [];
      }
      groupedByDate[shift.date].push(shift);
    });
    
    Object.keys(groupedByDate).slice(0, 3).forEach(date => {
      console.log(`\n📅 ${date}:`);
      groupedByDate[date].slice(0, 5).forEach(shift => {
        console.log(`  ${shift.location} | ${shift.shiftType} | ${shift.time} | ${shift.employee} (${shift.role})`);
      });
      if (groupedByDate[date].length > 5) {
        console.log(`  ... and ${groupedByDate[date].length - 5} more shifts`);
      }
    });

    // Check if variety improved
    if (locationVariety.size >= 3 && shiftTypeVariety.size >= 3 && timeVariety.size >= 3) {
      console.log('\n✅ SUCCESS: Scheduling now has good variety!');
      console.log('- Multiple locations are being used');
      console.log('- Different shift types are distributed');
      console.log('- Time variations are present');
    } else {
      console.log('\n⚠️  LIMITED VARIETY: Some aspects still need improvement');
      if (locationVariety.size < 3) console.log('- Need more location variety');
      if (shiftTypeVariety.size < 3) console.log('- Need more shift type variety');
      if (timeVariety.size < 3) console.log('- Need more time variety');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSchedulingVariety();
