#!/bin/bash

# Script untuk memperbaiki masalah path main.js yang salah
echo "🔧 Menjalankan perbaikan final untuk masalah fetch error..."

# Stop dan hapus container yang ada
echo "🛑 Menghentikan dan membersihkan container Docker yang ada..."
docker-compose down
docker rm -f rsud-backend rsud-frontend rsud-postgres 2>/dev/null || true

# Build dengan Dockerfile yang sudah diperbaiki
echo "🏗️ Membangun container backend dengan path main.js yang benar..."
docker-compose -f docker-compose.final-fix.yml build backend

# Jalankan semua container dengan konfigurasi yang diperbaiki
echo "🚀 Menjalankan sistem dengan konfigurasi yang diperbaiki..."
docker-compose -f docker-compose.final-fix.yml up -d

# Tunggu sampai backend siap
echo "⏳ Menunggu backend menjadi healthy..."
attempt=1
max_attempts=20
while [ $attempt -le $max_attempts ]; do
    if docker inspect rsud-backend | grep -q '"Status": "healthy"'; then
        echo "✅ Backend telah siap dan healthy!"
        break
    fi
    echo "⌛ Menunggu backend menjadi healthy... (Percobaan $attempt/$max_attempts)"
    sleep 5
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Backend tidak menjadi healthy dalam waktu yang ditentukan."
    echo "📋 Memeriksa log backend untuk diagnosa lebih lanjut..."
    docker logs rsud-backend
fi

# Periksa status semua container
echo "📊 Status container saat ini:"
docker ps

echo ""
echo "✅ Proses perbaikan selesai!"
echo "🌐 Frontend tersedia di: http://localhost:3000"
echo "🔌 Backend API tersedia di: http://localhost:3001"
echo ""
echo "Jika masih ada masalah, silakan cek log dengan perintah:"
echo "docker logs rsud-backend"
echo "docker logs rsud-frontend"
