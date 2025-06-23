#!/bin/bash

# RSUD SUPER STABLE STARTUP SCRIPT
# Script untuk memulai sistem dengan konfigurasi ultra stabil

echo "🚀 RSUD SUPER STABLE STARTUP"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to clean and prepare
prepare_system() {
    echo -e "${BLUE}🧹 Persiapan sistem ultra stabil...${NC}"
    
    # Kill all existing processes
    echo "Menghentikan semua proses yang ada..."
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "nest start" 2>/dev/null || true
    sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
    sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true
    
    sleep 5
    
    # Ultra clean cache
    echo "Pembersihan cache ultra mendalam..."
    rm -rf .next
    rm -rf node_modules/.cache
    rm -rf out
    rm -rf .next/cache
    rm -rf .next/static
    
    # Ensure stable config is in place
    if [ ! -f "next.config.mjs" ]; then
        echo "Membuat konfigurasi ultra stabil..."
        cat > next.config.mjs << 'EOF'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  experimental: {
    esmExternals: false,
    optimizePackageImports: false,
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        runtimeChunk: false,
        minimize: false,
      };
      config.resolve.fallback = {
        fs: false, path: false, os: false,
        crypto: false, stream: false, buffer: false,
      };
      config.cache = false;
    }
    return config;
  },
  images: {
    domains: ['localhost'],
    dangerouslyAllowSVG: true,
  },
  eslint: { ignoreBuildErrors: true },
  typescript: { ignoreBuildErrors: true },
  poweredByHeader: false,
  compress: true,
  async redirects() { return []; },
  async rewrites() { return []; },
};

export default nextConfig;
EOF
    fi
    
    echo -e "${GREEN}✅ Persiapan selesai${NC}"
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Memulai backend...${NC}"
    
    cd ../backend
    
    # Ensure database is ready
    npx prisma generate >/dev/null 2>&1
    npx prisma db push >/dev/null 2>&1
    
    # Start backend in background
    npm run start:dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    echo "Menunggu backend siap..."
    for i in {1..30}; do
        if curl -s http://localhost:3001/users >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend siap (PID: $BACKEND_PID)${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend timeout${NC}"
            exit 1
        fi
        sleep 2
    done
    
    cd ../frontend
}

# Function to start frontend with ultra stability
start_frontend() {
    echo -e "${BLUE}🌐 Memulai frontend dengan mode ultra stabil...${NC}"
    
    # Set environment for ultra stability
    export NODE_ENV=development
    export NEXT_TELEMETRY_DISABLED=1
    export NEXT_PRIVATE_STANDALONE=true
    
    # Start with maximum stability flags
    npm run dev -- --port 3000 --hostname localhost > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    echo "Menunggu frontend siap..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/ >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend siap (PID: $FRONTEND_PID)${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Frontend timeout${NC}"
            exit 1
        fi
        sleep 3
    done
}

# Function to verify system
verify_system() {
    echo -e "${BLUE}🧪 Verifikasi sistem...${NC}"
    
    # Test frontend
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Frontend: OK (Status: $FRONTEND_STATUS)${NC}"
    else
        echo -e "${RED}❌ Frontend: Error (Status: $FRONTEND_STATUS)${NC}"
    fi
    
    # Test backend
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/users)
    if [ "$BACKEND_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Backend: OK (Status: $BACKEND_STATUS)${NC}"
    else
        echo -e "${RED}❌ Backend: Error (Status: $BACKEND_STATUS)${NC}"
    fi
    
    # Test admin route
    ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin)
    if [ "$ADMIN_STATUS" = "307" ] || [ "$ADMIN_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Admin Route: OK (Status: $ADMIN_STATUS)${NC}"
    else
        echo -e "${RED}❌ Admin Route: Error (Status: $ADMIN_STATUS)${NC}"
    fi
}

# Function to show status
show_status() {
    echo ""
    echo -e "${BLUE}📊 STATUS SISTEM RSUD${NC}"
    echo "======================"
    echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}🔧 Backend:  http://localhost:3001${NC}"
    echo -e "${GREEN}👤 Admin:    admin@example.com / admin123${NC}"
    echo ""
    echo -e "${YELLOW}📝 Log Files:${NC}"
    echo "   Frontend: /Users/jo/Documents/Backup 2/Thesis/frontend.log"
    echo "   Backend:  /Users/jo/Documents/Backup 2/Thesis/backend.log"
    echo ""
    echo -e "${BLUE}💡 Tips:${NC}"
    echo "   • Jika ada error 404, tunggu 2-3 menit untuk warming up"
    echo "   • Gunakan ctrl+c untuk stop, lalu jalankan script ini lagi"
    echo "   • Akses emergency login: http://localhost:3000/emergency-login.html"
    echo ""
    echo -e "${GREEN}🎉 SISTEM SIAP DIGUNAKAN!${NC}"
}

# Main execution
main() {
    # Change to frontend directory
    if [ ! -f "package.json" ]; then
        cd "/Users/jo/Documents/Backup 2/Thesis/frontend" || {
            echo -e "${RED}❌ Direktori frontend tidak ditemukan${NC}"
            exit 1
        }
    fi
    
    prepare_system
    start_backend
    start_frontend
    sleep 5
    verify_system
    show_status
    
    # Keep script running and monitor
    echo -e "${YELLOW}🔄 Monitoring sistem (Ctrl+C untuk stop)...${NC}"
    trap 'echo -e "\n${YELLOW}🛑 Menghentikan sistem...${NC}"; pkill -f "next dev"; pkill -f "nest start"; exit 0' INT
    
    while true; do
        sleep 30
        # Quick health check
        if ! curl -s http://localhost:3000/ >/dev/null 2>&1; then
            echo -e "${RED}⚠️  Frontend tidak merespons - restart mungkin diperlukan${NC}"
        fi
        if ! curl -s http://localhost:3001/users >/dev/null 2>&1; then
            echo -e "${RED}⚠️  Backend tidak merespons - restart mungkin diperlukan${NC}"
        fi
    done
}

# Run main function
main "$@"
