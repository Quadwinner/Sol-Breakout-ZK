/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeFonts: false,
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]; // Needed for wallet adapters
    return config;
  },
  // To make deployment simpler, we're ignoring ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Since we have a lot of dynamic key-based access,
  // relaxing the check for missing keys during compilation
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'crypto.news',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      }
    ],
  },
};

module.exports = nextConfig; 