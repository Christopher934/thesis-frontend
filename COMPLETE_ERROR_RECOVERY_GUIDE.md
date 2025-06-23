# 🛠️ RSUD TROUBLESHOOTING GUIDE - PANDUAN LENGKAP MENGATASI ERROR

## 🚨 **JIKA MASIH ADA ERROR SETELAH INI - PANDUAN KOMPREHENSIF**

**Updated**: June 22, 2025  
**Status**: COMPLETE SOLUTION GUIDE

---

## 🔥 **SOLUSI EMERGENCY - GUNAKAN INI DULU!**

**Script emergency recovery otomatis sudah dibuat:**

```bash
cd "/Users/jo/Documents/Backup 2/Thesis"
./emergency-recovery.sh
```

**Menu recovery otomatis:**

1. Webpack Cache Error (ENOENT)
2. Vendor Chunks 404 Error
3. Port Already in Use (EADDRINUSE)
4. Build/Compilation Error
5. API Connection Error
6. Database Connection Error
7. Authentication Error
8. Complete System Reset
9. Check System Status

---

## 📋 **ERROR CATALOG & INSTANT SOLUTIONS**

### **🔧 1. WEBPACK/CACHE ERRORS**

#### **Error:** `ENOENT: no such file or directory, stat '.next/cache/webpack'`

**Quick Fix:**

```bash
cd "/Users/jo/Documents/Backup 2/Thesis/frontend"
./fix-cache.sh
# atau manual:
rm -rf .next && npm run dev
```

#### **Error:** `exports is not defined` di vendor chunks

**Quick Fix:**

```bash
# Gunakan emergency config:
cp next.config.emergency.mjs next.config.mjs
rm -rf .next
npm run dev
```

#### **Error:** `GET /_next/static/chunks/vendors-*.js 404`

**Root Cause:** Webpack split chunks configuration conflict  
**Solution:**

```bash
# 1. Stop server
pkill -f "next dev"

# 2. Clean cache completely
rm -rf .next
rm -rf node_modules/.cache

# 3. Use emergency config
cp next.config.emergency.mjs next.config.mjs

# 4. Restart
npm run dev
```

**Emergency config disables splitChunks:**

```javascript
webpack: (config, { dev }) => {
  if (dev) {
    config.optimization = {
      ...config.optimization,
      splitChunks: false, // This fixes vendor chunks error
    };
  }
  return config;
};
```

---

### **🌐 2. SERVER CONNECTION ERRORS**

#### **Error:** `EADDRINUSE: address already in use :::3000`

**Quick Fix:**

```bash
# Force kill all processes:
sudo pkill -9 -f "next"
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
sleep 2
npm run dev
```

#### **Error:** `Connection refused` atau 500 Server Error

**Quick Fix:**

```bash
# Restart backend first:
cd backend
npm run start:dev &

# Then frontend:
cd ../frontend
npm run dev
```

#### **Error:** API endpoints returning 404

**Quick Fix:**

```bash
# Check backend is running:
curl http://localhost:3001/users

# If not, restart backend:
cd backend && npm run start:dev
```

---

### **🔐 3. AUTHENTICATION ERRORS**

#### **Error:** `401 Unauthorized` atau JWT errors

**Quick Fix:**

```bash
# Create auto-login helper:
cat > frontend/public/emergency-login.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Emergency Login</title></head>
<body>
<h2>🚨 RSUD Emergency Login</h2>
<button onclick="autoLogin()">Login as Admin</button>
<script>
function autoLogin() {
  fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    })
  })
  .then(r => r.json())
  .then(d => {
    if (d.access_token) {
      localStorage.setItem('token', d.access_token);
      localStorage.setItem('user', JSON.stringify(d.user));
      localStorage.setItem('role', d.user.role);
      alert('Login success! Redirecting...');
      window.location.href = '/admin';
    }
  })
  .catch(e => alert('Login failed: ' + e));
}
</script>
</body>
</html>
EOF

# Access: http://localhost:3000/emergency-login.html
```

#### **Error:** User role tidak dikenali

**Quick Fix:**

```bash
# Clear browser storage:
# F12 > Application > Storage > Clear All

# Or create clear storage helper:
echo 'localStorage.clear(); sessionStorage.clear(); location.reload();' > frontend/public/clear-storage.js
# Then access: http://localhost:3000/clear-storage.js
```

---

### **🗄️ 4. DATABASE CONNECTION ERRORS**

#### **Error:** `Database connection failed`

**Quick Fix:**

```bash
cd backend

# Reset database connection:
npx prisma generate
npx prisma db push

# If still failing, reset completely:
npx prisma migrate reset
npx prisma db seed
```

#### **Error:** `Table 'user' doesn't exist`

**Quick Fix:**

```bash
cd backend

# Apply migrations:
npx prisma db push

# If no migrations, create them:
npx prisma migrate dev --name init
```

#### **Error:** No admin user exists

**Quick Fix:**

```bash
cd backend

# Seed database with admin:
npx prisma db seed

# Or manual SQL:
npx prisma studio
# Create admin user manually
```

---

## 🚀 **EMERGENCY PROCEDURES**

### **🚨 TOTAL SYSTEM RESET (Last Resort):**

```bash
#!/bin/bash
echo "🚨 EMERGENCY TOTAL RESET - RSUD SYSTEM"

# Navigate to project root
cd "/Users/jo/Documents/Backup 2/Thesis"

# 1. KILL ALL PROCESSES
echo "Stopping all processes..."
sudo pkill -9 -f "next" 2>/dev/null || true
sudo pkill -9 -f "nest" 2>/dev/null || true
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true
sleep 3

# 2. CLEAN FRONTEND
echo "Cleaning frontend..."
cd frontend
rm -rf .next
rm -rf node_modules/.cache
rm -rf out
cp next.config.emergency.mjs next.config.mjs

# 3. CLEAN BACKEND
echo "Cleaning backend..."
cd ../backend
rm -rf dist
rm -rf node_modules/.cache

# 4. RESET DATABASE
echo "Resetting database..."
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. RESTART SERVICES
echo "Starting backend..."
npm run start:dev &
sleep 10

echo "Starting frontend..."
cd ../frontend
npm run dev &
sleep 5

echo "✅ EMERGENCY RESET COMPLETE"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "Admin Login: admin@example.com / admin123"
```

### **🔄 QUICK RECOVERY (Common Issues):**

```bash
#!/bin/bash
echo "🔄 QUICK RECOVERY - RSUD SYSTEM"

cd "/Users/jo/Documents/Backup 2/Thesis/frontend"

# Quick fixes for common issues:
pkill -f "next dev" 2>/dev/null || true
rm -rf .next
cp next.config.emergency.mjs next.config.mjs
npm run dev &

echo "✅ Quick recovery completed"
echo "Access: http://localhost:3000"
```

---

## 🔍 **DIAGNOSTIC TOOLS**

### **System Health Check:**

```bash
# Quick status check:
echo "=== RSUD SYSTEM HEALTH CHECK ==="
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)"
echo "Backend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/users)"
echo "Database: $(cd backend && npx prisma db status 2>&1 | head -1)"
```

### **Error Log Collector:**

```bash
# Collect all error logs:
echo "=== ERROR LOG COLLECTION ==="
echo "Frontend logs:"
cd frontend && tail -20 dev.log 2>/dev/null || echo "No frontend logs"

echo "Backend logs:"
cd ../backend && tail -20 backend.log 2>/dev/null || echo "No backend logs"

echo "System processes:"
ps aux | grep -E "(next|nest)" | grep -v grep
```

---

## 📞 **ESCALATION PROCEDURES**

### **Level 1: Auto Recovery**

```bash
./emergency-recovery.sh
# Choose option based on error type
```

### **Level 2: Manual Recovery**

```bash
# Follow specific error solutions above
# Use emergency config files
# Reset components individually
```

### **Level 3: Total Reset**

```bash
# Use emergency total reset script
# Restore from backup if available
# Rebuild from clean state
```

---

## 🎯 **PREVENTION STRATEGIES**

### **Daily Maintenance:**

```bash
# Run every day before work:
cd "/Users/jo/Documents/Backup 2/Thesis/frontend"
./fix-cache.sh
./monitor-performance.sh
```

### **Weekly Maintenance:**

```bash
# Run every week:
cd "/Users/jo/Documents/Backup 2/Thesis"
./validate-system.sh

# Backup current working config:
cd frontend
cp next.config.mjs next.config.working.$(date +%Y%m%d).mjs
```

### **Emergency Preparedness:**

```bash
# Always have these files ready:
# - next.config.emergency.mjs
# - emergency-recovery.sh
# - fix-cache.sh
# - monitor-performance.sh

# Test recovery procedures monthly
```

---

## 📋 **ERROR CODE QUICK REFERENCE**

| Error Code          | Quick Fix                                      | Script                               |
| ------------------- | ---------------------------------------------- | ------------------------------------ |
| `ENOENT`            | `rm -rf .next && npm run dev`                  | `./fix-cache.sh`                     |
| `EADDRINUSE`        | `pkill -f "next" && npm run dev`               | `./emergency-recovery.sh` → Option 3 |
| `404 vendor chunks` | `cp next.config.emergency.mjs next.config.mjs` | `./emergency-recovery.sh` → Option 2 |
| `401 Unauthorized`  | Access `/emergency-login.html`                 | `./emergency-recovery.sh` → Option 7 |
| `500 Server Error`  | `cd backend && npm run start:dev`              | `./emergency-recovery.sh` → Option 5 |
| `Database Error`    | `npx prisma db push && npx prisma db seed`     | `./emergency-recovery.sh` → Option 6 |

---

## 🏆 **SUCCESS VALIDATION**

### **System is working if:**

- ✅ `http://localhost:3000/` loads without errors
- ✅ `http://localhost:3000/admin` redirects to login
- ✅ `http://localhost:3001/users` returns JSON data
- ✅ Admin login works: `admin@example.com / admin123`
- ✅ Dashboard shows real-time data
- ✅ No console errors in browser F12

### **Performance is good if:**

- ✅ Page load < 3 seconds
- ✅ API response < 500ms
- ✅ No 404 errors in Network tab
- ✅ Memory usage stable

---

## 💡 **PRO TIPS**

1. **Always use emergency config for development:**

   ```bash
   cp next.config.emergency.mjs next.config.mjs
   ```

2. **Keep recovery scripts executable:**

   ```bash
   chmod +x *.sh
   ```

3. **Monitor system regularly:**

   ```bash
   watch -n 30 ./monitor-performance.sh
   ```

4. **Create backup before major changes:**

   ```bash
   cp next.config.mjs next.config.backup.$(date +%Y%m%d).mjs
   ```

5. **Use emergency login for quick testing:**
   Access: `http://localhost:3000/emergency-login.html`

---

## 🚨 **REMEMBER: 90% of errors are fixed by:**

1. **🧹 Clean cache:** `rm -rf .next`
2. **🔄 Restart server:** `pkill -f "next" && npm run dev`
3. **⚙️ Use emergency config:** `cp next.config.emergency.mjs next.config.mjs`

**📞 Always try the emergency recovery script first!**

---

**🎯 FINAL REMINDER:**

- **Keep calm** 😌
- **Use scripts first** 🔧
- **Document what works** 📝
- **Prevention is better** 🛡️

**✅ System status after this guide: FULLY RECOVERABLE**
