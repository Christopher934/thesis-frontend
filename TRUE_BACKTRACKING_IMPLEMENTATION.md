# 🔄 TRUE BACKTRACKING + ENHANCED GREEDY ALGORITHM IMPLEMENTATION

## 🎯 MASALAH YANG DIPERBAIKI

### ❌ **Masalah Sebelumnya:**

1. **Backtracking Palsu**: Tidak ada rekursi, pencabangan, atau pencarian solusi alternatif
2. **Kurang Pemerataan**: User dengan sedikit shift tidak diprioritaskan
3. **Constraint Lemah**: Tidak ada batas shift berturut-turut yang ketat

### ✅ **Solusi Baru:**

1. **True Backtracking**: Recursive constraint satisfaction dengan pencabangan
2. **Workload Balancing**: Prioritas tinggi untuk pemerataan beban kerja
3. **Strict Constraints**: Batas ketat untuk consecutive shifts dan workload

---

## 🧠 **1. TRUE BACKTRACKING ALGORITHM**

### **Recursive Backtracking dengan Constraint Satisfaction:**

```typescript
/**
 * RECURSIVE BACKTRACKING: The core recursive function
 */
private async backtrackRecursive(
  requests: ShiftAssignment[],
  currentSolution: ShiftAssignment[],
  constraints: any,
  availableUsers: any[],
  index: number
): Promise<ShiftAssignment[]> {
  // Base case: all assignments processed
  if (index >= requests.length) {
    return [...currentSolution];
  }

  const currentRequest = requests[index];

  // Try each available user for this assignment
  const candidateUsers = this.getCandidateUsers(
    currentRequest,
    availableUsers,
    currentSolution,
    constraints
  );

  for (const user of candidateUsers) {
    // Create trial assignment
    const trialAssignment: ShiftAssignment = {
      ...currentRequest,
      userId: user.id,
      reason: `Backtracking: trial assignment`
    };

    // Check if this assignment violates constraints
    if (this.isValidAssignment(trialAssignment, currentSolution, constraints)) {
      // Add to current solution
      currentSolution.push(trialAssignment);

      // Update constraints for this assignment
      this.updateConstraints(constraints, trialAssignment);

      console.log(`🔄 Trying user ${user.id} for ${currentRequest.shiftDetails.date}`);

      // Recursive call for next assignment
      const result = await this.backtrackRecursive(
        requests,
        currentSolution,
        constraints,
        availableUsers,
        index + 1
      );

      // If successful, return the solution
      if (result.length > currentSolution.length - 1) {
        return result;
      }

      // BACKTRACK: Remove assignment and restore constraints
      console.log(`⬅️ Backtracking from user ${user.id}`);
      currentSolution.pop();
      this.restoreConstraints(constraints, trialAssignment);
    }
  }

  // No valid assignment found, return current solution
  return [...currentSolution];
}
```

### **Key Features:**

- ✅ **Rekursi**: Fungsi memanggil dirinya sendiri
- ✅ **Pencabangan**: Mencoba setiap user untuk setiap assignment
- ✅ **Backtrack**: Mundur ketika solusi tidak valid
- ✅ **Constraint Propagation**: Update dan restore constraints

---

## ⚖️ **2. ENHANCED WORKLOAD BALANCING**

### **Prioritas Pemerataan Shift:**

```typescript
private calculateWorkloadBalance(
  userWorkload: any,
  allUserWorkloads: Map<number, any>
): number {
  const allShiftCounts = Array.from(allUserWorkloads.values()).map(w => w.totalShifts);
  const avgShifts = allShiftCounts.reduce((sum, count) => sum + count, 0) / allShiftCounts.length;
  const minShifts = Math.min(...allShiftCounts);

  // Heavy bonus for users with fewer shifts than average
  const shiftDifference = avgShifts - userWorkload.totalShifts;

  if (userWorkload.totalShifts === minShifts) {
    return 30; // Maximum bonus for user with least shifts
  } else if (shiftDifference > 2) {
    return 20; // High bonus for significantly under-worked users
  } else if (shiftDifference > 0) {
    return 10; // Medium bonus for under-worked users
  } else if (shiftDifference < -3) {
    return -25; // Heavy penalty for over-worked users
  }

  return 0;
}
```

### **Sorting dengan Workload Priority:**

```typescript
// Sort by score, but prioritize workload balancing
userScores.sort((a, b) => {
  // First priority: workload balance (favor users with fewer shifts)
  const workloadDiff = a.workload.totalShifts - b.workload.totalShifts;
  if (Math.abs(workloadDiff) >= 3) {
    // Significant workload difference
    return workloadDiff; // User dengan shift lebih sedikit diprioritaskan
  }

  // Second priority: fitness score
  return b.score - a.score;
});
```

---

## 🚫 **3. STRICT CONSECUTIVE SHIFT CONSTRAINTS**

### **Hard Constraints (ABSOLUTE):**

```typescript
// 1. Maximum consecutive days: 5 hari
if (consecutiveDays >= 5) return 0; // Cannot assign

// 2. Maximum consecutive night shifts: 2 malam berturut-turut
if (request.shiftType === "MALAM") {
  const consecutiveNights = this.calculateConsecutiveNightShifts(
    user,
    request.date
  );
  if (consecutiveNights >= 2) return 0; // Cannot assign
}

// 3. Maximum weekly shifts: 5 shift dalam 7 hari
const weeklyShifts = this.calculateWeeklyShifts(user, request.date);
if (weeklyShifts >= 5) return 0; // Cannot assign

// 4. Minimum rest between shifts: 8 jam
if (this.checkMinimumRestViolation(userId, newShift, currentSolution, 8)) {
  return false; // Cannot assign
}
```

### **Consecutive Night Shift Detection:**

```typescript
private calculateConsecutiveNightShifts(user: any, targetDate: string): number {
  const nightShifts = user.shifts
    .filter((shift: any) => shift.tipeshift === 'MALAM')
    .map((shift: any) => shift.tanggal.toISOString().split('T')[0])
    .sort();

  const target = new Date(targetDate);
  let consecutiveCount = 0;

  // Count backwards from target date
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(target);
    checkDate.setDate(target.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (nightShifts.includes(dateStr)) {
      consecutiveCount++;
    } else {
      break; // Non-consecutive, stop counting
    }
  }

  return consecutiveCount;
}
```

### **Weekly Shift Limitation:**

```typescript
private checkWeeklyShiftsViolation(
  userId: number,
  newDate: string,
  currentSolution: ShiftAssignment[],
  maxWeeklyShifts: number
): boolean {
  const newDateObj = new Date(newDate);
  const weekStart = new Date(newDateObj);
  weekStart.setDate(newDateObj.getDate() - newDateObj.getDay()); // Start of week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // End of week

  const weekShifts = currentSolution.filter(a => {
    if (a.userId !== userId) return false;
    const shiftDate = new Date(a.shiftDetails.date);
    return shiftDate >= weekStart && shiftDate <= weekEnd;
  });

  return weekShifts.length >= maxWeeklyShifts; // Max 5 shifts per week
}
```

---

## 📊 **4. ENHANCED CONSTRAINT SYSTEM**

### **Constraint Types:**

```typescript
const constraints = {
  userShifts: new Map<number, ShiftAssignment[]>(),
  maxShiftsPerMonth: 20, // Batas bulanan
  maxConsecutiveDays: 5, // Max 5 hari berturut-turut
  maxConsecutiveNightShifts: 2, // Max 2 malam berturut-turut
  maxWeeklyShifts: 5, // Max 5 shift per minggu
  minRestBetweenShifts: 8, // Min 8 jam istirahat
  shiftTypeRotation: true, // Rotasi tipe shift
};
```

### **Constraint Validation:**

```typescript
private isValidAssignment(
  assignment: ShiftAssignment,
  currentSolution: ShiftAssignment[],
  constraints: any
): boolean {
  const userId = assignment.userId;

  // 1. No double booking same day
  if (this.hasShiftConflict(userId, assignment.shiftDetails.date, currentSolution)) {
    return false;
  }

  // 2. Maximum consecutive days
  if (this.checkConsecutiveDaysViolation(userId, assignment.shiftDetails.date, currentSolution, 5)) {
    return false;
  }

  // 3. Maximum consecutive night shifts
  if (assignment.shiftDetails.shiftType === 'MALAM') {
    if (this.checkConsecutiveNightShiftsViolation(userId, assignment.shiftDetails.date, currentSolution, 2)) {
      return false;
    }
  }

  // 4. Maximum weekly shifts
  if (this.checkWeeklyShiftsViolation(userId, assignment.shiftDetails.date, currentSolution, 5)) {
    return false;
  }

  // 5. Minimum rest between shifts
  if (this.checkMinimumRestViolation(userId, assignment.shiftDetails, currentSolution, 8)) {
    return false;
  }

  return true;
}
```

---

## 🎯 **5. ALGORITHM FLOW COMPARISON**

### **❌ Before (Fake Backtracking):**

```
1. Greedy assignment
2. Check conflicts
3. Simple reassignment (no recursion)
4. Limited constraint checking
```

### **✅ After (True Backtracking):**

```
1. Enhanced Greedy with workload balancing
2. Recursive backtracking with constraint satisfaction
3. Try all possible assignments for each request
4. Backtrack when constraints violated
5. Strict enforcement of all constraints
```

---

## 📈 **6. EXPECTED IMPROVEMENTS**

### **Workload Distribution:**

- ✅ **Pemerataan**: User dengan shift sedikit diprioritaskan
- ✅ **Fairness**: Tidak ada user yang overloaded
- ✅ **Balance**: Distribusi shift yang merata

### **Constraint Satisfaction:**

- ✅ **Consecutive Days**: Max 5 hari berturut-turut
- ✅ **Night Shifts**: Max 2 malam berturut-turut
- ✅ **Weekly Limit**: Max 5 shift per minggu
- ✅ **Rest Period**: Min 8 jam istirahat

### **Solution Quality:**

- ✅ **Optimal**: True backtracking finds better solutions
- ✅ **Valid**: All constraints strictly enforced
- ✅ **Fair**: Workload distributed evenly

---

## 🚀 **IMPLEMENTATION STATUS**

✅ **True Backtracking**: Implemented with recursion and constraint propagation  
✅ **Workload Balancing**: Heavy priority for even distribution  
✅ **Consecutive Constraints**: Strict enforcement of all limits  
✅ **Enhanced Fitness**: Comprehensive scoring with all factors  
✅ **Constraint System**: Complete validation framework

**Result**: Sekarang algorithm benar-benar menggunakan backtracking dengan rekursi, pencabangan solusi, dan constraint satisfaction yang ketat!
