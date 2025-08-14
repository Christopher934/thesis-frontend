#!/bin/bash

# Script untuk menjalankan penghapusan file-file yang tidak digunakan
# Buat oleh: GitHub Copilot
# Tanggal: $(date)

echo "🗑️  MENJALANKAN PENGHAPUSAN FILE YANG TIDAK DIGUNAKAN"
echo "====================================================="

# Pindah ke direktori utama
cd /Users/jo/Downloads/Thesis

# Periksa apakah file log ada
if [ ! -f "files_to_delete.log" ]; then
    echo "❌ File files_to_delete.log tidak ditemukan!"
    echo "💡 Jalankan ./cleanup_analyze.sh terlebih dahulu"
    exit 1
fi

echo "📂 Direktori kerja: $(pwd)"
echo ""

# Fungsi untuk menghapus file dengan konfirmasi
delete_files_by_pattern() {
    local pattern="$1"
    local description="$2"
    
    echo "🔍 Mencari $description..."
    files=$(find . -maxdepth 1 -name "$pattern" -type f)
    
    if [ -z "$files" ]; then
        echo "   ✅ Tidak ada file $description yang ditemukan"
        return
    fi
    
    echo "   📋 File yang akan dihapus:"
    echo "$files" | sed 's/^/      /'
    
    local count=$(echo "$files" | wc -l)
    echo "   📊 Total: $count file"
    
    # Hapus file
    echo "$files" | xargs rm -f
    echo "   ✅ $count file $description berhasil dihapus"
    echo ""
}

# Fungsi untuk menghapus multiple pattern
delete_files_by_multiple_patterns() {
    local description="$1"
    shift
    local patterns=("$@")
    
    echo "🔍 Mencari $description..."
    local all_files=""
    
    for pattern in "${patterns[@]}"; do
        files=$(find . -maxdepth 1 -name "$pattern" -type f)
        if [ ! -z "$files" ]; then
            all_files="$all_files$files"$'\n'
        fi
    done
    
    if [ -z "$all_files" ]; then
        echo "   ✅ Tidak ada file $description yang ditemukan"
        return
    fi
    
    echo "   📋 File yang akan dihapus:"
    echo "$all_files" | grep -v '^$' | sed 's/^/      /'
    
    local count=$(echo "$all_files" | grep -v '^$' | wc -l)
    echo "   📊 Total: $count file"
    
    # Hapus file
    echo "$all_files" | grep -v '^$' | xargs rm -f
    echo "   ✅ $count file $description berhasil dihapus"
    echo ""
}

echo "🚀 Memulai proses penghapusan..."
echo ""

# 1. Hapus test JS files
delete_files_by_pattern "test-*.js" "test JavaScript"

# 2. Hapus debug JS files  
delete_files_by_pattern "debug-*.js" "debug JavaScript"

# 3. Hapus test dan debug HTML files
delete_files_by_multiple_patterns "test/debug HTML" "test-*.html" "debug-*.html"

# 4. Hapus auto login HTML files
delete_files_by_multiple_patterns "auto login HTML" "auto-*login*.html" "quick-login.html" "clear-browser-data.html"

# 5. Hapus utility/temp JS files
delete_files_by_multiple_patterns "utility/temporary JavaScript" "analisis-*.js" "simple-calc.js" "force-refresh.js" "corrected-calculation.js" "check-database-query.js"

# 6. Hapus test shell scripts
delete_files_by_multiple_patterns "test shell scripts" "test-*.sh" "debug-*.sh"

# 7. Hapus file teks dan log temporary
echo "🔍 Mencari file temporary lainnya..."
temp_files=$(find . -maxdepth 1 \( -name "*.log" -o -name "*.tmp" -o -name "test-*.txt" \) -type f | grep -v files_to_delete.log)

if [ ! -z "$temp_files" ]; then
    echo "   📋 File temporary yang akan dihapus:"
    echo "$temp_files" | sed 's/^/      /'
    echo "$temp_files" | xargs rm -f
    echo "   ✅ File temporary berhasil dihapus"
else
    echo "   ✅ Tidak ada file temporary yang ditemukan"
fi

echo ""
echo "🎉 PROSES PEMBERSIHAN SELESAI!"
echo "=============================="

# Hitung sisa file di root directory
remaining_js=$(find . -maxdepth 1 -name "*.js" -type f | wc -l)
remaining_html=$(find . -maxdepth 1 -name "*.html" -type f | wc -l)  
remaining_sh=$(find . -maxdepth 1 -name "*.sh" -type f | wc -l)

echo "📊 Sisa file di root directory:"
echo "   🔸 JS files: $remaining_js"
echo "   🔸 HTML files: $remaining_html"
echo "   🔸 Shell scripts: $remaining_sh"
echo ""

echo "🗂️  File penting yang masih ada:"
if [ -f "package.json" ]; then echo "   ✅ package.json"; fi
if [ -f "README.md" ]; then echo "   ✅ README.md"; fi
if [ -f "docker-compose.yml" ]; then echo "   ✅ docker-compose.yml"; fi
if [ -f "nginx.conf" ]; then echo "   ✅ nginx.conf"; fi

echo ""
echo "💡 File log analisis (files_to_delete.log) masih tersimpan untuk referensi"
echo "💡 Jika perlu, Anda bisa menghapusnya dengan: rm files_to_delete.log"

echo ""
echo "✨ Workspace sudah bersih! ✨"
