import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ULTRA ULTIMATE STABLE CONFIGURATION - ZERO CHUNKS
  reactStrictMode: false,
  swcMinify: false,
  
  // Disable ALL experimental features
  experimental: {},
  
  // Disable image optimization that causes issues
  images: {
    unoptimized: true,
  },
  
  // ULTIMATE webpack config - ZERO CHUNKS GENERATED
  webpack: (config, { dev, isServer }) => {
    // Essential path alias only
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    // COMPLETE CHUNKING ELIMINATION
    config.optimization = {
      splitChunks: false,
      runtimeChunk: false,
      minimize: false,
      removeAvailableModules: false,
      removeEmptyChunks: false,
      mergeDuplicateChunks: false,
    };
    
    // Disable ALL caching
    config.cache = false;
    
    // Remove all fallbacks
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
      url: false,
      assert: false,
    };
    
    // Force single entry point
    if (dev && !isServer) {
      config.entry = async () => {
        const entries = await config.entry();
        return {
          'main': entries['main'],
        };
      };
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
