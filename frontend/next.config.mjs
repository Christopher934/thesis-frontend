import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
  rules: {
    '*.svg': {
      loaders: ['@svgr/webpack'],
      as: '*.js',
    },
  },
},
  
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // config.devtool = 'eval-cheap-module-source-map';
      config.resolve.symlinks = false;
      // config.cache = {
      //   type: 'filesystem',
      //   cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
      // };
    }
    return config;
  },

  typescript: {
    tsconfigPath: './tsconfig.json',
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
  ],
  dangerouslyAllowSVG: true,
},

  poweredByHeader: false,
  compress: true,

  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: false,
  }),
};

export default nextConfig;
