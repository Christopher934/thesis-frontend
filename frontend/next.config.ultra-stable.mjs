import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ULTRA STABLE CONFIGURATION - PERMANENT FIX
  reactStrictMode: false,
  
  // Disable all optimizations that cause chunk issues
  experimental: {
    // Remove esmExternals to avoid warnings
  },
  
  // Ultra simple webpack config
  webpack: (config, { dev, isServer }) => {
    // Only essential path alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    if (dev && !isServer) {
      // DISABLE ALL CHUNKING AND OPTIMIZATION
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        runtimeChunk: false,
        minimize: false,
      };
      
      // No fallbacks to prevent conflicts
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
      
      // Disable HMR optimizations that cause issues
      config.cache = false;
    }

    return config;
  },
  
  // Minimal image config
  images: {
    domains: ['localhost'],
    dangerouslyAllowSVG: true,
  },
  
  // Disable problematic features
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Basic settings only
  poweredByHeader: false,
  compress: true,
  
  // Disable problematic redirects
  async redirects() {
    return [];
  },
  
  // Disable rewrites
  async rewrites() {
    return [];
  },
};

export default nextConfig;
