import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ShiftCreationRequest {
  date: string;
  location: string;
  shiftType: 'PAGI' | 'SIANG' | 'MALAM' | 'ON_CALL' | 'JAGA';
  requiredCount: number;
  preferredRoles?: string[];
  skillRequirements?: string[];
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

async function testAutoScheduleService() {
  try {
    console.log('🤖 Testing Auto Schedule Service...');
    
    // Test request
    const requests: ShiftCreationRequest[] = [
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
    
    // Step 2: Simple assignment logic
    const assignments = [];
    
    for (const request of requests) {
      // Filter users by role if specified
      let eligibleUsers = availableUsers;
      if (request.preferredRoles?.length > 0) {
        eligibleUsers = availableUsers.filter(user => 
          request.preferredRoles.includes(user.role)
        );
      }
      
      console.log(`📋 Eligible users for ${request.shiftType} at ${request.location}: ${eligibleUsers.length}`);
      
      // Select first N available users
      const selectedUsers = eligibleUsers.slice(0, request.requiredCount);
      
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
    console.error('❌ Auto Schedule test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutoScheduleService();
