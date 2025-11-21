/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress 404 warnings for missing assets from extracted websites
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Custom webpack config to suppress warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Suppress client-side warnings
      config.stats = {
        ...config.stats,
        warnings: false,
      };
    }
    return config;
  },
  // Suppress specific 404 logs
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  transpilePackages: ['styleforge-shared'],
};

module.exports = nextConfig;
