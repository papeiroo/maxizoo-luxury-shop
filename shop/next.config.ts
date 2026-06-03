import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.maxizoo.pl' },
      { protocol: 'https', hostname: '*.maxizoo.pl' },
      { protocol: 'https', hostname: 'images.maxizoo.pl' },
    ],
  },
}
export default nextConfig
