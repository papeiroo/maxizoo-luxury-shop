/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.maxizoo.pl' },
      { protocol: 'https', hostname: '*.maxizoo.pl' },
      { protocol: 'https', hostname: 'media.os.fressnapf.com' },
      { protocol: 'https', hostname: '*.fressnapf.com' },
    ],
    unoptimized: true,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}
export default nextConfig
