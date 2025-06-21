/**
 * Test script to verify supervisor actions work correctly
 * This will test both 'approve' and 'reject' actions for supervisors
 */

const BASE_URL = 'http://localhost:3001';

// Test data - you'll need to replace these with actual IDs from your database
const TEST_REQUEST_ID = 1; // Replace with actual shift swap request ID
const SUPERVISOR_TOKEN = 'your-supervisor-jwt-token'; // Replace with actual supervisor token

async function testSupervisorActions() {
    console.log('🧪 Testing Supervisor Actions...\n');

    // Test 1: Supervisor Approve Action
    console.log('Test 1: Testing supervisor approve action');
    try {
        const approveResponse = await fetch(`${BASE_URL}/shift-swap-requests/${TEST_REQUEST_ID}/respond`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${SUPERVISOR_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'approve'
            })
        });

        if (approveResponse.ok) {
            const result = await approveResponse.json();
            console.log('✅ Supervisor approve action successful:', result.status);
        } else {
            const error = await approveResponse.json();
            console.log('❌ Supervisor approve action failed:', error.message);
        }
    } catch (error) {
        console.log('❌ Network error during approve test:', error.message);
    }

    console.log('');

    // Test 2: Supervisor Reject Action
    console.log('Test 2: Testing supervisor reject action');
    try {
        const rejectResponse = await fetch(`${BASE_URL}/shift-swap-requests/${TEST_REQUEST_ID}/respond`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${SUPERVISOR_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'reject',
                rejectionReason: 'Test rejection by supervisor'
            })
        });

        if (rejectResponse.ok) {
            const result = await rejectResponse.json();
            console.log('✅ Supervisor reject action successful:', result.status);
        } else {
            const error = await rejectResponse.json();
            console.log('❌ Supervisor reject action failed:', error.message);
        }
    } catch (error) {
        console.log('❌ Network error during reject test:', error.message);
    }

    console.log('\n🎯 Test Summary:');
    console.log('- Supervisors should use "approve" action instead of "accept"');
    console.log('- Both supervisors and regular users can use "reject" action');
    console.log('- Frontend now correctly sends "approve" for supervisor approvals');
}

// Instructions for running the test
console.log('📋 Instructions:');
console.log('1. Make sure both backend and frontend are running');
console.log('2. Replace TEST_REQUEST_ID with an actual request ID from your database');
console.log('3. Replace SUPERVISOR_TOKEN with a valid supervisor JWT token');
console.log('4. Run: node test-supervisor-actions.js');
console.log('\n⚠️  Note: This test will make actual API calls to your backend\n');

// Uncomment the line below to run the test (after setting up the test data)
// testSupervisorActions();
