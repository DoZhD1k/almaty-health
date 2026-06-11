/** @type {import('next').NextConfig} */
<<<<<<< HEAD
const nextConfig = {
=======
const basePath = "/hospital-admissions";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "standalone",
  ...(isProd ? { basePath } : {}),
>>>>>>> gitlab/main
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
<<<<<<< HEAD
=======
  poweredByHeader: false,
>>>>>>> gitlab/main
};

export default nextConfig;
