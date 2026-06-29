/** @type {import('next').NextConfig} */

const isVercel = process.env.VERCEL === '1';

const nextConfig = {
  output: 'standalone',
  // basePath: '/hospital-admissions',
  basePath: isVercel ? '' : '/hospital-admissions',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;