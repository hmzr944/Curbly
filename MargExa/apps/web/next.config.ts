import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    remotePatterns: [
      { hostname: '*.myshopify.com' },
      { hostname: 'cdn.shopify.com' },
    ],
  },
}

export default nextConfig
