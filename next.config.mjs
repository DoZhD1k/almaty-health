/** @type {import('next').NextConfig} */
const basePath = "/hospital-admissions";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "standalone",
  ...(isProd ? { basePath } : {}),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
