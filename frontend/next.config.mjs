import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 ULTRA-FAST DEVELOPMENT MODE
  // Optimized for maximum startup speed during development
  
  // Disable expensive features in development
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable source maps in development for speed
  productionBrowserSourceMaps: false,
  
  // Fast refresh optimization
  reactStrictMode: false, // Disabled for faster development
  
  // Output configuration for Docker
  output: 'standalone',
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
  },

  // Webpack optimizations for faster dev startup
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Speed up module resolution
      config.resolve.modules = ['node_modules'];
      config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx'];
      config.resolve.symlinks = false;
      config.resolve.cacheWithContext = false;
      
      // Disable heavy optimizations in dev
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
        minimize: false,
      };
      
      // Faster file watching
      config.watchOptions = {
        poll: false,
        ignored: /node_modules/,
        aggregateTimeout: 300,
      };
      
      // Cache configuration for faster rebuilds
      config.cache = {
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
      };
    }
    return config;
  },

  // TypeScript optimizations
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: true, // Skip type checking in dev for speed
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true, // Disable image optimization in dev for speed
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
