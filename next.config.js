/** @type {import('next').NextConfig} */

if (!process.env.ADMIN_API_URL) {
  throw new Error('FATAL: Missing required environment variable ADMIN_API_URL')
}

if (!process.env.PUBLIC_INTAKE_KEY) {
  throw new Error('FATAL: Missing required environment variable PUBLIC_INTAKE_KEY')
}

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/courses/cpl-ground-classes',
        destination: '/courses/commercial-pilot-license-cpl',
        permanent: true,
      },
      {
        source: '/courses/flying-training',
        destination: '/courses/flying-training-india-abroad',
        permanent: true,
      },
      {
        source: '/courses/cadet-pilot-program',
        destination: '/courses/cadet-preparation',
        permanent: true,
      },
      {
        source: '/courses/airbus-a320-sim-training',
        destination: '/courses/a320-simulator',
        permanent: true,
      },
      {
        source: '/courses/atpl-ground',
        destination: '/courses/atpl',
        permanent: true,
      },
      {
        source: '/courses/atpl-ground-classes',
        destination: '/courses/atpl',
        permanent: true,
      },
      {
        source: '/courses/gd-pi-mastery',
        destination: '/courses/airline-preparation',
        permanent: true,
      },
      {
        source: '/courses/screening-prep',
        destination: '/courses/cas-compass-adapt',
        permanent: true,
      },
      {
        source: '/courses/cpl-flying',
        destination: '/courses/flying-training',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
