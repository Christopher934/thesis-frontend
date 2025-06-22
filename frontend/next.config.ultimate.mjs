/** @type {import('next').NextConfig} */
const nextConfig = {
  // ULTRA ULTIMATE STABLE - ZERO CHUNKS CONFIGURATION
  reactStrictMode: false,
  swcMinify: false,
  
  // Disable image optimization
  images: {
    unoptimized: true,
  },
  
  // Disable output file tracing
  output: 'standalone',
  
  // ULTIMATE webpack config - COMPLETE CHUNK ELIMINATION
  webpack: (config, { dev, isServer }) => {
    // FORCE ZERO CHUNKING
    config.optimization = {
      splitChunks: false,
      runtimeChunk: false,
      minimize: false,
      removeAvailableModules: false,
      removeEmptyChunks: false,
      mergeDuplicateChunks: false,
      concatenateModules: false,
      usedExports: false,
      sideEffects: false,
    };
    
    // Disable ALL caching mechanisms
    config.cache = false;
    
    // Single bundle strategy
    if (dev && !isServer) {
      // Force everything into main bundle
      config.entry = async () => {
        return {
          main: ['./src/app/layout.tsx', './src/app/page.tsx']
        };
      };
    }
    
    // Remove fallbacks that cause issues
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      buffer: false,
    };

    return config;
  },
  
  // Disable static optimization
  generateStaticParams: false,
};

export default nextConfig;
