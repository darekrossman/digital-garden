import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
    viewTransition: true,
  },
  reactStrictMode: false,
  transpilePackages: ['three'],
}

export default nextConfig
