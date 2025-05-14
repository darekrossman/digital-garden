import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
  },
  reactStrictMode: false,
}

export default nextConfig
