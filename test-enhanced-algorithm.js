/**
 * Test Enhanced Algorithm Distribution
 * 
 * This test checks if the enhanced greedy + backtracking algorithm 
 * successfully prevents the same user from getting consecutive identical shifts
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testEnhancedDistribution() {
  console.log('🧪 TESTING ENHANCED ALGORITHM DISTRIBUTION');
  console.log('==========================================\n');

  try {
    // Test with sample shift requests that would previously cause the issue
    // This mimics the scenario where Tari Firmansyah got 9 consecutive SIANG shifts
    const testRequests = [
      {
        date: '2025-08-15',
        location: 'NICU',
        shiftType: 'SIANG',
        requiredCount: 1,
        preferredRoles: ['PERAWAT'],
        priority: 'NORMAL',
        description: 'Test enhanced distribution - Day 1'
      },
      {
        date: '2025-08-16',
        location: 'NICU',
        shiftType: 'SIANG',
        requiredCount: 1,
        preferredRoles: ['PERAWAT'],
        priority: 'NORMAL',
        description: 'Test enhanced distribution - Day 2'
      },
      {
        date: '2025-08-17',
        location: 'NICU',
        shiftType: 'SIANG',
        requiredCount: 1,
        preferredRoles: ['PERAWAT'],
        priority: 'NORMAL',
        description: 'Test enhanced distribution - Day 3'
      },
      {
        date: '2025-08-18',
        location: 'NICU',
        shiftType: 'SIANG',
        requiredCount: 1,
        preferredRoles: ['PERAWAT'],
        priority: 'NORMAL',
        description: 'Test enhanced distribution - Day 4'
      },
      {
        date: '2025-08-19',
        location: 'NICU',
        shiftType: 'SIANG',
        requiredCount: 1,
        preferredRoles: ['PERAWAT'],
        priority: 'NORMAL',
        description: 'Test enhanced distribution - Day 5'
      }
    ];

    console.log('📅 Testing consecutive day assignments...');
    console.log('This simulates the scenario that caused Tari Firmansyah to get 9 consecutive shifts\n');
    
    const response = await axios.post(`${API_BASE}/test-algorithm`, {
      shiftRequests: testRequests
    });

    if (response.data.assignments && response.data.assignments.length > 0) {
      console.log(`✅ Algorithm completed successfully!`);
      console.log(`📊 Total assignments created: ${response.data.assignments.length}`);
      console.log(`📈 Fulfillment rate: ${response.data.fulfillmentRate.toFixed(1)}%\n`);

      // Analyze the distribution
      const userAssignments = new Map();
      
      response.data.assignments.forEach(assignment => {
        const userId = assignment.userId;
        if (!userAssignments.has(userId)) {
          userAssignments.set(userId, []);
        }
        userAssignments.get(userId).push({
          date: assignment.shiftDetails.date,
          location: assignment.shiftDetails.location,
          shiftType: assignment.shiftDetails.shiftType,
          reason: assignment.reason
        });
      });

      console.log('👥 DISTRIBUTION ANALYSIS:');
      console.log('========================');
      
      let maxConsecutiveByUser = 0;
      let totalUsers = userAssignments.size;
      
      userAssignments.forEach((assignments, userId) => {
        console.log(`\n👤 User ${userId}: ${assignments.length} shift(s)`);
        assignments.forEach(assignment => {
          console.log(`   📅 ${assignment.date} - ${assignment.location} ${assignment.shiftType}`);
          console.log(`   💡 ${assignment.reason}`);
        });
        
        if (assignments.length > maxConsecutiveByUser) {
          maxConsecutiveByUser = assignments.length;
        }
      });

      console.log('\n🔍 ANALYSIS RESULTS:');
      console.log('===================');
      console.log(`📊 Total users involved: ${totalUsers}`);
      console.log(`📈 Max shifts per user: ${maxConsecutiveByUser}`);
      console.log(`📉 Average shifts per user: ${(response.data.assignments.length / totalUsers).toFixed(1)}`);
      
      if (maxConsecutiveByUser <= 2 && totalUsers >= 3) {
        console.log('✅ EXCELLENT: Distribution is well-balanced!');
        console.log('✅ No user got more than 2 consecutive assignments');
        console.log('✅ Multiple users are being utilized effectively');
      } else if (maxConsecutiveByUser <= 3) {
        console.log('✅ GOOD: Distribution is improved from before');
        console.log('✅ No single user is overwhelmed with assignments');
      } else {
        console.log('⚠️  CONCERN: Still some concentration in assignments');
        console.log('⚠️  May need further algorithm tuning');
      }

      // Check for workload alerts
      if (response.data.workloadAlerts && response.data.workloadAlerts.length > 0) {
        console.log('\n⚠️  WORKLOAD ALERTS:');
        response.data.workloadAlerts.slice(0, 3).forEach(alert => {
          console.log(`   👤 ${alert.name}: ${alert.status} (${alert.currentShifts} shifts)`);
          console.log(`   📝 ${alert.recommendation}`);
        });
      }

      // Check recommendations
      if (response.data.recommendations && response.data.recommendations.length > 0) {
        console.log('\n💡 SYSTEM RECOMMENDATIONS:');
        response.data.recommendations.forEach(rec => {
          console.log(`   • ${rec}`);
        });
      }

    } else {
      console.log(`❌ Algorithm failed to create assignments`);
      console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.log(`📄 Error details:`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run test
console.log('⏳ Starting enhanced algorithm test...\n');
testEnhancedDistribution();
