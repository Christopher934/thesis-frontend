# 🏥 RSUD Anugerah Hospital Management System

A comprehensive hospital management system built with modern web technologies, featuring employee management, attendance tracking, shift scheduling, and more.

## 🏗️ Architecture

This application uses a **multi-container Docker architecture** that separates concerns and enables independent scaling:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   NestJS        │    │   Next.js       │    │     Nginx       │
│   Database      │◄──►│   Backend API   │◄──►│   Frontend      │◄──►│   Proxy         │
│   Container     │    │   Container     │    │   Container     │    │   Container     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
    Port: 5433             Port: 3001             Port: 3000             Port: 80/443
```

## 🛠️ Tech Stack

### Backend

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **State Management**: React hooks

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL with Alpine Linux
- **Development**: Hot reload with volume mounts

## 📋 Prerequisites

Before starting, ensure you have:

- **Docker Desktop** installed and running
- **Git** for cloning the repository
- **8GB+ RAM** recommended for smooth operation
- **Ports available**: 3000, 3001, 5433, 80, 443

### Check Prerequisites:

```bash
# Check Docker
docker --version
docker compose version

# Check available ports
lsof -i :3000
lsof -i :3001
lsof -i :5433
```

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd rsud-anugerah
```

### Step 2: Choose Your Startup Method

#### 🎯 Option A: Fast Development (Recommended for Development)

```bash
# Fastest startup - backend in Docker, frontend local
chmod +x start-app.sh
./start-app.sh --fast

# Then in a new terminal:
cd frontend
npm run dev
```

**⚡ Benefits**: Instant frontend changes, no Docker build wait time

#### 🎯 Option B: One-Command Start (Production-like)

```bash
# Use our smart startup script
chmod +x start-app.sh
./start-app.sh
```

**⚠️ Note**: May take 10-15 minutes for frontend Docker build

#### 🎯 Option C: Backend-Only Docker

```bash
# Start only backend services (fastest backend setup)
./start-app.sh --backend-only

# Run frontend locally with hot reload
cd frontend
npm install
npm run dev
```

#### 🎯 Option D: Full Docker Production

```bash
# Start all services (may take 10-15 minutes first time)
docker compose up -d

# Monitor progress
docker compose logs -f
```

#### 🎯 Option C: Development with Logs

```bash
# Start with live logs (see everything happening)
./start-app.sh --logs

# Or manually
docker compose up
```

#### 🎯 Option D: Hybrid Development (Fastest for Development)

```bash
# Start backend services only (faster)
docker compose up -d postgres backend

# Run frontend locally with hot reload
cd frontend
npm install
npm run dev
```

#### 🎯 Option E: Production Deployment

```bash
# Use automated deployment script
chmod +x deploy-docker.sh
./deploy-docker.sh
```

### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Database**: localhost:5433

### Step 4: Default Login

```
Email: admin@rsud.com
Password: admin123
```

> **💡 Pro Tip**: For fastest development, use Option D (Hybrid Development) which starts the backend in Docker but runs the frontend locally with hot reload.

## 📝 Detailed Step-by-Step Setup

### 1. Prerequisites Check

```bash
# Check Docker installation
docker --version
docker compose version

# Check available ports
lsof -i :3000 :3001 :5433 :80

# Ensure Docker Desktop is running
docker info
```

### 2. Smart Startup Script (Recommended)

Our custom startup script handles everything automatically:

```bash
# Make executable (one-time setup)
chmod +x start-app.sh

# Quick start (background mode)
./start-app.sh

# Start with live logs
./start-app.sh --logs

# Development mode with hot reload
./start-app.sh --dev

# Force rebuild all containers
./start-app.sh --build
```

**What the script does:**

- ✅ Checks Docker is running
- ✅ Creates `.env` file if missing
- ✅ Starts containers in optimal order
- ✅ Shows real-time status
- ✅ Provides access URLs

### 3. Manual Container Management

#### Start All Services

```bash
# Background mode (recommended)
docker compose up -d

# Foreground mode (with logs)
docker compose up

# Development mode with volume mounts
docker compose -f docker-compose.dev.yml up -d
```

#### Monitor Startup Progress

```bash
# Check container status
docker compose ps

# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f nginx

# Follow logs from specific time
docker compose logs --since 30m -f
```

### 4. Environment Configuration

#### Automatic Environment Setup

The startup script creates a default `.env` file, or you can create a custom one:

```bash
# Create custom .env file
cat > .env << 'EOF'
# Database Configuration
POSTGRES_DB=rsud_anugerah
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Backend Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/rsud_anugerah

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

#### Production Environment

```bash
# Copy production template
cp .env.docker .env

# Edit with secure values
nano .env
```

### 5. Container Startup Timeline & Verification

#### Expected Startup Order & Times

| Step | Service               | Time           | Status Check                        |
| ---- | --------------------- | -------------- | ----------------------------------- |
| 1    | 🗄️ PostgreSQL         | 30 seconds     | `docker compose ps postgres`        |
| 2    | 🔧 Backend (NestJS)   | 2-5 minutes    | `curl http://localhost:3001/health` |
| 3    | 🌐 Frontend (Next.js) | 5-15 minutes\* | `curl http://localhost:3000`        |
| 4    | 🔀 Nginx Proxy        | 10 seconds     | `curl http://localhost:80`          |

\*First frontend build takes longer due to Next.js compilation and optimization

#### Container Health Verification

```bash
# Check all containers status
docker compose ps --format "table {{.Name}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

# Expected output:
# NAME              IMAGE               STATUS              PORTS
# rsud-postgres     postgres:15-alpine  Up (healthy)        0.0.0.0:5433->5432/tcp
# rsud-backend      thesis-backend      Up (healthy)        0.0.0.0:3001->3001/tcp
# rsud-frontend     thesis-frontend     Up (healthy)        0.0.0.0:3000->3000/tcp
# rsud-nginx        nginx:alpine        Up                  0.0.0.0:80->80/tcp

# Test individual services
curl -f http://localhost:3001/health  # Backend health
curl -f http://localhost:3000         # Frontend
curl -f http://localhost:3001/api/docs # API documentation
```

#### Database Verification

```bash
# Test database connection
docker compose exec postgres psql -U postgres -d rsud_anugerah -c "SELECT 1 AS test;"

# Check database tables
docker compose exec postgres psql -U postgres -d rsud_anugerah -c "\dt"

# Run database migrations (if needed)
docker compose exec backend npx prisma migrate deploy
```

### 6. Application Access Points

Once all containers are running:

| Service            | URL                            | Description                  |
| ------------------ | ------------------------------ | ---------------------------- |
| 🌐 **Frontend**    | http://localhost:3000          | Main application interface   |
| 🔧 **Backend API** | http://localhost:3001          | REST API endpoints           |
| 📋 **API Docs**    | http://localhost:3001/api/docs | Swagger documentation        |
| 🗄️ **Database**    | localhost:5433                 | PostgreSQL (external access) |
| 🔀 **Proxy**       | http://localhost:80            | Nginx reverse proxy          |

#### Default Login Credentials

```
Email: admin@rsud.com
Password: admin123
```

#### Test API Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Get all employees (requires auth)
curl -X GET http://localhost:3001/pegawai \
  -H "Authorization: Bearer your-jwt-token"

# Login to get token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@rsud.com", "password": "admin123"}'
```

## 🔧 Development Setup

### Development Mode Options

#### Option 1: Smart Development Script

```bash
# Use development mode (fastest for coding)
./start-app.sh --dev

# Features:
# - Volume mounts for hot reload
# - Development environment variables
# - Debug ports exposed
# - Faster rebuilds
```

#### Option 2: Full Docker Development

```bash
# Use development compose file
docker compose -f docker-compose.dev.yml up -d

# Features:
# - Volume mounts for hot reload
# - Development environment variables
# - Debug ports exposed
# - Source code sync
```

#### Option 3: Hybrid Development (Fastest)

**Backend in Docker, Frontend Local (Recommended)**

```bash
# Start database and backend only
docker compose up -d postgres backend

# Run frontend locally with hot reload
cd frontend
npm install
npm run dev  # Runs on localhost:3000 with Turbo

# Benefits:
# - Instant frontend changes
# - Full backend functionality
# - Database persistence
# - Fast iteration cycle
```

**Database Only in Docker**

```bash
# Start database only
docker compose up -d postgres

# Run backend locally
cd backend
npm install
npm run start:dev  # Runs on localhost:3001 with watch mode

# Run frontend locally
cd frontend
npm install
npm run dev  # Runs on localhost:3000 with Turbo
```

### Development Tools & Commands

#### Hot Reload & Live Updates

```bash
# Frontend with Turbopack (fastest)
cd frontend
npm run dev --turbo

# Backend with watch mode
cd backend
npm run start:dev

# Database migrations in development
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx prisma studio  # Database GUI
```

#### Development Debugging

```bash
# View development logs
docker compose -f docker-compose.dev.yml logs -f

# Access container for debugging
docker compose exec backend sh
docker compose exec frontend sh

# Run tests
docker compose exec backend npm run test
docker compose exec frontend npm run test
```

#### Code Quality & Formatting

```bash
# Backend linting
cd backend
npm run lint
npm run lint:fix

# Frontend linting
cd frontend
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

## 🎯 Usage Guide

### Default Login Credentials

```
Email: admin@rsud.com
Password: admin123
```

### Main Features

1. **Dashboard** - Overview of hospital statistics
2. **Pegawai Management** - Employee management system
3. **Absensi Tracking** - Attendance monitoring
4. **Shift Scheduling** - Staff shift management
5. **Kegiatan** - Activity and task management

### API Endpoints

- **Authentication**: `/auth/login`, `/auth/register`
- **Pegawai**: `/pegawai` (CRUD operations)
- **Absensi**: `/absensi` (attendance tracking)
- **Shift**: `/shift` (shift management)
- **Kegiatan**: `/kegiatan` (activity management)

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 🚨 Port Already in Use

```bash
# Check what's using the ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5433  # Database
lsof -i :80    # Nginx

# Kill processes if needed
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)

# Or change ports in docker-compose.yml
```

#### 🚨 Container Won't Start

```bash
# Check logs for specific errors
docker compose logs [service-name]

# Check container status
docker compose ps

# Restart specific service
docker compose restart [service-name]

# Force rebuild and restart
docker compose build [service-name] --no-cache
docker compose up -d [service-name]

# Complete reset
docker compose down -v
docker compose up -d
```

#### 🚨 Database Connection Issues

```bash
# Check database container status
docker compose ps postgres
docker compose logs postgres

# Test database connection
docker compose exec postgres psql -U postgres -d rsud_anugerah -c "SELECT version();"

# Reset database completely
docker compose down -v  # WARNING: This deletes all data
docker volume rm thesis_postgres_data
docker compose up -d postgres

# Restore from backup (if available)
docker compose exec -T postgres psql -U postgres -d rsud_anugerah < backup.sql
```

#### 🚨 Frontend Build Fails

```bash
# Check frontend build logs
docker compose logs frontend

# Clear npm cache and rebuild
docker compose exec frontend npm cache clean --force
docker compose restart frontend

# Rebuild with no cache
docker compose build frontend --no-cache
docker compose up -d frontend

# Check Node.js memory limits
docker stats frontend
```

#### 🚨 Backend API Errors

```bash
# Check backend logs for errors
docker compose logs backend

# Verify environment variables
docker compose exec backend printenv | grep -E "(DATABASE_URL|JWT_SECRET)"

# Run database migrations
docker compose exec backend npx prisma migrate deploy

# Restart backend
docker compose restart backend
```

#### 🚨 Memory Issues

```bash
# Check Docker memory usage
docker stats

# Check system memory
free -h  # Linux
memory_pressure  # macOS

# Increase Docker Desktop memory:
# Docker Desktop → Settings → Resources → Memory (8GB+ recommended)

# Clean up Docker resources
docker system prune -a -f
docker volume prune -f
```

#### 🚨 Network Issues

```bash
# Check Docker networks
docker network ls
docker network inspect thesis_rsud-network

# Recreate network
docker compose down
docker network prune -f
docker compose up -d
```

#### 🚨 Permission Issues

```bash
# Fix file permissions (Linux/macOS)
sudo chown -R $USER:$USER .
chmod +x start-app.sh deploy-docker.sh

# Windows: Run Docker Desktop as Administrator
```

### Quick Fixes

#### Complete System Reset

```bash
# Stop everything and clean up
docker compose down -v
docker system prune -a -f
docker volume prune -f

# Restart fresh
./start-app.sh --build
```

#### Service-Specific Restart

```bash
# Restart just the frontend
docker compose restart frontend

# Restart backend and database
docker compose restart backend postgres

# Restart with rebuild
docker compose up -d --force-recreate frontend
```

#### Log Analysis

```bash
# Get logs from last 30 minutes
docker compose logs --since 30m

# Follow logs for specific service
docker compose logs -f backend --tail 100

# Save logs to file for analysis
docker compose logs > debug.log 2>&1
```

## 🔄 Management Commands

### Smart Script Commands

```bash
# Quick start (recommended)
./start-app.sh

# Start with live logs
./start-app.sh --logs

# Development mode with hot reload
./start-app.sh --dev

# Force rebuild all containers
./start-app.sh --build

# Production deployment
./deploy-docker.sh
```

### Container Lifecycle Management

```bash
# Start all services
docker compose up -d

# Start with logs (foreground)
docker compose up

# Stop all services (containers remain)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove everything including volumes (⚠️ DATA LOSS)
docker compose down -v

# Restart specific service
docker compose restart backend

# Restart all services
docker compose restart
```

### Build & Update Commands

```bash
# Build all images
docker compose build

# Build with no cache (clean build)
docker compose build --no-cache

# Build specific service
docker compose build backend

# Pull latest base images
docker compose pull

# Update and restart
docker compose pull && docker compose up -d
```

### Monitoring & Debugging

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# Logs for specific service
docker compose logs -f backend

# Last 100 lines of logs
docker compose logs --tail 100

# Logs since specific time
docker compose logs --since 2024-01-01T10:00:00

# Container resource usage
docker stats

# Container processes
docker compose top
```

### Container Shell Access

```bash
# Access backend container shell
docker compose exec backend sh

# Access frontend container shell
docker compose exec frontend sh

# Access database shell
docker compose exec postgres psql -U postgres -d rsud_anugerah

# Run commands in container
docker compose exec backend npm run prisma:migrate
docker compose exec backend npx prisma studio
```

### Database Management

```bash
# Run database migrations
docker compose exec backend npx prisma migrate deploy

# Reset database schema
docker compose exec backend npx prisma migrate reset

# Seed database with test data
docker compose exec backend npx prisma db seed

# Open Prisma Studio (Database GUI)
docker compose exec backend npx prisma studio

# Database backup
docker compose exec postgres pg_dump -U postgres rsud_anugerah > backup_$(date +%Y%m%d_%H%M%S).sql

# Database restore
docker compose exec -T postgres psql -U postgres -d rsud_anugerah < backup.sql

# Check database status
docker compose exec postgres pg_isready -U postgres
```

### System Maintenance

```bash
# Clean up unused Docker resources
docker system prune -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# Complete cleanup (⚠️ removes all unused Docker data)
docker system prune -a -f

# Check Docker disk usage
docker system df

# Remove specific volumes
docker volume rm thesis_postgres_data thesis_node_modules
```

## 📊 Performance Optimization

### Production Setup

```bash
# Build optimized images
docker compose build --parallel

# Start with resource limits
docker compose up -d --scale frontend=2 --scale backend=2

# Monitor performance
docker stats
```

### Development Optimization

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Build with cache
docker compose build --build-arg BUILDKIT_INLINE_CACHE=1
```

## 🔐 Security

### Production Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong JWT secret
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Database access restrictions

### Environment Variables

```bash
# Required for production
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_very_long_random_secret_key
NODE_ENV=production
```

## 📈 Monitoring and Logging

### Health Checks

```bash
# Built-in health checks
curl http://localhost:3001/health  # Backend
curl http://localhost:3000         # Frontend

# Container health status
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```

### Log Management

```bash
# View all logs
docker compose logs

# Follow specific service logs
docker compose logs -f backend

# Save logs to file
docker compose logs > application.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue in this repository
- Contact the development team
- Check the troubleshooting section above

## 🔄 Updates

### Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added Docker containerization
- **v1.2.0** - Multi-container architecture
- **v1.3.0** - Added Nginx reverse proxy

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 🎯 Quick Commands Reference

### 🚀 **Starting the Application**

```bash
# Fastest start (recommended)
./start-app.sh

# With live logs
./start-app.sh --logs

# Development mode
./start-app.sh --dev

# Production deployment
./deploy-docker.sh
```

### 📊 **Checking Status**

```bash
# Container status
docker compose ps

# Resource usage
docker stats

# Service health
curl http://localhost:3001/health
curl http://localhost:3000
```

### 📋 **Viewing Logs**

```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### 🛑 **Stopping & Restarting**

```bash
# Stop all
docker compose down

# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### 🗄️ **Database Operations**

```bash
# Database shell
docker compose exec postgres psql -U postgres -d rsud_anugerah

# Run migrations
docker compose exec backend npx prisma migrate deploy

# Database GUI
docker compose exec backend npx prisma studio
```

### 🧹 **Cleanup & Reset**

```bash
# Clean restart (keeps data)
docker compose down && docker compose up -d

# Complete reset (⚠️ deletes all data)
docker compose down -v && docker compose up -d

# System cleanup
docker system prune -f
```

### 🔍 **Troubleshooting**

```bash
# Check what's using ports
lsof -i :3000 :3001 :5433

# Force rebuild
./start-app.sh --build

# View container logs
docker compose logs backend
```

---

### 📱 **Application URLs**

- **🌐 Frontend**: http://localhost:3000
- **🔧 Backend API**: http://localhost:3001
- **📋 API Docs**: http://localhost:3001/api/docs
- **🗄️ Database**: localhost:5433
- **🔀 Nginx**: http://localhost:80

### 🔐 **Default Login**

```
Email: admin@rsud.com
Password: admin123
```

---

**🏥 RSUD Anugerah Hospital Management System - Built with ❤️ using modern web technologies**

**🐳 Multi-Container Architecture**: PostgreSQL + NestJS + Next.js + Nginx

**⚡ Quick Start**: `./start-app.sh` | **📚 Full Docs**: See sections above | **🐛 Issues**: Check troubleshooting section
