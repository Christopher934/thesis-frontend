#!/bin/bash

# Fix all Prisma model references in backend
echo "Fixing Prisma model references..."

# Navigate to backend directory
cd /Users/jo/Downloads/Thesis/backend

# Replace all user references with users
find . -name "*.ts" -type f -exec sed -i '' 's/this\.prisma\.user\./this.prisma.users./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/prisma\.user\./prisma.users./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/tx\.user\./tx.users./g' {} \;

# Replace all shift references with shifts  
find . -name "*.ts" -type f -exec sed -i '' 's/this\.prisma\.shift\./this.prisma.shifts./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/prisma\.shift\./prisma.shifts./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/tx\.shift\./tx.shifts./g' {} \;

# Replace all shiftSwap references with shiftswaps
find . -name "*.ts" -type f -exec sed -i '' 's/this\.prisma\.shiftSwap\./this.prisma.shiftswaps./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/prisma\.shiftSwap\./prisma.shiftswaps./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/tx\.shiftSwap\./tx.shiftswaps./g' {} \;

# Replace all absensi references with absensis
find . -name "*.ts" -type f -exec sed -i '' 's/this\.prisma\.absensi\./this.prisma.absensis./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/prisma\.absensi\./prisma.absensis./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/tx\.absensi\./tx.absensis./g' {} \;

# Replace all kegiatan references with kegiatans
find . -name "*.ts" -type f -exec sed -i '' 's/this\.prisma\.kegiatan\./this.prisma.kegiatans./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/prisma\.kegiatan\./prisma.kegiatans./g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/tx\.kegiatan\./tx.kegiatans./g' {} \;

# Fix include references
find . -name "*.ts" -type f -exec sed -i '' 's/include: { user:/include: { users:/g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/include: {user:/include: {users:/g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/include:{user:/include:{users:/g' {} \;

# Fix fromUser/toUser references in shift-swap
find . -name "*.ts" -type f -exec sed -i '' 's/fromUser:/users_shiftswaps_fromUserIdTousers:/g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/toUser:/users_shiftswaps_toUserIdTousers:/g' {} \;

echo "Fixed all Prisma model references!"
