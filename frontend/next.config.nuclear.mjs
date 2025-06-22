/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚨 ZERO CHUNKS - FINAL SOLUTION 🚨
  reactStrictMode: false,
  swcMinify: false,
  
  webpack: (config) => {
    // Disable ALL chunking completely
    config.optimization.splitChunks = false;
    config.optimization.runtimeChunk = false;
    config.optimization.minimize = false;
    
    // No cache to prevent conflicts
    config.cache = false;
    
    return config;
  },
};

export default nextConfig;
