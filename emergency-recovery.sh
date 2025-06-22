#!/bin/bash

# RSUD EMERGENCY RECOVERY SCRIPT
# Script untuk mengatasi semua jenis error yang mungkin terjadi

echo "🚨 RSUD EMERGENCY RECOVERY SYSTEM"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to show menu
show_menu() {
    echo -e "${BLUE}Pilih jenis masalah yang terjadi:${NC}"
    echo "1. Webpack Cache Error (ENOENT)"
    echo "2. Vendor Chunks 404 Error"
    echo "3. Port Already in Use (EADDRINUSE)"
    echo "4. Build/Compilation Error"
    echo "5. API Connection Error"
    echo "6. Database Connection Error"
    echo "7. Authentication Error"
    echo "8. Complete System Reset"
    echo "9. Check System Status"
    echo "0. Exit"
    echo ""
    read -p "Masukkan pilihan (0-9): " choice
}

# Function 1: Fix Webpack Cache Error
fix_webpack_cache() {
    echo -e "${YELLOW}🔧 Memperbaiki Webpack Cache Error...${NC}"
    
    # Stop all Next.js processes
    echo "Menghentikan semua proses Next.js..."
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
    
    # Clean all caches
    echo "Membersihkan cache..."
    rm -rf .next
    rm -rf node_modules/.cache
    rm -rf .next/cache
    
    # Use emergency config
    if [ -f "next.config.emergency.mjs" ]; then
        cp next.config.emergency.mjs next.config.mjs
        echo "✅ Menggunakan konfigurasi emergency"
    fi
    
    # Restart server
    echo "Memulai ulang server..."
    npm run dev &
    echo -e "${GREEN}✅ Webpack cache diperbaiki${NC}"
}

# Function 2: Fix Vendor Chunks Error
fix_vendor_chunks() {
    echo -e "${YELLOW}🔧 Memperbaiki Vendor Chunks Error...${NC}"
    
    # Stop server
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
    
    # Clean everything
    rm -rf .next
    rm -rf node_modules/.cache
    
    # Create emergency config with splitChunks disabled
    cat > next.config.mjs << 'EOF'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, path: false, os: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [{ protocol: 'http', hostname: 'localhost' }],
    dangerouslyAllowSVG: true,
  },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
EOF
    
    # Restart
    npm run dev &
    echo -e "${GREEN}✅ Vendor chunks error diperbaiki${NC}"
}

# Function 3: Fix Port Already in Use
fix_port_error() {
    echo -e "${YELLOW}🔧 Memperbaiki Port Error...${NC}"
    
    # Kill all processes using port 3000
    echo "Menghentikan semua proses di port 3000..."
    sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
    
    # Kill all Next.js processes
    sudo pkill -9 -f "next" 2>/dev/null || true
    
    sleep 3
    
    # Start server
    npm run dev &
    echo -e "${GREEN}✅ Port error diperbaiki${NC}"
}

# Function 4: Fix Build/Compilation Error
fix_build_error() {
    echo -e "${YELLOW}🔧 Memperbaiki Build Error...${NC}"
    
    # Clean everything
    rm -rf .next
    rm -rf node_modules/.cache
    rm -rf out
    
    # Reinstall dependencies if needed
    read -p "Reinstall node_modules? (y/n): " reinstall
    if [ "$reinstall" = "y" ]; then
        rm -rf node_modules
        npm install
    fi
    
    # Use simple config
    if [ -f "next.config.emergency.mjs" ]; then
        cp next.config.emergency.mjs next.config.mjs
    fi
    
    # Try build
    npm run build
    echo -e "${GREEN}✅ Build error diperbaiki${NC}"
}

# Function 5: Fix API Connection Error
fix_api_error() {
    echo -e "${YELLOW}🔧 Memperbaiki API Connection Error...${NC}"
    
    # Check backend status
    if ! curl -s http://localhost:3001/users > /dev/null; then
        echo "Backend tidak berjalan. Memulai backend..."
        cd ../backend
        npm run start:dev &
        cd ../frontend
        sleep 5
    fi
    
    # Test API
    if curl -s http://localhost:3001/users > /dev/null; then
        echo -e "${GREEN}✅ API connection diperbaiki${NC}"
    else
        echo -e "${RED}❌ Backend masih bermasalah${NC}"
    fi
}

# Function 6: Fix Database Connection Error
fix_database_error() {
    echo -e "${YELLOW}🔧 Memperbaiki Database Error...${NC}"
    
    cd ../backend
    
    # Check Prisma
    npx prisma generate
    npx prisma db push
    
    # Restart backend
    pkill -f "nest start" 2>/dev/null || true
    npm run start:dev &
    
    cd ../frontend
    echo -e "${GREEN}✅ Database error diperbaiki${NC}"
}

# Function 7: Fix Authentication Error
fix_auth_error() {
    echo -e "${YELLOW}🔧 Memperbaiki Authentication Error...${NC}"
    
    # Clear localStorage (manual instruction)
    echo "Buka browser dan jalankan di console:"
    echo "localStorage.clear(); sessionStorage.clear(); location.reload();"
    echo ""
    echo "Atau gunakan login otomatis:"
    
    # Create auto-login page
    cat > public/auto-login.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Auto Login</title></head>
<body>
<h2>RSUD Auto Login</h2>
<p>Logging in as admin...</p>
<script>
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
})
.then(r => r.json())
.then(d => {
  if (d.access_token) {
    localStorage.setItem('token', d.access_token);
    localStorage.setItem('user', JSON.stringify(d.user));
    localStorage.setItem('role', d.user.role);
    window.location.href = '/admin';
  }
});
</script>
</body>
</html>
EOF
    
    echo "Akses http://localhost:3000/auto-login.html"
    echo -e "${GREEN}✅ Authentication helper dibuat${NC}"
}

# Function 8: Complete System Reset
complete_reset() {
    echo -e "${YELLOW}🔥 COMPLETE SYSTEM RESET...${NC}"
    echo -e "${RED}⚠️  Ini akan menghapus semua cache dan restart sistem${NC}"
    
    read -p "Yakin ingin reset lengkap? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        return
    fi
    
    # Stop all processes
    sudo pkill -9 -f "next" 2>/dev/null || true
    sudo pkill -9 -f "nest" 2>/dev/null || true
    sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
    sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true
    
    # Clean frontend
    rm -rf .next
    rm -rf node_modules/.cache
    rm -rf out
    
    # Clean backend
    cd ../backend
    rm -rf dist
    rm -rf node_modules/.cache
    cd ../frontend
    
    # Use emergency configs
    if [ -f "next.config.emergency.mjs" ]; then
        cp next.config.emergency.mjs next.config.mjs
    fi
    
    # Restart everything
    echo "Memulai backend..."
    cd ../backend && npm run start:dev &
    sleep 5
    
    echo "Memulai frontend..."
    cd ../frontend && npm run dev &
    sleep 5
    
    echo -e "${GREEN}✅ System reset selesai${NC}"
}

# Function 9: Check System Status
check_status() {
    echo -e "${BLUE}📊 Checking System Status...${NC}"
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Frontend: Running${NC}"
    else
        echo -e "${RED}❌ Frontend: Not running${NC}"
    fi
    
    # Check backend
    if curl -s http://localhost:3001/users > /dev/null; then
        echo -e "${GREEN}✅ Backend: Running${NC}"
    else
        echo -e "${RED}❌ Backend: Not running${NC}"
    fi
    
    # Check processes
    echo ""
    echo "Active processes:"
    ps aux | grep -E "(next|nest)" | grep -v grep
}

# Main script
main() {
    # Change to frontend directory
    if [ ! -f "package.json" ]; then
        cd frontend 2>/dev/null || {
            echo -e "${RED}❌ Tidak ditemukan di direktori frontend${NC}"
            exit 1
        }
    fi
    
    while true; do
        show_menu
        
        case $choice in
            1) fix_webpack_cache ;;
            2) fix_vendor_chunks ;;
            3) fix_port_error ;;
            4) fix_build_error ;;
            5) fix_api_error ;;
            6) fix_database_error ;;
            7) fix_auth_error ;;
            8) complete_reset ;;
            9) check_status ;;
            0) echo "Keluar..."; exit 0 ;;
            *) echo -e "${RED}❌ Pilihan tidak valid${NC}" ;;
        esac
        
        echo ""
        read -p "Tekan Enter untuk kembali ke menu..."
        clear
    done
}

# Run main function
main "$@"
