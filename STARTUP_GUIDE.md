# 🚀 RSUD Anugerah Application Startup Guide

## **Quick Start Commands**

### **🎯 Method 1: Full System Start (Recommended)**

```bash
# Start all containers in background
docker compose up -d

# View logs
docker compose logs -f

# Check container status
docker compose ps
```

### **🎯 Method 2: Development Mode with Logs**

```bash
# Start with live logs (see everything happening)
docker compose up

# Stop with Ctrl+C
```

### **🎯 Method 3: Selective Service Start**

```bash
# Start only database
docker compose up -d postgres

# Start database + backend
docker compose up -d postgres backend

# Start everything
docker compose up -d
```

### **🎯 Method 4: Using the Deploy Script**

```bash
# Use our automated deployment script
chmod +x deploy-docker.sh
./deploy-docker.sh
```

---

## 📊 **Container Startup Order**

The containers start in this dependency order:

```
1. 🗄️  PostgreSQL Database    (Port 5433 → 5432)
   ↓
2. 🔧 NestJS Backend API      (Port 3001)
   ↓
3. 🌐 Next.js Frontend        (Port 3000)
   ↓
4. 🔀 Nginx Reverse Proxy     (Port 80/443)
```

---

## 🔍 **How to Monitor Startup**

### **Check Container Status:**

```bash
# See all containers
docker compose ps

# See detailed status
docker compose ps -a

# See resource usage
docker stats
```

### **View Logs:**

```bash
# All services
docker compose logs

# Specific service
docker compose logs postgres
docker compose logs backend
docker compose logs frontend
docker compose logs nginx

# Follow logs in real-time
docker compose logs -f backend
```

### **Check Health:**

```bash
# Health check status
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Test endpoints
curl http://localhost:3001/health    # Backend health
curl http://localhost:3000          # Frontend
curl http://localhost:80            # Nginx proxy
```

---

## 🌐 **Access Points After Startup**

### **Direct Service Access:**

- **Frontend (Next.js)**: http://localhost:3000
- **Backend API (NestJS)**: http://localhost:3001
- **Database (PostgreSQL)**: localhost:5433
- **Nginx Proxy**: http://localhost:80

### **API Endpoints:**

- **Health Check**: http://localhost:3001/health
- **API Documentation**: http://localhost:3001/api/docs
- **Auth Login**: http://localhost:3001/auth/login
- **Pegawai**: http://localhost:3001/pegawai
- **Absensi**: http://localhost:3001/absensi
- **Shift**: http://localhost:3001/shift

### **Frontend Routes:**

- **Dashboard**: http://localhost:3000/
- **Login**: http://localhost:3000/sign-in
- **Absensi**: http://localhost:3000/list/absensi
- **Pegawai**: http://localhost:3000/list/pegawai
- **Shift**: http://localhost:3000/list/shift

---

## ⚡ **Expected Startup Times**

| Service    | Expected Time | Status Indicator    |
| ---------- | ------------- | ------------------- |
| PostgreSQL | 10-30 seconds | `healthy` status    |
| Backend    | 2-5 minutes   | Health check passes |
| Frontend   | 5-15 minutes  | Server responds     |
| Nginx      | 5-10 seconds  | Proxy ready         |

### **Build Times (First Run):**

- **Backend**: ~5 minutes (TypeScript compilation, dependencies)
- **Frontend**: ~10-15 minutes (Next.js build, optimization)
- **Subsequent runs**: Much faster (Docker cache)

---

## 🔧 **Environment Configuration**

### **Create .env file (if not exists):**

```bash
# Create environment file
cat > .env << 'EOF'
# Database Configuration
POSTGRES_DB=rsud_anugerah
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Backend Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
```

### **For Development:**

```bash
# Use development docker compose
docker compose -f docker-compose.dev.yml up -d
```

---

## 🛠️ **Troubleshooting Common Issues**

### **Issue: Port Already in Use**

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5433

# Kill process if needed
kill -9 $(lsof -ti:3000)

# Or change ports in docker-compose.yml
```

### **Issue: Container Won't Start**

```bash
# Check logs for errors
docker compose logs [service-name]

# Restart specific service
docker compose restart [service-name]

# Rebuild if needed
docker compose build [service-name]
docker compose up -d [service-name]
```

### **Issue: Database Connection Failed**

```bash
# Check database is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test database connection
docker compose exec postgres psql -U postgres -d rsud_anugerah -c "SELECT 1;"
```

### **Issue: Frontend Build Failed**

```bash
# Check frontend logs
docker compose logs frontend

# Rebuild frontend
docker compose build frontend --no-cache
docker compose up -d frontend
```

---

## 🔄 **Development Workflow**

### **For Frontend Development:**

```bash
# Start backend services only
docker compose up -d postgres backend

# Run frontend locally (in frontend directory)
cd frontend
npm run dev  # Runs on localhost:3000
```

### **For Backend Development:**

```bash
# Start database only
docker compose up -d postgres

# Run backend locally (in backend directory)
cd backend
npm run start:dev  # Runs on localhost:3001
```

### **For Full Stack Development:**

```bash
# Use development compose file
docker compose -f docker-compose.dev.yml up -d

# This includes volume mounts for hot reload
```

---

## 📈 **Performance Optimization**

### **Speed Up Builds:**

```bash
# Use Docker BuildKit
export DOCKER_BUILDKIT=1

# Build in parallel
docker compose build --parallel

# Use build cache
docker compose build
```

### **Reduce Resource Usage:**

```bash
# Limit resources
docker compose up -d --scale frontend=1 --scale backend=1
```

---

## 🛑 **Stopping the Application**

### **Stop All Services:**

```bash
# Stop containers (keeps them for restart)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove everything (including volumes)
docker compose down -v --remove-orphans
```

### **Stop Specific Services:**

```bash
# Stop just frontend
docker compose stop frontend

# Stop and restart backend
docker compose restart backend
```

---

## 🎯 **Quick Commands Cheat Sheet**

```bash
# Start everything
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Restart service
docker compose restart [service]

# Rebuild service
docker compose build [service]

# Shell into container
docker compose exec [service] sh

# Update and restart
docker compose pull && docker compose up -d
```

---

## ✅ **Startup Checklist**

1. ✅ Clone repository
2. ✅ Navigate to project directory
3. ✅ Create .env file (optional)
4. ✅ Run `docker compose up -d`
5. ✅ Wait for containers to build and start
6. ✅ Check status with `docker compose ps`
7. ✅ Access frontend at http://localhost:3000
8. ✅ Access backend at http://localhost:3001
9. ✅ Test login functionality
10. ✅ Verify all features working

---

_Happy coding! Your RSUD Anugerah hospital management system is ready to serve! 🏥_
