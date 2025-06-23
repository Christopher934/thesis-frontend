#!/bin/bash

echo "🚀 Setting up test users and notifications..."

API_URL="http://localhost:3001"

# Function to create user via API
create_user() {
  local username=$1
  local email=$2
  local password=$3
  local namaDepan=$4
  local namaBelakang=$5
  local role=$6
  
  echo "Creating user: $namaDepan $namaBelakang ($role)"
  
  curl -s -X POST "$API_URL/users" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "'$username'",
      "email": "'$email'",
      "password": "'$password'",
      "namaDepan": "'$namaDepan'",
      "namaBelakang": "'$namaBelakang'",
      "alamat": "Rumah Sakit",
      "noHp": "081234567890",
      "jenisKelamin": "L",
      "tanggalLahir": "1990-01-01",
      "role": "'$role'"
    }' || echo "User $email might already exist"
}

# Function to login and get token
login_user() {
  local email=$1
  local password=$2
  
  curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "'$email'",
      "password": "'$password'"
    }' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4
}

# Function to create notification
create_notification() {
  local token=$1
  local userId=$2
  local judul=$3
  local pesan=$4
  local jenis=$5
  
  echo "Creating notification: $judul (for user $userId)"
  
  # Escape quotes in the message
  local escaped_judul=$(echo "$judul" | sed 's/"/\\"/g')
  local escaped_pesan=$(echo "$pesan" | sed 's/"/\\"/g')
  
  curl -s -X POST "$API_URL/notifikasi" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d "{
      \"userId\": $userId,
      \"judul\": \"$escaped_judul\",
      \"pesan\": \"$escaped_pesan\",
      \"jenis\": \"$jenis\"
    }"
}

echo "🔗 Testing backend connection..."
if ! curl -s -X GET "$API_URL/" > /dev/null 2>&1; then
  echo "❌ Backend is not running on $API_URL"
  echo "Please start the backend first with: cd backend && npm run start:dev"
  exit 1
fi

echo "✅ Backend is running"

# Create test users and get their IDs
echo "👥 Creating test users..."
ADMIN_RESULT=$(create_user "admin" "admin@hospital.com" "admin123" "Admin" "System" "ADMIN")
SUPERVISOR_RESULT=$(create_user "supervisor1" "supervisor@hospital.com" "supervisor123" "Dr. Sarah" "Johnson" "SUPERVISOR")
PERAWAT_RESULT=$(create_user "perawat1" "perawat@hospital.com" "perawat123" "Siti" "Nurhaliza" "PERAWAT")
DOKTER_RESULT=$(create_user "dokter1" "dokter@hospital.com" "dokter123" "Dr. Ahmad" "Wijaya" "DOKTER")

# Get user IDs from database by calling users endpoint
echo "📋 Getting user IDs..."
ADMIN_TOKEN=$(login_user "admin@hospital.com" "admin123")

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token. Please check if users were created successfully."
  exit 1
fi

echo "✅ Admin token obtained"

# Get user list to extract IDs
USERS_JSON=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/users")

# Extract user IDs more reliably using jq or grep patterns
ADMIN_ID=$(echo "$USERS_JSON" | grep -B5 -A5 '"role":"ADMIN"' | head -20 | grep '"id":' | head -1 | sed 's/.*"id":\([0-9]*\).*/\1/')
SUPERVISOR_ID=$(echo "$USERS_JSON" | grep -B5 -A5 '"role":"SUPERVISOR"' | head -20 | grep '"id":' | head -1 | sed 's/.*"id":\([0-9]*\).*/\1/')
PERAWAT_ID=$(echo "$USERS_JSON" | grep -B5 -A5 '"role":"PERAWAT"' | head -20 | grep '"id":' | head -1 | sed 's/.*"id":\([0-9]*\).*/\1/')

echo "📊 User IDs found:"
echo "Admin ID: $ADMIN_ID"
echo "Supervisor ID: $SUPERVISOR_ID"  
echo "Perawat ID: $PERAWAT_ID"

# Check if we got valid IDs
if [ -z "$ADMIN_ID" ] || [ -z "$SUPERVISOR_ID" ] || [ -z "$PERAWAT_ID" ]; then
  echo "❌ Failed to extract all user IDs. Checking available users..."
  echo "Available users response:"
  echo "$USERS_JSON" | head -200
  echo ""
  echo "Trying to use existing user IDs from the system..."
  
  # Try to get any admin user
  ADMIN_ID=$(echo "$USERS_JSON" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  SUPERVISOR_ID=$ADMIN_ID  # Use admin for demo if supervisor not found
  PERAWAT_ID=$ADMIN_ID     # Use admin for demo if perawat not found
fi

# Create test notifications
echo "📝 Creating test notifications..."

create_notification "$ADMIN_TOKEN" "$ADMIN_ID" \
  "System Maintenance Scheduled" \
  "Sistem akan menjalani maintenance rutin pada hari Minggu, 25 Juni 2025 pukul 02:00-04:00 WIB." \
  "SISTEM_INFO"

create_notification "$ADMIN_TOKEN" "$ADMIN_ID" \
  "New User Registration Approval" \
  "Terdapat 3 pendaftaran pengguna baru yang memerlukan persetujuan." \
  "PERSETUJUAN_CUTI"

create_notification "$ADMIN_TOKEN" "$SUPERVISOR_ID" \
  "Shift Change Request" \
  "Perawat Sarah mengajukan pertukaran shift untuk tanggal 24 Juni 2025." \
  "KONFIRMASI_TUKAR_SHIFT"

create_notification "$ADMIN_TOKEN" "$SUPERVISOR_ID" \
  "Monthly Staff Meeting" \
  "Rapat bulanan staf akan diadakan pada hari Jumat, 28 Juni 2025 pukul 14:00 WIB." \
  "KEGIATAN_HARIAN"

create_notification "$ADMIN_TOKEN" "$PERAWAT_ID" \
  "Shift Reminder Tomorrow" \
  "Pengingat: Anda memiliki shift besok, 24 Juni 2025 pukul 07:00-15:00 WIB di Ruang IGD." \
  "REMINDER_SHIFT"

echo ""
echo "✅ Test data setup complete!"
echo ""
echo "🎯 Test credentials:"
echo "Admin: admin@hospital.com / admin123"
echo "Supervisor: supervisor@hospital.com / supervisor123"  
echo "Perawat: perawat@hospital.com / perawat123"
echo "Dokter: dokter@hospital.com / dokter123"
echo ""
echo "🔗 You can now test the notification system:"
echo "Frontend: http://localhost:3000/dashboard/notifications"
echo "Backend API: http://localhost:3001/notifikasi"
