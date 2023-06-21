module.exports = {
  swcMinify: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      {source: '/',
      destination: '/index.html'}
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery'
      }
    ]
  },
};