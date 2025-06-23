#!/bin/bash

# RSUD Anugerah Color Scheme Utility
# This script helps manage hospital color theme updates

echo "🏥 RSUD Anugerah Hospital Color Scheme Utility"
echo "=============================================="

# Color definitions
HOSPITAL_BLUE="#2563EB"
HOSPITAL_BLUE_LIGHT="#DBEAFE"
HOSPITAL_BLUE_DARK="#1E40AF"
HOSPITAL_GREEN="#059669"
HOSPITAL_GREEN_LIGHT="#D1FAE5"
HOSPITAL_GREEN_DARK="#047857"
HOSPITAL_TEAL="#0891B2"
HOSPITAL_TEAL_LIGHT="#CFFAFE"

echo ""
echo "🎨 Current Hospital Color Palette:"
echo "  Primary Blue: $HOSPITAL_BLUE"
echo "  Primary Blue Light: $HOSPITAL_BLUE_LIGHT"
echo "  Primary Blue Dark: $HOSPITAL_BLUE_DARK"
echo "  Medical Green: $HOSPITAL_GREEN"
echo "  Medical Green Light: $HOSPITAL_GREEN_LIGHT"
echo "  Medical Green Dark: $HOSPITAL_GREEN_DARK"
echo "  Calming Teal: $HOSPITAL_TEAL"
echo "  Calming Teal Light: $HOSPITAL_TEAL_LIGHT"

echo ""
echo "📁 Files with hospital colors:"
echo "  ✅ tailwind.config.js - Color definitions"
echo "  ✅ src/app/layout.tsx - Metadata and branding"
echo "  ✅ src/app/globals.css - Calendar and UI theming"
echo "  ✅ Components updated with hospital theme"

echo ""
echo "🔧 Usage in Components:"
echo "  Status Success: bg-hospitalGreenLight text-hospitalGreenDark"
echo "  Status Info: bg-hospitalBlueLight text-hospitalBlueDark"  
echo "  Status Warning: bg-hospitalTealLight text-hospitalTeal"
echo "  Primary Button: bg-hospitalBlue hover:bg-hospitalBlueDark"

echo ""
echo "🎯 To update additional components:"
echo "  1. Use hospitalBlue for primary actions"
echo "  2. Use hospitalGreen for success states"
echo "  3. Use hospitalTeal for info/waiting states"
echo "  4. Maintain contrast ratios for accessibility"

echo ""
echo "📱 Favicon and Branding:"
echo "  - Medical cross icon in hospital blue"
echo "  - PWA manifest with hospital theme"
echo "  - SVG favicon for scalability"

echo ""
echo "✅ Hospital Color Scheme Implementation Complete!"
