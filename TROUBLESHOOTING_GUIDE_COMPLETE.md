# 🛠️ RSUD TROUBLESHOOTING GUIDE - PANDUAN MENGATASI ERROR

## 🚨 **JIKA MASIH ADA ERROR SETELAH INI**

**Panduan Lengkap Mengatasi Masalah Sistem RSUD Shift Management**

---

## 📋 **DAFTAR ERROR UMUM & SOLUSINYA**

### **1. 🔧 WEBPACK/BUILD ERRORS**

#### **Error:** `ENOENT: no such file or directory, stat '.next/cache/webpack'`

```bash
# Solusi Cepat:
cd /Users/jo/Documents/Backup\ 2/Thesis/frontend
./fix-cache.sh

# Solusi Manual:
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

#### **Error:** `exports is not defined`

```bash
# Gunakan konfigurasi sederhana:
cp next.config.simple.mjs next.config.mjs
rm -rf .next
npm run dev
```

#### **Error:** `Module not found` atau `Cannot resolve module`

```bash
# Clear cache dan reinstall:
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

---

### **2. 🌐 SERVER ERRORS**

#### **Error:** `EADDRINUSE: address already in use`

```bash
# Hentikan semua proses Node.js:
pkill -f "next"
pkill -f "nest"

# Atau gunakan port lain:
npm run dev -- -p 3002

# Untuk backend:
nest start --watch --port 3002
```

#### **Error:** `Connection refused` atau Server tidak merespons

```bash
# Restart kedua server:
cd /Users/jo/Documents/Backup\ 2/Thesis

# Terminal 1 - Backend:
cd backend
npm run start:dev

# Terminal 2 - Frontend:
cd frontend
npm run dev
```

#### **Error:** `502 Bad Gateway` atau API tidak merespons

```bash
# Cek status backend:
curl http://localhost:3001/users

# Jika tidak merespons, restart backend:
cd backend
npm run start:dev
```

---

### **3. 🔐 AUTHENTICATION ERRORS**

#### **Error:** `401 Unauthorized` atau Token tidak valid

```bash
# Test login manual:
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Jika gagal, cek database:
cd backend
npx prisma studio
```

#### **Error:** `403 Forbidden` atau Access denied

```bash
# Cek role user di database
# Login sebagai admin dulu, kemudian akses halaman
```

#### **Error:** `JWT malformed` atau Token error

```bash
# Clear localStorage dan login ulang:
# Buka browser dev tools > Application > Local Storage > Clear All
```

---

### **4. 🗄️ DATABASE ERRORS**

#### **Error:** `Database connection failed`

```bash
cd backend

# Cek status database:
npx prisma db status

# Reset database jika perlu:
npx prisma db reset
npx prisma db seed
```

#### **Error:** `Table doesn't exist` atau Schema errors

```bash
cd backend

# Generate dan apply migrations:
npx prisma generate
npx prisma db push

# Jika masih error, reset database:
npx prisma migrate reset
```

#### **Error:** `No users found` atau Data kosong

```bash
cd backend

# Seed ulang database:
npx prisma db seed

# Atau manual insert admin:
npx prisma studio
# Buat user admin manual
```

---

### **5. 🎨 UI/FRONTEND ERRORS**

#### **Error:** `Hydration failed` atau React errors

```bash
# Clear cache dan restart:
cd frontend
rm -rf .next
npm run dev
```

#### **Error:** `CSS not loading` atau Styling rusak

```bash
# Regenerate CSS:
cd frontend
rm -rf .next/static
npm run dev
```

#### **Error:** `Component not found` atau Import errors

```bash
# Cek path import:
# Pastikan semua import menggunakan @ alias
# Contoh: import Component from '@/components/Component'
```

---

## 🚀 **RECOVERY SCRIPTS YANG TERSEDIA**

### **1. Script Cache Cleaner** (`fix-cache.sh`)

```bash
# Pembersihan cache normal:
./fix-cache.sh

# Pembersihan mendalam:
./fix-cache.sh --deep

# Backup konfigurasi:
./fix-cache.sh --backup
```

### **2. Script Performance Monitor** (`monitor-performance.sh`)

```bash
# Monitor performa sistem:
./monitor-performance.sh

# Monitor berkelanjutan (setiap 30 detik):
watch -n 30 ./monitor-performance.sh
```

### **3. Script System Validator** (`validate-system.sh`)

```bash
# Validasi sistem lengkap:
./validate-system.sh

# Cek status basic:
curl http://localhost:3000
curl http://localhost:3001/users
```

---

## 🔍 **DIAGNOSTIC COMMANDS**

### **Cek Status Server:**

```bash
# Frontend:
curl -I http://localhost:3000/

# Backend:
curl -I http://localhost:3001/users

# Database:
cd backend && npx prisma db status
```

### **Cek Log Errors:**

```bash
# Frontend logs:
cd frontend && npm run dev 2>&1 | tee dev.log

# Backend logs:
cd backend && npm run start:dev 2>&1 | tee backend.log
```

### **Cek Port Usage:**

```bash
# Cek port yang digunakan:
lsof -i :3000
lsof -i :3001

# Kill process di port tertentu:
kill -9 $(lsof -ti:3000)
```

---

## 🆘 **EMERGENCY PROCEDURES**

### **🚨 JIKA SEMUA ERROR - FULL RESET:**

```bash
#!/bin/bash
echo "🚨 EMERGENCY FULL RESET"

# 1. Stop all processes
pkill -f "next"
pkill -f "nest"

# 2. Clean frontend
cd /Users/jo/Documents/Backup\ 2/Thesis/frontend
rm -rf .next
rm -rf node_modules
npm install

# 3. Clean backend
cd ../backend
rm -rf node_modules
npm install

# 4. Reset database
npx prisma generate
npx prisma db reset
npx prisma db seed

# 5. Restart servers
echo "Starting backend..."
npm run start:dev &

sleep 5

echo "Starting frontend..."
cd ../frontend
npm run dev
```

### **🔄 QUICK RESTART PROCEDURE:**

```bash
#!/bin/bash
echo "🔄 QUICK RESTART"

# Stop processes
pkill -f "next"
pkill -f "nest"

# Clean cache
cd /Users/jo/Documents/Backup\ 2/Thesis/frontend
rm -rf .next

# Start backend
cd ../backend
npm run start:dev &

# Start frontend
cd ../frontend
npm run dev
```

---

## 📞 **STEP-BY-STEP ERROR RESOLUTION**

### **Langkah 1: Identifikasi Error**

```bash
# Cek console browser (F12)
# Cek terminal output
# Cek network tab untuk API errors
```

### **Langkah 2: Cek Status Sistem**

```bash
# Test kedua server:
curl http://localhost:3000/
curl http://localhost:3001/users
```

### **Langkah 3: Gunakan Recovery Script**

```bash
# Untuk cache errors:
./fix-cache.sh

# Untuk performa issues:
./monitor-performance.sh
```

### **Langkah 4: Manual Troubleshooting**

```bash
# Lihat log error detail
# Cari error di Google/Stack Overflow
# Apply fix spesifik
```

### **Langkah 5: Validasi Perbaikan**

```bash
# Test sistem setelah fix:
./validate-system.sh
```

---

## 🎯 **PREVENTION TIPS**

### **Mencegah Error di Masa Depan:**

1. **✅ Regular Maintenance:**

   ```bash
   # Jalankan setiap minggu:
   ./fix-cache.sh
   ./monitor-performance.sh
   ```

2. **✅ Backup Berkala:**

   ```bash
   # Backup database:
   cd backend && npx prisma db backup

   # Backup konfigurasi:
   cp next.config.mjs next.config.backup.mjs
   ```

3. **✅ Monitor Performance:**

   ```bash
   # Setup monitoring otomatis:
   crontab -e
   # Tambahkan: */30 * * * * /path/to/monitor-performance.sh
   ```

4. **✅ Keep Dependencies Updated:**
   ```bash
   # Update berkala (hati-hati):
   npm audit
   npm update
   ```

---

## 📚 **DOCUMENTATION REFERENCES**

### **Error Codes & Solutions:**

- **ENOENT**: File/directory tidak ditemukkan → Bersihkan cache
- **EADDRINUSE**: Port sudah digunakan → Kill process lama
- **401/403**: Authentication error → Cek token/login
- **500**: Server error → Restart backend
- **404**: Route not found → Cek URL/routing

### **Useful Commands:**

```bash
# System Info:
node --version
npm --version
next --version

# Process Management:
ps aux | grep node
pkill -f "next"
lsof -i :3000

# Cache Management:
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force
```

---

## 🏆 **SUCCESS INDICATORS**

### **Sistem Berjalan Normal Jika:**

- ✅ Frontend: `http://localhost:3000/` returns 200
- ✅ Backend: `http://localhost:3001/users` returns data
- ✅ Auth: Login admin berhasil
- ✅ Dashboard: Data tampil real-time
- ✅ No error di console browser

---

## 📞 **EMERGENCY CONTACT PROCEDURE**

### **Jika Semua Cara Gagal:**

1. **🔄 Full System Reset** (gunakan emergency script di atas)
2. **📋 Document Error** (screenshot + log files)
3. **🔍 Research Solution** (Google error message)
4. **🛠️ Apply Targeted Fix**
5. **✅ Validate System** (gunakan validate-system.sh)

### **Backup Plan:**

```bash
# Jika sistem benar-benar rusak, gunakan:
git checkout HEAD~1  # Kembali ke commit sebelumnya
# Atau restore dari backup terbaru
```

---

**🎯 INGAT: 99% error dapat diatasi dengan membersihkan cache dan restart server!**

**📞 Gunakan script yang telah disediakan untuk troubleshooting cepat.**
