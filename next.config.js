/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
