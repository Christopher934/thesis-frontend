# 🐳 Docker Containerization Guide - RSUD Anugerah

## 📋 Overview

Sistem RSUD Anugerah telah dikonfigurasi untuk menggunakan **arsitektur multi-container** yang mengikuti best practices modern untuk aplikasi web scalable.

---

## 🏗️ **Arsitektur Container**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Frontend      │    │   Backend       │
│   (Port 80/443) │────│   (Next.js)     │────│   (NestJS)      │
│                 │    │   Port 3000     │    │   Port 3001     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   Port 5432     │
                                               └─────────────────┘
```

### 🔧 **Container Components:**

1. **🌐 Nginx Reverse Proxy**

   - Load balancing & SSL termination
   - Rate limiting & security headers
   - Static file serving

2. **📱 Frontend Container (Next.js)**

   - React-based user interface
   - Server-side rendering
   - API route handling

3. **🔧 Backend Container (NestJS)**

   - REST API endpoints
   - Business logic processing
   - Authentication & authorization

4. **🗄️ Database Container (PostgreSQL)**
   - Data persistence
   - Transactional operations
   - Backup & recovery

---

## ✅ **Best Practices Implemented**

### 🔒 **Security:**

- Non-root user execution
- Multi-stage builds for smaller images
- Environment variable management
- Network isolation
- Rate limiting

### 📈 **Performance:**

- Standalone Next.js output
- Alpine Linux base images
- Layer caching optimization
- Health checks

### 🔄 **Scalability:**

- Independent container scaling
- Horizontal scaling ready
- Load balancer configuration
- Database connection pooling

### 🛠️ **Development:**

- Hot reload support
- Volume mounting for development
- Environment-specific configs
- Easy local setup

---

## 🚀 **Quick Start**

### 1. **Prerequisites:**

```bash
# Install Docker & Docker Compose
brew install docker docker-compose  # macOS
# or
sudo apt-get install docker docker-compose  # Ubuntu
```

### 2. **Environment Setup:**

```bash
# Copy environment template
cp .env.docker .env

# Edit environment variables
nano .env
```

### 3. **Deploy:**

```bash
# Make deployment script executable
chmod +x deploy-docker.sh

# Deploy all services
./deploy-docker.sh
```

### 4. **Access Applications:**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Database:** localhost:5432

---

## 📊 **Container Management**

### **Start Services:**

```bash
docker-compose up -d
```

### **Stop Services:**

```bash
docker-compose down
```

### **View Logs:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### **Rebuild Images:**

```bash
docker-compose build --no-cache
docker-compose up -d
```

### **Database Operations:**

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed

# Access database
docker-compose exec postgres psql -U postgres -d rsud_anugerah
```

---

## 🔧 **Development Mode**

### **Local Development with Docker:**

```bash
# Development compose file
docker-compose -f docker-compose.dev.yml up -d
```

### **Hot Reload Configuration:**

```yaml
# docker-compose.dev.yml
version: "3.8"
services:
  frontend:
    build:
      context: ./frontend
      target: development
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

---

## 📈 **Production Deployment**

### **Environment Variables:**

```bash
# .env.production
NODE_ENV=production
POSTGRES_PASSWORD=secure-production-password
JWT_SECRET=super-secure-jwt-secret-key
NEXT_PUBLIC_API_URL=https://api.rsud-anugerah.com
```

### **SSL Configuration:**

```bash
# Generate SSL certificates
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/rsud.key -out ssl/rsud.crt
```

### **Production Deployment:**

```bash
# Deploy with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🔍 **Monitoring & Health Checks**

### **Service Health:**

```bash
# Check all service status
docker-compose ps

# Health check endpoints
curl http://localhost:3000/api/health  # Frontend
curl http://localhost:3001/health      # Backend
```

### **Resource Monitoring:**

```bash
# Container resource usage
docker stats

# Logs monitoring
docker-compose logs -f --tail=100
```

---

## 🎯 **Benefits Achieved**

### ✅ **Operational Benefits:**

- **Independent Scaling:** Scale frontend & backend separately
- **Zero Downtime Deployment:** Rolling updates possible
- **Environment Consistency:** Same containers dev → staging → prod
- **Easy Rollback:** Container versioning & quick rollback

### ✅ **Development Benefits:**

- **Team Independence:** Frontend & backend teams can work separately
- **Technology Flexibility:** Upgrade Next.js without affecting NestJS
- **Simplified Setup:** One command deployment for new developers
- **Debugging:** Isolated container logs and debugging

### ✅ **Security Benefits:**

- **Network Isolation:** Containers communicate via internal network
- **Least Privilege:** Non-root user execution
- **Secret Management:** Environment-based secret handling
- **Attack Surface Reduction:** Minimal base images

---

## 📚 **Additional Resources**

### **Docker Commands Reference:**

```bash
# Container management
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose restart frontend   # Restart specific service
docker-compose exec backend bash  # Shell into container

# Image management
docker-compose build              # Build all images
docker-compose pull               # Pull latest base images
docker image prune -a             # Clean unused images

# Volume management
docker volume ls                  # List volumes
docker volume rm rsud_postgres_data  # Remove volume
```

### **Troubleshooting:**

```bash
# Check container status
docker-compose ps

# View container resource usage
docker stats

# Check network connectivity
docker-compose exec frontend ping backend
docker-compose exec backend ping postgres

# Database connection test
docker-compose exec backend npx prisma db ping
```

---

## 🎉 **Summary**

Sistem RSUD Anugerah sekarang menggunakan **containerized architecture** yang mengikuti industry best practices:

- ✅ **Multi-container separation** (Frontend, Backend, Database, Proxy)
- ✅ **Security hardening** (Non-root users, network isolation)
- ✅ **Production-ready** (Health checks, SSL support, monitoring)
- ✅ **Developer-friendly** (One-command deployment, hot reload)
- ✅ **Scalable architecture** (Independent scaling, load balancing)

Container setup ini memberikan foundation yang solid untuk development, testing, dan production deployment yang reliable dan scalable! 🚀

---

**Created:** June 20, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
