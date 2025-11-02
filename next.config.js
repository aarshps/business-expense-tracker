/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Any experimental features for Vercel optimization
  },
  // Optimize for Vercel deployment
  images: {
    domains: [
      'lh3.googleusercontent.com', // For Google profile images
      'ui-avatars.com' // For default avatars
    ],
  },
  // Enable gzip compression
  compress: true,
};

module.exports = nextConfig;