/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Docker
  output: 'standalone',
  
  // Build optimizations for Docker
  experimental: {
    // Disable turbo in production builds to avoid hanging
    turbo: process.env.NODE_ENV === 'development' ? {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    } : undefined,
  },
  
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
    
    if (dev && !isServer) {
      // Faster builds in development
      config.devtool = 'eval-cheap-module-source-map';
      
      // Optimize module resolution
      config.resolve.symlinks = false;
      
      // Cache configuration for faster rebuilds
      config.cache = {
        type: 'filesystem',
        cacheDirectory: '.next/cache/webpack',
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
    // Optimize image loading
    domains: ['localhost'],
    dangerouslyAllowSVG: true,
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Development-specific optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Faster refresh in development
    reactStrictMode: false,
  }),
};

export default nextConfig;
