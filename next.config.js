module.exports = {
  swcMinify: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery'
      }
    ]
  },
};