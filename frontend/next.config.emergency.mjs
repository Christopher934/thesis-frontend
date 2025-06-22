import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Konfigurasi minimal untuk menghindari error vendor chunks
  reactStrictMode: false,
  
  // Webpack configuration sederhana
  webpack: (config, { dev }) => {
    // Path alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    if (dev) {
      // DISABLE semua optimasi yang menyebabkan masalah vendor chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: false, // Nonaktifkan split chunks sama sekali
      };
      
      // Fallback untuk Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

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
  
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Basic optimizations
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
