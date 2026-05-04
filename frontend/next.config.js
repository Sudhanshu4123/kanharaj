/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Required for Docker deployments
  output: 'standalone',

  async rewrites() {
    // For local development, proxy API requests to the backend
    const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';

    return [
      {
        // Fix for old properties in the database
        source: '/uploads/:path*',
        destination: `${backendUrl}/api/uploads/:path*`,
      },
      {
        // For local development to proxy the new image URLs
        source: '/api/uploads/:path*',
        destination: `${backendUrl}/api/uploads/:path*`,
      }
    ];
  },
};
module.exports = nextConfig;