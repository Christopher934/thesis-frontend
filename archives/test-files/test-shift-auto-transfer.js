const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
let token = '';

// Test credentials
const credentials = {
  pegawai: { email: 'staff@gmail.com', password: 'staff123' },
  pegawai2: { email: 'staff2@gmail.com', password: 'staff123' },
  supervisor: { email: 'supervisor@gmail.com', password: 'super123' }
};

async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.access_token;
  } catch (error) {
    console.error(`Login failed for ${email}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function createShiftSwapRequest(token, toUserId, shiftId, alasan) {
  try {
    const response = await axios.post(`${BASE_URL}/shift-swap-requests`, {
      toUserId,
      shiftId,
      alasan
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Create shift swap request failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function respondToRequest(token, requestId, action, rejectionReason = null) {
  try {
    const response = await axios.patch(`${BASE_URL}/shift-swap-requests/${requestId}/respond`, {
      action,
      rejectionReason
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Respond to request failed:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function getShifts(token, userId = null) {
  try {
    const url = userId ? `${BASE_URL}/shifts?userId=${userId}` : `${BASE_URL}/shifts`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get shifts failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function getUsers(token) {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get users failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testShiftAutoTransfer() {
  console.log('🧪 Testing Automatic Shift Transfer After Supervisor Approval\n');

  try {
    // Step 1: Login as supervisor to get users and shifts data
    console.log('1️⃣ Logging in as supervisor...');
    const supervisorToken = await login(credentials.supervisor.email, credentials.supervisor.password);
    console.log('✅ Supervisor logged in successfully\n');

    // Get users data
    const users = await getUsers(supervisorToken);
    const pegawai1 = users.find(u => u.email === 'staff@gmail.com');
    const pegawai2 = users.find(u => u.email === 'staff2@gmail.com');
    
    if (!pegawai1 || !pegawai2) {
      console.error('❌ Required test users not found');
      return;
    }

    console.log(`👤 Pegawai 1: ${pegawai1.namaDepan} ${pegawai1.namaBelakang} (ID: ${pegawai1.id})`);
    console.log(`👤 Pegawai 2: ${pegawai2.namaDepan} ${pegawai2.namaBelakang} (ID: ${pegawai2.id})\n`);

    // Step 2: Get initial shift assignments
    console.log('2️⃣ Getting initial shift assignments...');
    const initialShifts = await getShifts(supervisorToken);
    const pegawai1Shifts = initialShifts.filter(s => s.userId === pegawai1.id);
    const pegawai2Shifts = initialShifts.filter(s => s.userId === pegawai2.id);

    console.log(`📅 Pegawai 1 has ${pegawai1Shifts.length} shifts`);
    console.log(`📅 Pegawai 2 has ${pegawai2Shifts.length} shifts`);

    if (pegawai1Shifts.length === 0) {
      console.error('❌ Pegawai 1 has no shifts to swap');
      return;
    }

    const targetShift = pegawai1Shifts[0];
    console.log(`🎯 Target shift: ID ${targetShift.id} on ${new Date(targetShift.tanggal).toLocaleDateString()}\n`);

    // Step 3: Login as pegawai1 and create swap request
    console.log('3️⃣ Logging in as pegawai1 and creating swap request...');
    const pegawai1Token = await login(credentials.pegawai.email, credentials.pegawai.password);
    
    const swapRequest = await createShiftSwapRequest(
      pegawai1Token,
      pegawai2.id,
      targetShift.id,
      'Testing automatic shift transfer feature'
    );

    console.log(`✅ Swap request created: ID ${swapRequest.id}`);
    console.log(`📄 Status: ${swapRequest.status}\n`);

    // Step 4: Login as pegawai2 and accept the request
    console.log('4️⃣ Logging in as pegawai2 and accepting swap request...');
    const pegawai2Token = await login(credentials.pegawai2.email, credentials.pegawai2.password);
    
    const acceptedRequest = await respondToRequest(pegawai2Token, swapRequest.id, 'accept');
    console.log(`✅ Request accepted by pegawai2`);
    console.log(`📄 New status: ${acceptedRequest.status}\n`);

    // Step 5: Supervisor approves the request (this should trigger auto-transfer)
    console.log('5️⃣ Supervisor approving request (should trigger auto-transfer)...');
    const finalRequest = await respondToRequest(supervisorToken, swapRequest.id, 'approve');
    console.log(`✅ Request approved by supervisor`);
    console.log(`📄 Final status: ${finalRequest.status}\n`);

    // Step 6: Verify shift ownership has changed
    console.log('6️⃣ Verifying shift ownership transfer...');
    const finalShifts = await getShifts(supervisorToken);
    const updatedShift = finalShifts.find(s => s.id === targetShift.id);

    if (!updatedShift) {
      console.error('❌ Could not find the target shift after approval');
      return;
    }

    console.log(`🔍 Original shift owner: User ID ${targetShift.userId} (${pegawai1.namaDepan})`);
    console.log(`🔍 Current shift owner:  User ID ${updatedShift.userId}`);

    if (updatedShift.userId === pegawai2.id) {
      console.log('🎉 SUCCESS: Shift ownership transferred automatically!');
      console.log(`✅ Shift ${targetShift.id} is now owned by ${pegawai2.namaDepan} ${pegawai2.namaBelakang}`);
    } else if (updatedShift.userId === pegawai1.id) {
      console.log('❌ FAILURE: Shift ownership did not change');
      console.log('⚠️  Auto-transfer feature may not be working correctly');
    } else {
      console.log(`❓ UNEXPECTED: Shift is now owned by User ID ${updatedShift.userId}`);
    }

    // Step 7: Show final shift distribution
    console.log('\n7️⃣ Final shift distribution:');
    const finalPegawai1Shifts = finalShifts.filter(s => s.userId === pegawai1.id);
    const finalPegawai2Shifts = finalShifts.filter(s => s.userId === pegawai2.id);
    
    console.log(`📊 ${pegawai1.namaDepan}: ${finalPegawai1Shifts.length} shifts (was ${pegawai1Shifts.length})`);
    console.log(`📊 ${pegawai2.namaDepan}: ${finalPegawai2Shifts.length} shifts (was ${pegawai2Shifts.length})`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('📝 Error details:', error.response.data);
    }
  }
}

// Run the test
testShiftAutoTransfer()
  .then(() => console.log('\n🏁 Test completed'))
  .catch(error => console.error('\n💥 Test execution failed:', error.message));
