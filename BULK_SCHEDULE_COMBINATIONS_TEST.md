# 🧮 BULK SCHEDULE - TEST KOMBINASI KONFIGURASI

## 📊 **FORMULA PERHITUNGAN:**

```
Total Shift = Σ(Lokasi × Shift_per_Lokasi × Jumlah_Hari)
            = Σ(PAGI + SIANG + MALAM) × 7 hari
```

---

## 🎯 **TEST CASE 1: KONFIGURASI SEIMBANG**

### **Scenario A: Semua Lokasi - Pola Seimbang**

```
ICU:           PAGI=2, SIANG=2, MALAM=1  = 5 shift/hari
RAWAT_INAP:    PAGI=2, SIANG=2, MALAM=1  = 5 shift/hari
GAWAT_DARURAT: PAGI=3, SIANG=3, MALAM=2  = 8 shift/hari
```

**Perhitungan**: (5 + 5 + 8) × 7 = **126 shift total**

### **Scenario B: Konfigurasi Minimal User**

```
ICU:           PAGI=1, SIANG=1, MALAM=1  = 3 shift/hari
RAWAT_INAP:    PAGI=1, SIANG=1, MALAM=1  = 3 shift/hari
GAWAT_DARURAT: PAGI=1, SIANG=1, MALAM=1  = 3 shift/hari
```

**Perhitungan**: (3 + 3 + 3) × 7 = **63 shift total** ✅ (Sesuai user)

---

## 🔄 **TEST CASE 2: KONFIGURASI TIDAK SEIMBANG**

### **Scenario C: ICU Heavy**

```
ICU:           PAGI=5, SIANG=4, MALAM=3  = 12 shift/hari
RAWAT_INAP:    PAGI=1, SIANG=1, MALAM=0  = 2 shift/hari
GAWAT_DARURAT: PAGI=2, SIANG=2, MALAM=1  = 5 shift/hari
```

**Perhitungan**: (12 + 2 + 5) × 7 = **133 shift total**

### **Scenario D: Gawat Darurat Focus**

```
ICU:           PAGI=1, SIANG=0, MALAM=1  = 2 shift/hari
RAWAT_INAP:    PAGI=1, SIANG=1, MALAM=0  = 2 shift/hari
GAWAT_DARURAT: PAGI=8, SIANG=6, MALAM=4  = 18 shift/hari
```

**Perhitungan**: (2 + 2 + 18) × 7 = **154 shift total**

---

## 🚫 **TEST CASE 3: EDGE CASES**

### **Scenario E: Hanya Shift Pagi**

```
ICU:           PAGI=3, SIANG=0, MALAM=0  = 3 shift/hari
RAWAT_INAP:    PAGI=2, SIANG=0, MALAM=0  = 2 shift/hari
GAWAT_DARURAT: PAGI=4, SIANG=0, MALAM=0  = 4 shift/hari
```

**Perhitungan**: (3 + 2 + 4) × 7 = **63 shift total**

### **Scenario F: Shift Malam Only**

```
ICU:           PAGI=0, SIANG=0, MALAM=2  = 2 shift/hari
RAWAT_INAP:    PAGI=0, SIANG=0, MALAM=1  = 1 shift/hari
GAWAT_DARURAT: PAGI=0, SIANG=0, MALAM=3  = 3 shift/hari
```

**Perhitungan**: (2 + 1 + 3) × 7 = **42 shift total**

### **Scenario G: Mix Locations (Hanya 2 Lokasi)**

```
ICU:           PAGI=3, SIANG=2, MALAM=2  = 7 shift/hari
RAWAT_INAP:    PAGI=2, SIANG=2, MALAM=1  = 5 shift/hari
```

**Perhitungan**: (7 + 5) × 7 = **84 shift total**

### **Scenario H: Single Location Heavy**

```
ICU:           PAGI=10, SIANG=8, MALAM=6  = 24 shift/hari
```

**Perhitungan**: 24 × 7 = **168 shift total**

---

## ⚙️ **EXPECTED BEHAVIOR DARI SYSTEM:**

### ✅ **YANG HARUS BEKERJA:**

1. **Exact Count**: Total shift TEPAT sesuai perhitungan
2. **Only Configured Locations**: Hanya buat shift untuk lokasi yang ada konfigurasi
3. **Only Non-Zero Shifts**: Tidak buat shift untuk PAGI=0, SIANG=0, MALAM=0
4. **Sequential Dates**: 7 hari berurutan mulai dari start date
5. **Correct Shift Types**: Hanya buat shift yang dikonfigurasi (tidak semua PAGI/SIANG/MALAM)

### 🔍 **VALIDATION RULES:**

```typescript
// Pseudocode validation
function validateBulkSchedule(config, result) {
  let expectedTotal = 0;

  for (const [location, pattern] of Object.entries(config.shiftPattern)) {
    const dailyShifts =
      (pattern.PAGI || 0) + (pattern.SIANG || 0) + (pattern.MALAM || 0);
    expectedTotal += dailyShifts * 7;
  }

  assert(result.totalShifts === expectedTotal, "Total shift mismatch!");
  assert(result.uniqueDates.length === 7, "Should have exactly 7 dates!");
  assert(
    result.locations.equals(Object.keys(config.shiftPattern)),
    "Wrong locations!"
  );
}
```

---

## 🧪 **MANUAL TESTING PLAN:**

### **Test 1: Scenario User (63 shifts)**

```json
{
  "startDate": "2025-08-04",
  "shiftPattern": {
    "ICU": { "PAGI": 1, "SIANG": 1, "MALAM": 1 },
    "RAWAT_INAP": { "PAGI": 1, "SIANG": 1, "MALAM": 1 },
    "GAWAT_DARURAT": { "PAGI": 1, "SIANG": 1, "MALAM": 1 }
  }
}
```

**Expected**: 63 shifts, dates 4-10 Aug

### **Test 2: ICU Heavy (133 shifts)**

```json
{
  "startDate": "2025-08-04",
  "shiftPattern": {
    "ICU": { "PAGI": 5, "SIANG": 4, "MALAM": 3 },
    "RAWAT_INAP": { "PAGI": 1, "SIANG": 1, "MALAM": 0 },
    "GAWAT_DARURAT": { "PAGI": 2, "SIANG": 2, "MALAM": 1 }
  }
}
```

**Expected**: 133 shifts, no MALAM for RAWAT_INAP

### **Test 3: Single Location (168 shifts)**

```json
{
  "startDate": "2025-08-04",
  "shiftPattern": {
    "ICU": { "PAGI": 10, "SIANG": 8, "MALAM": 6 }
  }
}
```

**Expected**: 168 shifts, only ICU location

### **Test 4: Pagi Only (63 shifts)**

```json
{
  "startDate": "2025-08-04",
  "shiftPattern": {
    "ICU": { "PAGI": 3, "SIANG": 0, "MALAM": 0 },
    "RAWAT_INAP": { "PAGI": 2, "SIANG": 0, "MALAM": 0 },
    "GAWAT_DARURAT": { "PAGI": 4, "SIANG": 0, "MALAM": 0 }
  }
}
```

**Expected**: 63 shifts, hanya PAGI shifts

---

## 🎯 **KESIMPULAN:**

Dengan **fix yang sudah diterapkan**, sistem seharusnya:

1. ✅ **Menggunakan HANYA lokasi yang dikonfigurasi user**
2. ✅ **Membuat TEPAT jumlah shift sesuai perhitungan**
3. ✅ **Menghasilkan tanggal berurutan 7 hari**
4. ✅ **Tidak membuat shift untuk count = 0**

**Silakan test berbagai kombinasi ini untuk memastikan sistem bekerja konsisten!** 🚀
