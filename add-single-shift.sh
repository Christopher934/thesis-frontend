#!/bin/bash

# Skrip untuk menambahkan 1 shift ke database
# Menggunakan API endpoint backend

# Konfigurasi
API_URL="http://localhost:3001"
TOKEN_FILE="/Users/jo/Downloads/Thesis/test-token.txt"

# Fungsi untuk mendapatkan token dari file atau login
get_token() {
    if [ -f "$TOKEN_FILE" ]; then
        TOKEN=$(cat "$TOKEN_FILE")
        echo "Menggunakan token dari file: ${TOKEN:0:20}..."
    else
        echo "File token tidak ditemukan. Silakan login terlebih dahulu atau buat file token."
        echo "Anda dapat membuat file token dengan menjalankan:"
        echo "echo 'jwt_token_anda_disini' > $TOKEN_FILE"
        exit 1
    fi
}

# Fungsi untuk mendapatkan daftar user (untuk memilih pegawai)
get_users() {
    echo "Mendapatkan daftar pengguna..."
    curl -s -X GET "$API_URL/users" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" | jq '.[0:5]' || echo "Gagal mendapatkan daftar pengguna"
}

# Fungsi untuk membuat shift baru
create_shift() {
    local employee_id="$1"
    local tanggal="$2"
    local jam_mulai="$3"
    local jam_selesai="$4"
    local lokasi="$5"
    local tipe_shift="$6"

    echo "Membuat shift dengan data:"
    echo "  ID Pegawai: $employee_id"
    echo "  Tanggal: $tanggal"
    echo "  Jam Mulai: $jam_mulai"
    echo "  Jam Selesai: $jam_selesai"
    echo "  Lokasi: $lokasi"
    echo "  Tipe Shift: $tipe_shift"

    SHIFT_DATA=$(cat <<EOF
{
    "tanggal": "$tanggal",
    "jammulai": "$jam_mulai",
    "jamselesai": "$jam_selesai",
    "lokasishift": "$lokasi",
    "tipeshift": "$tipe_shift",
    "idpegawai": "$employee_id"
}
EOF
)

    echo "Mengirim permintaan ke $API_URL/shifts..."
    
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$API_URL/shifts" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$SHIFT_DATA")

    HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    HTTP_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

    if [ "$HTTP_STATUS" -eq 201 ] || [ "$HTTP_STATUS" -eq 200 ]; then
        echo "✅ Shift berhasil dibuat!"
        echo "Respons: $HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
    else
        echo "❌ Gagal membuat shift. Status HTTP: $HTTP_STATUS"
        echo "Respons: $HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
        return 1
    fi
}

# Skrip utama
echo "🏥 Skrip Menambahkan Shift ke Database RSUD Anugerah"
echo "=================================================="

# Dapatkan token
get_token

# Periksa apakah backend berjalan
echo "Memeriksa koneksi backend..."
curl -s "$API_URL/health" > /dev/null || {
    echo "❌ Backend tidak dapat diakses di $API_URL"
    echo "Pastikan backend sedang berjalan dengan perintah:"
    echo "cd backend && npm run start:dev"
    exit 1
}

echo "✅ Backend terhubung"

# Tampilkan pengguna yang tersedia (5 pertama)
echo ""
echo "Daftar beberapa pengguna yang tersedia:"
get_users

echo ""
echo "Membuat contoh shift..."

# Contoh data shift
EMPLOYEE_ID="STF001"    # Staff Hans yang tersedia
TANGGAL="2025-08-05"    # Besok
JAM_MULAI="08:00"
JAM_SELESAI="16:00"
LOKASI="ICU"
TIPE_SHIFT="PAGI"

# Buat shift
create_shift "$EMPLOYEE_ID" "$TANGGAL" "$JAM_MULAI" "$JAM_SELESAI" "$LOKASI" "$TIPE_SHIFT"

echo ""
echo "Skrip selesai. Periksa database atau frontend untuk melihat hasil."
