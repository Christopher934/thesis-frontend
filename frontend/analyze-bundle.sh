#!/bin/bash

# 📊 Bundle Analyzer Script for RSUD Anugerah Frontend
echo "📊 Running Bundle Analysis for RSUD Anugerah Frontend..."
echo "======================================================"

# Navigate to frontend directory
cd "$(dirname "$0")"

# Install bundle analyzer if not present
echo "🔍 Checking bundle analyzer installation..."
if ! npm list @next/bundle-analyzer > /dev/null 2>&1; then
    echo "📦 Installing @next/bundle-analyzer..."
    npm install --save-dev @next/bundle-analyzer
fi

# Create temporary config with bundle analyzer
echo "⚙️  Creating temporary config with bundle analyzer..."
cat > next.config.analyze.mjs << 'EOF'
import { fileURLToPath } from 'url';
import path from 'path';
import withBundleAnalyzer from '@next/bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundleAnalyzer = withBundleAnalyzer({
  enabled: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.resolve.modules = ['node_modules'];
      config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx'];
      config.resolve.symlinks = false;
      config.resolve.cacheWithContext = false;
      
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
        minimize: false,
      };
      
      config.watchOptions = {
        poll: false,
        ignored: /node_modules/,
        aggregateTimeout: 300,
      };
      
      config.cache = {
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
      };
    }
    return config;
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default bundleAnalyzer(nextConfig);
EOF

# Run build with analyzer
echo "🏗️  Building with bundle analyzer..."
NEXT_CONFIG_FILE=next.config.analyze.mjs NODE_OPTIONS='--max-old-space-size=4096' npx next build

# Clean up temporary config
echo "🧹 Cleaning up temporary files..."
rm -f next.config.analyze.mjs

echo ""
echo "✅ Bundle analysis complete!"
echo "📊 Check your browser for the bundle analyzer report"
echo "📁 Build output saved to .next/ directory"
