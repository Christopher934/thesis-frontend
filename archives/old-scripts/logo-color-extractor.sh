#!/bin/bash

# RSUD Anugerah Logo Color Extraction and Theme Update Script
# This script helps extract colors from your logo and update the theme

echo "🏥 RSUD Anugerah Logo-Based Color Theme Updater"
echo "=============================================="

# Check if logo exists
LOGO_PATH="/Users/jo/Documents/Backup 2/Thesis/frontend/public/logo.png"
TAILWIND_CONFIG="/Users/jo/Documents/Backup 2/Thesis/frontend/tailwind.config.js"

if [ -f "$LOGO_PATH" ]; then
    echo "✅ Logo found: $LOGO_PATH"
else
    echo "❌ Logo not found at: $LOGO_PATH"
    echo "   Please ensure your logo.png is in the public folder"
    exit 1
fi

echo ""
echo "🎨 Logo-Based Theme Instructions:"
echo ""
echo "1. Open the Logo-to-Favicon converter:"
echo "   file:///Users/jo/Documents/Backup%202/Thesis/frontend/public/logo-to-favicon.html"
echo ""
echo "2. The tool will automatically:"
echo "   - Load your logo.png"
echo "   - Extract the dominant colors"
echo "   - Generate favicon files"
echo "   - Provide Tailwind color codes"
echo ""
echo "3. Update your Tailwind config with extracted colors:"
echo "   Edit: $TAILWIND_CONFIG"
echo ""
echo "4. Replace these values in the hospitalTheme section:"
echo "   hospitalBlue: \"#[PRIMARY_COLOR]\"     // Use your logo's main color"
echo "   hospitalGreen: \"#[SECONDARY_COLOR]\"  // Use your logo's accent color"  
echo "   hospitalTeal: \"#[TERTIARY_COLOR]\"    // Use your logo's third color"
echo ""

# Check if ImageMagick is available for advanced color extraction
if command -v identify >/dev/null 2>&1; then
    echo "🔍 Advanced Color Analysis (ImageMagick detected):"
    echo ""
    
    # Get basic image info
    echo "📊 Logo Information:"
    identify "$LOGO_PATH"
    echo ""
    
    # Extract dominant colors using ImageMagick
    echo "🎨 Dominant Colors (Top 5):"
    convert "$LOGO_PATH" -resize 50x50! -quantize RGB -colors 5 -unique-colors txt:- | grep -v '#' | head -5 | while read line; do
        if [[ $line == *"("* ]]; then
            # Extract hex color from ImageMagick output
            color=$(echo "$line" | sed -n 's/.*#\([0-9A-Fa-f]\{6\}\).*/\1/p')
            if [ ! -z "$color" ]; then
                echo "   #$color"
            fi
        fi
    done
    echo ""
    
    echo "💡 Copy these hex codes to your Tailwind config!"
else
    echo "💡 For automatic color extraction, install ImageMagick:"
    echo "   brew install imagemagick"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Open the favicon generator in your browser"
echo "2. Download the generated favicon files"
echo "3. Replace favicon.ico in src/app/"
echo "4. Update Tailwind config with extracted colors"
echo "5. Test the application with your logo-based theme"

echo ""
echo "📁 Generated Files Location:"
echo "   Favicons: Download from the web tool"
echo "   Place in: /Users/jo/Documents/Backup 2/Thesis/frontend/src/app/"
echo "   Also place in: /Users/jo/Documents/Backup 2/Thesis/frontend/public/"

echo ""
echo "✅ Ready to extract colors from your RSUD Anugerah logo!"
