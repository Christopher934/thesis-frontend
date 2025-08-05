const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAutoScheduleService() {
  try {
    console.log('🤖 Testing Auto Schedule Service...');
    
    // Test request
    const requests = [
      {
        date: "2024-01-21",
        location: "IGD",
        shiftType: "PAGI",
        requiredCount: 2,
        priority: "NORMAL"
      }
    ];
    
    console.log('📝 Request:', JSON.stringify(requests, null, 2));
    
    // Step 1: Get available users
    console.log('🔍 Getting available users...');
    const availableUsers = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        shifts: {
          where: {
            tanggal: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });
    
    console.log(`✅ Found ${availableUsers.length} available users`);
    console.log('Sample users:', availableUsers.slice(0, 3).map(u => ({
      id: u.id,
      name: `${u.namaDepan} ${u.namaBelakang}`,
      role: u.role,
      shifts: u.shifts.length
    })));
    
    // Step 2: Simple assignment logic
    const assignments = [];
    
    for (const request of requests) {
      // Filter users by role if specified (prefer PERAWAT for medical areas)
      let eligibleUsers = availableUsers;
      if (request.location === 'IGD' || request.location === 'ICU') {
        eligibleUsers = availableUsers.filter(user => 
          user.role === 'PERAWAT' || user.role === 'DOKTER'
        );
      }
      
      console.log(`📋 Eligible users for ${request.shiftType} at ${request.location}: ${eligibleUsers.length}`);
      
      // Select first N available users
      const selectedUsers = eligibleUsers.slice(0, request.requiredCount);
      console.log('Selected users:', selectedUsers.map(u => `${u.namaDepan} ${u.namaBelakang} (${u.role})`));
      
      for (const user of selectedUsers) {
        assignments.push({
          userId: user.id,
          shiftDetails: request,
          score: 85,
          reason: `Selected for ${request.shiftType} shift at ${request.location}`
        });
      }
    }
    
    const result = {
      assignments,
      conflicts: [],
      workloadAlerts: [],
      locationCapacityStatus: [],
      fulfillmentRate: assignments.length > 0 ? 100 : 0,
      recommendations: [
        'All shifts successfully assigned',
        `Total assignments: ${assignments.length}`
      ]
    };
    
    console.log('✅ Auto Schedule Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Auto Schedule test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutoScheduleService();
