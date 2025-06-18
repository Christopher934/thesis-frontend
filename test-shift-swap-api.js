// Test script for Shift Swap Request API
const baseUrl = 'http://localhost:3001';

async function testAPI() {
  console.log('Testing Shift Swap Request API...\n');

  try {
    // Test 1: Create a shift swap request
    console.log('1. Testing CREATE shift swap request...');
    const createResponse = await fetch(`${baseUrl}/shift-swap-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toUserId: 2,
        shiftId: 1,
        alasan: 'Need to attend family event',
        fromUserId: 1, // For testing without auth
      }),
    });

    if (createResponse.ok) {
      const createdRequest = await createResponse.json();
      console.log('✅ Created request:', createdRequest.id);
      
      // Test 2: Get all requests
      console.log('\n2. Testing GET all shift swap requests...');
      const getAllResponse = await fetch(`${baseUrl}/shift-swap-requests`);
      if (getAllResponse.ok) {
        const allRequests = await getAllResponse.json();
        console.log('✅ Found requests:', allRequests.length);
      } else {
        console.log('❌ Failed to get all requests');
      }

      // Test 3: Get specific request
      console.log('\n3. Testing GET specific request...');
      const getOneResponse = await fetch(`${baseUrl}/shift-swap-requests/${createdRequest.id}`);
      if (getOneResponse.ok) {
        const request = await getOneResponse.json();
        console.log('✅ Found request:', request.id, 'Status:', request.status);
      } else {
        console.log('❌ Failed to get specific request');
      }

      // Test 4: Respond to request (target user accepting)
      console.log('\n4. Testing RESPOND to request (target user accepting)...');
      const respondResponse = await fetch(`${baseUrl}/shift-swap-requests/${createdRequest.id}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'accept',
          userId: 2, // Target user ID for testing
        }),
      });

      if (respondResponse.ok) {
        const updatedRequest = await respondResponse.json();
        console.log('✅ Request updated, new status:', updatedRequest.status);
      } else {
        const error = await respondResponse.text();
        console.log('❌ Failed to respond to request:', error);
      }

      // Test 5: Get pending approvals for supervisor
      console.log('\n5. Testing GET pending approvals for supervisor...');
      const pendingResponse = await fetch(`${baseUrl}/shift-swap-requests/pending-approvals?userId=3`);
      if (pendingResponse.ok) {
        const pending = await pendingResponse.json();
        console.log('✅ Pending approvals for supervisor:', pending.length);
      } else {
        console.log('❌ Failed to get pending approvals');
      }

    } else {
      const error = await createResponse.text();
      console.log('❌ Failed to create request:', error);
    }

  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

testAPI();
