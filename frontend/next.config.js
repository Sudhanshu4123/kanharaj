/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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

  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Forwarded-Proto',
            value: 'https',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Remove '/api' from the end to get the base backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
      : 'http://localhost:8080';

    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: '/api/uploads/:path*',
        destination: `${backendUrl}/api/uploads/:path*`,
      },
      // Explicitly proxy backend auth endpoints
      {
        source: '/api/auth/register',
        destination: `${backendUrl}/api/auth/register`,
      },
      {
        source: '/api/auth/login',
        destination: `${backendUrl}/api/auth/login`,
      },
      {
        source: '/api/auth/login-verify-otp',
        destination: `${backendUrl}/api/auth/login-verify-otp`,
      },
      {
        source: '/api/auth/forgot-password',
        destination: `${backendUrl}/api/auth/forgot-password`,
      },
      {
        source: '/api/auth/reset-password',
        destination: `${backendUrl}/api/auth/reset-password`,
      },
      {
        source: '/api/auth/verify',
        destination: `${backendUrl}/api/auth/verify`,
      },
      {
        source: '/api/auth/resend-otp',
        destination: `${backendUrl}/api/auth/resend-otp`,
      },
      {
        source: '/api/auth/refresh',
        destination: `${backendUrl}/api/auth/refresh`,
      },
      {
        source: '/api/auth/me',
        destination: `${backendUrl}/api/auth/me`,
      },
      {
        source: '/api/auth/social-login',
        destination: `${backendUrl}/api/auth/social-login`,
      },
      // Catch-all for non-auth api calls
      {
        source: '/api/:path((?!auth(?:/|$)).*)',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;