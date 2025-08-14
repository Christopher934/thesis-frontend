#!/bin/bash

# Script untuk membersihkan file-file yang tidak digunakan
# Buat oleh: GitHub Copilot
# Tanggal: $(date)

echo "🧹 Membersihkan file-file yang tidak digunakan..."
echo "================================================="

# Pindah ke direktori utama
cd /Users/jo/Downloads/Thesis

# Buat backup list file yang akan dihapus
echo "📝 Membuat daftar file yang akan dihapus..."

# 1. File-file testing JavaScript di root
echo "=== TEST JS FILES (Root Directory) ===" > files_to_delete.log
find . -maxdepth 1 -name "test-*.js" -type f >> files_to_delete.log
echo "" >> files_to_delete.log

# 2. File-file debug JavaScript di root  
echo "=== DEBUG JS FILES (Root Directory) ===" >> files_to_delete.log
find . -maxdepth 1 -name "debug-*.js" -type f >> files_to_delete.log
echo "" >> files_to_delete.log

# 3. File-file HTML test di root
echo "=== TEST HTML FILES (Root Directory) ===" >> files_to_delete.log
find . -maxdepth 1 -name "test-*.html" -type f >> files_to_delete.log
find . -maxdepth 1 -name "debug-*.html" -type f >> files_to_delete.log
echo "" >> files_to_delete.log

# 4. File-file utility temporary
echo "=== UTILITY/TEMP FILES ===" >> files_to_delete.log
find . -maxdepth 1 -name "analisis-*.js" -type f >> files_to_delete.log
find . -maxdepth 1 -name "simple-calc.js" -type f >> files_to_delete.log
find . -maxdepth 1 -name "force-refresh.js" -type f >> files_to_delete.log
find . -maxdepth 1 -name "corrected-calculation.js" -type f >> files_to_delete.log
find . -maxdepth 1 -name "check-database-query.js" -type f >> files_to_delete.log
echo "" >> files_to_delete.log

# 5. File-file auto login HTML (testing)
echo "=== AUTO LOGIN HTML FILES ===" >> files_to_delete.log
find . -maxdepth 1 -name "auto-*login*.html" -type f >> files_to_delete.log
find . -maxdepth 1 -name "quick-login.html" -type f >> files_to_delete.log
find . -maxdepth 1 -name "clear-browser-data.html" -type f >> files_to_delete.log
echo "" >> files_to_delete.log

# 6. File-file shell script testing
echo "=== TEST SHELL SCRIPTS ===" >> files_to_delete.log
find . -maxdepth 1 -name "test-*.sh" -type f >> files_to_delete.log
find . -maxdepth 1 -name "debug-*.sh" -type f >> files_to_delete.log
echo "" >> files_to_delete.log

echo "✅ Daftar file berhasil dibuat di: files_to_delete.log"
echo ""
echo "📊 Ringkasan file yang akan dihapus:"
echo "------------------------------------"

# Hitung jumlah file per kategori
test_js_count=$(find . -maxdepth 1 -name "test-*.js" -type f | wc -l)
debug_js_count=$(find . -maxdepth 1 -name "debug-*.js" -type f | wc -l)
test_html_count=$(find . -maxdepth 1 \( -name "test-*.html" -o -name "debug-*.html" \) -type f | wc -l)
auto_login_count=$(find . -maxdepth 1 \( -name "auto-*login*.html" -o -name "quick-login.html" -o -name "clear-browser-data.html" \) -type f | wc -l)
utility_count=$(find . -maxdepth 1 \( -name "analisis-*.js" -o -name "simple-calc.js" -o -name "force-refresh.js" -o -name "corrected-calculation.js" -o -name "check-database-query.js" \) -type f | wc -l)
test_sh_count=$(find . -maxdepth 1 \( -name "test-*.sh" -o -name "debug-*.sh" \) -type f | wc -l)

echo "🔸 Test JS files: $test_js_count"
echo "🔸 Debug JS files: $debug_js_count"  
echo "🔸 Test/Debug HTML files: $test_html_count"
echo "🔸 Auto login HTML files: $auto_login_count"
echo "🔸 Utility JS files: $utility_count"
echo "🔸 Test shell scripts: $test_sh_count"

total_count=$((test_js_count + debug_js_count + test_html_count + auto_login_count + utility_count + test_sh_count))
echo ""
echo "📈 Total file yang akan dihapus: $total_count file"

echo ""
echo "💡 Untuk melihat daftar lengkap: cat files_to_delete.log"
echo "💡 Untuk menjalankan penghapusan: ./cleanup_execute.sh"
