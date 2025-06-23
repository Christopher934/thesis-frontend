import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration - stable and reliable
  reactStrictMode: false,
  
  // Essential experimental features only
  experimental: {
    optimizePackageImports: ['lucide-react', 'axios'],
  },
  
  // Simple webpack configuration - no complex optimizations
  webpack: (config) => {
    // Path alias only
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    return config;
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  
  // Basic optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
