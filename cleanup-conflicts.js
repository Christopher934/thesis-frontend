/**
 * Cleanup script to remove conflicting shifts
 * Removes multiple shifts per person per day, keeping only the first 2 non-overlapping shifts
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function cleanupConflictingShifts() {
  console.log('🧹 Starting cleanup of conflicting shifts...\n');

  try {
    // 1. Get all shifts
    console.log('📊 Fetching all shifts...');
    const response = await axios.get(`${API_BASE}/shifts`);
    const allShifts = response.data;
    
    console.log(`Found ${allShifts.length} total shifts`);

    // 2. Group shifts by user and date
    const shiftsByUserDate = {};
    allShifts.forEach(shift => {
      const key = `${shift.idpegawai}-${shift.tanggal}`;
      if (!shiftsByUserDate[key]) {
        shiftsByUserDate[key] = [];
      }
      shiftsByUserDate[key].push(shift);
    });

    // 3. Find conflicts (more than 2 shifts per day or overlapping times)
    const conflictsToResolve = [];
    const shiftsToDelete = [];

    Object.entries(shiftsByUserDate).forEach(([key, shifts]) => {
      const [userId, date] = key.split('-');
      
      if (shifts.length > 2) {
        console.log(`🚫 CONFLICT: User ${userId} has ${shifts.length} shifts on ${date}`);
        conflictsToResolve.push({ userId, date, shifts });
        
        // Keep only first 2 shifts, mark others for deletion
        const shiftsToKeep = shifts.slice(0, 2);
        const shiftsToRemove = shifts.slice(2);
        
        console.log(`  ✅ Keeping ${shiftsToKeep.length} shifts`);
        console.log(`  🗑️ Deleting ${shiftsToRemove.length} shifts`);
        
        shiftsToRemove.forEach(shift => {
          shiftsToDelete.push(shift.id);
          console.log(`    - ${shift.tipeshift} at ${shift.lokasishift} (${shift.jammulai}-${shift.jamselesai})`);
        });
      } else if (shifts.length === 2) {
        // Check for time overlaps between the 2 shifts
        const [shift1, shift2] = shifts;
        const start1 = timeToMinutes(shift1.jammulai);
        const end1 = timeToMinutes(shift1.jamselesai);
        const start2 = timeToMinutes(shift2.jammulai);
        const end2 = timeToMinutes(shift2.jamselesai);

        if (hasTimeOverlap(start1, end1, start2, end2)) {
          console.log(`🚫 TIME OVERLAP: User ${userId} on ${date}`);
          console.log(`  - ${shift1.tipeshift} (${shift1.jammulai}-${shift1.jamselesai}) at ${shift1.lokasishift}`);
          console.log(`  - ${shift2.tipeshift} (${shift2.jammulai}-${shift2.jamselesai}) at ${shift2.lokasishift}`);
          
          // Keep the first shift, delete the second
          shiftsToDelete.push(shift2.id);
          console.log(`  🗑️ Deleting second shift to resolve overlap`);
        }
      }
    });

    // 4. Execute deletions
    if (shiftsToDelete.length > 0) {
      console.log(`\n🗑️ Deleting ${shiftsToDelete.length} conflicting shifts...`);
      
      for (const shiftId of shiftsToDelete) {
        try {
          await axios.delete(`${API_BASE}/shifts/${shiftId}`);
          console.log(`✅ Deleted shift ${shiftId}`);
        } catch (error) {
          console.error(`❌ Failed to delete shift ${shiftId}:`, error.response?.data || error.message);
        }
      }
    } else {
      console.log('✅ No conflicting shifts found to delete');
    }

    // 5. Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const afterResponse = await axios.get(`${API_BASE}/shifts`);
    const remainingShifts = afterResponse.data;
    
    // Re-check for conflicts
    const remainingByUserDate = {};
    remainingShifts.forEach(shift => {
      const key = `${shift.idpegawai}-${shift.tanggal}`;
      if (!remainingByUserDate[key]) {
        remainingByUserDate[key] = [];
      }
      remainingByUserDate[key].push(shift);
    });

    let remainingConflicts = 0;
    Object.entries(remainingByUserDate).forEach(([key, shifts]) => {
      if (shifts.length > 2) {
        remainingConflicts++;
        const [userId, date] = key.split('-');
        console.log(`⚠️ Still has conflict: User ${userId} on ${date} (${shifts.length} shifts)`);
      }
    });

    if (remainingConflicts === 0) {
      console.log('✅ All conflicts resolved!');
    } else {
      console.log(`⚠️ ${remainingConflicts} conflicts remain`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Before: ${allShifts.length} shifts`);
    console.log(`- Deleted: ${shiftsToDelete.length} shifts`);
    console.log(`- After: ${remainingShifts.length} shifts`);
    console.log(`- Conflicts resolved: ${conflictsToResolve.length}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error.response?.data || error.message);
  }
}

// Helper functions
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function hasTimeOverlap(start1, end1, start2, end2) {
  // Handle overnight shifts
  if (end1 < start1) end1 += 24 * 60;
  if (end2 < start2) end2 += 24 * 60;
  
  return start1 < end2 && start2 < end1;
}

// Run cleanup
cleanupConflictingShifts();
