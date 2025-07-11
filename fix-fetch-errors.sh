#!/bin/bash

# Perbaikan Fetch Error - RSUD Anugerah
# Script ini memperbaiki masalah fetch error dan memulai ulang layanan

echo "🔧 SCRIPT PERBAIKAN FETCH ERROR"
echo "============================="
echo

# 1. Memeriksa status kontainer
echo "1️⃣ MEMERIKSA STATUS LAYANAN"
echo "--------------------------"

# Memeriksa status Docker containers
echo "Status Docker Containers:"
docker ps
echo

# 2. Restart container backend jika ada masalah
echo "2️⃣ RESTART CONTAINER BACKEND"
echo "---------------------------"
echo "Melakukan restart container backend..."
docker restart rsud-backend
echo "Menunggu container backend siap..."
sleep 10
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

# 3. Memeriksa kesehatan API
echo "3️⃣ MEMERIKSA KESEHATAN API"
echo "-------------------------"
echo "Menguji endpoint root..."
curl -s -m 2 http://localhost:3001 || echo "❌ Endpoint root tidak merespon"
echo

echo "Menguji endpoint health..."
curl -s -m 2 http://localhost:3001/health || echo "❌ Endpoint health tidak merespon"
echo

echo "Menguji endpoint users (memerlukan auth)..."
echo "Catatan: Ini mungkin mengembalikan error 401 jika memerlukan autentikasi"
curl -s -m 2 -i http://localhost:3001/users | head -1
echo

# 4. Restart frontend jika perlu
echo "4️⃣ PETUNJUK RESTART FRONTEND"
echo "---------------------------"
echo "Untuk restart frontend dan mengatasi masalah fetch error:"
echo "1. Pastikan backend berjalan dengan baik (status 'healthy')"
echo "2. Buka terminal baru dan jalankan perintah berikut:"
echo "   cd /Users/jo/Downloads/Thesis/frontend && npm run dev"
echo
echo "Atau gunakan command ini untuk restart cepat:"
echo "   cd /Users/jo/Downloads/Thesis/frontend && npm run dev"
echo

echo "5️⃣ DIAGNOSA TAMBAHAN"
echo "------------------"
echo "Jika masih mengalami fetch error, kemungkinan penyebabnya:"
echo "1. CORS - Backend tidak mengizinkan akses dari frontend"
echo "2. Endpoint API tidak sesuai dengan backend"
echo "3. Authentication/Token issues"
echo "4. Database tidak terkoneksi dengan baik"
echo
echo "Untuk melihat log backend dan mengidentifikasi masalah:"
echo "   docker logs rsud-backend --tail 50"
echo

echo "Script perbaikan selesai! 🏁"
