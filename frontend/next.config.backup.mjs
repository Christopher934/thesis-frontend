import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable output optimization for development speed
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Enable experimental features for speed (Next.js 15+ compatible)
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
    // Optimize CSS loading
    optimizeCss: true,
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: process.env.NODE_ENV === 'development' ? {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  } : undefined,
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production build optimizations
    if (!dev) {
      // Faster production builds
      config.optimization.minimize = true;
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
        },
      };
    }
    
    if (dev) {
      // STABLE development configuration - prevents cache errors
      config.resolve.symlinks = false;
      config.resolve.cacheWithContext = false;
      
      // Use stable memory cache for ALL development builds (main + edge server)
      config.cache = {
        type: 'memory',
        maxGenerations: 1,
      };
      
      // Optimize module resolution for speed
      config.resolve.modules = ['node_modules'];
      config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx'];
      config.resolve.alias = {
        ...config.resolve.alias,
        // Add aliases for faster resolution
        '@': path.resolve(__dirname, 'src'),
      };
      
      // Let Next.js handle source maps automatically - don't override devtool
      // This prevents the webpack devtool warning in Next.js 15+
      
      // Fixed chunk configuration to prevent "exports is not defined" error
      config.optimization = {
        ...config.optimization,
        runtimeChunk: false, // Disable single runtime chunk to fix exports error
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              enforce: true,
              // Fix CommonJS/ES module compatibility
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // Stable watch options
      config.watchOptions = {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: false,
      };
    }
    
    return config;
  },
  
  // TypeScript optimization
  typescript: {
    // Faster type checking in development
    tsconfigPath: './tsconfig.json',
  },
  
  // ESLint optimization
  eslint: {
    // Ignore ESLint during builds for faster development
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
  images: {
    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',  
      }
    ],
    dangerouslyAllowSVG: true,
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Development-specific optimizations (Next.js 15+ compatible)
  ...(process.env.NODE_ENV === 'development' && {
    // Disable strict mode for faster rendering
    reactStrictMode: false,
  }),
  
  // Production optimizations (Next.js 15+ compatible)
  ...(process.env.NODE_ENV === 'production' && {
    // Enable optimizations for production
    reactStrictMode: true,
  }),
};

export default nextConfig;
