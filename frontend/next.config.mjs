/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development optimizations
  experimental: {
    turbo: {
      // Enable Turbopack for faster builds in development
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Webpack optimizations for development
  webpack: (config, { dev, isServer }) => {
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
