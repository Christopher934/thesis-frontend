// Test script untuk verify monthly scheduling dengan partial assignment

console.log('🧪 Testing Monthly Scheduling with Partial Assignment Support');
console.log('='.repeat(65));

// Dari screenshot user: 18 max shifts, 4 staff per shift, ICU only
const config = {
  maxShiftsPerPerson: 18,
  staffPerShift: 4,
  availableUsers: 5, // From previous analysis
  location: 'ICU',
  month: 8,
  year: 2025,
  currentDay: 4
};

console.log('⚙️ CONFIGURATION:');
console.log(`   - Max shifts per person: ${config.maxShiftsPerPerson}`);
console.log(`   - Staff per shift: ${config.staffPerShift}`);
console.log(`   - Available users: ${config.availableUsers}`);
console.log(`   - Location: ${config.location}`);
console.log(`   - Target: ${config.month}/${config.year} (from day ${config.currentDay + 1})`);

// Calculate capacity and demand
const daysInMonth = 31;
const remainingDays = daysInMonth - config.currentDay; // 27 days
const totalCapacity = config.availableUsers * config.maxShiftsPerPerson; // 5 × 18 = 90

// Calculate actual demand
let weekdays = 0, weekends = 0;
for (let day = config.currentDay + 1; day <= daysInMonth; day++) {
  const dayOfWeek = new Date(config.year, config.month - 1, day).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) weekends++;
  else weekdays++;
}

const shiftsPerWeekday = 4 + 4 + 3; // PAGI + SIANG + MALAM
const shiftsPerWeekend = 3 + 4 + 3; // Reduced weekend staff
const totalDemand = (weekdays * shiftsPerWeekday) + (weekends * shiftsPerWeekend);

console.log('\n📊 CAPACITY vs DEMAND:');
console.log(`   - Remaining days: ${remainingDays} (${weekdays} weekdays, ${weekends} weekends)`);
console.log(`   - Total capacity: ${totalCapacity} shifts`);
console.log(`   - Total demand: ${totalDemand} shifts`);
console.log(`   - Deficit: ${totalDemand - totalCapacity} shifts`);

const fulfillmentRate = (totalCapacity / totalDemand) * 100;
console.log(`   - Max fulfillment rate: ${fulfillmentRate.toFixed(1)}%`);

console.log('\n🔧 EXPECTED BEHAVIOR WITH NEW FIX:');

if (fulfillmentRate < 30) {
  console.log('   ❌ Should still fail (< 30% threshold)');
  console.log('   ❌ Error: "Tidak ada pegawai yang tersedia..."');
} else if (fulfillmentRate < 80) {
  console.log('   ✅ Should succeed with warnings (30-80% partial success)');
  console.log(`   ⚠️  Warning: "Jadwal bulanan hanya ${fulfillmentRate.toFixed(1)}% terpenuhi..."`);
  console.log(`   ✅ Should create ~${Math.floor(totalCapacity)} shifts`);
  console.log('   ✅ Should save to database');
} else {
  console.log('   ✅ Should succeed fully (>80% fulfillment)');
}

console.log('\n📝 RECOMMENDED ACTIONS FOR USER:');
if (fulfillmentRate < 80) {
  const additionalUsersNeeded = Math.ceil((totalDemand - totalCapacity) / config.maxShiftsPerPerson);
  console.log(`   1. Add ${additionalUsersNeeded} more active users`);
  console.log(`   2. Or increase max shifts per person to ${Math.ceil(totalDemand / config.availableUsers)}`);
  console.log(`   3. Or use weekly scheduling for better control`);
  console.log('   4. Or reduce staff per shift requirements');
}

console.log('\n🎯 USER SCENARIOS:');
console.log('   SCENARIO A: Keep current settings');
console.log(`      Result: ${fulfillmentRate < 30 ? 'FAIL' : 'PARTIAL SUCCESS'} with ${Math.min(totalCapacity, totalDemand)} shifts`);

console.log('   SCENARIO B: Increase max shifts to 30');
const newCapacity = config.availableUsers * 30;
const newFulfillment = Math.min(100, (newCapacity / totalDemand) * 100);
console.log(`      Result: ${newFulfillment >= 80 ? 'SUCCESS' : 'PARTIAL'} with ${newFulfillment.toFixed(1)}% fulfillment`);

console.log('   SCENARIO C: Add 15 more active users');
const expandedCapacity = (config.availableUsers + 15) * config.maxShiftsPerPerson;
const expandedFulfillment = Math.min(100, (expandedCapacity / totalDemand) * 100);
console.log(`      Result: SUCCESS with ${expandedFulfillment.toFixed(1)}% fulfillment`);

console.log('\n' + '='.repeat(65));
console.log('🧪 ANALYSIS COMPLETE - Ready for testing');
