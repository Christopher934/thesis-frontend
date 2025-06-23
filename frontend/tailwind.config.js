/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            screens: {
                'xs': '480px',
                // Add extra small breakpoint for very small mobile devices
            },
            colors: {
                // RSUD Anugerah Hospital Brand Colors
                // Primary Medical Blue - Professional & Trustworthy
                hospitalBlue: "#2563EB",           // Rich medical blue
                hospitalBlueLight: "#DBEAFE",      // Light blue backgrounds
                hospitalBlueDark: "#1E40AF",       // Dark blue accents
                
                // Secondary Medical Green - Health & Care
                hospitalGreen: "#059669",          // Medical green
                hospitalGreenLight: "#D1FAE5",     // Light green backgrounds
                hospitalGreenDark: "#047857",      // Dark green accents
                
                // Accent Colors
                hospitalTeal: "#0891B2",           // Calming teal
                hospitalTealLight: "#CFFAFE",      // Light teal
                hospitalOrange: "#EA580C",         // Emergency/warning orange
                hospitalOrangeLight: "#FED7AA",    // Light orange
                
                // Neutral Hospital Colors
                hospitalGray: "#6B7280",           // Professional gray
                hospitalGrayLight: "#F3F4F6",      // Background gray
                hospitalGrayDark: "#374151",       // Text gray
                
                // Status Colors - Enhanced for Medical Context
                success: "#10B981",                // Positive results
                warning: "#F59E0B",                // Caution
                error: "#EF4444",                  // Critical/emergency
                info: "#3B82F6",                   // Information
                
                // Legacy colors maintained for backward compatibility
                lamaSky: "#DBEAFE",                // Mapped to hospitalBlueLight
                lamaSkyLight: "#F0F9FF",           // Even lighter blue
                lamaPurple: "#C7D2FE",             // Soft purple-blue
                lamaPurpleLight: "#E0E7FF",        // Light purple-blue
                lamaYellow: "#FCD34D",             // Warm yellow
                lamaYellowLight: "#FFFBEB",        // Light yellow
            }
        },
    },
    plugins: [],
};