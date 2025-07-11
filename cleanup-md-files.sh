#!/bin/bash
# Script to clean up unused Markdown documentation files
# This will keep only README.md files and remove all other .md files

echo "🧹 Cleaning up unused Markdown documentation files..."
echo "Keeping only README.md files..."

# Navigate to the project root
cd /Users/jo/Downloads/Thesis

# Count total MD files before cleanup
TOTAL_MD_FILES=$(find . -name "*.md" -type f | wc -l)
README_FILES=$(find . -name "README.md" -type f | wc -l)
OTHER_MD_FILES=$((TOTAL_MD_FILES - README_FILES))

echo "📊 Found:"
echo "  - Total MD files: $TOTAL_MD_FILES"
echo "  - README files: $README_FILES"  
echo "  - Other MD files to remove: $OTHER_MD_FILES"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with cleanup? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo "🗑️  Removing unused MD files..."

# Find and remove all .md files except README.md files
find . -name "*.md" -type f ! -name "README.md" -exec rm -f {} \;

echo "✅ Cleanup completed!"

# Count remaining files
REMAINING_MD_FILES=$(find . -name "*.md" -type f | wc -l)
echo "📊 After cleanup:"
echo "  - Remaining MD files: $REMAINING_MD_FILES"
echo "  - Removed files: $OTHER_MD_FILES"

# List the remaining README files
echo ""
echo "📄 Remaining documentation files:"
find . -name "README.md" -type f | sort

echo ""
echo "🎉 Workspace cleaned! Only essential README files remain."
